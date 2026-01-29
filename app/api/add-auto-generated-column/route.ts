import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    // posts tablosuna is_auto_generated kolonu ekle
    const { data, error } = await supabase
      .from('posts')
      .select('id')
      .limit(1);

    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: 'Posts table not accessible: ' + error.message 
      }, { status: 500 });
    }

    // Kolon ekleme işlemi için raw SQL kullanmaya gerek yok
    // Supabase dashboard'dan manuel ekleyebiliriz
    
    return NextResponse.json({ 
      success: true, 
      message: 'Posts table is accessible. Add is_auto_generated column manually in Supabase dashboard.',
      instruction: 'ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_auto_generated BOOLEAN DEFAULT FALSE;'
    });

  } catch (error) {
    console.error('Add column API error:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}