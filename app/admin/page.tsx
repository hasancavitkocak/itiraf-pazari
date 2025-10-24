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
import { AdsManagement } from '@/components/admin/ads-management';
import { PricingManagement } from '@/components/admin/pricing-management';
import { ContactManagement } from '@/components/admin/contact-management';
import { CategoriesManagement } from '@/components/admin/categories-management';
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
      if (!profile || profile.role !== 'admin') {
        router.push('/');
      }
    }
  }, [profile, loading, mounted, router]);

  if (loading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile || profile.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Yönetim Paneli</h1>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-9">
            <TabsTrigger value="analytics">Analiz</TabsTrigger>
            <TabsTrigger value="users">Kullanıcılar</TabsTrigger>
            <TabsTrigger value="posts">Gönderiler</TabsTrigger>
            <TabsTrigger value="categories">Kategoriler</TabsTrigger>
            <TabsTrigger value="contact">İletişim</TabsTrigger>
            <TabsTrigger value="payments">Ödemeler</TabsTrigger>
            <TabsTrigger value="pricing">Fiyatlar</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="ads">Reklamlar</TabsTrigger>
          </TabsList>

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

          <TabsContent value="contact">
            <ContactManagement />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentsManagement />
          </TabsContent>

          <TabsContent value="pricing">
            <PricingManagement />
          </TabsContent>

          <TabsContent value="seo">
            <SEOManagement />
          </TabsContent>

          <TabsContent value="ads">
            <AdsManagement />
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}
