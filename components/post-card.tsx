'use client';

import { motion } from 'framer-motion';
import { Heart, MessageCircle, ThumbsDown, Flag, Sparkles, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useState, useRef, useEffect } from 'react';

interface PostCardProps {
  post: {
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
  };
  onLike: (postId: string) => void;
  onDislike: (postId: string) => void;
  onComment: (postId: string) => void;
  onReport: (postId: string) => void;
  onShare: (postId: string) => void;
  onView?: (postId: string) => void;

  userReaction?: 'like' | 'dislike' | null;
  currentUserId?: string;
  onClick?: () => void;
}

export function PostCard({
  post,
  onLike,
  onDislike,
  onComment,
  onShare,
  onReport,
  onView,
  userReaction,
  currentUserId,
  onClick,
}: PostCardProps) {
  const [showFullContent, setShowFullContent] = useState(false);
  const [hasBeenViewed, setHasBeenViewed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Intersection Observer - Post %50 görününce sayım yap
  useEffect(() => {
    if (!cardRef.current || hasBeenViewed || !onView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            setHasBeenViewed(true);
            onView(post.id);
          }
        });
      },
      {
        threshold: 0.5, // %50 görünürlük
        rootMargin: '0px'
      }
    );

    observer.observe(cardRef.current);

    return () => {
      observer.disconnect();
    };
  }, [post.id, hasBeenViewed, onView]);
  const maxLength = 280;
  const needsTruncate = post.content.length > maxLength;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        ref={cardRef}
        className={`p-4 sm:p-6 card-hover cursor-pointer ${post.is_boosted ? 'ring-2 ring-secondary' : ''}`}
        onClick={onClick}
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              {post.categories && (
                <Badge variant="secondary" className="gap-1">
                  <span>{post.categories.icon && post.categories.icon.length <= 2 ? post.categories.icon : '📁'}</span>
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
                  <span>Öne Çıkan</span>
                </Badge>
              )}
            </div>
            <div className="text-left sm:text-right">
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                  locale: tr,
                })}
              </div>
              <div className="text-xs text-muted-foreground/70 hidden sm:block">
                {new Date(post.created_at).toLocaleString('tr-TR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>

          {post.title && (
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
              {post.title}
            </h3>
          )}

          {(post.cities || post.districts || post.custom_location) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>📍</span>
              <span>
                {[
                  post.cities?.name,
                  post.districts?.name,
                  post.custom_location
                ].filter(Boolean).join(', ')}
              </span>
            </div>
          )}

          <div className="text-foreground leading-relaxed">
            {needsTruncate && !showFullContent ? (
              <>
                {post.content.substring(0, maxLength)}...
                <button
                  onClick={() => setShowFullContent(true)}
                  className="ml-2 text-primary hover:underline text-sm font-medium"
                >
                  Devamını oku
                </button>
              </>
            ) : (
              post.content
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1">
              <Button
                variant={userReaction === 'like' ? 'default' : 'ghost'}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onLike(post.id);
                }}
                className={`gap-1 sm:gap-1.5 transition-all text-xs sm:text-sm h-8 sm:h-9 ${
                  userReaction === 'like' 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'hover:bg-red-50 hover:text-red-500'
                }`}
              >
                <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${userReaction === 'like' ? 'fill-current' : ''}`} />
                <span className="font-medium">{(post.likes_count || 0).toLocaleString('tr-TR')}</span>
              </Button>

              <Button
                variant={userReaction === 'dislike' ? 'default' : 'ghost'}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDislike(post.id);
                }}
                className={`gap-1 sm:gap-1.5 transition-all text-xs sm:text-sm h-8 sm:h-9 ${
                  userReaction === 'dislike' 
                    ? 'bg-gray-500 hover:bg-gray-600 text-white' 
                    : 'hover:bg-gray-50 hover:text-gray-500'
                }`}
              >
                <ThumbsDown className={`h-3 w-3 sm:h-4 sm:w-4 ${userReaction === 'dislike' ? 'fill-current' : ''}`} />
                <span className="font-medium">{(post.dislikes_count || 0).toLocaleString('tr-TR')}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onComment(post.id);
                }}
                className="gap-1 sm:gap-1.5 hover:bg-blue-50 hover:text-blue-500 transition-all text-xs sm:text-sm h-8 sm:h-9"
              >
                <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="font-medium">{(post.comments_count || 0).toLocaleString('tr-TR')}</span>
              </Button>
              
              {/* Görüntülenme sayısı */}
              <div className="flex items-center gap-1 px-2 py-1 text-xs sm:text-sm text-muted-foreground">
                <span>👁️</span>
                <span className="font-medium">{(post.views_count || 0).toLocaleString('tr-TR')}</span>
              </div>
            </div>

            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare(post.id);
                }}
                className="h-8 sm:h-9 hover:bg-green-50 hover:text-green-500"
                title="Paylaş"
              >
                <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onReport(post.id);
                }}
                className="h-8 sm:h-9"
              >
                <Flag className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
