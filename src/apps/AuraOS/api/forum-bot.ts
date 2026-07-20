/**
 * Vercel Serverless Function: Forum Bot (combined)
 *
 * action: 'create-thread' — creates a new forum thread as the AI bot user
 * action: 'post'          — posts a reply as the AI bot user
 *
 * Both bypass RLS using the service role key.
 *
 * Endpoint: POST /api/forum-bot
 * Request body: { action: 'create-thread' | 'post', ...fields }
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const VALID_CATEGORIES = ['practice-sharing', 'insights', 'questions', 'community'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  const botUserId = process.env.VITE_BOT_USER_ID;

  if (!supabaseUrl || !anonKey || !serviceKey || !botUserId) {
    const missing = [
      !supabaseUrl && 'VITE_SUPABASE_URL',
      !anonKey && 'VITE_SUPABASE_ANON_KEY',
      !serviceKey && 'SUPABASE_SERVICE_KEY',
      !botUserId && 'VITE_BOT_USER_ID',
    ].filter(Boolean);
    console.error(`[forum-bot] Missing environment variables: ${missing.join(', ')}`);
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // Verify caller is an authenticated Supabase user
  const authHeader = req.headers.authorization;
  const userToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!userToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const anonClient = createClient(supabaseUrl, anonKey);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(userToken);
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // Only admins may trigger bot actions
    const { data: profile } = await anonClient.from('user_profiles').select('is_admin').eq('id', user.id).single();
    if (!profile?.is_admin) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  } catch (authErr) {
    console.error('[forum-bot] Auth verification error:', authErr);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { action } = req.body;
  const supabase = createClient(supabaseUrl, serviceKey);

  if (action === 'create-thread') {
    const { title, description, category } = req.body;
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Missing title' });
    }
    if (!category || !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }
    try {
      const { data, error } = await supabase
        .from('forum_threads')
        .insert({ user_id: botUserId, title, description: description || null, category })
        .select()
        .single();
      if (error) {
        console.error('[forum-bot] create-thread insert error:', error);
        return res.status(500).json({ error: error.message });
      }
      return res.status(200).json({ success: true, thread: data });
    } catch (err) {
      console.error('[forum-bot] create-thread unexpected error:', err);
      return res.status(500).json({ error: 'An unexpected server error occurred' });
    }
  }

  if (action === 'post') {
    const { threadId, content, personaName } = req.body;
    if (!threadId || typeof threadId !== 'string') {
      return res.status(400).json({ error: 'Missing threadId' });
    }
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Missing content' });
    }
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .insert({
          thread_id: threadId,
          user_id: botUserId,
          content,
          bot_persona_name: personaName ?? null,
          is_edited: false,
          likes_count: 0,
          is_deleted: false,
        })
        .select()
        .single();
      if (error) {
        console.error('[forum-bot] post insert error:', error);
        return res.status(500).json({ error: error.message });
      }
      return res.status(200).json({ success: true, post: data });
    } catch (err) {
      console.error('[forum-bot] post unexpected error:', err);
      return res.status(500).json({ error: 'An unexpected server error occurred' });
    }
  }

  return res.status(400).json({ error: 'Invalid action' });
}
