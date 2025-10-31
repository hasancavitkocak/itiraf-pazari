'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';
import Image from 'next/image';

interface Ad {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  link_url?: string;
  position: string;
  is_active: boolean;
  priority: number;
}

interface AdBannerProps {
  position: 'header' | 'sidebar' | 'footer' | 'between_posts';
  className?: string;
}

export function AdBanner({ position, className = '' }: AdBannerProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const fetchAds = useCallback(async () => {
    try {
      const response = await fetch(`/api/ads?position=${position}`);
      const data = await response.json();
      setAds(data.ads || []);
    } catch (error) {
      console.error('Error fetching ads:', error);
    }
  }, [position]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
      }, 10000); // 10 saniyede bir değiştir

      return () => clearInterval(interval);
    }
  }, [ads.length]);

  if (!isVisible || ads.length === 0) {
    return null;
  }

  const currentAd = ads[currentAdIndex];

  const handleAdClick = () => {
    if (currentAd.link_url) {
      window.open(currentAd.link_url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 z-10 p-1 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
        aria-label="Reklamı kapat"
      >
        <X className="h-3 w-3" />
      </button>

      <div
        className={`p-4 ${currentAd.link_url ? 'cursor-pointer' : ''}`}
        onClick={handleAdClick}
      >
        {currentAd.image_url && (
          <div className="mb-3">
            <Image
              src={currentAd.image_url}
              alt={currentAd.title}
              width={400}
              height={200}
              className="w-full h-auto rounded-lg object-cover max-h-48"
            />
          </div>
        )}

        <div className="space-y-2">
          <h3 className="font-semibold text-sm">{currentAd.title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-3">
            {currentAd.content}
          </p>
        </div>

        {ads.length > 1 && (
          <div className="flex justify-center mt-3 space-x-1">
            {ads.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentAdIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentAdIndex ? 'bg-primary' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}

        <div className="text-xs text-muted-foreground mt-2 text-center">
          Reklam
        </div>
      </div>
    </Card>
  );
}
