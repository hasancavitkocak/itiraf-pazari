'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Loader2 } from 'lucide-react';

export default function PremiumPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Giriş yapmış kullanıcıları ana sayfaya yönlendir
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Giriş yapmış kullanıcı varsa hiçbir şey render etme
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold mb-6">Premium Özellikler</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Şu anda premium özellikler geçici olarak devre dışı bırakılmıştır.
        </p>
        <p className="text-lg text-muted-foreground">
          Yakında reklam destekli ücretsiz model ile hizmet vereceğiz.
        </p>
      </div>
      
      <Footer />
    </div>
  );
}
