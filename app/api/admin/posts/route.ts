import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Admin yetkisi ile tüm gönderileri getir (RLS bypass)
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        is_hidden,
        reports_count,
        likes_count,
        comments_count,
        created_at,
        categories(name, slug, icon)
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    return NextResponse.json({ posts: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
