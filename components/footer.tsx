'use client';

import { Heart } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface City {
  id: number;
  name: string;
}

export function Footer() {
  const [cities, setCities] = useState<City[]>([]);

  useEffect(() => {
    // Şehirleri yükle
    const fetchCities = async () => {
      try {
        const response = await fetch('/api/cities');
        const data = await response.json();
        setCities(data.cities || []);
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    };
    fetchCities();
  }, []);

  // Şehir ID'sini bul (name'e göre)
  const getCityIdByName = (cityName: string) => {
    const city = cities.find(c => c.name === cityName);
    return city ? city.id.toString() : '34'; // Fallback
  };
  return (
    <footer className="bg-muted/50 border-t">
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
                <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                  İtiraf Rehberi
                </Link>
              </li>
              <li>
                <Link href="/seo-landing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Anonim İtiraf Nedir?
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
            <h4 className="font-semibold mb-4">Şehir İtirafları</h4>
            <div className="grid grid-cols-2 gap-1 text-sm">
              <Link href="/?city=İstanbul" className="text-muted-foreground hover:text-foreground transition-colors">
                İstanbul İtiraf
              </Link>
              <Link href="/?city=Ankara" className="text-muted-foreground hover:text-foreground transition-colors">
                Ankara İtiraf
              </Link>
              <Link href="/?city=İzmir" className="text-muted-foreground hover:text-foreground transition-colors">
                İzmir İtiraf
              </Link>
              <Link href="/?city=Bursa" className="text-muted-foreground hover:text-foreground transition-colors">
                Bursa İtiraf
              </Link>
              <Link href="/?city=Antalya" className="text-muted-foreground hover:text-foreground transition-colors">
                Antalya İtiraf
              </Link>
              <Link href="/?city=Adana" className="text-muted-foreground hover:text-foreground transition-colors">
                Adana İtiraf
              </Link>
              <Link href="/?city=Konya" className="text-muted-foreground hover:text-foreground transition-colors">
                Konya İtiraf
              </Link>
              <Link href="/?city=Gaziantep" className="text-muted-foreground hover:text-foreground transition-colors">
                Gaziantep İtiraf
              </Link>
            </div>
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

