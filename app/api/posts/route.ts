import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const body = await request.json();
    const { content, categoryId } = body;

    if (!content || !categoryId) {
      return NextResponse.json(
        { error: "Content and categoryId are required" },
        { status: 400 }
      );
    }

    const forwardedFor = request.headers.get("x-forwarded-for");
    const user_ip = forwardedFor ? forwardedFor.split(',')[0].trim() : "127.0.0.1";
    const user_agent = request.headers.get("user-agent") || "unknown";
    const authorHash = `${user_ip}-${user_agent}`;

    const { data, error } = await supabase
      .from("posts")
      .insert({
        content,
        category_id: categoryId,
        author_ip_hash: authorHash,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, post: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '6');
    const offset = (page - 1) * limit;

    let query = supabase
      .from("posts")
      .select(`
        id, 
        content, 
        category_id, 
        created_at, 
        likes_count, 
        dislikes_count, 
        comments_count, 
        is_boosted,
        author_id,
        is_hidden,
        categories(name, slug, icon)
      `)
      .eq('is_hidden', false)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    let countQuery = supabase
      .from("posts")
      .select('id', { count: 'exact' })
      .eq('is_hidden', false);

    // Kategori filtresi varsa uygula
    if (category && category !== 'all') {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single();

      if (categoryData) {
        query = query.eq('category_id', categoryData.id);
        countQuery = countQuery.eq('category_id', categoryData.id);
      }
    }

    const [{ data: posts, error }, { count }] = await Promise.all([
      query,
      countQuery
    ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get usernames for posts with author_id
    const postsWithUsernames = await Promise.all(
      (posts || []).map(async (post) => {
        if (post.author_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', post.author_id)
            .single();

          return {
            ...post,
            username: profile?.username || null
          };
        }
        return post;
      })
    );

    const response = NextResponse.json({ 
      success: true, 
      posts: postsWithUsernames,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit)
    });

    // Cache kontrolü ekle
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}