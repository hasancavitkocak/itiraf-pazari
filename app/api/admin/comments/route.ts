import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('post_id');

    if (!postId) {
      return NextResponse.json(
        { error: 'post_id gerekli' },
        { status: 400 }
      );
    }

    // Tüm yorumları getir (gizli olanlar dahil)
    const { data: comments, error } = await supabaseAdmin
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        author_id,
        likes_count,
        is_hidden
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Username'leri getir
    const commentsWithUsernames = await Promise.all(
      (comments || []).map(async (comment) => {
        if (comment.author_id) {
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('display_username')
            .eq('id', comment.author_id)
            .single();
          
          return {
            ...comment,
            username: profile?.display_username || null
          };
        }
        return {
          ...comment,
          username: null
        };
      })
    );

    return NextResponse.json({ 
      comments: commentsWithUsernames,
      count: commentsWithUsernames.length
    });
  } catch (error: any) {
    console.error('Admin comments error:', error);
    return NextResponse.json(
      { error: error.message || 'Yorumlar yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}
