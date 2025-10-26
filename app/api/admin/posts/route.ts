import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Admin yetkisi ile tüm gönderileri getir (RLS bypass)
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        is_hidden,
        reports_count,
        likes_count,
        dislikes_count,
        comments_count,
        created_at,
        author_id,
        category_id,
        custom_location,
        categories(id, name, slug, icon),
        cities(name),
        districts(name)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Toplam sayıyı al
    const { count } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({ 
      posts: data || [], 
      total: count || 0,
      page,
      limit
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
