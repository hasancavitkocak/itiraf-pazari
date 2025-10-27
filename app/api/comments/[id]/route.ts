import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const commentId = id;

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID gerekli' },
        { status: 400 }
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

    // Check if comment exists
    const { data: comment, error: fetchError } = await supabaseAdmin
      .from('comments')
      .select('*')
      .eq('id', commentId)
      .single();

    if (fetchError || !comment) {
      return NextResponse.json(
        { error: 'Yorum bulunamadı' },
        { status: 404 }
      );
    }

    // Check if user owns the comment
    if (comment.author_id !== user.id) {
      return NextResponse.json(
        { error: 'Bu yorumu silme yetkiniz yok' },
        { status: 403 }
      );
    }

    // Delete the comment
    const { error: deleteError } = await supabaseAdmin
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (deleteError) {
      throw deleteError;
    }

    // Update comment count in posts table - manuel olarak hesapla
    const { data: commentCount } = await supabaseAdmin
      .from('comments')
      .select('id', { count: 'exact' })
      .eq('post_id', comment.post_id)
      .eq('is_hidden', false);

    const { error: updateError } = await supabaseAdmin
      .from('posts')
      .update({ comments_count: commentCount?.length || 0 })
      .eq('id', comment.post_id);

    if (updateError) {
      console.error('Error updating comment count:', updateError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
