import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { clearBadWordsCache } from '@/lib/word-filter';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: badWords, error } = await supabase
      .from("bad_words")
      .select("id, word, created_at")
      .order("word");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      badWords: badWords || []
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
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
      .insert({ word: word.trim().toLowerCase() })
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
      message: "Yasaklı kelime eklendi",
      badWord: data 
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
