import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, Search, ArrowLeft, Heart } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Sayfa Bulunamadı | İtiraf Pazarı',
  description: 'Aradığınız sayfa bulunamadı. İtiraf Pazarı\'nda binlerce anonim itiraf sizi bekliyor.',
};

export default function NotFound() {
  // Rastgele 404 mesajları
  const messages = [
    "Aradığınız sayfa mevcut değil veya taşınmış olabilir. Belki de hiç var olmamıştır... 🤷‍♂️",
    "Bu sayfa kaybolmuş! Belki de gizli bir itiraf olarak paylaşılmıştır? 🕵️‍♂️",
    "404 - Sayfa bulunamadı. Ama sen bulundun, bu da bir şey! 😊",
    "Bu sayfa şu anda tatilde. Daha sonra tekrar deneyin! 🏖️",
    "Sayfa kayıp! Son görüldüğü yer: bilinmiyor 🔍"
  ];
  
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          {/* 404 Emoji */}
          <div className="text-6xl mb-4">🤔</div>
          
          {/* Başlık */}
          <h1 className="text-3xl font-bold mb-2">Sayfa Bulunamadı</h1>
          
          {/* Açıklama */}
          <p className="text-muted-foreground mb-6">
            {randomMessage}
          </p>
          
          {/* Öneriler */}
          <div className="space-y-3 mb-6">
            <p className="text-sm font-medium">Ne yapmak istersiniz?</p>
            
            <div className="grid gap-2">
              <Link href="/">
                <Button className="w-full" variant="default">
                  <Home className="h-4 w-4 mr-2" />
                  Ana Sayfaya Dön
                </Button>
              </Link>
              
              <Link href="/?search=">
                <Button className="w-full" variant="outline">
                  <Search className="h-4 w-4 mr-2" />
                  İtiraf Ara
                </Button>
              </Link>
              
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Geri Git
              </Button>
            </div>
          </div>
          
          {/* Popüler Kategoriler */}
          <div className="mb-6">
            <p className="text-sm font-medium mb-3">Popüler Kategoriler:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link href="/?category=ask">
                <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                  💕 Aşk
                </Badge>
              </Link>
              <Link href="/?category=is">
                <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                  💼 İş
                </Badge>
              </Link>
              <Link href="/?category=okul">
                <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                  📚 Okul
                </Badge>
              </Link>
              <Link href="/?category=aile">
                <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                  👨‍👩‍👧‍👦 Aile
                </Badge>
              </Link>
            </div>
          </div>
          
          {/* Alt bilgi */}
          <div className="text-xs text-muted-foreground border-t pt-4">
            <p className="flex items-center justify-center gap-1">
              <Heart className="h-3 w-3 text-red-500" />
              İtiraf Pazarı - Anonim İtiraf Platformu
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}