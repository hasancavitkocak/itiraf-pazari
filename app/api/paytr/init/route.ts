import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, payment_type, amount, subscription_duration, post_id } = body;

    const merchant_id = process.env.PAYTR_MERCHANT_ID || 'MERCHANT_ID';
    const merchant_key = process.env.PAYTR_MERCHANT_KEY || 'MERCHANT_KEY';
    const merchant_salt = process.env.PAYTR_MERCHANT_SALT || 'MERCHANT_SALT';

    const merchant_oid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const payment_amount = Math.round(amount * 100);

    const user_basket = JSON.stringify([
      [payment_type === 'subscription' ? 'Premium Abonelik' : 'Gönderi Öne Çıkarma', payment_amount.toString(), 1]
    ]);

    // Get IP from headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    const user_ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    const hashSTR = `${merchant_id}${user_ip}${merchant_oid}${user_id}${payment_amount}${user_basket}no_installment0${merchant_salt}`;
    const paytr_token = crypto.createHmac('sha256', merchant_key).update(hashSTR).digest('base64');

    const params = {
      merchant_id,
      user_ip,
      merchant_oid,
      email: 'user@example.com',
      payment_amount: payment_amount.toString(),
      paytr_token,
      user_basket,
      debug_on: '1',
      no_installment: '0',
      max_installment: '0',
      user_name: 'User',
      user_address: 'Address',
      user_phone: '5551234567',
      merchant_ok_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success`,
      merchant_fail_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/failed`,
      timeout_limit: '30',
      currency: 'TL',
      test_mode: '1',
    };

    return NextResponse.json({
      success: true,
      iframe_url: 'https://www.paytr.com/odeme/guvenli/' + merchant_oid,
      merchant_oid,
      message: 'PayTR entegrasyonu için .env dosyanıza gerçek kimlik bilgileri eklemelisiniz',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
