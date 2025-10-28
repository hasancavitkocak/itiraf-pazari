'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface Profile {
  id: string;
  username: string | null;
  nickname: string;
  login_username: string | null;
  display_username: string | null;
  email: string | null;
  role: string;
  is_premium: boolean;
  premium_expires_at: string | null;
  is_banned: boolean;
  created_at: string;
  birth_year: number | null;
  gender: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (nickname: string, password: string) => Promise<void>;
  signUp: (nickname: string, password: string, birthYear: string, gender: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (data) {
      setProfile(data);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // İlk session kontrolü
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      (async () => {
        if (error) {
          console.error('Session error:', error);
          // Refresh token hatası varsa oturumu temizle
          if (error.message.includes('refresh_token_not_found') || 
              error.message.includes('Invalid Refresh Token')) {
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
          }
        } else {
          setUser(session?.user ?? null);
          if (session?.user) {
            await fetchProfile(session.user.id);
          }
        }
        setLoading(false);
      })();
    });

    // Auth state değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id);
      
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setUser(null);
        setProfile(null);
        return;
      }

      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (nickname: string, password: string) => {
    // Nickname'den email'e çevir
    const email = `${nickname}@anonymous.local`;
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Hata mesajını Türkçeleştir
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Kullanıcı adı veya şifre hatalı');
      } else if (error.message.includes('Email not confirmed')) {
        throw new Error('E-posta adresiniz doğrulanmamış');
      } else if (error.message.includes('Too many requests')) {
        throw new Error('Çok fazla deneme. Lütfen daha sonra tekrar deneyin');
      } else {
        throw new Error('Giriş yapılamadı. Lütfen tekrar deneyin');
      }
    }
  };

  const signUp = async (nickname: string, password: string, birthYear: string, gender: string) => {
    // Şifre validation
    if (password.length < 6) {
      throw new Error('Şifre en az 6 karakter olmalıdır');
    }
    if (password.length > 20) {
      throw new Error('Şifre en fazla 20 karakter olabilir');
    }

    // Nickname benzersizlik kontrolü
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('nickname', nickname)
      .maybeSingle();

    if (existingProfile) {
      throw new Error('Bu kullanıcı adı zaten kullanılıyor');
    }

    // Nickname'den email'e çevir
    const email = `${nickname}@anonymous.local`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    
    // Manuel olarak profil oluştur
    if (data.user) {
      // Anonim username oluştur
      const randomNum = Math.floor(Math.random() * 900000 + 100000);
      const username = `anonymous${randomNum}`;
      
      // Profil oluştur veya güncelle
      const profileData: any = {
        id: data.user.id,
        username: username,
        nickname: nickname,
        role: 'user',
        is_premium: false,
        is_banned: false
      };

      // Doğum yılı ve cinsiyet ekle (zorunlu)
      profileData.birth_year = parseInt(birthYear);
      profileData.gender = gender;

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'id'
        });
      
      if (profileError) {
        console.error('Profil oluşturma hatası:', profileError);
        throw new Error('Profil oluşturulamadı');
      }
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Çıkış sonrası ana sayfaya yönlendir
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
