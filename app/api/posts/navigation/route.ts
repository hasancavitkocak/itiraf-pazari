import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const currentId = searchParams.get('current_id');

    if (!currentId) {
      return NextResponse.json({ error: 'Current ID is required' }, { status: 400 });
    }

    // Mevcut post'un created_at değerini al
    const { data: currentPost, error: currentError } = await supabase
      .from('posts')
      .select('created_at')
      .eq('id', currentId)
      .single();

    if (currentError || !currentPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Önceki post (daha yeni)
    const { data: prevPost } = await supabase
      .from('posts')
      .select('id')
      .gt('created_at', currentPost.created_at)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    // Sonraki post (daha eski)
    const { data: nextPost } = await supabase
      .from('posts')
      .select('id')
      .lt('created_at', currentPost.created_at)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      prev_id: prevPost?.id || null,
      next_id: nextPost?.id || null
    });

  } catch (error) {
    console.error('Navigation API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}