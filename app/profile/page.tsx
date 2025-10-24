'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Key, Loader as Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function ProfilePage() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }
    if (profile?.username) {
      setUsername(profile.username);
    }
  }, [user, profile, router]);

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error('Kullanıcı adı boş olamaz');
      return;
    }

    setLoading(true);
    try {
      // Supabase session token'ı al
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error('Oturum bulunamadı');
        return;
      }

      const response = await fetch('/api/profile/update-username', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ username: username.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Güncelleme başarısız');
      }

      toast.success('Kullanıcı adı güncellendi');
      await refreshProfile();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Tüm alanları doldurun');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Yeni şifre en az 6 karakter olmalı');
      return;
    }

    setLoading(true);
    try {
      // Supabase session token'ı al
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error('Oturum bulunamadı');
        return;
      }

      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          currentPassword, 
          newPassword 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Şifre değiştirme başarısız');
      }

      toast.success('Şifre başarıyla değiştirildi');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };



  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Profil Ayarları</h1>
              <p className="text-muted-foreground">
                Hesap bilgilerinizi yönetin
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            {/* Kullanıcı Bilgileri */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <h2 className="text-xl font-semibold">Kullanıcı Bilgileri</h2>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-muted-foreground">E-posta</Label>
                    <p className="font-medium">{user.email}</p>
                  </div>

                  <div>
                    <Label className="text-sm text-muted-foreground">Üyelik Tarihi</Label>
                    <p className="font-medium">
                      {new Date(profile.created_at).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleUpdateUsername} className="space-y-3">
                  <div>
                    <Label htmlFor="username">Kullanıcı Adı</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Kullanıcı adınız"
                      maxLength={50}
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Güncelleniyor...' : 'Kullanıcı Adını Güncelle'}
                  </Button>
                </form>
              </div>
            </Card>


          </div>

          {/* Şifre Değiştirme */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Şifre Değiştir</h2>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="current-password">Mevcut Şifre</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <Label htmlFor="new-password">Yeni Şifre</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirm-password">Yeni Şifre (Tekrar)</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
                </Button>
              </form>
            </div>
          </Card>


        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}