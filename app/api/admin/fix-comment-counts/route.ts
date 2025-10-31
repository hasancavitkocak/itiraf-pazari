import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdmin, rateLimit } from '@/lib/auth-middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const rateLimitResult = rateLimit(ip, 5, 15 * 60 * 1000); // 5 istek/15dk
  
  if (!rateLimitResult.allowed) {
    return NextResponse.json({ error: 'Çok fazla istek' }, { status: 429 });
  }

  // Admin yetkisi kontrolü
  const authResult = await verifyAdmin(request);
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    console.log('🔧 Yorum sayıları düzeltiliyor...');

    // Tüm postları al
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, comments_count');

    if (postsError) {
      throw postsError;
    }

    let fixedCount = 0;
    let totalProcessed = 0;
    const results = [];

    for (const post of posts || []) {
      totalProcessed++;
      
      // Bu post için gerçek yorum sayısını hesapla
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('id', { count: 'exact' })
        .eq('post_id', post.id)
        .eq('is_hidden', false);

      if (commentsError) {
        results.push({
          postId: post.id,
          status: 'error',
          error: commentsError.message
        });
        continue;
      }

      const realCommentCount = comments?.length || 0;
      const currentCommentCount = post.comments_count || 0;

      // Eğer sayılar farklıysa düzelt
      if (realCommentCount !== currentCommentCount) {
        const { error: updateError } = await supabase
          .from('posts')
          .update({ comments_count: realCommentCount })
          .eq('id', post.id);

        if (updateError) {
          results.push({
            postId: post.id,
            status: 'error',
            error: updateError.message
          });
        } else {
          results.push({
            postId: post.id,
            status: 'fixed',
            oldCount: currentCommentCount,
            newCount: realCommentCount
          });
          fixedCount++;
        }
      } else {
        results.push({
          postId: post.id,
          status: 'ok',
          count: realCommentCount
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `${fixedCount} post düzeltildi, ${totalProcessed} post işlendi`,
      fixedCount,
      totalProcessed,
      results: results.filter(r => r.status !== 'ok') // Sadece düzeltilen ve hatalı olanları göster
    });

  } catch (error: any) {
    console.error('Yorum sayıları düzeltme hatası:', error);
    return NextResponse.json({ 
      error: 'Yorum sayıları düzeltilemedi',
      details: error.message 
    }, { status: 500 });
  }
}
