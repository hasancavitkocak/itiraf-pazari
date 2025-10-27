import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Site ayarlarını getir
export async function GET() {
  try {
    const { data: settings, error } = await supabase
      .from('site_settings')
      .select('setting_key, setting_value, setting_type')
      .order('setting_key');

    if (error) {
      console.error('Supabase hatası:', error);
      return NextResponse.json({ error: 'Ayarlar getirilemedi' }, { status: 500 });
    }

    const settingsObj = settings?.reduce((acc: any, setting: any) => {
      acc[setting.setting_key] = {
        value: setting.setting_value,
        type: setting.setting_type
      };
      return acc;
    }, {}) || {};

    return NextResponse.json(settingsObj);
  } catch (error) {
    console.error('Ayarlar getirme hatası:', error);
    return NextResponse.json({ error: 'Ayarlar getirilemedi' }, { status: 500 });
  }
}

// Site ayarlarını güncelle
export async function POST(request: NextRequest) {
  try {
    const { settings } = await request.json();

    // Her ayarı tek tek güncelle
    for (const [key, data] of Object.entries(settings)) {
      const { value, type } = data as { value: string; type: string };
      
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          setting_key: key,
          setting_value: value,
          setting_type: type,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'setting_key'
        });

      if (error) {
        console.error(`Ayar güncelleme hatası (${key}):`, error);
        return NextResponse.json({ error: `${key} ayarı güncellenemedi` }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: 'Ayarlar güncellendi' });
  } catch (error) {
    console.error('Ayarlar güncelleme hatası:', error);
    return NextResponse.json({ error: 'Ayarlar güncellenemedi' }, { status: 500 });
  }
}