import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    // Önce tabloyu sil (varsa)
    await supabase.rpc('exec_sql', {
      sql: 'DROP TABLE IF EXISTS confession_logs CASCADE;'
    });

    // Yeni tabloyu oluştur
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE confession_logs (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          action VARCHAR(100) NOT NULL,
          details JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE INDEX idx_confession_logs_created_at ON confession_logs(created_at DESC);
        CREATE INDEX idx_confession_logs_action ON confession_logs(action);

        ALTER TABLE confession_logs ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Admin can read confession logs" ON confession_logs
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE profiles.id = auth.uid() 
              AND profiles.role = 'admin'
            )
          );

        CREATE POLICY "System can insert confession logs" ON confession_logs
          FOR INSERT WITH CHECK (true);
      `
    });

    if (error) {
      console.error('Create confession_logs error:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'confession_logs table created successfully' 
    });

  } catch (error) {
    console.error('Create confession_logs API error:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}