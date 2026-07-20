import { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify webhook signature
    const signature = req.headers['x-signature'] as string;
    if (!signature) {
      return res.status(401).json({ error: 'Missing signature' });
    }

    const body = JSON.stringify(req.body);
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || '';
    const hash = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;

    // Handle order completed event
    if (event.meta?.event_name === 'order_completed') {
      const customData = event.data?.attributes?.custom_data;
      if (!customData?.user_id) {
        return res.status(400).json({ error: 'Missing user_id in custom_data' });
      }

      // Mark user as supporter
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_supporter: true })
        .eq('id', customData.user_id);

      if (error) {
        console.error('Supabase update error:', error);
        return res.status(500).json({ error: 'Failed to update user' });
      }

      return res.status(200).json({ success: true });
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
};
