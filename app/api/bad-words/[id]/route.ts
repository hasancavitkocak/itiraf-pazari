import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { clearBadWordsCache } from '@/lib/word-filter';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { id } = await params;

    const { error } = await supabase
      .from("bad_words")
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Cache'i temizle
    clearBadWordsCache();

    return NextResponse.json({ 
      success: true, 
      message: "Yasaklı kelime silindi"
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { id } = await params;
    const body = await request.json();
    const { word } = body;

    if (!word || !word.trim()) {
      return NextResponse.json(
        { error: "Kelime boş olamaz" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("bad_words")
      .update({ word: word.trim().toLowerCase() })
      .eq('id', id)
      .select("*")
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: "Bu kelime zaten listede mevcut" },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Cache'i temizle
    clearBadWordsCache();

    return NextResponse.json({ 
      success: true, 
      message: "Yasaklı kelime güncellendi",
      badWord: data 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}