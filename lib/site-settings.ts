import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface SiteSetting {
  setting_key: string;
  setting_value: string;
  setting_type: string;
}

export async function getSiteSetting(key: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', key)
      .single();

    if (error) {
      console.error('Site ayarı getirme hatası:', error);
      return null;
    }

    return data?.setting_value || null;
  } catch (error) {
    console.error('Site ayarı getirme hatası:', error);
    return null;
  }
}

export async function getAllSiteSettings(): Promise<Record<string, string>> {
  try {
    const { data: settings, error } = await supabase
      .from('site_settings')
      .select('setting_key, setting_value');

    if (error) {
      console.error('Site ayarları getirme hatası:', error);
      return {};
    }

    return settings?.reduce((acc, setting) => {
      acc[setting.setting_key] = setting.setting_value;
      return acc;
    }, {} as Record<string, string>) || {};
  } catch (error) {
    console.error('Site ayarları getirme hatası:', error);
    return {};
  }
}

export async function setSiteSetting(key: string, value: string, type: string = 'text'): Promise<boolean> {
  try {
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
      console.error('Site ayarı kaydetme hatası:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Site ayarı kaydetme hatası:', error);
    return false;
  }
}