import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { sponsored_content_id } = await request.json();

    if (!sponsored_content_id) {
      return NextResponse.json({ error: 'Sponsored content ID required' }, { status: 400 });
    }

    // Görüntülenme sayısını artır - önce mevcut değeri al
    const { data: currentData, error: fetchError } = await adminSupabase
      .from('sponsored_content')
      .select('view_count')
      .eq('id', sponsored_content_id)
      .single();

    if (fetchError) {
      console.error('Error fetching current view count:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Sonra artır
    const { error } = await adminSupabase
      .from('sponsored_content')
      .update({ 
        view_count: (currentData?.view_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', sponsored_content_id);

    if (error) {
      console.error('Error updating view count:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('View tracking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}