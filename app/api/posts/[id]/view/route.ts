import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;

    if (!postId) {
      return NextResponse.json({ error: 'Post ID gerekli' }, { status: 400 });
    }

    // Post'un var olup olmadığını kontrol et
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, views_count')
      .eq('id', postId)
      .eq('is_hidden', false)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: 'Post bulunamadı' }, { status: 404 });
    }

    // Görüntülenme sayısını artır
    const { error: updateError } = await supabase
      .from('posts')
      .update({ 
        views_count: (post.views_count || 0) + 1
      })
      .eq('id', postId);

    if (updateError) {
      console.error('View count update error:', updateError);
      return NextResponse.json({ error: 'Görüntülenme sayısı güncellenemedi' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      views_count: (post.views_count || 0) + 1 
    });

  } catch (error: any) {
    console.error('View count API error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}