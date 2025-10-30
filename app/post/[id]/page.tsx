'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { 
  Heart, 
  ThumbsDown, 
  MessageCircle, 
  Share2, 
  Flag, 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight,
  Trash2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

interface Post {
  id: string;
  title?: string;
  content: string;
  likes_count: number;
  dislikes_count: number;
  comments_count: number;
  views_count?: number;
  is_boosted: boolean;
  created_at: string;
  author_id?: string;
  username?: string;
  custom_location?: string;
  categories?: {
    name: string;
    slug: string;
    icon: string;
  };
  cities?: {
    name: string;
  };
  districts?: {
    name: string;
  };
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author_id?: string;
  username?: string;
  likes_count: number;
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null);
  const [commentLikes, setCommentLikes] = useState<Record<string, boolean>>({});
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [nextPostId, setNextPostId] = useState<string | null>(null);
  const [prevPostId, setPrevPostId] = useState<string | null>(null);

  // Görüntülenme sayısını artır (30 dakika cooldown ile) - Sadece direkt link için
  const incrementViewCount = async (postId: string) => {
    try {
      const viewKey = `post_view_${postId}`;
      const lastViewTime = localStorage.getItem(viewKey);
      const now = Date.now();
      const cooldownTime = 30 * 60 * 1000; // 30 dakika

      // Eğer 30 dakika geçmemişse sayma
      if (lastViewTime && (now - parseInt(lastViewTime)) < cooldownTime) {
        return;
      }

      // Sadece direkt link ile gelenler için say (referrer kontrolü)
      const referrer = document.referrer;
      const currentDomain = window.location.origin;
      
      // Eğer aynı domain'den geliyorsa (anasayfadan tıklama) sayma
      if (referrer.startsWith(currentDomain)) {
        return;
      }

      // API'ye görüntülenme artırma isteği gönder
      const response = await fetch(`/api/posts/${postId}/view`, {
        method: 'POST',
      });

      if (response.ok) {
        // Başarılıysa localStorage'a kaydet
        localStorage.setItem(viewKey, now.toString());
        
        // Post state'ini güncelle (opsiyonel - UI'da hemen göstermek için)
        setPost(prev => prev ? { ...prev, views_count: (prev.views_count || 0) + 1 } : prev);
      }
    } catch (error) {
      console.error('View count increment failed:', error);
      // Hata olsa bile devam et
    }
  };

  useEffect(() => {
    if (postId) {
      setLoading(true);
      setCommentsLoading(true);
      setPost(null);
      
      // Post ve reaction'ı önce yükle (hızlı)
      Promise.all([
        fetchPost(),
        fetchUserReaction()
      ]).then(() => {
        setLoading(false); // Post gösterilmeye hazır
        
        // Görüntülenme sayısını artır (cooldown kontrolü ile)
        incrementViewCount(postId);
      });
      
      // Yorumlar ve navigation'ı paralel yükle (yavaş)
      Promise.all([
        fetchComments(),
        fetchNavigationPosts()
      ]).then(() => {
        setCommentsLoading(false);
      });
    }
  }, [postId]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}`);
      if (!response.ok) {
        if (response.status === 404) {
          toast.error('İtiraf bulunamadı');
          router.push('/');
          return;
        }
        throw new Error('İtiraf yüklenemedi');
      }
      const data = await response.json();
      setPost(data.post);
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('İtiraf yüklenirken hata oluştu');
      router.push('/');
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?post_id=${postId}`);
      const data = await response.json();
      const comments = data.comments || [];
      setComments(comments);

      // Yorum beğenilerini paralel getir
      if (comments.length > 0) {
        const commentIds = comments.map((c: Comment) => c.id).join(',');
        const { data: { session } } = await supabase.auth.getSession();
        const headers: Record<string, string> = {};

        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        // Paralel çağrı - await kullanmıyoruz
        fetch(`/api/comment-likes?comment_ids=${commentIds}`, { headers })
          .then(response => response.json())
          .then(likesData => {
            setCommentLikes(likesData.likes || {});
          })
          .catch(error => {
            console.error('Error fetching comment likes:', error);
          });
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const fetchUserReaction = async () => {
    if (!postId) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {};

      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`/api/reactions?post_ids=${postId}`, {
        headers
      });
      const data = await response.json();
      setUserReaction(data.reactions?.[postId] || null);
    } catch (error) {
      console.error('Error fetching user reaction:', error);
    }
  };

  const fetchNavigationPosts = async () => {
    try {
      // Sadece navigation için gerekli olan post ID'lerini al
      const response = await fetch(`/api/posts/navigation?current_id=${postId}`);
      const data = await response.json();
      
      setPrevPostId(data.prev_id || null);
      setNextPostId(data.next_id || null);
    } catch (error) {
      console.error('Error fetching navigation posts:', error);
      // Fallback: Eski yöntem
      try {
        const response = await fetch(`/api/posts?limit=20`);
        const data = await response.json();
        const posts = data.posts || [];
        
        const currentIndex = posts.findIndex((p: Post) => p.id === postId);
        if (currentIndex !== -1) {
          setPrevPostId(currentIndex > 0 ? posts[currentIndex - 1].id : null);
          setNextPostId(currentIndex < posts.length - 1 ? posts[currentIndex + 1].id : null);
        }
      } catch (fallbackError) {
        console.error('Fallback navigation fetch failed:', fallbackError);
      }
    }
  };

  const handleReaction = async (type: 'like' | 'dislike') => {
    if (!post) return;

    // Optimistic update
    const wasAlreadyReacted = userReaction === type;
    const newReaction = wasAlreadyReacted ? null : type;
    
    setUserReaction(newReaction);
    setPost(prev => {
      if (!prev) return prev;
      
      let newLikesCount = prev.likes_count;
      let newDislikesCount = prev.dislikes_count;
      
      // Eski reaction'ı geri al
      if (userReaction === 'like') newLikesCount--;
      if (userReaction === 'dislike') newDislikesCount--;
      
      // Yeni reaction'ı ekle
      if (newReaction === 'like') newLikesCount++;
      if (newReaction === 'dislike') newDislikesCount++;
      
      return {
        ...prev,
        likes_count: Math.max(0, newLikesCount),
        dislikes_count: Math.max(0, newDislikesCount)
      };
    });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/reactions', {
        method: 'POST',
        headers,
        body: JSON.stringify({ post_id: postId, type })
      });

      if (!response.ok) {
        throw new Error('Reaction failed');
      }
    } catch (error: any) {
      // Revert optimistic update
      setUserReaction(userReaction);
      setPost(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          likes_count: post.likes_count,
          dislikes_count: post.dislikes_count
        };
      });
      toast.error(error.message || 'Beğeni işlemi başarısız');
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return;

    setSubmittingComment(true);
    try {
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
        body: JSON.stringify({
          post_id: postId,
          content: newComment.trim()
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Yorum eklenemedi');
      }

      setNewComment('');
      fetchComments();
      
      // Post comment count'u güncelle
      setPost(prev => prev ? { ...prev, comments_count: prev.comments_count + 1 } : prev);
      
      toast.success('Yorum eklendi');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCommentLike = async (commentId: string) => {
    try {
      // Optimistic update
      setCommentLikes(prev => ({
        ...prev,
        [commentId]: !prev[commentId]
      }));

      setComments(prevComments =>
        prevComments.map(comment =>
          comment.id === commentId
            ? {
                ...comment,
                likes_count: commentLikes[commentId] 
                  ? comment.likes_count - 1 
                  : comment.likes_count + 1
              }
            : comment
        )
      );

      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/comment-likes', {
        method: 'POST',
        headers,
        body: JSON.stringify({ commentId })
      });

      if (!response.ok) {
        throw new Error('Beğeni işlemi başarısız');
      }

    } catch (error: any) {
      // Revert optimistic update
      setCommentLikes(prev => ({
        ...prev,
        [commentId]: !prev[commentId]
      }));

      setComments(prevComments =>
        prevComments.map(comment =>
          comment.id === commentId
            ? {
                ...comment,
                likes_count: commentLikes[commentId] 
                  ? comment.likes_count + 1 
                  : comment.likes_count - 1
              }
            : comment
        )
      );

      toast.error(error.message || 'Beğeni işlemi başarısız');
    }
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: post?.title || 'İtiraf Pazarı - İtiraf',
          text: post?.content.substring(0, 100) + '...',
          url: postUrl,
        });
      } else {
        await navigator.clipboard.writeText(postUrl);
        toast.success('Link kopyalandı! 📋');
      }
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = postUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Link kopyalandı! 📋');
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) {
      toast.error('Şikayet sebebini belirtiniz');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          post_id: postId,
          reason: reportReason
        })
      });

      if (!response.ok) {
        throw new Error('Şikayet gönderilemedi');
      }

      toast.success('Şikayet gönderildi');
      setReportDialogOpen(false);
      setReportReason('');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading || !post) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>İtiraf yükleniyor...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Geri Dön
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => prevPostId && router.push(`/post/${prevPostId}`)}
                disabled={commentsLoading || !prevPostId}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                {commentsLoading ? '...' : 'Önceki'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => nextPostId && router.push(`/post/${nextPostId}`)}
                disabled={commentsLoading || !nextPostId}
                className="gap-1"
              >
                {commentsLoading ? '...' : 'Sonraki'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Post Content */}
          <Card className="p-6">
            <div className="space-y-4">
              {/* Post Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    {post.categories && (
                      <Badge variant="secondary" className="gap-1">
                        <span>{post.categories.icon}</span>
                        <span>{post.categories.name}</span>
                      </Badge>
                    )}
                    {post.username && (
                      <Badge variant="outline" className="gap-1">
                        <span>@{post.username}</span>
                      </Badge>
                    )}
                    {post.is_boosted && (
                      <Badge variant="default" className="gap-1 premium-gradient text-white">
                        <Sparkles className="h-3 w-3" />
                        Öne Çıkan
                      </Badge>
                    )}
                  </div>
                  
                  {post.title && (
                    <h1 className="text-2xl font-bold mb-3">{post.title}</h1>
                  )}
                  
                  <p className="text-lg leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>
                  
                  {(post.custom_location || post.cities || post.districts) && (
                    <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                      <span>📍</span>
                      <span>
                        {post.custom_location || 
                         `${post.cities?.name || ''}${post.districts?.name ? ` / ${post.districts.name}` : ''}`}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                    <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: tr })}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-1">
                  <Button
                    variant={userReaction === 'like' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleReaction('like')}
                    className={`gap-1.5 transition-all ${
                      userReaction === 'like' 
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'hover:bg-red-50 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${userReaction === 'like' ? 'fill-current' : ''}`} />
                    <span className="font-medium">{(post.likes_count || 0).toLocaleString('tr-TR')}</span>
                  </Button>
                  
                  <Button
                    variant={userReaction === 'dislike' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleReaction('dislike')}
                    className={`gap-1.5 transition-all ${
                      userReaction === 'dislike' 
                        ? 'bg-gray-500 hover:bg-gray-600 text-white' 
                        : 'hover:bg-gray-50 hover:text-gray-500'
                    }`}
                  >
                    <ThumbsDown className={`h-4 w-4 ${userReaction === 'dislike' ? 'fill-current' : ''}`} />
                    <span className="font-medium">{(post.dislikes_count || 0).toLocaleString('tr-TR')}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 hover:bg-blue-50 hover:text-blue-500 transition-all"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="font-medium">{(post.comments_count || 0).toLocaleString('tr-TR')}</span>
                  </Button>
                  
                  {/* Görüntülenme sayısı */}
                  <div className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground">
                    <span>👁️</span>
                    <span className="font-medium">{(post.views_count || 0).toLocaleString('tr-TR')}</span>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="gap-1.5 hover:bg-green-50 hover:text-green-500 transition-all"
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Paylaş</span>
                  </Button>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReportDialogOpen(true)}
                  className="gap-1"
                >
                  <Flag className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Comments Section */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                <h2 className="text-lg font-semibold">
                  Yorumlar ({post.comments_count})
                </h2>
              </div>

              {/* Add Comment */}
              {user ? (
                <div className="space-y-3">
                  <Textarea
                    placeholder="Yorumunuzu yazın..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    autoFocus={false}
                    className="text-base resize-none"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim() || submittingComment}
                      size="sm"
                    >
                      {submittingComment ? 'Gönderiliyor...' : 'Yorum Yap'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>Yorum yapmak için <a href="/auth" className="text-primary hover:underline">giriş yapın</a></p>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-3">
                {commentsLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Yorumlar yükleniyor...</p>
                  </div>
                ) : comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Henüz yorum yok</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="p-3 bg-muted rounded-lg">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-primary">
                              @{comment.username || 'anonymous'}
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
                        
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCommentLike(comment.id)}
                            className={`p-1 h-6 gap-1 ${
                              commentLikes[comment.id] 
                                ? 'text-red-500 hover:text-red-600' 
                                : 'text-muted-foreground hover:text-red-500'
                            }`}
                          >
                            <Heart 
                              className={`h-3 w-3 ${commentLikes[comment.id] ? 'fill-current' : ''}`} 
                            />
                            <span className="text-xs">{comment.likes_count || 0}</span>
                          </Button>
                          
                          {user && comment.author_id === user.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {/* handleDeleteComment(comment.id) */}}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-6 w-6"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </main>

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>İtirafı Şikayet Et</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Şikayet sebebinizi yazın..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
                İptal
              </Button>
              <Button onClick={handleReport}>
                Şikayet Et
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
}