import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Public site ayarlarını getir (logo, site adı gibi)
export async function GET() {
  try {
    const { data: settings, error } = await supabase
      .from('site_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['site_logo', 'site_name', 'site_description'])
      .order('setting_key');

    if (error) {
      console.error('Supabase hatası:', error);
      return NextResponse.json({ error: 'Ayarlar getirilemedi' }, { status: 500 });
    }

    const settingsObj = settings?.reduce((acc: any, setting: any) => {
      acc[setting.setting_key] = setting.setting_value;
      return acc;
    }, {}) || {};

    return NextResponse.json(settingsObj);
  } catch (error) {
    console.error('Site ayarları getirme hatası:', error);
    return NextResponse.json({ error: 'Ayarlar getirilemedi' }, { status: 500 });
  }
}
