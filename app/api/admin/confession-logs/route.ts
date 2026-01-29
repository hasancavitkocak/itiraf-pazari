import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Admin kontrolü yapılabilir burada
    
    // confession_logs tablosu yoksa boş array döndür
    try {
      const { data: logs, error } = await supabase
        .from('confession_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.warn('Confession logs fetch error (table may not exist):', error);
        return NextResponse.json({ 
          success: true, 
          logs: [],
          message: 'confession_logs table not found'
        });
      }

      return NextResponse.json({ 
        success: true, 
        logs: logs || [] 
      });
    } catch (tableError) {
      console.warn('confession_logs table does not exist:', tableError);
      return NextResponse.json({ 
        success: true, 
        logs: [],
        message: 'confession_logs table not found'
      });
    }

  } catch (error) {
    console.error('Confession logs API error:', error);
    return NextResponse.json({ 
      success: true, 
      logs: [],
      error: 'Internal server error'
    });
  }
}