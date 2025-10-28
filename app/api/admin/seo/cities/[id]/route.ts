import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

interface Props {
  params: Promise<{ id: string }>;
}

// Tek şehir SEO ayarlarını getir
export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const cityId = parseInt(id);

    if (isNaN(cityId)) {
      return NextResponse.json(
        { error: 'Geçersiz şehir ID' },
        { status: 400 }
      );
    }

    // SEO ayarlarını al
    const { data: settings, error } = await supabaseAdmin
      .from('city_seo_settings')
      .select('*')
      .eq('city_id', cityId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw error;
    }

    return NextResponse.json({
      success: true,
      settings: settings || null
    });
  } catch (error: any) {
    console.error('City SEO fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Şehir SEO ayarları alınamadı' },
      { status: 500 }
    );
  }
}