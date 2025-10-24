import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

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

    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .eq('is_hidden', false)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get usernames for comments with author_id using admin client
    const commentsWithUsernames = await Promise.all(
      (data || []).map(async (comment) => {
        if (comment.author_id) {
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('username')
            .eq('id', comment.author_id)
            .single();
          
          return {
            ...comment,
            username: profile?.username || 'Kullanıcı'
          };
        }
        return {
          ...comment,
          username: 'Anonim'
        };
      })
    );

    return NextResponse.json({ comments: commentsWithUsernames });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Yorum yazmak için giriş yapmanız gerekiyor' },
        { status: 401 }
      );
    }

    // Verify user with supabase admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Geçersiz oturum' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { post_id, content } = body;

    if (!post_id || !content) {
      return NextResponse.json(
        { error: 'post_id ve content gerekli' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('comments')
      .insert({
        post_id,
        content,
        author_id: user.id,
        author_ip_hash: '', // Artık IP hash kullanmıyoruz
      })
      .select('*')
      .single();

    if (error) throw error;

    // Update comment count in posts table
    const { error: updateError } = await supabaseAdmin
      .rpc('increment_comment_count', { post_id });

    if (updateError) {
      console.error('Error updating comment count:', updateError);
    }

    // Get username for the new comment
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();

    return NextResponse.json({ 
      comment: {
        ...data,
        username: profile?.username || user.email?.split('@')[0] || 'Kullanıcı'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
