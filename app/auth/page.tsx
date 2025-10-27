'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Footer } from '@/components/footer';

export default function AuthPage() {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [siteLogo, setSiteLogo] = useState<string>('');
  const [siteName, setSiteName] = useState<string>('İtiraf Pazarı');
  const [isLoading, setIsLoading] = useState(true);
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Site ayarlarını yükle
    const fetchSiteSettings = async () => {
      try {
        const response = await fetch('/api/site-settings');
        if (response.ok) {
          const settings = await response.json();
          if (settings.site_logo) {
            setSiteLogo(settings.site_logo);
          }
          if (settings.site_name) {
            setSiteName(settings.site_name);
          }
        }
      } catch (error) {
        console.error('Site ayarları yüklenirken hata:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSiteSettings();
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(nickname, password);
      toast.success('Giriş başarılı!');
      router.push('/');
    } catch (error: any) {
      toast.error(error.message || 'Giriş yapılamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signUp(nickname, password);
      toast.success('Kayıt başarılı! Otomatik giriş yapılıyor...');
      
      // Kayıt başarılı olduktan sonra otomatik giriş yap
      await signIn(nickname, password);
      router.push('/');
    } catch (error: any) {
      toast.error(error.message || 'Kayıt oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/">
            {!isLoading && siteLogo ? (
              <div className="flex justify-center mb-2">
                <Image
                  src={siteLogo}
                  alt={siteName}
                  width={220}
                  height={60}
                  className="h-16 w-auto object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            ) : !isLoading ? (
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {siteName}
              </h1>
            ) : (
              <div className="h-16 w-full"></div>
            )}
          </Link>
          <p className="text-muted-foreground mt-2">
            Anonim olarak itiraflarınızı paylaşın
          </p>
        </div>

        <Card className="p-6">
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Giriş Yap</TabsTrigger>
              <TabsTrigger value="signup">Kayıt Ol</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-nickname">Kullanıcı Adı</Label>
                  <Input
                    id="signin-nickname"
                    type="text"
                    placeholder="kullaniciadi"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password">Şifre</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-nickname">Kullanıcı Adı</Label>
                  <Input
                    id="signup-nickname"
                    type="text"
                    placeholder="kullaniciadi"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    required
                    minLength={3}
                    maxLength={20}
                    pattern="[a-zA-Z0-9_]+"
                  />
                  <p className="text-xs text-muted-foreground">
                    3-20 karakter, sadece harf, rakam ve alt çizgi
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Şifre</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    En az 6 karakter olmalıdır
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Kayıt oluşturuluyor...' : 'Kayıt Ol'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="text-center mt-4">
          <Link href="/">
            <Button variant="link">Ana Sayfaya Dön</Button>
          </Link>
        </div>
      </motion.div>
      </div>
      
      <Footer />
    </div>
  );
}
