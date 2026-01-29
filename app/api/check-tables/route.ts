import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Mevcut tabloları listele
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (error) {
      console.error('Tables check error:', error);
    }

    // confession_logs tablosu var mı kontrol et
    const { data: confessionLogsExists, error: confessionError } = await supabase
      .from('confession_logs')
      .select('count')
      .limit(1);

    // posts tablosunda is_auto_generated kolonu var mı kontrol et
    const { data: postsColumns, error: postsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'posts')
      .eq('table_schema', 'public');

    return NextResponse.json({
      tables: tables?.map(t => t.table_name) || [],
      confession_logs_exists: !confessionError,
      confession_logs_error: confessionError?.message,
      posts_columns: postsColumns?.map(c => c.column_name) || [],
      posts_error: postsError?.message
    });

  } catch (error) {
    console.error('Check tables error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}