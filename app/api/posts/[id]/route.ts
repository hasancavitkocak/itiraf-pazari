import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service role key ile RLS bypass
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = id;

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID gerekli' },
        { status: 400 }
      );
    }

    // Check if post exists
    const { data: post, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (fetchError || !post) {
      return NextResponse.json(
        { error: 'İtiraf bulunamadı' },
        { status: 404 }
      );
    }

    // Sadece üye olan kullanıcılar kendi itiraflarını silebilir
    if (!post.author_id) {
      return NextResponse.json(
        { error: 'Bu itirafı silme yetkiniz yok. Sadece üye kullanıcılar itiraflarını silebilir.' },
        { status: 403 }
      );
    }

    // Get user from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      );
    }

    // Verify user with supabase
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Geçersiz oturum' },
        { status: 401 }
      );
    }

    // Check if user owns the post
    if (post.author_id !== user.id) {
      return NextResponse.json(
        { error: 'Bu itirafı silme yetkiniz yok' },
        { status: 403 }
      );
    }

    // Delete the post
    const { error: deleteError } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('id', postId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
