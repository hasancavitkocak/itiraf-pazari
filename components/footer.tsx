'use client';

import { Heart } from 'lucide-react';
import Link from 'next/link';
import { GoogleAdSense } from '@/components/google-adsense';

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      {/* Footer AdSense Banner */}
      {process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID && (
        <div className="border-b bg-background/95">
          <div className="container mx-auto px-4 py-4">
            <GoogleAdSense 
              adSlot="0987654321" 
              adFormat="auto"
              className="max-h-32"
            />
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-4">Anonim İtiraf Pazarı</h3>
            <p className="text-muted-foreground text-sm">
              Düşüncelerinizi özgürce paylaşın. Kimliğiniz gizli kalır, itiraflarınız anonim olarak paylaşılır.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Hızlı Linkler</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link href="/sss" className="text-muted-foreground hover:text-foreground transition-colors">
                  SSS
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Bize Ulaşın
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Kullanım Şartları
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">İletişim</h4>
            <p className="text-muted-foreground text-sm mb-2">
              Sorularınız için bize ulaşın.
            </p>
            <Link 
              href="/contact" 
              className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              İletişim
            </Link>
            <div className="flex items-center gap-2 mt-4">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-sm text-muted-foreground">
                Sevgiyle yapıldı
              </span>
            </div>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © 2025 Anonim İtiraf Pazarı. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}

