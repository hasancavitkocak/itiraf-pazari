import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);

    const merchant_oid = params.get('merchant_oid');
    const status = params.get('status');
    const total_amount = params.get('total_amount');
    const hash = params.get('hash');

    const merchant_key = process.env.PAYTR_MERCHANT_KEY || 'MERCHANT_KEY';
    const merchant_salt = process.env.PAYTR_MERCHANT_SALT || 'MERCHANT_SALT';

    const hashSTR = `${merchant_oid}${merchant_salt}${status}${total_amount}`;
    const token = crypto.createHmac('sha256', merchant_key).update(hashSTR).digest('base64');

    if (token !== hash) {
      return NextResponse.json({ status: 'error', message: 'Hash mismatch' });
    }

    if (status === 'success') {
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('merchant_oid', merchant_oid)
        .maybeSingle();

      if (payment) {
        await supabase
          .from('payments')
          .update({ status: 'completed' })
          .eq('merchant_oid', merchant_oid);

        if (payment.payment_type === 'subscription') {
          const expiresAt = payment.subscription_duration === 'yearly'
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

          await supabase
            .from('profiles')
            .update({
              is_premium: true,
              premium_expires_at: expiresAt.toISOString(),
            })
            .eq('id', payment.user_id);
        } else if (payment.payment_type === 'boost' && payment.post_id) {
          const boostedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);

          await supabase
            .from('posts')
            .update({
              is_boosted: true,
              boosted_until: boostedUntil.toISOString(),
            })
            .eq('id', payment.post_id);

          await supabase
            .from('boosts')
            .insert({
              post_id: payment.post_id,
              payment_id: payment.id,
              boosted_until: boostedUntil.toISOString(),
            });
        }
      }
    }

    return NextResponse.json({ status: 'OK' });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message });
  }
}