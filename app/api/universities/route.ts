import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { searchParams } = new URL(request.url);
    const citySlug = searchParams.get('city_slug');

    let query = supabase
      .from("universities")
      .select(`
        id,
        name,
        slug,
        cities(name, id)
      `)
      .eq('is_active', true)
      .order('name');

    // Şehir filtresi varsa uygula
    if (citySlug && citySlug !== 'all') {
      // Tüm şehirleri çek ve slug ile eşleştir
      const { data: allCities } = await supabase
        .from('cities')
        .select('id, name');
      
      // Slug'a göre şehri bul (Türkçe karakterler için özel dönüşüm)
      const cityData = allCities?.find(city => {
        const citySlugGenerated = city.name
          .replace(/İ/g, 'i')
          .replace(/I/g, 'i')
          .replace(/ı/g, 'i')
          .replace(/Ğ/g, 'g')
          .replace(/ğ/g, 'g')
          .replace(/Ü/g, 'u')
          .replace(/ü/g, 'u')
          .replace(/Ş/g, 's')
          .replace(/ş/g, 's')
          .replace(/Ö/g, 'o')
          .replace(/ö/g, 'o')
          .replace(/Ç/g, 'c')
          .replace(/ç/g, 'c')
          .toLowerCase();
        return citySlugGenerated === citySlug;
      });

      if (cityData) {
        query = query.eq('city_id', cityData.id);
      }
    }

    const { data: universities, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const response = NextResponse.json({
      success: true,
      universities: universities || []
    });

    // Cache kontrolü ekle
    response.headers.set('Cache-Control', 'public, max-age=3600'); // 1 saat cache

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}