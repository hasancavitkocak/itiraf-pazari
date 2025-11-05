import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Blog post detayını getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Blog post fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!post) {
      return NextResponse.json({ error: 'Blog post bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Blog post API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Blog post güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, slug, excerpt, content, category, readTime, keywords, metaDescription, isPublished } = body;

    // Slug benzersizlik kontrolü (mevcut post hariç)
    const { data: existingPost } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', slug)
      .neq('id', id)
      .single();

    if (existingPost) {
      return NextResponse.json({ error: 'Bu slug zaten kullanılıyor' }, { status: 400 });
    }

    const { data: post, error } = await supabase
      .from('blog_posts')
      .update({
        title,
        slug,
        excerpt,
        content,
        category: category || 'Genel',
        read_time: readTime || '5 dk',
        keywords: keywords || [],
        meta_description: metaDescription,
        is_published: isPublished || false
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Blog post update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Blog post update API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Blog post sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Blog post delete error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Blog post başarıyla silindi' });
  } catch (error) {
    console.error('Blog post delete API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}