import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { id: cityId } = await params;

    // Şehir SEO ayarlarını al
    const { data: seoSettings, error } = await supabaseAdmin
      .from('city_seo_settings')
      .select('*')
      .eq('city_id', parseInt(cityId))
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json({
      success: true,
      settings: seoSettings
    });
  } catch (error: any) {
    console.error('City SEO fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Şehir SEO ayarları alınamadı' },
      { status: 500 }
    );
  }
}