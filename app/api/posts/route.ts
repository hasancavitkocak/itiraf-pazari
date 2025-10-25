import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { filterBadWords, getBadWords } from '@/lib/word-filter';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const body = await request.json();
    const { title, content, categoryId, cityId, districtId, customLocation } = body;

    if (!title || !content || !categoryId) {
      return NextResponse.json(
        { error: "Title, content and categoryId are required" },
        { status: 400 }
      );
    }

    // Yasaklı kelimeleri al ve filtreleme yap
    const badWords = await getBadWords();
    const filteredTitle = filterBadWords(title, badWords);
    const filteredContent = filterBadWords(content, badWords);
    const filteredCustomLocation = customLocation ? filterBadWords(customLocation, badWords) : null;

    const forwardedFor = request.headers.get("x-forwarded-for");
    const user_ip = forwardedFor ? forwardedFor.split(',')[0].trim() : "127.0.0.1";
    const user_agent = request.headers.get("user-agent") || "unknown";
    const authorHash = `${user_ip}-${user_agent}`;

    const { data, error } = await supabase
      .from("posts")
      .insert({
        title: filteredTitle,
        content: filteredContent,
        category_id: categoryId,
        city_id: cityId || null,
        district_id: districtId || null,
        custom_location: filteredCustomLocation,
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
    const cityId = searchParams.get('city');
    const districtId = searchParams.get('district');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '6');
    const offset = (page - 1) * limit;

    let query = supabase
      .from("posts")
      .select(`
        id, 
        title,
        content, 
        category_id, 
        city_id,
        district_id,
        custom_location,
        created_at, 
        likes_count, 
        dislikes_count, 
        comments_count, 
        is_boosted,
        author_id,
        is_hidden,
        categories(name, slug, icon),
        cities(name),
        districts(name)
      `)
      .eq('is_hidden', false)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    let countQuery = supabase
      .from("posts")
      .select('id', { count: 'exact' })
      .eq('is_hidden', false);

    // Kategori filtresi
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

    // Şehir filtresi
    if (cityId) {
      query = query.eq('city_id', parseInt(cityId));
      countQuery = countQuery.eq('city_id', parseInt(cityId));
    }

    // İlçe filtresi
    if (districtId) {
      query = query.eq('district_id', parseInt(districtId));
      countQuery = countQuery.eq('district_id', parseInt(districtId));
    }

    // Arama filtresi
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
      countQuery = countQuery.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const [{ data: posts, error }, { count }] = await Promise.all([
      query,
      countQuery
    ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Yasaklı kelimeleri al
    const badWords = await getBadWords();

    // Get usernames for posts with author_id and filter bad words
    const postsWithUsernames = await Promise.all(
      (posts || []).map(async (post) => {
        let username = null;
        if (post.author_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', post.author_id)
            .single();
          username = profile?.username || 'Anonim';
        }

        // Yasaklı kelimeleri filtrele
        return {
          ...post,
          title: post.title ? filterBadWords(post.title, badWords) : post.title,
          content: filterBadWords(post.content, badWords),
          custom_location: post.custom_location ? filterBadWords(post.custom_location, badWords) : post.custom_location,
          username
        };
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