import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, code } = req.body as { userId?: string; code?: string };

  if (!userId || !code) {
    return res.status(400).json({ error: 'userId and code are required' });
  }

  const normalizedCode = code.trim().toUpperCase();

  // Fetch code row
  const { data: codeRow, error: fetchError } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', normalizedCode)
    .single();

  if (fetchError || !codeRow) {
    return res.status(404).json({ error: 'Invalid code' });
  }

  if (codeRow.status === 'revoked') {
    return res.status(400).json({ error: 'This code has been revoked' });
  }

  if (codeRow.status === 'redeemed') {
    return res.status(400).json({ error: 'This code has already been used' });
  }

  // Mark code as redeemed
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + codeRow.days_valid * 24 * 60 * 60 * 1000).toISOString();

  const { error: updateCodeError } = await supabase
    .from('promo_codes')
    .update({ status: 'redeemed', redeemed_by: userId, redeemed_at: now })
    .eq('id', codeRow.id);

  if (updateCodeError) {
    console.error('[redeem-code] update code error:', updateCodeError);
    return res.status(500).json({ error: 'Failed to redeem code' });
  }

  // Update user subscription in preferences
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('preferences')
    .eq('id', userId)
    .single();

  const updatedPrefs = {
    ...(profile?.preferences || {}),
    subscription_tier: 'pro',
    subscription_status: 'active',
    subscription_expires_at: expiresAt,
  };

  const { error: updateUserError } = await supabase
    .from('user_profiles')
    .update({ preferences: updatedPrefs })
    .eq('id', userId);

  if (updateUserError) {
    console.error('[redeem-code] update user error:', updateUserError);
    return res.status(500).json({ error: 'Failed to activate access' });
  }

  return res.status(200).json({ success: true, expiresAt });
};
