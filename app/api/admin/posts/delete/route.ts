import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { post_id } = await request.json();

    if (!post_id) {
      return NextResponse.json(
        { error: 'Post ID gerekli' },
        { status: 400 }
      );
    }

    // Admin olarak gönderiyi sil (cascade ile yorumlar ve reaksiyonlar da silinir)
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', post_id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}