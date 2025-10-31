import { NextRequest, NextResponse } from "next/server";
import { clearBadWordsCache } from '@/lib/word-filter';

export async function POST(request: NextRequest) {
  try {
    clearBadWordsCache();
    
    // Cache durumunu güncelle
    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('/rest/v1', '')}/api/bad-words/cache-status`, {
      method: 'POST'
    }).catch(() => {}); // Hata olursa sessizce devam et
    
    return NextResponse.json({ 
      success: true, 
      message: "Cache temizlendi"
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
