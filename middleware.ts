import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting için basit in-memory store
const rateLimit = new Map();

export function middleware(request: NextRequest) {
  // API routes için rate limiting
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'anonymous';
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 dakika
    const maxRequests = 100; // Dakikada max 100 istek

    const key = `${ip}:${Math.floor(now / windowMs)}`;
    const requestCount = rateLimit.get(key) || 0;

    if (requestCount >= maxRequests) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }

    rateLimit.set(key, requestCount + 1);

    // Eski kayıtları temizle
    const keysToDelete: string[] = [];
    rateLimit.forEach((value, key) => {
      if (parseInt(key.split(':')[1]) < Math.floor(now / windowMs) - 5) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => rateLimit.delete(key));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};