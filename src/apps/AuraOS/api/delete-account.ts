import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = authHeader.slice(7);

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Verify JWT
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

  const uid = user.id;
  try {
    // Delete user data in order (FK constraints)
    const tables = ['forum_posts', 'forum_threads', 'integrated_insights', 'wizard_sessions',
                    'intelligent_guidance', 'user_subscriptions', 'user_usage', 'user_profiles'];
    for (const table of tables) {
      await supabase.from(table as never).delete().eq('user_id', uid);
    }
    await supabase.auth.admin.deleteUser(uid);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[delete-account]', err);
    return res.status(500).json({ error: 'Deletion failed' });
  }
}
