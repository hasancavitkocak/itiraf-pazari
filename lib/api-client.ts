import { supabase } from './supabase';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  requireAuth?: boolean;
}

export async function adminFetch(endpoint: string, options: ApiOptions = {}) {
  return apiCall(endpoint, { ...options, requireAuth: true });
}

export async function authenticatedFormFetch(endpoint: string, formData: FormData) {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    throw new Error('Authentication required');
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: formData,
  });

  return response;
}

export async function apiCall(endpoint: string, options: ApiOptions = {}) {
  const { method = 'GET', body, requireAuth = false } = options;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Auth gerekiyorsa token ekle
  if (requireAuth) {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Session error:', error);
      
      // Refresh token hatası varsa oturumu temizle
      if (error.message.includes('refresh_token_not_found') || 
          error.message.includes('Invalid Refresh Token')) {
        await supabase.auth.signOut();
        throw new Error('Oturumunuz sona erdi. Lütfen tekrar giriş yapın.');
      }
      
      throw new Error('Kimlik doğrulama hatası');
    }
    
    if (!session) {
      throw new Error('Giriş yapmanız gerekiyor');
    }
    
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(endpoint, config);
    
    // 401 Unauthorized - token süresi dolmuş olabilir
    if (response.status === 401) {
      // Token yenilemeyi dene
      const { error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error('Token refresh failed:', refreshError);
        await supabase.auth.signOut();
        throw new Error('Oturumunuz sona erdi. Lütfen tekrar giriş yapın.');
      }
      
      // Yenilenen token ile tekrar dene
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        headers.Authorization = `Bearer ${session.access_token}`;
        const retryResponse = await fetch(endpoint, { ...config, headers });
        
        if (!retryResponse.ok) {
          throw new Error(`API Error: ${retryResponse.status}`);
        }
        
        return await retryResponse.json();
      }
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}
