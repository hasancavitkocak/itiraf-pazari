'use client';

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { LogOut, Shield, User } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GoogleAdSense } from '@/components/google-adsense';

export function Header() {
  const { user, profile, signOut } = useAuth();
  
  // Debug log (development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('Header render - user:', !!user, 'profile:', profile?.username);
  }
  const [siteLogo, setSiteLogo] = useState<string>('');
  const [siteName, setSiteName] = useState<string>('İtiraf Pazarı');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Site ayarlarını yükle (public endpoint)
    const fetchSiteSettings = async () => {
      try {
        const response = await fetch('/api/site-settings');
        if (response.ok) {
          const settings = await response.json();
          if (settings.site_logo) {
            setSiteLogo(settings.site_logo);
          }
          if (settings.site_name) {
            setSiteName(settings.site_name);
          }
        }
      } catch (error) {
        console.error('Site ayarları yüklenirken hata:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSiteSettings();
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link 
          href="/" 
          className="flex items-center"
          onClick={(e) => {
            // Sadece URL'de filtre parametreleri varsa tam yenileme yap
            const hasFilters = window.location.search && 
              (window.location.search.includes('city=') || 
               window.location.search.includes('category=') || 
               window.location.search.includes('district=') || 
               window.location.search.includes('search='));
            
            if (hasFilters) {
              e.preventDefault();
              window.location.href = '/';
            }
            // Filtre yoksa normal Next.js navigation kullan (auth context korunur)
          }}
        >
          {!isLoading && siteLogo ? (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center"
            >
              <Image
                src={siteLogo}
                alt={siteName}
                width={220}
                height={60}
                className="h-12 w-auto object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </motion.div>
          ) : !isLoading ? (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
            >
              {siteName}
            </motion.div>
          ) : (
            // Loading placeholder - boş alan bırak
            <div className="h-12 w-48"></div>
          )}
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {profile?.role === 'admin' && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </Button>
                </Link>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {profile?.username || (user ? '...' : 'Profil')}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Profil Ayarları</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      try {
                        await signOut();
                      } catch (error) {
                        console.error('Çıkış yapılırken hata:', error);
                        // Hata olsa bile çıkış yap
                        window.location.href = '/';
                      }
                    }}
                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Çıkış Yap</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/auth">
              <Button size="sm">Giriş Yap</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Header AdSense Banner */}
      {process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID && (
        <div className="border-b bg-background/95">
          <div className="container mx-auto px-4 py-2">
            <GoogleAdSense
              adSlot="1234567890"
              adFormat="auto"
              className="max-h-24"
            />
          </div>
        </div>
      )}
    </motion.header>
  );
}
