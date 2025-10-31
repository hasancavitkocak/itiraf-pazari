import { NextRequest } from 'next/server';
import crypto from 'crypto';

// CSRF token store (production'da Redis kullanılmalı)
const csrfTokens = new Map<string, { token: string; expires: number }>();

export function generateCSRFToken(sessionId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + (60 * 60 * 1000); // 1 saat
  
  csrfTokens.set(sessionId, { token, expires });
  
  // Eski token'lari temizle
  csrfTokens.forEach((value, key) => {
    if (value.expires < Date.now()) {
      csrfTokens.delete(key);
    }
  });
  
  return token;
}

export function verifyCSRFToken(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId);
  
  if (!stored || stored.expires < Date.now()) {
    csrfTokens.delete(sessionId);
    return false;
  }
  
  return stored.token === token;
}

export function validateCSRF(request: NextRequest, sessionId: string): boolean {
  // GET istekleri için CSRF kontrolü yapma
  if (request.method === 'GET') {
    return true;
  }
  
  const csrfToken = request.headers.get('x-csrf-token');
  if (!csrfToken) {
    return false;
  }
  
  return verifyCSRFToken(sessionId, csrfToken);
}
