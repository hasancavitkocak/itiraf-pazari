import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function verifyAdmin(request: NextRequest) {
  try {
    // Authorization header'ını kontrol et
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'Yetkilendirme tokeni bulunamadi', status: 401 };
    }

    const token = authHeader.substring(7);

    // Token'i dogrula
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return { error: 'Gecersiz token', status: 401 };
    }

    // Kullanici profilini kontrol et
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, is_banned')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return { error: 'Kullanici profili bulunamadi', status: 404 };
    }

    // Admin yetkisi kontrolu
    if (profile.role !== 'admin') {
      return { error: 'Admin yetkisi gerekli', status: 403 };
    }

    // Banned kontrolu
    if (profile.is_banned) {
      return { error: 'Hesap engellenmis', status: 403 };
    }

    return { user, profile };
  } catch (error) {
    console.error('Auth middleware hatasi:', error);
    return { error: 'Yetkilendirme hatasi', status: 500 };
  }
}

export async function verifyUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'Yetkilendirme tokeni bulunamadi', status: 401 };
    }

    const token = authHeader.substring(7);

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return { error: 'Gecersiz token', status: 401 };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return { error: 'Kullanici profili bulunamadi', status: 404 };
    }

    if (profile.is_banned) {
      return { error: 'Hesap engellenmis', status: 403 };
    }

    return { user, profile };
  } catch (error) {
    console.error('User auth hatasi:', error);
    return { error: 'Yetkilendirme hatasi', status: 500 };
  }
}

// Rate limiting için basit in-memory store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(ip: string, maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
  const now = Date.now();
  const key = ip;
  
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }
  
  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }
  
  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

// Input sanitization
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // XSS koruması
      .replace(/javascript:/gi, '') // JavaScript URL koruması
      .replace(/on\w+\s*=/gi, '') // Event handler koruması
      .trim();
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[sanitizeInput(key)] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}
