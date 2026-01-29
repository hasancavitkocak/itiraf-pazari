import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Posts tablosundan bir kayıt al ve yapısını gör
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .limit(1);

    if (error) {
      return NextResponse.json({ 
        error: error.message,
        code: error.code 
      }, { status: 500 });
    }

    // Kategorileri de kontrol et
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name')
      .eq('is_active', true)
      .limit(5);

    return NextResponse.json({
      posts_sample: posts?.[0] || null,
      posts_count: posts?.length || 0,
      categories: categories || [],
      categories_error: catError?.message
    });

  } catch (error) {
    console.error('Check posts structure error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}