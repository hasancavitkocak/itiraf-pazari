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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Key, Loader as Loader2, FileText, Trash2, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  likes_count: number;
  dislikes_count: number;
  comments_count: number;
  categories?: {
    name: string;
    icon: string;
  } | null;
}

export default function ProfilePage() {
  const { user, profile, loading: authLoading, refreshProfile, signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [postsLoading, setPostsLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    // Auth loading tamamlanana kadar bekle
    if (authLoading) {
      return;
    }

    // Auth loading tamamlandıktan sonra user yoksa yönlendir
    if (!user) {
      router.push('/auth');
      return;
    }

    // Kullanıcının gönderilerini yükle
    fetchUserPosts();
  }, [user, profile, router, authLoading]);

  const fetchUserPosts = async () => {
    if (!user) return;

    setPostsLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          content,
          created_at,
          likes_count,
          dislikes_count,
          comments_count,
          categories!inner(name, icon)
        `)
        .eq('author_id', user.id)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Supabase'den gelen veriyi düzelt
      const formattedPosts = (data || []).map((post: any) => ({
        ...post,
        categories: Array.isArray(post.categories) ? post.categories[0] : post.categories
      }));
      
      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Gönderiler yüklenirken hata oluştu');
    } finally {
      setPostsLoading(false);
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

    if (newPassword.length > 20) {
      toast.error('Yeni şifre en fazla 20 karakter olabilir');
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

      // Yeni session'ı ayarla
      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        });
      }

      toast.success('Şifre başarıyla değiştirildi');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Profili yenile
      await refreshProfile();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };



  // Auth loading durumunda loading göster
  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // User yok ve loading tamamlandıysa (zaten useEffect'te yönlendirme yapılacak)
  if (!user) {
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
              <h1 className="text-3xl font-bold">Profilim</h1>
              <p className="text-muted-foreground">
                Gönderilerinizi ve hesap ayarlarınızı yönetin
              </p>
            </div>
          </div>

          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="posts" className="gap-2">
                <FileText className="h-4 w-4" />
                Gönderilerim
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                Ayarlar
              </TabsTrigger>
            </TabsList>

            {/* Gönderilerim Sekmesi */}
            <TabsContent value="posts" className="space-y-4">
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      <h2 className="text-xl font-semibold">Gönderilerim</h2>
                    </div>
                    <Badge variant="secondary">{posts.length} gönderi</Badge>
                  </div>

                  {postsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : posts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Henüz gönderi paylaşmadınız</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {posts.map((post) => (
                        <Card key={post.id} className="p-4 hover:bg-accent/50 transition-colors">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  {post.categories && (
                                    <Badge variant="secondary" className="gap-1">
                                      <span>{post.categories.icon}</span>
                                      <span>{post.categories.name}</span>
                                    </Badge>
                                  )}
                                </div>
                                <h3 className="font-semibold text-sm mb-1 truncate">{post.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-3">
                                <span>❤️ {post.likes_count}</span>
                                <span>👎 {post.dislikes_count}</span>
                                <span>💬 {post.comments_count}</span>
                              </div>
                              <span>
                                {formatDistanceToNow(new Date(post.created_at), {
                                  addSuffix: true,
                                  locale: tr,
                                })}
                              </span>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* Ayarlar Sekmesi */}
            <TabsContent value="settings" className="space-y-4">
              {/* Kullanıcı Bilgileri */}
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <h2 className="text-xl font-semibold">Kullanıcı Bilgileri</h2>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm text-muted-foreground">Kullanıcı Adı (Nickname)</Label>
                      <p className="font-medium">{profile?.nickname || 'Yükleniyor...'}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Bu sizin giriş yaptığınız kullanıcı adınızdır
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm text-muted-foreground">Anonim İsim</Label>
                      <p className="font-medium">{profile?.username || 'Anonim'}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Yorumlarda görünen anonim isminiz (otomatik atanmıştır)
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm text-muted-foreground">Doğum Yılı</Label>
                      <p className="font-medium">{profile?.birth_year || 'Belirtilmemiş'}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Kayıt sırasında belirttiğiniz doğum yılı
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm text-muted-foreground">Cinsiyet</Label>
                      <p className="font-medium">
                        {profile?.gender === 'kadın' ? 'Kadın' : 
                         profile?.gender === 'erkek' ? 'Erkek' : 
                         profile?.gender === 'belirtmek_istemiyorum' ? 'Belirtmek istemiyorum' : 
                         'Belirtilmemiş'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Kayıt sırasında belirttiğiniz cinsiyet
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm text-muted-foreground">Üyelik Tarihi</Label>
                      <p className="font-medium">
                        {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('tr-TR') : 'Yükleniyor...'}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

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
                          maxLength={20}
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
                          maxLength={20}
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
                          maxLength={20}
                        />
                      </div>
                    </div>

                    <Button type="submit" disabled={loading}>
                      {loading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
                    </Button>
                  </form>
                </div>
              </Card>
            </TabsContent>
          </Tabs>


        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}