import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

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

export async function POST(request: Request) {
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

    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!adminProfile || adminProfile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    const { user_id, role } = await request.json();

    if (!user_id || !role) {
      return NextResponse.json(
        { error: 'Kullanıcı ID ve rol gerekli' },
        { status: 400 }
      );
    }

    if (!['user', 'admin', 'moderator'].includes(role)) {
      return NextResponse.json(
        { error: 'Geçersiz rol' },
        { status: 400 }
      );
    }

    if (user_id === user.id && role !== 'admin') {
      return NextResponse.json(
        { error: 'Kendi admin rolünüzü kaldıramazsınız' },
        { status: 400 }
      );
    }

    const { data: adminCount } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin');

    const { data: targetUser } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user_id)
      .single();

    if (targetUser?.role === 'admin' && adminCount && adminCount.length <= 1 && role !== 'admin') {
      return NextResponse.json(
        { error: 'Sistemde en az bir admin olmalıdır' },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', user_id);

    if (updateError) throw updateError;

    return NextResponse.json({
      message: 'Kullanıcı rolü güncellendi',
      user_id,
      role
    });
  } catch (error: any) {
    console.error('Change role error:', error);
    return NextResponse.json(
      { error: error.message || 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
