import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 });
    }

    // Dosya tipini kontrol et
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Sadece resim dosyaları yüklenebilir' }, { status: 400 });
    }

    // Dosya boyutunu kontrol et (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Dosya boyutu 5MB\'dan küçük olmalıdır' }, { status: 400 });
    }

    // Dosya adını oluştur
    const fileExt = file.name.split('.').pop();
    const fileName = `logo-${Date.now()}.${fileExt}`;

    // Dosyayı Supabase Storage'a yükle
    const { data, error } = await supabase.storage
      .from('site-assets')
      .upload(`logos/${fileName}`, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Dosya yükleme hatası:', error);
      return NextResponse.json({ error: 'Dosya yüklenemedi' }, { status: 500 });
    }

    // Public URL'i al
    const { data: { publicUrl } } = supabase.storage
      .from('site-assets')
      .getPublicUrl(`logos/${fileName}`);

    // Site ayarlarını güncelle
    const { error: settingsError } = await supabase
      .from('site_settings')
      .upsert({
        setting_key: 'site_logo',
        setting_value: publicUrl,
        setting_type: 'image',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'setting_key'
      });

    if (settingsError) {
      console.error('Ayar güncelleme hatası:', settingsError);
      return NextResponse.json({ error: 'Logo kaydedilemedi' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      message: 'Logo başarıyla yüklendi' 
    });

  } catch (error) {
    console.error('Logo yükleme hatası:', error);
    return NextResponse.json({ error: 'Logo yüklenirken hata oluştu' }, { status: 500 });
  }
}