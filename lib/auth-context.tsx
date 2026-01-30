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
    try {
      console.log('Fetching profile for user:', userId); // Debug log
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, nickname, login_username, display_username, email, role, is_premium, premium_expires_at, is_banned, created_at, birth_year, gender')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Profile fetch error:', error);
        setProfile(null);
        return;
      }

      if (data) {
        console.log('Profile loaded:', data.role); // Debug log
        setProfile(data);
      } else {
        // Profil yoksa oluştur
        console.log('Profile not found, creating...');
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const username = userData.user.email?.split('@')[0] || 'user';
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              username: username,
              email: userData.user.email,
              role: 'user'
            })
            .select()
            .single();

          if (createError) {
            console.error('Profile creation error:', createError);
            setProfile(null);
          } else {
            console.log('New profile created:', newProfile.role); // Debug log
            setProfile(newProfile);
          }
        }
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    let mounted = true;

    // İlk session kontrolü
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error('Session error:', error);
          // Sadece kritik hatalarda session'ı temizle
          if (error.message.includes('refresh_token_not_found') || 
              error.message.includes('Invalid Refresh Token') ||
              error.message.includes('JWT expired')) {
            console.log('Clearing invalid session');
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
          }
        } else if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setProfile(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Auth state değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      try {
        console.log('Auth state change:', event, 'session:', !!session, 'user:', !!session?.user); // Debug log
        
        if (event === 'SIGNED_OUT') {
          console.log('User signed out'); // Debug log
          setUser(null);
          setProfile(null);
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('User signed in or token refreshed'); // Debug log
          if (session?.user) {
            console.log('Setting user from auth state change'); // Debug log
            setUser(session.user);
            await fetchProfile(session.user.id);
          } else {
            console.log('No user in session'); // Debug log
            setUser(null);
            setProfile(null);
          }
        }

        // Session expire durumunda otomatik refresh dene
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.log('Token refresh failed, signing out');
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        // Sadece kritik hatalarda kullanıcıyı çıkış yap
        if (error instanceof Error && 
            (error.message.includes('refresh_token_not_found') ||
             error.message.includes('JWT expired'))) {
          console.log('Critical auth error, signing out');
          await supabase.auth.signOut();
          setUser(null);
          setProfile(null);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (nickname: string, password: string) => {
    try {
      console.log('SignIn attempt for:', nickname); // Debug log
      
      // Nickname'den email'e çevir
      const email = `${nickname}@anonymous.local`;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('SignIn response:', { user: !!data.user, session: !!data.session, error }); // Debug log

      if (error) {
        console.error('SignIn error:', error); // Debug log
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

      // Başarılı giriş sonrası manuel olarak state'i güncelle
      if (data.user && data.session) {
        console.log('Setting user and fetching profile...'); // Debug log
        setUser(data.user);
        await fetchProfile(data.user.id);
        
        console.log('SignIn completed successfully'); // Debug log
        
        // Kısa bir bekleme
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        throw new Error('Giriş verisi alınamadı');
      }
    } catch (error) {
      console.error('SignIn catch error:', error); // Debug log
      throw error;
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
    try {
      // Local state'i hemen temizle
      setUser(null);
      setProfile(null);
      
      // Supabase'den çıkış yap
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase signOut error:', error);
        // Hata olsa bile devam et
      }
      
      // Local storage'ı temizle
      localStorage.clear();
      
      // Ana sayfaya yönlendir
      window.location.href = '/';
    } catch (error) {
      console.error('SignOut error:', error);
      // Hata olsa bile çıkış yap
      setUser(null);
      setProfile(null);
      localStorage.clear();
      window.location.href = '/';
    }
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
