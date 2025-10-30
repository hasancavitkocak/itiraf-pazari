import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getBadWords, filterBadWords } from '@/lib/word-filter';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;

    if (!postId) {
      return NextResponse.json({ error: 'Post ID gerekli' }, { status: 400 });
    }

    // Post'u getir
    const { data: post, error } = await supabase
      .from('posts')
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
        views_count,
        is_boosted,
        author_id,
        is_hidden,
        categories(name, slug, icon),
        cities(name),
        districts(name)
      `)
      .eq('id', postId)
      .eq('is_hidden', false)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'İtiraf bulunamadı' }, { status: 404 });
      }
      throw error;
    }

    // Yasaklı kelimeleri al
    const badWords = await getBadWords();

    // Username'i al
    let username = 'anonymous'; // Varsayılan olarak anonymous
    
    if (post.author_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', post.author_id)
        .single();
      
      username = profile?.username || 'anonymous';
    }

    // Yasaklı kelimeleri filtrele ve username ekle
    const filteredPost = {
      ...post,
      title: post.title ? filterBadWords(post.title, badWords) : post.title,
      content: filterBadWords(post.content, badWords),
      custom_location: post.custom_location ? filterBadWords(post.custom_location, badWords) : post.custom_location,
      username
    };

    return NextResponse.json({ 
      success: true, 
      post: filteredPost 
    });

  } catch (error: any) {
    console.error('Get post error:', error);
    return NextResponse.json({ 
      error: 'İtiraf getirilemedi' 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;

    if (!postId) {
      return NextResponse.json({ error: 'Post ID gerekli' }, { status: 400 });
    }

    // Kullanıcı doğrulama
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'İtiraf silmek için giriş yapmanız gerekiyor' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Geçersiz oturum' },
        { status: 401 }
      );
    }

    // Post'un sahibi mi kontrol et
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: 'İtiraf bulunamadı' }, { status: 404 });
    }

    if (post.author_id !== user.id) {
      return NextResponse.json({ error: 'Bu itirafı silme yetkiniz yok' }, { status: 403 });
    }

    // İtirafı sil (soft delete)
    const { error: deleteError } = await supabase
      .from('posts')
      .update({ is_hidden: true })
      .eq('id', postId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ 
      success: true, 
      message: 'İtiraf silindi' 
    });

  } catch (error: any) {
    console.error('Delete post error:', error);
    return NextResponse.json({ 
      error: 'İtiraf silinemedi' 
    }, { status: 500 });
  }
}