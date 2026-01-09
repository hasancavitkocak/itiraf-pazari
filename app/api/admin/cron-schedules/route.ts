import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Tüm cron schedule'ları getir
export async function GET() {
  try {
    // Service role ile bağlan
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: schedules, error } = await supabaseAdmin
      .from('cron_schedules')
      .select('*')
      .order('time', { ascending: true });

    if (error) {
      console.error('Cron schedules hatası:', error);
      return NextResponse.json({ error: 'Schedule\'lar alınamadı' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      schedules: schedules || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Admin cron schedules hatası:', error);
    return NextResponse.json({ 
      error: 'Beklenmeyen hata',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

// POST - Yeni cron schedule ekle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { time, label, is_active = true, category } = body;

    console.log('Schedule ekleme isteği:', { time, label, is_active, category });

    if (!time || !label) {
      return NextResponse.json({ error: 'Saat ve label gerekli' }, { status: 400 });
    }

    // Saat formatını kontrol et (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      return NextResponse.json({ error: 'Geçersiz saat formatı (HH:MM)' }, { status: 400 });
    }

    // Service role ile bağlan
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Aynı saatte başka schedule var mı kontrol et
    const { data: existing } = await supabaseAdmin
      .from('cron_schedules')
      .select('id')
      .eq('time', time)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Bu saatte zaten bir schedule var' }, { status: 400 });
    }

    const { data: schedule, error } = await supabaseAdmin
      .from('cron_schedules')
      .insert({
        time,
        label,
        is_active,
        category: category === 'random' ? null : category
      })
      .select()
      .single();

    if (error) {
      console.error('Schedule ekleme hatası:', error);
      return NextResponse.json({ error: 'Schedule eklenemedi', details: error.message }, { status: 500 });
    }

    console.log('Schedule başarıyla eklendi:', schedule);

    return NextResponse.json({
      success: true,
      schedule,
      message: 'Schedule başarıyla eklendi',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Schedule ekleme hatası:', error);
    return NextResponse.json({ 
      error: 'Beklenmeyen hata',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}