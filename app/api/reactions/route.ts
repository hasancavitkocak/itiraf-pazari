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

    const today = new Date().toISOString().split('T')[0];

    const { data: existingReactions } = await supabaseAdmin
      .from('reactions')
      .select('id')
      .eq('ip_hash', ipHash)
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`);

    if (existingReactions && existingReactions.length >= 30) {
      return NextResponse.json(
        { error: 'Günlük reaksiyon limitine ulaştınız (30 reaksiyon/gün)' },
        { status: 429 }
      );
    }

    const { data: existingReaction } = await supabaseAdmin
      .from('reactions')
      .select('*')
      .eq('post_id', post_id)
      .eq('ip_hash', ipHash)
      .maybeSingle();

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

    const { data, error } = await supabaseAdmin
      .from('reactions')
      .select('post_id, type')
      .eq('ip_hash', ipHash)
      .in('post_id', postIds);

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
