import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { comment_id, is_hidden } = body;

    if (!comment_id || typeof is_hidden !== 'boolean') {
      return NextResponse.json(
        { error: 'comment_id ve is_hidden gerekli' },
        { status: 400 }
      );
    }

    // Yorumun görünürlüğünü güncelle
    const { error } = await supabaseAdmin
      .from('comments')
      .update({ is_hidden })
      .eq('id', comment_id);

    if (error) throw error;

    return NextResponse.json({ 
      success: true,
      message: is_hidden ? 'Yorum gizlendi' : 'Yorum gösterildi'
    });
  } catch (error: any) {
    console.error('Toggle comment visibility error:', error);
    return NextResponse.json(
      { error: error.message || 'İşlem başarısız' },
      { status: 500 }
    );
  }
}