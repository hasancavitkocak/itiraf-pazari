import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { filterBadWords, getBadWords } from '@/lib/word-filter';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const body = await request.json();
    const { title, content, categoryId, cityId, districtId, universityId, customLocation } = body;

    if (!title || !content || !categoryId) {
      return NextResponse.json(
        { error: "Title, content and categoryId are required" },
        { status: 400 }
      );
    }

    // İçerik uzunluk kontrolü
    if (title.length > 100) {
      return NextResponse.json(
        { error: "Başlık en fazla 100 karakter olabilir" },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: "İtiraf içeriği en fazla 2000 karakter olabilir" },
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

    // Kullanıcı oturum kontrolü - Authorization header'dan token al
    let authorId = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      authorId = user?.id || null;
    }

    const { data, error } = await supabase
      .from("posts")
      .insert({
        title: filteredTitle,
        content: filteredContent,
        category_id: categoryId,
        city_id: cityId || null,
        district_id: districtId || null,
        university_id: universityId || null,
        custom_location: filteredCustomLocation,
        author_ip_hash: authorHash,
        author_id: authorId,
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
    const cityName = searchParams.get('city'); // Şehir adı kullanıyoruz
    const districtName = searchParams.get('district'); // İlçe adı kullanıyoruz
    const universitySlug = searchParams.get('university'); // Üniversite slug'ı kullanıyoruz
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';
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
        university_id,
        custom_location,
        created_at, 
        likes_count, 
        dislikes_count, 
        comments_count,
        views_count,
        is_boosted,
        author_id,
        is_hidden,
        categories(name, slug, icon),
        cities(name),
        districts(name),
        universities(name, slug)
      `)
      .eq('is_hidden', false)
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

    // Şehir filtresi - şehir slug'ına göre
    if (cityName && cityName !== 'all') {
      // Tüm şehirleri çek ve slug ile eşleştir
      const { data: allCities } = await supabase
        .from('cities')
        .select('id, name');
      
      // Slug'a göre şehri bul (Türkçe karakterler için özel dönüşüm)
      const cityData = allCities?.find(city => {
        const citySlug = city.name
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
        return citySlug === cityName;
      });

      if (cityData) {
        query = query.eq('city_id', cityData.id);
        countQuery = countQuery.eq('city_id', cityData.id);
      }
    }

    // İlçe filtresi - ilçe slug'ına göre
    if (districtName && districtName !== 'all') {
      // Tüm ilçeleri çek ve slug ile eşleştir
      const { data: allDistricts } = await supabase
        .from('districts')
        .select('id, name');
      
      const districtData = allDistricts?.find(district => {
        const districtSlug = district.name
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
        return districtSlug === districtName;
      });

      if (districtData) {
        query = query.eq('district_id', districtData.id);
        countQuery = countQuery.eq('district_id', districtData.id);
      }
    }

    // Üniversite filtresi - üniversite slug'ına göre
    if (universitySlug && universitySlug !== 'all') {
      const { data: universityData } = await supabase
        .from('universities')
        .select('id')
        .eq('slug', universitySlug)
        .single();

      if (universityData) {
        query = query.eq('university_id', universityData.id);
        countQuery = countQuery.eq('university_id', universityData.id);
      }
    }

    // Arama filtresi
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
      countQuery = countQuery.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    // Sıralama mantığı
    switch (sort) {
      case 'popular':
        // Popülerlik = (likes * 2 + comments * 3) - (dislikes * 1)
        // En popüler olanlar önce
        query = query.order('likes_count', { ascending: false })
          .order('comments_count', { ascending: false })
          .order('created_at', { ascending: false });
        break;

      case 'trending':
        // Trend = Son 24 saatte oluşturulan ve popüler olanlar
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        query = query.gte('created_at', yesterday.toISOString())
          .order('likes_count', { ascending: false })
          .order('comments_count', { ascending: false })
          .order('created_at', { ascending: false });
        break;

      case 'newest':
      default:
        // En yeni olanlar önce (varsayılan)
        query = query.order('created_at', { ascending: false });
        break;
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
        let username = 'anonymous'; // Varsayılan olarak anonymous

        if (post.author_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', post.author_id)
            .single();
          username = profile?.username || 'anonymous';
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
