import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { error } = await supabaseAdmin
      .from("reports")
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Rapor silindi"
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action } = body; // 'approve' or 'reject'

    // Raporu al
    const { data: report, error: reportError } = await supabaseAdmin
      .from('reports')
      .select('post_id')
      .eq('id', id)
      .single();

    if (reportError || !report) {
      return NextResponse.json({ error: 'Rapor bulunamadı' }, { status: 404 });
    }

    if (action === 'approve') {
      // Postu gizle
      await supabaseAdmin
        .from('posts')
        .update({ is_hidden: true })
        .eq('id', report.post_id);

      // Raporu sil
      await supabaseAdmin
        .from('reports')
        .delete()
        .eq('id', id);

      return NextResponse.json({ 
        success: true, 
        message: "Rapor onaylandı, post gizlendi"
      });
    } else if (action === 'reject') {
      // Sadece raporu sil
      await supabaseAdmin
        .from('reports')
        .delete()
        .eq('id', id);

      return NextResponse.json({ 
        success: true, 
        message: "Rapor reddedildi"
      });
    }

    return NextResponse.json({ error: 'Geçersiz aksiyon' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}