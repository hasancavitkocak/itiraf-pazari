import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function extractSupabaseToken(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
  
  for (const cookie of cookies) {
    if (cookie.includes('sb-') && cookie.includes('-auth-token')) {
      const [, value] = cookie.split('=');
      if (value) {
        try {
          const decoded = decodeURIComponent(value);
          const parsed = JSON.parse(decoded);
          return parsed.access_token;
        } catch {
          continue;
        }
      }
    }
  }
  
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const accessToken = extractSupabaseToken(cookieHeader);

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Oturum bulunamadı' },
        { status: 401 }
      );
    }

    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 401 }
      );
    }

    // Premium üyeliği iptal et (hemen değil, süre bitince)
    const { error } = await supabase
      .from('profiles')
      .update({ 
        is_premium: false,
        premium_expires_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) throw error;

    return NextResponse.json({ 
      message: 'Premium üyelik iptal edildi'
    });
  } catch (error: any) {
    console.error('Cancel premium error:', error);
    return NextResponse.json(
      { error: error.message || 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
