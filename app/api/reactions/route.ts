import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { post_id, type } = body;

    if (!post_id || !type || !['like', 'dislike'].includes(type)) {
      return NextResponse.json(
        { error: 'Geçersiz istek' },
        { status: 400 }
      );
    }

    // Get IP and User Agent from request
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : (realIp || '127.0.0.1');
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const ipHash = `${ip}-${userAgent}`;

    // Kullanıcı kontrolü
    let userId = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      userId = user?.id || null;
      
      // Eğer kullanıcı giriş yaptıysa, bu post için IP'ye ait eski anonim kayıtları sil
      if (userId) {
        await supabaseAdmin
          .from('reactions')
          .delete()
          .eq('post_id', post_id)
          .eq('ip_hash', ipHash)
          .is('user_id', null);
      }
    }

    const today = new Date().toISOString().split('T')[0];

    // Günlük limit kontrolü
    let limitQuery = supabaseAdmin
      .from('reactions')
      .select('id')
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`);

    if (userId) {
      limitQuery = limitQuery.eq('user_id', userId);
    } else {
      limitQuery = limitQuery.eq('ip_hash', ipHash).is('user_id', null);
    }

    const { data: existingReactions } = await limitQuery;

    if (existingReactions && existingReactions.length >= 30) {
      return NextResponse.json(
        { error: 'Günlük reaksiyon limitine ulaştınız (30 reaksiyon/gün)' },
        { status: 429 }
      );
    }

    // Mevcut reaction kontrolü
    let reactionQuery = supabaseAdmin
      .from('reactions')
      .select('*')
      .eq('post_id', post_id);

    if (userId) {
      reactionQuery = reactionQuery.eq('user_id', userId);
    } else {
      reactionQuery = reactionQuery.eq('ip_hash', ipHash).is('user_id', null);
    }

    const { data: existingReaction } = await reactionQuery.maybeSingle();

    if (existingReaction) {
      if (existingReaction.type === type) {
        const { error: deleteError } = await supabaseAdmin
          .from('reactions')
          .delete()
          .eq('id', existingReaction.id);

        if (deleteError) throw deleteError;

        await updatePostCounts(post_id);

        return NextResponse.json({ message: 'Reaksiyon kaldırıldı', action: 'removed' });
      } else {
        const { error: updateError } = await supabaseAdmin
          .from('reactions')
          .update({ type })
          .eq('id', existingReaction.id);

        if (updateError) throw updateError;

        await updatePostCounts(post_id);

        return NextResponse.json({ message: 'Reaksiyon güncellendi', action: 'updated' });
      }
    }

    const { error } = await supabaseAdmin
      .from('reactions')
      .insert({
        post_id,
        type,
        ip_hash: ipHash,
        user_id: userId,
      });

    if (error) throw error;

    await updatePostCounts(post_id);

    return NextResponse.json({ message: 'Reaksiyon eklendi', action: 'added' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function updatePostCounts(postId: string) {
  const { data: reactions } = await supabaseAdmin
    .from('reactions')
    .select('type')
    .eq('post_id', postId);

  if (!reactions) return;

  const likes = reactions.filter((r) => r.type === 'like').length;
  const dislikes = reactions.filter((r) => r.type === 'dislike').length;

  await supabaseAdmin
    .from('posts')
    .update({
      likes_count: likes,
      dislikes_count: dislikes,
    })
    .eq('id', postId);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postIds = searchParams.get('post_ids')?.split(',') || [];

    if (postIds.length === 0) {
      return NextResponse.json({ reactions: {} });
    }

    // Get IP and User Agent from request
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : (realIp || '127.0.0.1');
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const ipHash = `${ip}-${userAgent}`;

    // Kullanıcı kontrolü
    let userId = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      userId = user?.id || null;
    }

    let query = supabaseAdmin
      .from('reactions')
      .select('post_id, type')
      .in('post_id', postIds);

    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.eq('ip_hash', ipHash).is('user_id', null);
    }

    const { data, error } = await query;

    if (error) throw error;

    const reactionsMap: Record<string, 'like' | 'dislike'> = {};
    data?.forEach((reaction) => {
      reactionsMap[reaction.post_id] = reaction.type;
    });

    return NextResponse.json({ reactions: reactionsMap });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
