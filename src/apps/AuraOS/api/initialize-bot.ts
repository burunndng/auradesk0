/**
 * Vercel Serverless Function: Initialize AI Coach Bot Metadata
 *
 * Securely handles bot metadata initialization by calling the Supabase Edge Function.
 * The SUPABASE_FUNCTION_KEY is kept server-side only and never exposed to the client.
 *
 * Endpoint: POST /api/initialize-bot
 * Request body: { botUserId: string }
 * Response: { success: boolean, message: string }
 */

import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Extract bot user ID from request
    const { botUserId } = req.body;
    if (!botUserId || typeof botUserId !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid botUserId' });
    }

    // Read server-side secrets
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseFunctionKey = process.env.SUPABASE_FUNCTION_KEY;

    if (!supabaseUrl || !supabaseFunctionKey) {
      console.error('[initialize-bot] Missing Supabase environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Constants
    const FUNCTION_NAME = 'update-bot-metadata';
    const API_KEY_HEADER = 'x-api-key';
    const BOT_METADATA = {
      is_bot: true,
      bot_type: 'ai_coach',
      display_name: 'AI Coach',
    };

    // Build Supabase Edge Function URL
    const functionUrl = `${supabaseUrl.replace(/\/+$/, '')}/functions/v1/${FUNCTION_NAME}`;

    // Call Supabase Edge Function securely (server-to-server)
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [API_KEY_HEADER]: supabaseFunctionKey,
      },
      body: JSON.stringify({
        user_id: botUserId,
        metadata: BOT_METADATA,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[initialize-bot] Supabase Edge Function error: ${response.status}`,
        errorText
      );
      return res.status(response.status).json({
        error: 'Failed to initialize bot metadata',
        details: errorText,
      });
    }

    const data = await response.json();
    return res.status(200).json({
      success: true,
      message: 'Bot metadata initialized successfully',
      data,
    });
  } catch (err) {
    console.error('[initialize-bot] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
