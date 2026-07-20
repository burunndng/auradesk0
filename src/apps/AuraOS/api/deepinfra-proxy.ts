/**
 * Vercel Serverless Function: DeepInfra TTS + STT Proxy
 *
 * Proxies TTS and STT calls to DeepInfra via OpenAI-compatible API
 * Keeps DEEPINFRA_API_KEY server-side.
 *
 * Endpoint: POST /api/deepinfra-proxy
 * Actions:
 *   { action: 'tts', text: string, voice?: string, format?: string }
 *     → returns { audioData: base64, mimeType: string }
 *   { action: 'stt', audioData: base64, mimeType: string }
 *     → returns { transcript: string }
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS_PER_MINUTE = 30;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (record.count >= MAX_REQUESTS_PER_MINUTE) return false;
  record.count += 1;
  return true;
}

const DEFAULT_VOICE = 'af_bella';
const DEFAULT_FORMAT = 'mp3';
const ALLOWED_VOICES = new Set(['af_bella', 'af_alloy', 'af_echo', 'af_fable', 'af_onyx', 'af_nova', 'af_shimmer', 'af_sky']);
const ALLOWED_FORMATS = new Set(['mp3', 'wav', 'pcm', 'opus', 'flac']);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin || '';
  const ALLOWED_ORIGINS = new Set(['https://auraos.space']);
  if (ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) return res.status(429).json({ error: 'Rate limit exceeded' });

  // Require authenticated Supabase session
  const authHeader = req.headers.authorization;
  const userToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!userToken) return res.status(401).json({ error: 'Unauthorized' });
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (supabaseUrl && anonKey) {
    const { data: { user }, error: authErr } = await createClient(supabaseUrl, anonKey).auth.getUser(userToken);
    if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' });
  }

  const apiKey = process.env.DEEPINFRA_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Server configuration error: DEEPINFRA_API_KEY not set' });

  const { action } = req.body as { action?: string };

  // --- TTS ---
  if (action === 'tts') {
    const { text, voice, format } = req.body as {
      text?: string;
      voice?: string;
      format?: string;
    };

    if (!text || text.trim().length === 0) return res.status(400).json({ error: 'text is required' });
    if (text.length > 5000) return res.status(400).json({ error: 'text too long (max 5000 chars)' });

    const selectedVoice = voice || DEFAULT_VOICE;
    const selectedFormat = format || DEFAULT_FORMAT;

    if (!ALLOWED_VOICES.has(selectedVoice)) return res.status(400).json({ error: 'Invalid voice' });
    if (!ALLOWED_FORMATS.has(selectedFormat)) return res.status(400).json({ error: 'Invalid format' });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    try {
      const response = await fetch(
        'https://api.deepinfra.com/v1/openai/audio/speech',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'hexgrad/Kokoro-82M',
            input: text,
            voice: selectedVoice,
            response_format: selectedFormat,
            speed: 1.0,
          }),
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        const err = await response.text();
        return res.status(response.status).json({ error: 'DeepInfra TTS error', details: err });
      }

      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');

      // Map format to MIME type
      const mimeTypes: Record<string, string> = {
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'pcm': 'audio/pcm',
        'opus': 'audio/opus',
        'flac': 'audio/flac',
      };

      return res.status(200).json({
        audioData: base64,
        mimeType: mimeTypes[selectedFormat] || 'audio/mpeg'
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError')
        return res.status(504).json({ error: 'Gateway Timeout' });
      console.error('[deepinfra-proxy] TTS error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      clearTimeout(timeout);
    }
  }

  // --- STT ---
  if (action === 'stt') {
    const { audioData, mimeType } = req.body as { audioData?: string; mimeType?: string };
    if (!audioData) return res.status(400).json({ error: 'audioData is required' });

    const ALLOWED_MIME_TYPES = new Set(['audio/webm', 'audio/ogg', 'audio/wav', 'audio/mp4', 'audio/mpeg', 'audio/webm;codecs=opus']);
    const safeMime = (mimeType && ALLOWED_MIME_TYPES.has(mimeType)) ? mimeType : 'audio/webm';

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);

    try {
      const audioBuffer = Buffer.from(audioData, 'base64');
      const ext = safeMime.split('/')[1]?.split(';')[0] || 'webm';

      const boundary = `----DeepInfraBoundary${Date.now()}`;
      const parts: Buffer[] = [];

      // model field
      parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="model"\r\n\r\nopenai/whisper-large-v3-turbo\r\n`));
      // response_format field
      parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="response_format"\r\n\r\njson\r\n`));
      // file field
      parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="audio.${ext}"\r\nContent-Type: ${safeMime}\r\n\r\n`));
      parts.push(audioBuffer);
      parts.push(Buffer.from(`\r\n--${boundary}--\r\n`));

      const body = Buffer.concat(parts);

      const response = await fetch('https://api.deepinfra.com/v1/openai/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': String(body.length),
        },
        body,
        signal: controller.signal,
      });

      if (!response.ok) {
        const err = await response.text();
        return res.status(response.status).json({ error: 'DeepInfra STT error', details: err });
      }

      const data = await response.json() as { text?: string };
      return res.status(200).json({ transcript: data.text || '' });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError')
        return res.status(504).json({ error: 'Gateway Timeout' });
      console.error('[deepinfra-proxy] STT error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      clearTimeout(timeout);
    }
  }

  return res.status(400).json({ error: 'Unknown action. Use "tts" or "stt".' });
}
