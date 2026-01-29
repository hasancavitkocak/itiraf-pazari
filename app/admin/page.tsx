'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/header';
import { Loader as Loader2 } from 'lucide-react';
import { UsersManagement } from '@/components/admin/users-management';
import { PostsManagement } from '@/components/admin/posts-management';
import { PaymentsManagement } from '@/components/admin/payments-management';
import { AnalyticsDashboard } from '@/components/admin/analytics-dashboard';
import { SEOManagement } from '@/components/admin/seo-management';
import { SponsoredContentManagement } from '@/components/admin/sponsored-content-management';
import { PricingManagement } from '@/components/admin/pricing-management';
import { ContactManagement } from '@/components/admin/contact-management';
import { CategoriesManagement } from '@/components/admin/categories-management';
import { BadWordsManagement } from '@/components/admin/bad-words-management';
import { ReportsManagement } from '@/components/admin/reports-management';
import SettingsManagement from '@/components/admin/settings-management';
import { JobsManagement } from '@/components/admin/jobs-management';
import { Footer } from '@/components/footer';

export default function AdminPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && mounted) {
      if (!profile) {
        // Profil yok, ana sayfaya yönlendir
        router.push('/');
        return;
      }
      
      if (profile.role !== 'admin') {
        // Admin değil, ana sayfaya yönlendir
        router.push('/');
        return;
      }
    }
  }, [profile, loading, mounted, router]);

  if (loading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Yükleniyor...</span>
      </div>
    );
  }

  // Debug log
  console.log('Admin page render:', { 
    profile: profile ? { role: profile.role, nickname: profile.nickname } : null,
    loading,
    mounted 
  });

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Profil yükleniyor...</p>
          <p className="text-sm text-gray-500 mt-2">Eğer bu mesaj devam ederse, çıkış yapıp tekrar giriş yapın.</p>
        </div>
      </div>
    );
  }

  if (profile.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Bu sayfaya erişim yetkiniz yok.</p>
          <p className="text-sm text-gray-500 mt-2">Role: {profile.role}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-7xl">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-8">Yönetim Paneli</h1>

        <Tabs defaultValue="analytics" className="space-y-6">
          {/* Mobil için kaydırılabilir tab listesi */}
          <div className="w-full overflow-x-auto">
            <TabsList className="flex w-max min-w-full h-auto p-1 bg-muted rounded-lg">
              <TabsTrigger value="analytics" className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm">
                📊 Analiz
              </TabsTrigger>
              <TabsTrigger value="users" className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm">
                👥 Kullanıcılar
              </TabsTrigger>
              <TabsTrigger value="posts" className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm">
                📝 Gönderiler
              </TabsTrigger>
              <TabsTrigger value="categories" className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm">
                📂 Kategoriler
              </TabsTrigger>
              <TabsTrigger value="badwords" className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm">
                🚫 Yasaklı Kelimeler
              </TabsTrigger>
              <TabsTrigger value="reports" className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm">
                📊 Raporlar
              </TabsTrigger>
              <TabsTrigger value="contact" className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm">
                📧 İletişim
              </TabsTrigger>
              {/* Premium özellikler geçici olarak devre dışı */}
              {/* <TabsTrigger value="payments" className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm">
                💳 Ödemeler
              </TabsTrigger>
              <TabsTrigger value="pricing" className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm">
                💰 Fiyatlar
              </TabsTrigger> */}
              <TabsTrigger value="seo" className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm">
                🔍 SEO
              </TabsTrigger>
              <TabsTrigger value="sponsored" className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm">
                📢 Sponsorlu İçerik
              </TabsTrigger>
              <TabsTrigger value="settings" className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm">
                ⚙️ Ayarlar
              </TabsTrigger>
              <TabsTrigger value="jobs" className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm">
                🤖 Jobs
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="users">
            <UsersManagement />
          </TabsContent>

          <TabsContent value="posts">
            <PostsManagement />
          </TabsContent>

          <TabsContent value="categories">
            <CategoriesManagement />
          </TabsContent>

          <TabsContent value="badwords">
            <BadWordsManagement />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsManagement />
          </TabsContent>

          <TabsContent value="contact">
            <ContactManagement />
          </TabsContent>

          {/* Premium özellikler geçici olarak devre dışı */}
          {/* <TabsContent value="payments">
            <PaymentsManagement />
          </TabsContent>

          <TabsContent value="pricing">
            <PricingManagement />
          </TabsContent> */}

          <TabsContent value="seo">
            <SEOManagement />
          </TabsContent>

          <TabsContent value="sponsored">
            <SponsoredContentManagement />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsManagement />
          </TabsContent>

          <TabsContent value="jobs">
            <JobsManagement />
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}
