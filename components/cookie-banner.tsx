'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Cookie } from 'lucide-react';
import Link from 'next/link';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Çerez onayı kontrolü
    const cookieConsent = localStorage.getItem('cookie-consent');
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const rejectCookies = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md">
      <Card className="p-4 shadow-lg border-2">
        <div className="flex items-start gap-3">
          <Cookie className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-2">Çerez Kullanımı</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Sitemizde deneyiminizi iyileştirmek ve reklamları kişiselleştirmek için çerezler kullanıyoruz. 
              Devam ederek çerez kullanımını kabul etmiş olursunuz.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                size="sm" 
                onClick={acceptCookies}
                className="text-xs"
              >
                Kabul Et
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={rejectCookies}
                className="text-xs"
              >
                Reddet
              </Button>
              <Link href="/privacy">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-xs"
                >
                  Detaylar
                </Button>
              </Link>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsVisible(false)}
            className="p-1 h-auto"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}