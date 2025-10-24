import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, is_premium, duration } = body;

    let premium_expires_at = null;
    
    if (is_premium) {
      const days = duration === 'monthly' ? 30 : 365;
      premium_expires_at = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    }

    // Admin yetkisi ile güncelle
    const { error } = await supabase
      .from('profiles')
      .update({ is_premium, premium_expires_at })
      .eq('id', user_id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
