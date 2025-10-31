'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { Header } from '@/components/header';
import { NewPostForm } from '@/components/new-post-form';
import { PostCard } from '@/components/post-card';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';

import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Loader as Loader2, Lock, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SponsoredContentCard } from '@/components/sponsored-content-card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronUp, Filter, Plus, Sparkles, Heart, Share2, ThumbsDown, MessageCircle } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  is_premium: boolean;
  is_active?: boolean;
}

interface Post {
  id: string;
  title?: string;
  content: string;
  likes_count?: number;
  dislikes_count?: number;
  comments_count?: number;
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

interface City {
  id: number;
  name: string;
}

interface District {
  id: number;
  name: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author_id?: string;
  username?: string;
  likes_count: number;
}

function HomeContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isInitialized, setIsInitialized] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string | undefined>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string | undefined>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [newPostDialogOpen, setNewPostDialogOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 10;
  const [userReactions, setUserReactions] = useState<Record<string, 'like' | 'dislike' | null>>({});
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string>('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'trending'>('newest');
  const [trendPeriod, setTrendPeriod] = useState<'24h' | '7d' | '30d'>('24h');
  const [commentLikes, setCommentLikes] = useState<Record<string, boolean>>({});
  const [sponsoredContents, setSponsoredContents] = useState<any[]>([]);


  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      // Cache busting için timestamp ekle
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/categories?t=${timestamp}`, {
        cache: 'no-store'
      });
      const data = await response.json();
      console.log('Categories response:', data); // Debug log
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Kategoriler yüklenirken hata oluştu');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchCities = async () => {
    setCitiesLoading(true);
    try {
      const response = await fetch('/api/cities');
      const data = await response.json();
      setCities(data.cities || []);
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setCitiesLoading(false);
    }
  };

  const fetchDistricts = async (citySlug: string) => {
    if (!citySlug || citySlug === 'all') {
      setDistricts([]);
      return;
    }
    
    setDistrictsLoading(true);
    try {
      const response = await fetch(`/api/districts?city_slug=${citySlug}`);
      const data = await response.json();
      setDistricts(data.districts || []);
    } catch (error) {
      console.error('Error fetching districts:', error);
    } finally {
      setDistrictsLoading(false);
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

      if (selectedCity && selectedCity !== 'all') {
        params.append('city', selectedCity);
      }

      if (selectedDistrict && selectedDistrict !== 'all') {
        params.append('district', selectedDistrict);
      }

      if (searchKeyword.trim()) {
        params.append('search', searchKeyword.trim());
      }

      // Sıralama parametresi ekle
      params.append('sort', sortBy);
      
      // Trend periyodu ekle
      if (sortBy === 'trending') {
        params.append('trendPeriod', trendPeriod);
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
  }, [currentPage, selectedCategory, selectedCity, selectedDistrict, searchKeyword, sortBy, trendPeriod, postsPerPage]);

  const fetchSponsoredContent = async () => {
    try {
      // Hem top hem mixed pozisyonları için içerik çek
      const [topResponse, mixedResponse] = await Promise.all([
        fetch('/api/sponsored-content?position=top'),
        fetch('/api/sponsored-content?position=mixed')
      ]);
      
      const topData = await topResponse.json();
      const mixedData = await mixedResponse.json();
      
      const contents = [];
      if (topData.content) contents.push({ ...topData.content, position: 'top' });
      if (mixedData.content) contents.push({ ...mixedData.content, position: 'mixed' });
      
      setSponsoredContents(contents);
    } catch (error) {
      console.error('Error fetching sponsored content:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchCities();
    fetchSponsoredContent();
  }, []);

  // Şehir ID'sini bul (name'e göre)
  const getSlugByName = (name: string) => {
    // İsmi slug formatına çevir (Türkçe karakterler için)
    return name
      .replace(/İ/g, 'i')
      .replace(/I/g, 'i')
      .replace(/ı/g, 'i')
      .replace(/Ğ/g, 'g')
      .replace(/ğ/g, 'g')
      .replace(/Ü/g, 'u')
      .replace(/ü/g, 'u')
      .replace(/Ş/g, 's')
      .replace(/ş/g, 's')
      .replace(/Ö/g, 'o')
      .replace(/ö/g, 'o')
      .replace(/Ç/g, 'c')
      .replace(/ç/g, 'c')
      .toLowerCase();
  };

  const getCitySlugByName = getSlugByName; // Geriye uyumluluk için

  const handleCityClick = (cityName: string) => {
    const slug = getCitySlugByName(cityName);
    window.location.href = `/?city=${slug}&district=all`;
  };

  // URL parametrelerinden filtreleri oku (sadece ilk yüklemede)
  useEffect(() => {
    if (isInitialized) return; // Zaten initialize edilmişse çık
    
    const cityParam = searchParams.get('city');
    const districtParam = searchParams.get('district');
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    const sortParam = searchParams.get('sort');
    const periodParam = searchParams.get('period');
    const postParam = searchParams.get('post');
    
    // Eğer post parametresi varsa, o gönderiyi göster
    if (postParam) {
      router.push(`/post/${postParam}`);
      return;
    }
    
    // Şehir parametresi
    if (cityParam) {
      setSelectedCity(cityParam);
    }
    
    // İlçe parametresi
    if (districtParam) {
      setSelectedDistrict(districtParam);
    }
    
    // Kategori parametresi
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    
    // Arama parametresi
    if (searchParam) {
      setSearchKeyword(searchParam);
    }
    
    // Sıralama parametresi
    if (sortParam && ['newest', 'popular', 'trending'].includes(sortParam)) {
      setSortBy(sortParam as 'newest' | 'popular' | 'trending');
    }
    
    // Trend periyodu parametresi
    if (periodParam && ['24h', '7d', '30d'].includes(periodParam)) {
      setTrendPeriod(periodParam as '24h' | '7d' | '30d');
    }
    
    setIsInitialized(true);
  }, [searchParams, isInitialized, router]);

  // Filtreler değiştiğinde URL'yi güncelle (initialization sonrasında)
  useEffect(() => {
    if (!isInitialized) return; // Initialize edilmeden URL güncelleme yapma
    
    const params = new URLSearchParams();
    
    if (selectedCategory && selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    }
    
    if (selectedCity && selectedCity !== 'all') {
      params.set('city', selectedCity);
    }
    
    if (selectedDistrict) {
      params.set('district', selectedDistrict);
    }
    
    if (searchKeyword) {
      params.set('search', searchKeyword);
    }
    
    if (sortBy !== 'newest') {
      params.set('sort', sortBy);
    }
    
    if (sortBy === 'trending' && trendPeriod !== '24h') {
      params.set('period', trendPeriod);
    }
    
    const newUrl = params.toString() ? `/?${params.toString()}` : '/';
    
    // URL'yi güncelle (sayfa yenilenmeden)
    window.history.replaceState({}, '', newUrl);
  }, [selectedCategory, selectedCity, selectedDistrict, searchKeyword, sortBy, trendPeriod, isInitialized]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [selectedCategory, selectedCity, selectedDistrict, searchKeyword, sortBy, trendPeriod]);

  useEffect(() => {
    if (selectedCity) {
      fetchDistricts(selectedCity);
      setSelectedDistrict('all'); // Reset district when city changes
    } else {
      setDistricts([]);
      setSelectedDistrict('all');
    }
  }, [selectedCity]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

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
    setSelectedPostId(postId);
    setCommentDialogOpen(true);

    try {
      const response = await fetch(`/api/comments?post_id=${postId}`);
      const data = await response.json();
      const comments = data.comments || [];
      setComments(comments);

      // Yorum beğenilerini getir (sadece giriş yapmış kullanıcılar için)
      if (comments.length > 0 && user) {
        const commentIds = comments.map((c: Comment) => c.id).join(',');
        const { data: { session } } = await supabase.auth.getSession();
        const headers: Record<string, string> = {};

        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        try {
          const likesResponse = await fetch(`/api/comment-likes?comment_ids=${commentIds}`, {
            headers
          });
          const likesData = await likesResponse.json();
          setCommentLikes(likesData.likes || {});
        } catch (error) {
          console.error('Error fetching comment likes:', error);
        }
      }
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

      // Update comment count in posts
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === selectedPostId
            ? { ...post, comments_count: (post.comments_count || 0) + 1 }
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

      // Update comment count in posts
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === selectedPostId
            ? { ...post, comments_count: Math.max(0, (post.comments_count || 0) - 1) }
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

      // Supabase session token'ı al
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
      // Revert optimistic update on error
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


  const openReportDialog = (postId: string) => {
    setSelectedPostId(postId);
    setReportDialogOpen(true);
  };



  const handleShare = async (postId: string) => {
    const postUrl = `${window.location.origin}/?post=${postId}`;
    
    try {
      if (navigator.share) {
        // Web Share API destekleniyorsa (mobil cihazlarda)
        await navigator.share({
          title: 'İtiraf Pazarı - İtiraf',
          text: 'Bu itirafı kontrol et!',
          url: postUrl,
        });
      } else {
        // Web Share API desteklenmiyorsa clipboard'a kopyala
        await navigator.clipboard.writeText(postUrl);
        toast.success('Link kopyalandı! 📋');
      }
    } catch (error) {
      // Fallback: manuel kopyalama
      const textArea = document.createElement('textarea');
      textArea.value = postUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Link kopyalandı! 📋');
    }
  };

  // Instagram tarzı görüntülenme - Post %50 görününce say
  const handlePostView = async (postId: string) => {
    // Cooldown kontrolü
    const viewKey = `post_view_${postId}`;
    const lastViewTime = localStorage.getItem(viewKey);
    const now = Date.now();
    const cooldownTime = 30 * 60 * 1000; // 30 dakika

    // Eğer 30 dakika geçmemişse sayma
    if (lastViewTime && (now - parseInt(lastViewTime)) < cooldownTime) {
      return;
    }

    // Optimistic update - UI'da hemen +1 göster
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, views_count: (post.views_count || 0) + 1 }
          : post
      )
    );

    try {
      // API çağrısı yap
      const response = await fetch(`/api/posts/${postId}/view`, {
        method: 'POST',
      });

      if (response.ok) {
        // Başarılıysa localStorage'a kaydet
        localStorage.setItem(viewKey, now.toString());
      } else {
        // API başarısızsa optimistic update'i geri al
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === postId
              ? { ...post, views_count: Math.max(0, (post.views_count || 0) - 1) }
              : post
          )
        );
      }
    } catch (error) {
      console.error('View count update failed:', error);
      // Hata durumunda optimistic update'i geri al
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, views_count: Math.max(0, (post.views_count || 0) - 1) }
            : post
        )
      );
    }
  };

  // Post detayına git + görüntülenme sayımı (engagement)
  const handlePostClick = async (postId: string) => {
    // Detay tıklaması için ayrı cooldown kontrolü
    const clickKey = `post_click_${postId}`;
    const lastClickTime = localStorage.getItem(clickKey);
    const now = Date.now();
    const cooldownTime = 30 * 60 * 1000; // 30 dakika

    // Cooldown geçmişse +1 ekle
    if (!lastClickTime || (now - parseInt(lastClickTime)) >= cooldownTime) {
      // Optimistic update - UI'da hemen +1 göster
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, views_count: (post.views_count || 0) + 1 }
            : post
        )
      );

      try {
        // API çağrısı yap
        const response = await fetch(`/api/posts/${postId}/view`, {
          method: 'POST',
        });

        if (response.ok) {
          // Başarılıysa localStorage'a kaydet
          localStorage.setItem(clickKey, now.toString());
        } else {
          // API başarısızsa optimistic update'i geri al
          setPosts(prevPosts =>
            prevPosts.map(post =>
              post.id === postId
                ? { ...post, views_count: Math.max(0, (post.views_count || 0) - 1) }
                : post
            )
          );
        }
      } catch (error) {
        console.error('Click view count update failed:', error);
        // Hata durumunda optimistic update'i geri al
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === postId
              ? { ...post, views_count: Math.max(0, (post.views_count || 0) - 1) }
              : post
          )
        );
      }
    }

    // Navigate et
    router.push(`/post/${postId}`);
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
          {/* Attractive New Post Button */}
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              onClick={() => setNewPostDialogOpen(true)}
              className="w-full h-auto p-3 sm:p-4 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 relative overflow-hidden group rounded-xl"
              size="lg"
            >
              {/* Overlay efekti */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="flex items-center justify-center gap-2 sm:gap-3 w-full relative z-10">
                <div className="bg-white/20 rounded-full p-1.5">
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="text-center flex-1">
                  <div className="text-base sm:text-lg font-bold mb-0.5">✍️ YENİ İTİRAF PAYLAŞ</div>
                  <div className="text-xs opacity-90">Kayıt gerektirmez • Gizlilik garantisi</div>
                </div>
                <div className="bg-white/20 rounded-full p-1.5">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
                </div>
              </div>
            </Button>
          </motion.div>

          {categoriesLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Debug: Kategori yenileme butonu */}
              {process.env.NODE_ENV === 'development' && (
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchCategories}
                    disabled={categoriesLoading}
                  >
                    🔄 Kategorileri Yenile
                  </Button>
                </div>
              )}
              


              {/* Trend Filtreleri - Mobil Optimize */}
              <Card className="p-3 sm:p-4">
                <div className="space-y-3">
                  {/* Mobil: Başlık ve açıklama üstte */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold">🔥 Trend İtiraflar</h3>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {sortBy === 'newest' && '⏰ En son paylaşılan itiraflar'}
                        {sortBy === 'popular' && '❤️ En çok beğenilen ve yorumlanan itiraflar'}
                        {sortBy === 'trending' && `🚀 ${
                          trendPeriod === '24h' ? 'Son 24 saatte' : 
                          trendPeriod === '7d' ? 'Son 7 günde' : 
                          'Son 30 günde'
                        } popüler olan itiraflar`}
                      </div>
                    </div>
                  </div>
                  
                  {/* Mobil: Butonlar tam genişlik, masaüstü: yan yana */}
                  <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-2 sm:justify-end">
                    <Button
                      variant={sortBy === 'newest' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSortBy('newest')}
                      className="text-xs sm:text-sm h-8 sm:h-9"
                    >
                      <span className="sm:hidden">🕐</span>
                      <span className="hidden sm:inline">🕐 En Yeni</span>
                    </Button>
                    <Button
                      variant={sortBy === 'popular' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSortBy('popular')}
                      className="text-xs sm:text-sm h-8 sm:h-9"
                    >
                      <span className="sm:hidden">🔥</span>
                      <span className="hidden sm:inline">🔥 Popüler</span>
                    </Button>
                    <Button
                      variant={sortBy === 'trending' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSortBy('trending')}
                      className="text-xs sm:text-sm h-8 sm:h-9"
                    >
                      <span className="sm:hidden">📈</span>
                      <span className="hidden sm:inline">📈 Trend</span>
                    </Button>
                  </div>

                  {/* Trend Zaman Filtreleri */}
                  {sortBy === 'trending' && (
                    <div className="border-t pt-3">
                      <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">
                        Zaman Aralığı:
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant={trendPeriod === '24h' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setTrendPeriod('24h')}
                          className="text-xs h-8"
                        >
                          Son 24 Saat
                        </Button>
                        <Button
                          variant={trendPeriod === '7d' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setTrendPeriod('7d')}
                          className="text-xs h-8"
                        >
                          Son 7 Gün
                        </Button>
                        <Button
                          variant={trendPeriod === '30d' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setTrendPeriod('30d')}
                          className="text-xs h-8"
                        >
                          Son 1 Ay
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Collapsible Filter Area */}
              <Collapsible open={filterOpen} onOpenChange={setFilterOpen}>
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between h-auto p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <span>Filtreleme Seçenekleri</span>
                      {(selectedCategory !== 'all' || selectedCity || selectedDistrict || searchKeyword) && (
                        <Badge variant="secondary" className="ml-2">
                          Aktif
                        </Badge>
                      )}
                    </div>
                    {filterOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <Card className="p-3 sm:p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Kategori</Label>
                        {categoriesLoading ? (
                          <div className="flex items-center gap-2 p-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">Yükleniyor...</span>
                          </div>
                        ) : (
                          <Select 
                            value={selectedCategory} 
                            onValueChange={(value) => {
                              // Gizli kategori kontrolü
                              const category = categories.find(c => c.slug === value);
                              if (category?.is_premium && !user) {
                                toast.error('Gizli kategoriye erişmek için üye girişi yapmanız gerekmektedir');
                                router.push('/auth');
                                return;
                              }
                              setSelectedCategory(value);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Kategori seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Tüm Kategoriler</SelectItem>
                              {categories
                                .filter(cat => cat.is_active !== false) // Sadece aktif kategorileri göster
                                .map((cat) => (
                                <SelectItem 
                                  key={cat.id} 
                                  value={cat.slug}
                                  disabled={cat.is_premium && !user}
                                >
                                  <div className="flex items-center gap-2">
                                    <span>{cat.icon && cat.icon.length <= 2 ? cat.icon : '📁'}</span>
                                    <span>{cat.name}</span>
                                    {cat.is_premium && <Lock className="h-3 w-3 text-secondary" />}
                                    {cat.is_premium && !user && <span className="text-xs text-muted-foreground">(Üyelik gerekli)</span>}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="search">Anahtar Kelime</Label>
                        <Input
                          id="search"
                          value={searchKeyword}
                          onChange={(e) => setSearchKeyword(e.target.value)}
                          placeholder="Başlık veya içerikte ara..."
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cityFilter">İl</Label>
                        {citiesLoading ? (
                          <div className="flex items-center gap-2 p-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">Yükleniyor...</span>
                          </div>
                        ) : (
                          <Select value={selectedCity} onValueChange={setSelectedCity}>
                            <SelectTrigger>
                              <SelectValue placeholder="İl seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Tüm İller</SelectItem>
                              {cities.map((city) => (
                                <SelectItem key={city.id} value={getCitySlugByName(city.name)}>
                                  {city.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="districtFilter">İlçe</Label>
                        {districtsLoading ? (
                          <div className="flex items-center gap-2 p-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">Yükleniyor...</span>
                          </div>
                        ) : (
                          <Select 
                            value={selectedDistrict} 
                            onValueChange={setSelectedDistrict}
                            disabled={!selectedCity || districts.length === 0}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="İlçe seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Tüm İlçeler</SelectItem>
                              {districts.map((district) => (
                                <SelectItem key={district.id} value={getSlugByName(district.name)}>
                                  {district.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>&nbsp;</Label>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSelectedCategory('all');
                            setSelectedCity('all');
                            setSelectedDistrict('all');
                            setSearchKeyword('');
                          }}
                          className="w-full"
                        >
                          Filtreleri Temizle
                        </Button>
                      </div>
                    </div>
                  </Card>
                </CollapsibleContent>
              </Collapsible>
            </div>
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
              {/* En üstte sponsorlu içerik varsa göster */}
              {sponsoredContents.find(c => c.position === 'top') && (
                <SponsoredContentCard position="top" />
              )}
              
              {posts.map((post, index) => (
                <div key={post.id}>
                  <PostCard
                    post={post}
                    onLike={(id) => handleReaction(id, 'like')}
                    onDislike={(id) => handleReaction(id, 'dislike')}
                    onComment={openCommentDialog}
                    onReport={openReportDialog}
                    onShare={handleShare}
                    onView={handlePostView}
                    userReaction={userReactions[post.id]}
                    currentUserId={user?.id}
                    onClick={() => handlePostClick(post.id)}
                  />
                  {/* Her 5 gönderide bir mixed sponsorlu içerik göster */}
                  {sponsoredContents.find(c => c.position === 'mixed') && (index + 1) % 5 === 0 && (
                    <div className="mt-4">
                      <SponsoredContentCard position="between_posts" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination - Mobil Optimize */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentPage(prev => Math.max(1, prev - 1));
                  scrollToTop();
                }}
                disabled={currentPage === 1}
                className="w-full sm:w-auto"
              >
                ← Önceki
              </Button>

              {/* Mobil: Sadece mevcut sayfa göster, Desktop: Tüm sayfalar */}
              <div className="flex gap-1 overflow-x-auto max-w-full">
                {/* Mobil için sadece yakın sayfalar */}
                <div className="flex gap-1 sm:hidden">
                  {currentPage > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentPage(currentPage - 1);
                        scrollToTop();
                      }}
                    >
                      {currentPage - 1}
                    </Button>
                  )}
                  <Button variant="default" size="sm">
                    {currentPage}
                  </Button>
                  {currentPage < totalPages && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentPage(currentPage + 1);
                        scrollToTop();
                      }}
                    >
                      {currentPage + 1}
                    </Button>
                  )}
                </div>

                {/* Desktop için tüm sayfalar */}
                <div className="hidden sm:flex gap-1">
                  {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setCurrentPage(page);
                        scrollToTop();
                      }}
                    >
                      {page}
                    </Button>
                  ))}
                  {totalPages > 10 && (
                    <span className="flex items-center px-2 text-muted-foreground">...</span>
                  )}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentPage(prev => Math.min(totalPages, prev + 1));
                  scrollToTop();
                }}
                disabled={currentPage === totalPages}
                className="w-full sm:w-auto"
              >
                Sonraki →
              </Button>
            </div>
          )}
        </motion.div>
      </main>

      <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
        <DialogContent className="max-w-lg w-[95vw] max-h-[85vh] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg">Yorumlar</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="max-h-[250px] sm:max-h-[300px] overflow-y-auto space-y-3">
              {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Henüz yorum yok</p>
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
                      
                      <div className="flex items-center gap-1">
                        {/* Beğeni butonu */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (!user) {
                              toast.error('Beğenmek için giriş yapmanız gerekiyor');
                              return;
                            }
                            handleCommentLike(comment.id);
                          }}
                          className={`p-1 h-6 gap-1 ${
                            user && commentLikes[comment.id] 
                              ? 'text-red-500 hover:text-red-600' 
                              : 'text-muted-foreground hover:text-red-500'
                          }`}
                        >
                          <Heart 
                            className={`h-3 w-3 ${user && commentLikes[comment.id] ? 'fill-current' : ''}`} 
                          />
                          <span className="text-xs">{comment.likes_count || 0}</span>
                        </Button>
                        
                        {user && comment.author_id === user.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComment(comment.id)}
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
            <div className="space-y-3">
              <Label className="text-sm">Yorum Ekle</Label>
              {user ? (
                <>
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Yorumunuzu yazın..."
                    rows={3}
                    autoFocus={false}
                    autoComplete="off"
                    className="text-base resize-none"
                  />
                  <Button onClick={handleSubmitComment} className="w-full" size="sm">
                    Yorum Yap
                  </Button>
                </>
              ) : (
                <div className="text-center py-4 space-y-3">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      🔒 Yorum yapmak için giriş yapmanız gerekiyor
                    </p>
                    <Button 
                      onClick={() => {
                        setCommentDialogOpen(false);
                        router.push('/auth');
                      }}
                      className="w-full"
                      size="sm"
                    >
                      Giriş Yap
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="max-w-lg w-[95vw] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg">Gönderiyi Bildir</DialogTitle>
            <DialogDescription className="text-sm">
              Bu gönderiyi neden bildirmek istiyorsunuz?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Neden..."
              rows={4}
              autoFocus={false}
              autoComplete="off"
              className="text-base resize-none"
            />
            <Button onClick={handleSubmitReport} className="w-full">
              Bildir
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Post Dialog - Mobil Optimize */}
      <Dialog open={newPostDialogOpen} onOpenChange={setNewPostDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] sm:max-h-[95vh] overflow-y-auto w-[95vw] sm:w-full p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              <span>İtiraf Paylaş</span>
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Kayıt gerektirmez, sadece cesaret. Gizliliğin garantisi altında paylaşın.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <NewPostForm
              categories={categories}
              categoriesLoading={categoriesLoading}
              onPostCreated={() => {
                fetchPosts();
                setNewPostDialogOpen(false); // Form gönderildikten sonra dialog'u kapat
                toast.success('İtirafınız başarıyla paylaşıldı! 🎉');
              }}
            />
          </div>
        </DialogContent>
      </Dialog>




      {/* Şehir İtirafları Bölümü */}
      <section className="bg-muted/30 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Şehir İtirafları</h2>
            <p className="text-muted-foreground">
              Türkiye'nin her yerinden şehir bazında itirafları keşfedin
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <button 
              onClick={() => handleCityClick('İstanbul')}
              className="group p-4 bg-background rounded-lg border hover:border-primary/50 transition-all hover:shadow-md cursor-pointer"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🏙️</div>
                <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">İstanbul</h3>
                <p className="text-xs text-muted-foreground">İtirafları Gör</p>
              </div>
            </button>
            
            <button 
              onClick={() => handleCityClick('Ankara')}
              className="group p-4 bg-background rounded-lg border hover:border-primary/50 transition-all hover:shadow-md cursor-pointer"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🏛️</div>
                <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">Ankara</h3>
                <p className="text-xs text-muted-foreground">İtirafları Gör</p>
              </div>
            </button>
            
            <button 
              onClick={() => handleCityClick('İzmir')}
              className="group p-4 bg-background rounded-lg border hover:border-primary/50 transition-all hover:shadow-md cursor-pointer"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🌊</div>
                <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">İzmir</h3>
                <p className="text-xs text-muted-foreground">İtirafları Gör</p>
              </div>
            </button>
            
            <button 
              onClick={() => handleCityClick('Bursa')}
              className="group p-4 bg-background rounded-lg border hover:border-primary/50 transition-all hover:shadow-md cursor-pointer"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🏔️</div>
                <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">Bursa</h3>
                <p className="text-xs text-muted-foreground">İtirafları Gör</p>
              </div>
            </button>
            
            <button 
              onClick={() => handleCityClick('Antalya')}
              className="group p-4 bg-background rounded-lg border hover:border-primary/50 transition-all hover:shadow-md cursor-pointer"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🏖️</div>
                <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">Antalya</h3>
                <p className="text-xs text-muted-foreground">İtirafları Gör</p>
              </div>
            </button>
            
            <button 
              onClick={() => handleCityClick('Adana')}
              className="group p-4 bg-background rounded-lg border hover:border-primary/50 transition-all hover:shadow-md cursor-pointer"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🌶️</div>
                <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">Adana</h3>
                <p className="text-xs text-muted-foreground">İtirafları Gör</p>
              </div>
            </button>
            
            <button 
              onClick={() => handleCityClick('Konya')}
              className="group p-4 bg-background rounded-lg border hover:border-primary/50 transition-all hover:shadow-md cursor-pointer"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🕌</div>
                <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">Konya</h3>
                <p className="text-xs text-muted-foreground">İtirafları Gör</p>
              </div>
            </button>
            
            <button 
              onClick={() => handleCityClick('Gaziantep')}
              className="group p-4 bg-background rounded-lg border hover:border-primary/50 transition-all hover:shadow-md cursor-pointer"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🥙</div>
                <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">Gaziantep</h3>
                <p className="text-xs text-muted-foreground">İtirafları Gör</p>
              </div>
            </button>
          </div>
          
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Daha fazla şehir yakında eklenecek...
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
