import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdmin, rateLimit } from '@/lib/auth-middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  // Rate limiting - dosya yükleme için daha sıkı limit
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const rateLimitResult = rateLimit(ip, 5, 15 * 60 * 1000); // 5 dosya/15dk
  
  if (!rateLimitResult.allowed) {
    return NextResponse.json({ error: 'Çok fazla dosya yükleme isteği' }, { status: 429 });
  }

  // Admin yetkisi kontrolü
  const authResult = await verifyAdmin(request);
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 });
    }

    // Güvenlik kontrolleri
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Sadece JPG, PNG, WebP ve SVG dosyaları yüklenebilir' }, { status: 400 });
    }

    // Dosya boyutunu kontrol et (2MB max - güvenlik için düşürüldü)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'Dosya boyutu 2MB\'dan küçük olmalıdır' }, { status: 400 });
    }

    // Dosya adı güvenlik kontrolü
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
    if (originalName.length === 0) {
      return NextResponse.json({ error: 'Geçersiz dosya adı' }, { status: 400 });
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