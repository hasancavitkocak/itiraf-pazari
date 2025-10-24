import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { getIpHash } from '@/lib/security';

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

    const hdrs = headers();
    const ip = hdrs.get('x-forwarded-for') || hdrs.get('x-real-ip') || '127.0.0.1';
    const ua = hdrs.get('user-agent') || 'unknown';
    const ipHash = getIpHash(ip, ua);

    const today = new Date().toISOString().split('T')[0];

    const { data: existingReactions } = await supabase
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

    const { data: existingReaction } = await supabase
      .from('reactions')
      .select('*')
      .eq('post_id', post_id)
      .eq('ip_hash', ipHash)
      .maybeSingle();

    if (existingReaction) {
      if (existingReaction.type === type) {
        const { error: deleteError } = await supabase
          .from('reactions')
          .delete()
          .eq('id', existingReaction.id);

        if (deleteError) throw deleteError;

        await updatePostCounts(post_id);

        return NextResponse.json({ message: 'Reaksiyon kaldırıldı', action: 'removed' });
      } else {
        const { error: updateError } = await supabase
          .from('reactions')
          .update({ type })
          .eq('id', existingReaction.id);

        if (updateError) throw updateError;

        await updatePostCounts(post_id);

        return NextResponse.json({ message: 'Reaksiyon güncellendi', action: 'updated' });
      }
    }

    const { error } = await supabase
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
  const { data: reactions } = await supabase
    .from('reactions')
    .select('type')
    .eq('post_id', postId);

  if (!reactions) return;

  const likes = reactions.filter((r) => r.type === 'like').length;
  const dislikes = reactions.filter((r) => r.type === 'dislike').length;

  await supabase
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

    const hdrs = headers();
    const ip = hdrs.get('x-forwarded-for') || hdrs.get('x-real-ip') || '127.0.0.1';
    const ua = hdrs.get('user-agent') || 'unknown';
    const ipHash = getIpHash(ip, ua);

    const { data, error } = await supabase
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
