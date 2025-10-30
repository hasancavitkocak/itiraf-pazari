import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Önce is_active sütunu var mı kontrol et
    let data, error;
    
    try {
      // is_active sütunu varsa filtrele
      const result = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });
      
      data = result.data;
      error = result.error;
      
      console.log('Active categories (with is_active filter):', data);
    } catch (columnError) {
      console.log('is_active column might not exist, fetching all categories:', columnError);
      
      // is_active sütunu yoksa tüm kategorileri getir
      const result = await supabase
        .from('categories')
        .select('*')
        .order('order_index', { ascending: true });
      
      data = result.data;
      error = result.error;
      
      console.log('All categories (fallback):', data);
    }

    if (error) throw error;

    const response = NextResponse.json({ 
      categories: data || [],
      timestamp: new Date().getTime() // Cache busting için
    });
    
    // Cache'i devre dışı bırak
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
