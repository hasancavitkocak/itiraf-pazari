import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { comment_id } = body;

    if (!comment_id) {
      return NextResponse.json(
        { error: 'comment_id gerekli' },
        { status: 400 }
      );
    }

    // Önce yorumun hangi post'a ait olduğunu öğren
    const { data: comment, error: fetchError } = await supabaseAdmin
      .from('comments')
      .select('post_id')
      .eq('id', comment_id)
      .single();

    if (fetchError) throw fetchError;

    // Yorumu sil (hard delete)
    const { error: deleteError } = await supabaseAdmin
      .from('comments')
      .delete()
      .eq('id', comment_id);

    if (deleteError) throw deleteError;

    // Post'un yorum sayısını güncelle
    const { data: commentCount } = await supabaseAdmin
      .from('comments')
      .select('id', { count: 'exact' })
      .eq('post_id', comment.post_id)
      .eq('is_hidden', false);

    await supabaseAdmin
      .from('posts')
      .update({ comments_count: commentCount?.length || 0 })
      .eq('id', comment.post_id);

    return NextResponse.json({ 
      success: true,
      message: 'Yorum silindi'
    });
  } catch (error: any) {
    console.error('Delete comment error:', error);
    return NextResponse.json(
      { error: error.message || 'İşlem başarısız' },
      { status: 500 }
    );
  }
}
