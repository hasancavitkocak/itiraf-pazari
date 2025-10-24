import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Admin yetkisi ile tüm ödemeleri getir
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        profiles(id)
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    return NextResponse.json({ payments: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
