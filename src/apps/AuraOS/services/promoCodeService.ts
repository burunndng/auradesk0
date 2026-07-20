import { supabase } from './supabaseClient';
import type { PromoCode } from '../types';

function generateCodeString(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segment = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `AOS-${segment(4)}-${segment(4)}`;
}

export async function generatePromoCode(daysValid = 30): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const code = generateCodeString();
  const expiresAt = new Date(Date.now() + daysValid * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await (supabase as any)
    .from('promo_codes')
    .insert({ code, created_by: user.id, days_valid: daysValid, expires_at: expiresAt });

  if (error) {
    console.error('[promoCodeService] generatePromoCode error:', error);
    return null;
  }
  return code;
}

export async function listPromoCodes(): Promise<PromoCode[]> {
  const { data, error } = await (supabase as any)
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[promoCodeService] listPromoCodes error:', error);
    return [];
  }
  return (data || []) as PromoCode[];
}

export async function revokePromoCode(id: string): Promise<boolean> {
  const { error } = await (supabase as any)
    .from('promo_codes')
    .update({ status: 'revoked' })
    .eq('id', id);

  if (error) {
    console.error('[promoCodeService] revokePromoCode error:', error);
    return false;
  }
  return true;
}
