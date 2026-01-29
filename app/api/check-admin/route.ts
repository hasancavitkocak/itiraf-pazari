import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Admin kullanıcıları listele
    const { data: admins, error } = await supabase
      .from('profiles')
      .select('id, nickname, role, created_at')
      .eq('role', 'admin');

    if (error) {
      return NextResponse.json({ 
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      admins: admins || [],
      count: admins?.length || 0
    });

  } catch (error) {
    console.error('Check admin error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}