'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader as Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  is_premium: boolean;
}

interface City {
  id: number;
  name: string;
}

interface District {
  id: number;
  name: string;
}

interface NewPostFormProps {
  categories: Category[];
  categoriesLoading: boolean;
  onPostCreated: () => void;
}

export function NewPostForm({ categories, categoriesLoading, onPostCreated }: NewPostFormProps) {
  const { user, profile } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [cityId, setCityId] = useState<string | undefined>(undefined);
  const [districtId, setDistrictId] = useState<string | undefined>(undefined);
  const [customLocation, setCustomLocation] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  // İlleri yükle
  useEffect(() => {
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

    fetchCities();
  }, []);

  // İl değiştiğinde ilçeleri yükle
  useEffect(() => {
    if (cityId) {
      const fetchDistricts = async () => {
        setDistrictsLoading(true);
        try {
          const response = await fetch(`/api/districts?city_id=${cityId}`);
          const data = await response.json();
          setDistricts(data.districts || []);
        } catch (error) {
          console.error('Error fetching districts:', error);
        } finally {
          setDistrictsLoading(false);
        }
      };

      fetchDistricts();
      setDistrictId(undefined); // İl değiştiğinde ilçe seçimini sıfırla
    } else {
      setDistricts([]);
      setDistrictId(undefined);
    }
  }, [cityId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Başlık boş olamaz');
      return;
    }

    if (!content.trim()) {
      toast.error('İtiraf içeriği boş olamaz');
      return;
    }

    if (!categoryId) {
      toast.error('Lütfen bir kategori seçin');
      return;
    }

    const selectedCategory = categories.find(c => c.id === categoryId);
    if (selectedCategory?.is_premium && !user) {
      toast.error('Gizli kategoriye gönderi yapmak için üye girişi yapmanız gerekmektedir');
      return;
    }

    setLoading(true);

    try {
      // Supabase session token'ı al
      const { data: { session } } = await (await import('@/lib/supabase')).supabase.auth.getSession();
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      // Eğer kullanıcı giriş yapmışsa token ekle
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          title: title.trim(),
          content: content.trim(), 
          categoryId: categoryId,
          cityId: cityId || null,
          districtId: districtId || null,
          customLocation: customLocation.trim() || null
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Bir hata oluştu');
      }

      toast.success('İtirafınız paylaşıldı!');
      setTitle('');
      setContent('');
      setCategoryId('');
      setCityId(undefined);
      setDistrictId(undefined);
      setCustomLocation('');
      onPostCreated();
    } catch (error: any) {
      console.error('Post creation error:', error);
      toast.error(error.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-primary/20 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-center text-primary">
          ✍️ Yeni İtiraf Paylaş
        </CardTitle>
        <p className="text-sm text-muted-foreground text-center">
          Anonim olarak itirafınızı paylaşın
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Başlık</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="İtirafınızın başlığını yazın..."
              maxLength={100}
              disabled={loading}
              autoFocus={false}
              autoComplete="off"
              className="text-base" // iOS'ta zoom'u engellemek için
            />
            <div className="text-xs text-muted-foreground text-right">
              {title.length}/100
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">İtiraf</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="İtirafınızı buraya yazın..."
              rows={4}
              maxLength={1000}
              disabled={loading}
              autoFocus={false}
              autoComplete="off"
              className="text-base resize-none" // iOS'ta zoom'u engellemek için
            />
            <div className="text-xs text-muted-foreground text-right">
              {content.length}/1000
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            {categoriesLoading ? (
              <div className="flex items-center gap-2 p-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Kategoriler yükleniyor...</span>
              </div>
            ) : (
              <Select value={categoryId} onValueChange={setCategoryId} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem 
                      key={category.id} 
                      value={category.id}
                      disabled={category.is_premium && !user}
                    >
                      <div className="flex items-center gap-2">
                        <span>{category.icon && category.icon.length <= 2 ? category.icon : '📁'}</span>
                        <span>{category.name}</span>
                        {category.is_premium && <Lock className="h-3 w-3 text-secondary" />}
                        {category.is_premium && !user && <span className="text-xs text-muted-foreground">(Üyelik gerekli)</span>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">İl</Label>
              {citiesLoading ? (
                <div className="flex items-center gap-2 p-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">İller yükleniyor...</span>
                </div>
              ) : (
                <Select value={cityId} onValueChange={setCityId} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue placeholder="İl seçin (opsiyonel)" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id.toString()}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">İlçe</Label>
              {districtsLoading ? (
                <div className="flex items-center gap-2 p-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">İlçeler yükleniyor...</span>
                </div>
              ) : (
                <Select 
                  value={districtId} 
                  onValueChange={setDistrictId} 
                  disabled={loading || !cityId || districts.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="İlçe seçin (opsiyonel)" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem key={district.id} value={district.id.toString()}>
                        {district.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customLocation">Özel Konum (Opsiyonel)</Label>
            <Input
              id="customLocation"
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              placeholder="Örn: Merkez Mahallesi, Üniversite Kampüsü..."
              maxLength={100}
              disabled={loading}
            />
            <div className="text-xs text-muted-foreground">
              Daha spesifik bir konum belirtmek isterseniz buraya yazabilirsiniz
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90" 
            disabled={loading || !title.trim() || !content.trim() || !categoryId}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Paylaşılıyor...
              </>
            ) : (
              <>
                ✨ İtiraf Paylaş
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}