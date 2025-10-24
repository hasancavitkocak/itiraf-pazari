'use client';

import { motion } from 'framer-motion';
import { Heart, MessageCircle, ThumbsDown, Flag, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useState } from 'react';

interface PostCardProps {
  post: {
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
  };
  onLike: (postId: string) => void;
  onDislike: (postId: string) => void;
  onComment: (postId: string) => void;
  onReport: (postId: string) => void;
  onDelete?: (postId: string) => void;
  userReaction?: 'like' | 'dislike' | null;
  currentUserId?: string;
}

export function PostCard({
  post,
  onLike,
  onDislike,
  onComment,
  onReport,
  onDelete,
  userReaction,
  currentUserId,
}: PostCardProps) {
  const [showFullContent, setShowFullContent] = useState(false);
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
      <Card className={`p-6 card-hover ${post.is_boosted ? 'ring-2 ring-secondary' : ''}`}>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              {post.categories && (
                <Badge variant="secondary" className="gap-1">
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
            <div className="text-right">
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                  locale: tr,
                })}
              </div>
              <div className="text-xs text-muted-foreground/70">
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
                onClick={() => onLike(post.id)}
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
                onClick={() => onDislike(post.id)}
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
                onClick={() => onComment(post.id)}
                className="gap-1.5 hover:bg-blue-50 hover:text-blue-500 transition-all"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="font-medium">{(post.comments_count || 0).toLocaleString('tr-TR')}</span>
              </Button>
            </div>

            <div className="flex gap-1">
              {onDelete && currentUserId && post.author_id === currentUserId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(post.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReport(post.id)}
              >
                <Flag className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
