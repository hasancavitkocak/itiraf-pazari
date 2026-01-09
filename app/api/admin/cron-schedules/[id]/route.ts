import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// PUT - Schedule güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { time, label, is_active, category } = body;

    console.log('Schedule güncelleme isteği:', { id, time, label, is_active, category });

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

    // Aynı saatte başka schedule var mı kontrol et (kendisi hariç)
    const { data: existing } = await supabaseAdmin
      .from('cron_schedules')
      .select('id')
      .eq('time', time)
      .neq('id', id)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Bu saatte zaten başka bir schedule var' }, { status: 400 });
    }

    const { data: schedule, error } = await supabaseAdmin
      .from('cron_schedules')
      .update({
        time,
        label,
        is_active: is_active ?? true,
        category: category === 'random' ? null : category
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Schedule güncelleme hatası:', error);
      return NextResponse.json({ error: 'Schedule güncellenemedi', details: error.message }, { status: 500 });
    }

    console.log('Schedule başarıyla güncellendi:', schedule);

    return NextResponse.json({
      success: true,
      schedule,
      message: 'Schedule başarıyla güncellendi',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Schedule güncelleme hatası:', error);
    return NextResponse.json({ 
      error: 'Beklenmeyen hata',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

// DELETE - Schedule sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log('Schedule silme isteği:', { id });

    // Service role ile bağlan
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabaseAdmin
      .from('cron_schedules')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Schedule silme hatası:', error);
      return NextResponse.json({ error: 'Schedule silinemedi', details: error.message }, { status: 500 });
    }

    console.log('Schedule başarıyla silindi:', id);

    return NextResponse.json({
      success: true,
      message: 'Schedule başarıyla silindi',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Schedule silme hatası:', error);
    return NextResponse.json({ 
      error: 'Beklenmeyen hata',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}