import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { seoCities } from '@/lib/cities-seo';

// Şehir SEO listesini getir
export async function GET() {
  try {
    // Şehir istatistiklerini al
    const citiesWithStats = await Promise.all(
      seoCities.map(async (city) => {
        // Her şehir için gönderi sayısını al
        const { count } = await supabaseAdmin
          .from('posts')
          .select('id', { count: 'exact' })
          .eq('city_id', city.id)
          .eq('is_hidden', false);

        // SEO ayarlarını kontrol et (varsa)
        const { data: seoSettings } = await supabaseAdmin
          .from('city_seo_settings')
          .select('*')
          .eq('city_id', city.id)
          .single();

        return {
          id: city.id,
          slug: city.slug,
          name: city.name,
          is_active: seoSettings?.is_active ?? true, // Varsayılan aktif
          title: seoSettings?.title || `${city.name} İtirafları | İtiraf Pazarı`,
          description: seoSettings?.description || `${city.name}'dan anonim itiraflar. ${city.name} şehrinden gerçek hikayeler, deneyimler ve itiraflar. Tamamen anonim ve güvenli.`,
          keywords: seoSettings?.keywords || `${city.name} itiraf, ${city.name} anonim itiraf, ${city.name} hikaye, ${city.name} deneyim`,
          post_count: count || 0,
          last_updated: seoSettings?.updated_at || new Date().toISOString(),
          redirect_url: seoSettings?.redirect_url || null,
          redirect_type: seoSettings?.redirect_type || 0
        };
      })
    );

    return NextResponse.json({
      success: true,
      cities: citiesWithStats
    });
  } catch (error: any) {
    console.error('City SEO fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Şehir listesi alınamadı' },
      { status: 500 }
    );
  }
}

// Şehir SEO ayarlarını kaydet
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, description, keywords, redirect_url, redirect_type } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Şehir ID gerekli' },
        { status: 400 }
      );
    }

    // Şehir SEO ayarlarını kaydet veya güncelle
    const { error } = await supabaseAdmin
      .from('city_seo_settings')
      .upsert({
        city_id: id,
        title: title || null,
        description: description || null,
        keywords: keywords || null,
        redirect_url: redirect_url || null,
        redirect_type: redirect_type || 0,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'city_id'
      });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Şehir SEO ayarları kaydedildi'
    });
  } catch (error: any) {
    console.error('City SEO save error:', error);
    return NextResponse.json(
      { error: error.message || 'Kaydetme başarısız' },
      { status: 500 }
    );
  }
}

// Şehir durumunu güncelle
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, city_id, is_active } = body;

    if (action === 'toggle_status') {
      const { error } = await supabaseAdmin
        .from('city_seo_settings')
        .upsert({
          city_id,
          is_active,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'city_id'
        });

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: `Şehir ${is_active ? 'aktif' : 'pasif'} edildi`
      });
    }

    return NextResponse.json(
      { error: 'Geçersiz işlem' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('City SEO update error:', error);
    return NextResponse.json(
      { error: error.message || 'Güncelleme başarısız' },
      { status: 500 }
    );
  }
}