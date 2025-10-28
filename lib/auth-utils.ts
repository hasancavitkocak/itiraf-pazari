import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function getAuthenticatedUser(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Authorization header'dan token al
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return { user: null, error: null };
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.error('Auth error:', error);
      
      // Refresh token hatası varsa özel handling
      if (error.message.includes('refresh_token_not_found') || 
          error.message.includes('Invalid Refresh Token') ||
          error.message.includes('JWT expired')) {
        return { 
          user: null, 
          error: { 
            type: 'token_expired', 
            message: 'Session expired, please login again' 
          } 
        };
      }
      
      return { user: null, error };
    }

    return { user, error: null };
  } catch (error) {
    console.error('Auth utils error:', error);
    return { user: null, error };
  }
}

export async function requireAuth(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser(request);
  
  if (!user) {
    throw new Error((error as any)?.type === 'token_expired' 
      ? 'Session expired, please login again' 
      : 'Authentication required'
    );
  }
  
  return user;
}