import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getIpHash } from '@/lib/security';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const REPORT_THRESHOLD = 5;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Admin kontrolü burada yapılabilir
    const { data: reports, error } = await supabaseAdmin
      .from('reports')
      .select(`
        id,
        reason,
        created_at,
        posts (
          id,
          title,
          content,
          is_hidden,
          categories (name)
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const { count } = await supabaseAdmin
      .from('reports')
      .select('id', { count: 'exact' });

    return NextResponse.json({
      success: true,
      reports: reports || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { post_id, reason } = body;

    if (!post_id || !reason) {
      return NextResponse.json(
        { error: 'post_id ve reason gerekli' },
        { status: 400 }
      );
    }

    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
    const ua = request.headers.get('user-agent') || 'unknown';
    const ipHash = getIpHash(ip, ua);

    const { data: existingReport } = await supabase
      .from('reports')
      .select('id')
      .eq('post_id', post_id)
      .eq('reporter_ip_hash', ipHash)
      .maybeSingle();

    if (existingReport) {
      return NextResponse.json(
        { error: 'Bu gönderiyi zaten bildirdiniz' },
        { status: 400 }
      );
    }

    const { error: insertError } = await supabase
      .from('reports')
      .insert({
        post_id,
        reason,
        reporter_ip_hash: ipHash,
      });

    if (insertError) throw insertError;

    const { data: reports } = await supabase
      .from('reports')
      .select('id')
      .eq('post_id', post_id);

    const reportCount = reports?.length || 0;

    await supabase
      .from('posts')
      .update({ reports_count: reportCount })
      .eq('id', post_id);

    if (reportCount >= REPORT_THRESHOLD) {
      await supabase
        .from('posts')
        .update({ is_hidden: true })
        .eq('id', post_id);

      return NextResponse.json({
        message: 'Rapor gönderildi. Post otomatik olarak gizlendi.',
      });
    }

    return NextResponse.json({ message: 'Rapor gönderildi' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
