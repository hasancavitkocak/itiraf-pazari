import { supabase } from './supabase';

// API çağrıları için authenticated fetch wrapper
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  // Mevcut session'dan token'ı al
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
  }

  // Headers'ı hazırla
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
    ...options.headers,
  };

  // Fetch isteğini yap
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // 401 hatası alırsak oturumu sonlandır
  if (response.status === 401) {
    await supabase.auth.signOut();
    window.location.href = '/auth';
    throw new Error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
  }

  return response;
}

// Admin API çağrıları için özel wrapper
export async function adminFetch(url: string, options: RequestInit = {}) {
  try {
    return await authenticatedFetch(url, options);
  } catch (error) {
    console.error('Admin API hatası:', error);
    throw error;
  }
}

// Multipart form data için özel wrapper (dosya yükleme)
export async function authenticatedFormFetch(url: string, formData: FormData) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      // Content-Type'ı FormData için otomatik ayarlanmasına izin ver
    },
    body: formData,
  });

  if (response.status === 401) {
    await supabase.auth.signOut();
    window.location.href = '/auth';
    throw new Error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
  }

  return response;
}