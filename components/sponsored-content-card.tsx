'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Eye, Heart, MessageCircle, ThumbsDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface SponsoredContent {
  id: string;
  title: string;
  description?: string;
  link_url: string;
  button_text: string;
  author_name: string;
  view_count: number;
  click_count: number;
}

interface Props {
  position: 'top' | 'header' | 'sidebar' | 'footer' | 'between_posts' | 'mixed';
}

export function SponsoredContentCard({ position }: Props) {
  const [content, setContent] = useState<SponsoredContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`/api/sponsored-content?position=${position}`);
        const data = await response.json();
        if (data.content) {
          setContent(data.content);
        }
      } catch (error) {
        console.error('Error fetching sponsored content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [position]);

  if (loading || !content) {
    return null;
  }

  return <SponsoredContentCardInner content={content} />;
}

interface InnerProps {
  content: SponsoredContent;
}

function SponsoredContentCardInner({ content }: InnerProps) {
  const [hasViewed, setHasViewed] = useState(false);
  const [localViewCount, setLocalViewCount] = useState(content.view_count);
  const [localClickCount, setLocalClickCount] = useState(content.click_count);
  const cardRef = useRef<HTMLDivElement>(null);

  // Intersection Observer - %50 görününce sayım yap (cooldown ile)
  useEffect(() => {
    if (!cardRef.current || hasViewed) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            // Cooldown kontrolü
            const viewKey = `sponsored_view_${content.id}`;
            const lastViewTime = localStorage.getItem(viewKey);
            const now = Date.now();
            const cooldownTime = 30 * 60 * 1000; // 30 dakika

            // Eğer 30 dakika geçmemişse sayma
            if (lastViewTime && (now - parseInt(lastViewTime)) < cooldownTime) {
              setHasViewed(true);
              return;
            }

            setHasViewed(true);
            
            // Optimistic update
            setLocalViewCount(prev => prev + 1);
            
            fetch('/api/sponsored-content/view', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sponsored_content_id: content.id })
            }).then(response => {
              if (response.ok) {
                localStorage.setItem(viewKey, now.toString());
              } else {
                // Başarısızsa geri al
                setLocalViewCount(prev => prev - 1);
              }
            }).catch(() => {
              setLocalViewCount(prev => prev - 1);
            });
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: '0px'
      }
    );

    observer.observe(cardRef.current);

    return () => {
      observer.disconnect();
    };
  }, [content.id, hasViewed]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Cooldown kontrolü
    const clickKey = `sponsored_click_${content.id}`;
    const lastClickTime = localStorage.getItem(clickKey);
    const now = Date.now();
    const cooldownTime = 30 * 60 * 1000; // 30 dakika

    // Cooldown geçmişse +1 ekle
    if (!lastClickTime || (now - parseInt(lastClickTime)) >= cooldownTime) {
      // Optimistic update
      setLocalClickCount(prev => prev + 1);
      
      fetch('/api/sponsored-content/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sponsored_content_id: content.id })
      }).then(response => {
        if (response.ok) {
          localStorage.setItem(clickKey, now.toString());
        } else {
          setLocalClickCount(prev => prev - 1);
        }
      }).catch(() => {
        setLocalClickCount(prev => prev - 1);
      });
    }

    // Yeni sekmede aç
    window.open(content.link_url, '_blank', 'noopener,noreferrer');
  };

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
        className="p-4 sm:p-6 card-hover cursor-pointer"
        onClick={(e) => {
          // Sadece card'ın kendisine tıklandığında aç
          if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.space-y-4')) {
            handleClick(e);
          }
        }}
      >
        <div className="space-y-4">
          {/* Üst kısım - Badge ve tarih (normal gönderi gibi) */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <Badge variant="secondary" className="gap-1">
                <span>📢</span>
                <span>Sponsorlu</span>
              </Badge>
              <Badge variant="outline" className="gap-1">
                <span>@{content.author_name || 'anonymous'}</span>
              </Badge>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-xs text-muted-foreground">
                Sponsorlu içerik
              </div>
            </div>
          </div>

          {/* Başlık */}
          <h3 className="text-base sm:text-lg font-semibold text-foreground">
            {content.title}
          </h3>

          {/* Açıklama (içerik gibi) */}
          {content.description && (
            <div className="text-foreground leading-relaxed">
              {content.description}
            </div>
          )}

          {/* Alt kısım - İstatistikler (normal gönderi gibi) */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1">
              {/* Fake beğeni butonu */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick(e);
                }}
                className="gap-1 sm:gap-1.5 transition-all text-xs sm:text-sm h-8 sm:h-9 hover:bg-red-50 hover:text-red-500"
              >
                <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="font-medium">{Math.floor(localViewCount * 0.3).toLocaleString('tr-TR')}</span>
              </Button>

              {/* Fake dislike butonu */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick(e);
                }}
                className="gap-1 sm:gap-1.5 transition-all text-xs sm:text-sm h-8 sm:h-9 hover:bg-gray-50 hover:text-gray-500"
              >
                <ThumbsDown className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="font-medium">{Math.floor(localViewCount * 0.05).toLocaleString('tr-TR')}</span>
              </Button>

              {/* Fake yorum butonu */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick(e);
                }}
                className="gap-1 sm:gap-1.5 hover:bg-blue-50 hover:text-blue-500 transition-all text-xs sm:text-sm h-8 sm:h-9"
              >
                <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="font-medium">{Math.floor(localViewCount * 0.15).toLocaleString('tr-TR')}</span>
              </Button>
              
              {/* Görüntülenme sayısı */}
              <div className="flex items-center gap-1 px-2 py-1 text-xs sm:text-sm text-muted-foreground">
                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="font-medium">{localViewCount.toLocaleString('tr-TR')}</span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              {content.button_text}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}