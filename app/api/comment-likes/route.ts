import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '@/lib/auth-middleware';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip + process.env.IP_HASH_SECRET!).digest('hex');
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const rateLimitResult = rateLimit(ip, 30, 15 * 60 * 1000); // 30 beğeni/15dk
  
  if (!rateLimitResult.allowed) {
    return NextResponse.json({ error: 'Çok fazla beğeni' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { commentId } = body;

    if (!commentId) {
      return NextResponse.json({ error: 'Yorum ID gerekli' }, { status: 400 });
    }

    // Kullanıcı kontrolü
    let userId = null;
    let userIpHash = null;

    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        userId = user.id;
      }
    }

    if (!userId) {
      userIpHash = hashIP(ip);
    }

    // Daha önce beğenmiş mi kontrol et
    let existingLike;
    if (userId) {
      const { data } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', userId)
        .single();
      existingLike = data;
    } else {
      const { data } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_ip_hash', userIpHash)
        .single();
      existingLike = data;
    }

    if (existingLike) {
      // Beğeniyi kaldır
      const { error } = await supabase
        .from('comment_likes')
        .delete()
        .eq('id', existingLike.id);

      if (error) {
        return NextResponse.json({ error: 'Beğeni kaldırılamadı' }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        action: 'unliked',
        message: 'Beğeni kaldırıldı' 
      });
    } else {
      // Beğeni ekle
      const likeData: any = { comment_id: commentId };
      if (userId) {
        likeData.user_id = userId;
      } else {
        likeData.user_ip_hash = userIpHash;
      }

      const { error } = await supabase
        .from('comment_likes')
        .insert(likeData);

      if (error) {
        return NextResponse.json({ error: 'Beğeni eklenemedi' }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        action: 'liked',
        message: 'Beğeni eklendi' 
      });
    }

  } catch (error: any) {
    console.error('Comment like error:', error);
    return NextResponse.json({ error: 'Beğeni işlemi başarısız' }, { status: 500 });
  }
}

// Kullanıcının yorum beğenilerini getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const commentIds = searchParams.get('comment_ids')?.split(',') || [];

    if (commentIds.length === 0) {
      return NextResponse.json({ likes: {} });
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    let userId = null;
    let userIpHash = null;

    // Kullanıcı kontrolü
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        userId = user.id;
      }
    }

    if (!userId) {
      userIpHash = hashIP(ip);
    }

    // Kullanıcının beğendiği yorumları getir
    let query = supabase
      .from('comment_likes')
      .select('comment_id')
      .in('comment_id', commentIds);

    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.eq('user_ip_hash', userIpHash);
    }

    const { data: likes } = await query;

    const userLikes: Record<string, boolean> = {};
    commentIds.forEach(id => {
      userLikes[id] = likes?.some(like => like.comment_id === id) || false;
    });

    return NextResponse.json({ likes: userLikes });

  } catch (error: any) {
    console.error('Get comment likes error:', error);
    return NextResponse.json({ error: 'Beğeniler getirilemedi' }, { status: 500 });
  }
}