import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('bad_words')
      .select('word');

    if (error) throw error;

    const words = data?.map((item) => item.word) || [];

    return NextResponse.json({ words });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, words: [] }, { status: 500 });
  }
}
