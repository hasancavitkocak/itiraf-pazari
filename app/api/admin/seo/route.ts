import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('seo_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({ settings: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data: existing } = await supabase
      .from('seo_settings')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('seo_settings')
        .update({
          ...body,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('seo_settings')
        .insert(body);

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
