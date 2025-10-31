import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { sponsored_content_id } = await request.json();

    if (!sponsored_content_id) {
      return NextResponse.json({ error: 'Sponsored content ID required' }, { status: 400 });
    }

    // IP ve User Agent bilgilerini al
    const forwardedFor = request.headers.get('x-forwarded-for');
    const userIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Tıklama logunu kaydet
    const { error: logError } = await adminSupabase
      .from('sponsored_content_clicks')
      .insert({
        sponsored_content_id,
        user_ip: userIp,
        user_agent: userAgent
      });

    if (logError) {
      console.error('Error logging click:', logError);
    }

    // Tıklama sayısını artır - önce mevcut değeri al
    const { data: currentData, error: fetchError } = await adminSupabase
      .from('sponsored_content')
      .select('click_count')
      .eq('id', sponsored_content_id)
      .single();

    if (fetchError) {
      console.error('Error fetching current click count:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Sonra artır
    const { error } = await adminSupabase
      .from('sponsored_content')
      .update({ 
        click_count: (currentData?.click_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', sponsored_content_id);

    if (error) {
      console.error('Error updating click count:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Click tracking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}