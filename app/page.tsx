'use client';

import { useEffect, useState, useCallback } from 'react';
import { Header } from '@/components/header';
import { NewPostForm } from '@/components/new-post-form';
import { PostCard } from '@/components/post-card';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Loader as Loader2, Lock, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  is_premium: boolean;
}

interface Post {
  id: string;
  content: string;
  likes_count?: number;
  dislikes_count?: number;
  comments_count?: number;
  is_boosted: boolean;
  created_at: string;
  author_id?: string;
  username?: string;
  categories?: {
    name: string;
    slug: string;
    icon: string;
  };
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author_id?: string;
  username?: string;
}

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 6;
  const [userReactions, setUserReactions] = useState<Record<string, 'like' | 'dislike' | null>>({});
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string>('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [reportReason, setReportReason] = useState('');

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Kategoriler yüklenirken hata oluştu');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: postsPerPage.toString()
      });

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      const response = await fetch(`/api/posts?${params}`);
      const data = await response.json();
      setPosts(data.posts || []);
      setTotalPages(Math.ceil((data.total || 0) / postsPerPage));

      const postIds = data.posts?.map((p: Post) => p.id).join(',') || '';
      if (postIds) {
        const reactionsResponse = await fetch(`/api/reactions?post_ids=${postIds}`);
        const reactionsData = await reactionsResponse.json();
        setUserReactions(reactionsData.reactions || {});
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Gönderiler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedCategory, postsPerPage]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when category changes
  }, [selectedCategory]);

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, currentPage, fetchPosts]);

  const handleReaction = async (postId: string, type: 'like' | 'dislike') => {
    try {
      const currentReaction = userReactions[postId];
      let newReaction: 'like' | 'dislike' | null = null;

      // Determine new reaction state
      if (currentReaction === type) {
        // Same button clicked - remove reaction
        newReaction = null;
      } else {
        // Different button clicked or no previous reaction - set new reaction
        newReaction = type;
      }

      // Optimistic update - immediately update UI
      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post.id === postId) {
            let newLikes = post.likes_count || 0;
            let newDislikes = post.dislikes_count || 0;

            // Remove current reaction
            if (currentReaction === 'like') {
              newLikes = Math.max(0, newLikes - 1);
            } else if (currentReaction === 'dislike') {
              newDislikes = Math.max(0, newDislikes - 1);
            }

            // Add new reaction
            if (newReaction === 'like') {
              newLikes += 1;
            } else if (newReaction === 'dislike') {
              newDislikes += 1;
            }

            return {
              ...post,
              likes_count: newLikes,
              dislikes_count: newDislikes
            };
          }
          return post;
        })
      );

      // Update user reactions state
      setUserReactions(prev => ({
        ...prev,
        [postId]: newReaction
      }));

      const response = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, type }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Bir hata oluştu');
      }

      // No need to refresh all posts, optimistic update is sufficient
    } catch (error: any) {
      toast.error(error.message);
      // Revert optimistic update on error
      await fetchPosts();
    }
  };

  const openCommentDialog = async (postId: string) => {
    if (!user) {
      toast.error('Yorumları görmek için giriş yapmanız gerekiyor');
      router.push('/auth');
      return;
    }

    setSelectedPostId(postId);
    setCommentDialogOpen(true);

    try {
      const response = await fetch(`/api/comments?post_id=${postId}`);
      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    if (!user) {
      toast.error('Yorum yazmak için giriş yapmanız gerekiyor');
      return;
    }

    try {
      // Supabase session token'ı al
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        toast.error('Oturum bulunamadı');
        return;
      }

      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ post_id: selectedPostId, content: newComment }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Bir hata oluştu');
      }

      toast.success('Yorum eklendi!');
      setNewComment('');

      // Add comment to the list without refreshing
      const newCommentData = await response.json();
      setComments(prev => [newCommentData.comment, ...prev]);

      // Update comment count in posts - gerçek yorum sayısına göre güncelle
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === selectedPostId
            ? { ...post, comments_count: comments.length + 1 }
            : post
        )
      );
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      // Supabase session token'ı al
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        toast.error('Oturum bulunamadı');
        return;
      }

      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Yorum silinirken hata oluştu');
      }

      // Optimistic update - immediately remove from UI
      setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));

      // Update comment count in posts - gerçek yorum sayısına göre güncelle
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === selectedPostId
            ? { ...post, comments_count: Math.max(0, comments.length - 1) }
            : post
        )
      );

      toast.success('Yorum silindi');
    } catch (error: any) {
      toast.error(error.message);
      // Revert optimistic update on error
      openCommentDialog(selectedPostId);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Bu itirafı silmek istediğinizden emin misiniz?')) return;

    try {
      // Optimistic update - immediately remove from UI
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));

      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      console.log('Delete response status:', response.status);
      const data = await response.json();
      console.log('Delete response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'İtiraf silinirken hata oluştu');
      }

      toast.success('İtiraf silindi');
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message);
      // Revert optimistic update on error
      await fetchPosts();
    }
  };

  const openReportDialog = (postId: string) => {
    setSelectedPostId(postId);
    setReportDialogOpen(true);
  };

  const handleSubmitReport = async () => {
    if (!reportReason.trim()) {
      toast.error('Lütfen bir neden belirtin');
      return;
    }

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: selectedPostId, reason: reportReason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Bir hata oluştu');
      }

      toast.success(data.message);
      setReportDialogOpen(false);
      setReportReason('');
      fetchPosts();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <NewPostForm
            categories={categories}
            categoriesLoading={categoriesLoading}
            onPostCreated={fetchPosts}
          />

          {categoriesLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs value={selectedCategory} onValueChange={(value) => {
              // Gizli kategori kontrolü
              const category = categories.find(c => c.slug === value);
              if (category?.is_premium && !user) {
                toast.error('Gizli kategoriye erişmek için üye girişi yapmanız gerekmektedir');
                router.push('/auth');
                return;
              }
              setSelectedCategory(value);
            }}>
              <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="all">Tümü</TabsTrigger>
                {categories.map((cat) => (
                  <TabsTrigger key={cat.id} value={cat.slug}>
                    <div className="flex items-center gap-1.5">
                      <span>{cat.icon}</span>
                      {cat.name}
                      {cat.is_premium && <Lock className="h-3 w-3 text-secondary" />}
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}

          {selectedCategory !== 'all' && categories.find(c => c.slug === selectedCategory)?.is_premium && !user ? (
            <Card className="p-8 text-center">
              <Lock className="h-12 w-12 mx-auto mb-4 text-secondary" />
              <h3 className="text-xl font-semibold mb-2">Gizli Kategori - Üyelik Gerekli</h3>
              <p className="text-muted-foreground mb-6">
                Gizli kategorideki itirafları görmek için üye girişi yapmanız gerekmektedir
              </p>
              <Link href="/auth">
                <Button className="gap-2">
                  <Lock className="h-4 w-4" />
                  Giriş Yap
                </Button>
              </Link>
            </Card>
          ) : loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Henüz gönderi yok. İlk paylaşan siz olun!
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={(id) => handleReaction(id, 'like')}
                  onDislike={(id) => handleReaction(id, 'dislike')}
                  onComment={openCommentDialog}
                  onReport={openReportDialog}
                  onDelete={handleDeletePost}
                  userReaction={userReactions[post.id]}
                  currentUserId={user?.id}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Önceki
              </Button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Sonraki
              </Button>
            </div>
          )}
        </motion.div>
      </main>

      <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yorumlar</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="max-h-[300px] overflow-y-auto space-y-3">
              {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground">Henüz yorum yok</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-muted rounded-lg">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-primary">
                            {comment.username || 'Anonim'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), {
                              addSuffix: true,
                              locale: tr,
                            })}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                      {user && comment.author_id === user.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="space-y-2">
              <Label>Yorum Ekle</Label>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Yorumunuzu yazın..."
                rows={3}
              />
              <Button onClick={handleSubmitComment} className="w-full">
                Yorum Yap
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gönderiyi Bildir</DialogTitle>
            <DialogDescription>
              Bu gönderiyi neden bildirmek istiyorsunuz?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Neden..."
              rows={4}
            />
            <Button onClick={handleSubmitReport} className="w-full">
              Bildir
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}