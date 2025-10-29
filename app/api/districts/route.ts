import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { searchParams } = new URL(request.url);
    const citySlug = searchParams.get('city_slug'); // Şehir slug'ı (anasayfa filtreleme için)
    const cityId = searchParams.get('city_id'); // Şehir ID'si (yeni post formu için)

    let targetCityId: number | null = null;

    // city_id parametresi varsa direkt kullan
    if (cityId) {
      targetCityId = parseInt(cityId);
    } 
    // city_slug parametresi varsa şehir ID'sini bul
    else if (citySlug) {
      const { data: allCities } = await supabase
        .from('cities')
        .select('id, name');
      
      const cityData = allCities?.find(city => {
        const citySlugFormatted = city.name
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
        return citySlugFormatted === citySlug;
      });

      if (cityData) {
        targetCityId = cityData.id;
      }
    } else {
      return NextResponse.json(
        { error: "city_slug or city_id parameter is required" },
        { status: 400 }
      );
    }

    if (!targetCityId) {
      return NextResponse.json({ 
        success: true, 
        districts: []
      });
    }

    const { data: districts, error } = await supabase
      .from("districts")
      .select("id, name")
      .eq("city_id", targetCityId)
      .order("name");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      districts: districts || []
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}