/**
 * Vercel Serverless Function: RAG Storage Proxy
 *
 * Handles all S3 operations server-side, keeping credentials out of the browser.
 * Validates Supabase JWT so only authenticated users can access their own files.
 *
 * Endpoint: POST /api/rag-storage
 * Actions: upload | download | list | delete | gettext | check
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';

// Server-side only — no VITE_ prefix
const S3_ACCESS_KEY = process.env.SUPABASE_S3_ACCESS_KEY_ID || '';
const S3_SECRET_KEY = process.env.SUPABASE_S3_SECRET_ACCESS_KEY || '';
const S3_ENDPOINT = process.env.SUPABASE_S3_ENDPOINT || '';
const S3_REGION = process.env.SUPABASE_S3_REGION || 'eu-west-1';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const BUCKET_NAME = 'user-knowledge-base';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function getS3Client(): S3Client {
  return new S3Client({
    credentials: {
      accessKeyId: S3_ACCESS_KEY,
      secretAccessKey: S3_SECRET_KEY,
    },
    endpoint: S3_ENDPOINT,
    region: S3_REGION,
    forcePathStyle: true,
  });
}

/** Validate Supabase JWT and return user id */
async function getUserId(authHeader?: string): Promise<string | null> {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user.id;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', 'https://auraos.space');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  if (!S3_ACCESS_KEY || !S3_SECRET_KEY || !S3_ENDPOINT) {
    return res.status(500).json({ error: 'Storage not configured' });
  }

  const userId = await getUserId(req.headers.authorization as string);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { action, fileName, fileData, contentType } = req.body || {};

  if (!action) return res.status(400).json({ error: 'action is required' });

  const s3 = getS3Client();

  try {
    switch (action) {
      case 'check':
        return res.status(200).json({ configured: true });

      case 'upload': {
        if (!fileName || !fileData) return res.status(400).json({ error: 'fileName and fileData required' });
        if (typeof fileData !== 'string') return res.status(400).json({ error: 'fileData must be base64 string' });

        const buffer = Buffer.from(fileData, 'base64');
        if (buffer.byteLength > MAX_FILE_SIZE) {
          return res.status(413).json({ error: 'File exceeds 10 MB limit' });
        }

        // Sanitize filename — prevent path traversal
        const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `${userId}/${safeName}`;

        await s3.send(new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: filePath,
          Body: buffer,
          ContentType: contentType || 'application/octet-stream',
          Metadata: {
            uploadedBy: userId,
            originalName: fileName,
            uploadedAt: new Date().toISOString(),
          },
        }));

        return res.status(200).json({ success: true, filePath, fileName: safeName });
      }

      case 'download': {
        if (!fileName) return res.status(400).json({ error: 'fileName required' });
        const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `${userId}/${safeName}`;

        const response = await s3.send(new GetObjectCommand({ Bucket: BUCKET_NAME, Key: filePath }));
        if (!response.Body) return res.status(404).json({ error: 'File not found' });

        const chunks: Uint8Array[] = [];
        const reader = (response.Body as any).getReader?.();
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
          }
        }

        const base64 = Buffer.concat(chunks.map(c => Buffer.from(c))).toString('base64');
        return res.status(200).json({ success: true, data: base64, contentType: response.ContentType });
      }

      case 'list': {
        const response = await s3.send(new ListObjectsV2Command({
          Bucket: BUCKET_NAME,
          Prefix: `${userId}/`,
        }));

        const files = (response.Contents || []).map(item => ({
          fileName: item.Key?.split('/').pop() || '',
          filePath: item.Key || '',
          size: item.Size || 0,
          lastModified: item.LastModified || new Date(),
          contentType: 'unknown',
        }));

        return res.status(200).json({ success: true, files });
      }

      case 'delete': {
        if (!fileName) return res.status(400).json({ error: 'fileName required' });
        const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `${userId}/${safeName}`;

        await s3.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: filePath }));
        return res.status(200).json({ success: true });
      }

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (err: any) {
    console.error('[rag-storage] Error:', err);
    return res.status(500).json({ error: 'Storage operation failed', details: err.message });
  }
}
