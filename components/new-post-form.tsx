'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

import { Loader as Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  is_premium: boolean;
  is_active?: boolean;
}

interface City {
  id: number;
  name: string;
}

interface District {
  id: number;
  name: string;
}

interface University {
  id: number;
  name: string;
  slug: string;
}

interface NewPostFormProps {
  categories?: Category[];
  categoriesLoading?: boolean;
  onPostCreated?: () => void;
  defaultCity?: string;
}

export function NewPostForm({ categories = [], categoriesLoading = false, onPostCreated, defaultCity }: NewPostFormProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [cityId, setCityId] = useState<string | undefined>(undefined);
  const [districtId, setDistrictId] = useState<string | undefined>(undefined);
  const [universityId, setUniversityId] = useState<string | undefined>(undefined);
  const [customLocation, setCustomLocation] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [universitiesLoading, setUniversitiesLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Default city'yi set et
  useEffect(() => {
    if (defaultCity && cities.length > 0) {
      const city = cities.find(c => c.name === defaultCity);
      if (city) {
        setCityId(city.id.toString());
      }
    }
  }, [defaultCity, cities]);

  // İlleri yükle
  useEffect(() => {
    const fetchCities = async () => {
      setCitiesLoading(true);
      try {
        const response = await fetch('/api/cities');
        const data = await response.json();
        const allCities = data.cities || [];
        
        // İstanbul, Ankara, İzmir'i en üste koy
        const priorityCities = ['İstanbul', 'Ankara', 'İzmir'];
        const sortedCities = allCities.sort((a: City, b: City) => {
          const aIndex = priorityCities.indexOf(a.name);
          const bIndex = priorityCities.indexOf(b.name);
          
          if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex; // Her ikisi de öncelikli şehirse sırasına göre
          }
          if (aIndex !== -1) return -1; // a öncelikli şehirse üstte
          if (bIndex !== -1) return 1;  // b öncelikli şehirse üstte
          
          return a.name.localeCompare(b.name, 'tr'); // Diğerleri alfabetik
        });
        
        setCities(sortedCities);
      } catch (error) {
        console.error('Error fetching cities:', error);
      } finally {
        setCitiesLoading(false);
      }
    };

    fetchCities();
    
    // Üniversiteleri yükle
    const fetchUniversities = async () => {
      setUniversitiesLoading(true);
      try {
        const response = await fetch('/api/universities');
        const data = await response.json();
        setUniversities(data.universities || []);
      } catch (error) {
        console.error('Error fetching universities:', error);
      } finally {
        setUniversitiesLoading(false);
      }
    };

    fetchUniversities();
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
      
      // İl değiştiğinde o ile ait üniversiteleri yükle
      const fetchUniversitiesByCity = async () => {
        setUniversitiesLoading(true);
        try {
          const selectedCity = cities.find(c => c.id.toString() === cityId);
          if (selectedCity) {
            const citySlug = selectedCity.name
              .replace(/İ/g, 'i')
              .replace(/I/g, 'i')
              .replace(/ı/g, 'i')
              .replace(/Ğ/g, 'g')
              .replace(/ğ/g, 'g')
              .replace(/Ü/g, 'u')
              .replace(/ü/g, 'u')
              .replace(/Ş/g, 's')
              .replace(/ş/g, 's')
              .replace(/Ö/g, 'o')
              .replace(/ö/g, 'o')
              .replace(/Ç/g, 'c')
              .replace(/ç/g, 'c')
              .toLowerCase();
            
            const response = await fetch(`/api/universities?city_slug=${citySlug}`);
            const data = await response.json();
            setUniversities(data.universities || []);
          }
        } catch (error) {
          console.error('Error fetching universities by city:', error);
        } finally {
          setUniversitiesLoading(false);
        }
      };
      
      fetchUniversitiesByCity();
      setDistrictId(undefined); // İl değiştiğinde ilçe seçimini sıfırla
      setUniversityId(undefined); // İl değiştiğinde üniversite seçimini sıfırla
    } else {
      setDistricts([]);
      setDistrictId(undefined);
      setUniversityId(undefined);
      
      // İl seçilmediğinde tüm üniversiteleri yükle
      const fetchAllUniversities = async () => {
        setUniversitiesLoading(true);
        try {
          const response = await fetch('/api/universities');
          const data = await response.json();
          setUniversities(data.universities || []);
        } catch (error) {
          console.error('Error fetching all universities:', error);
        } finally {
          setUniversitiesLoading(false);
        }
      };
      
      fetchAllUniversities();
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
          universityId: universityId || null,
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
      setUniversityId(undefined);
      setCustomLocation('');
      onPostCreated?.();
    } catch (error: any) {
      console.error('Post creation error:', error);
      toast.error(error.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">


      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Ana İçerik */}
        <div className="space-y-4">
          <div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Başlık yazın..."
              maxLength={100}
              disabled={loading}
              autoFocus={false}
              autoComplete="off"
              className="text-base h-12 text-lg"
            />
            <div className="text-xs text-muted-foreground text-right mt-1">
              {title.length}/100
            </div>
          </div>

          <div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="İtirafınızı buraya yazın... Ne olursa olsun, burada güvendesiniz."
              rows={6}
              maxLength={2000}
              disabled={loading}
              autoFocus={false}
              autoComplete="off"
              className="text-base resize-none text-lg"
            />
            <div className="text-xs text-muted-foreground text-right mt-1">
              {content.length}/2000
            </div>
          </div>
        </div>

        {/* Kategori Seçimi */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Kategori</Label>
          {categoriesLoading ? (
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Kategoriler yükleniyor...</span>
            </div>
          ) : (
            <Select 
              value={categoryId} 
              onValueChange={(value) => {
                // Premium kategori kontrolü
                const category = categories.find(c => c.id === value);
                if (category?.is_premium && !user) {
                  toast.error('Bu kategori için üye girişi yapmanız gerekmektedir');
                  return;
                }
                setCategoryId(value);
              }} 
              disabled={loading}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Hangi konuda?" />
              </SelectTrigger>
              <SelectContent>
                {categories
                  .filter(category => category.is_active !== false) // Sadece aktif kategorileri göster
                  .map((category) => (
                  <SelectItem 
                    key={category.id} 
                    value={category.id}
                    disabled={category.is_premium && !user}
                  >
                    <div className="flex items-center gap-2">
                      <span>{category.icon && category.icon.length <= 2 ? category.icon : '📁'}</span>
                      <span>{category.name}</span>
                      {category.is_premium && <Lock className="h-3 w-3 text-amber-500" />}
                      {category.is_premium && !user && <span className="text-xs text-muted-foreground">(Üyelik gerekli)</span>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Premium Kategori Uyarısı */}
        {categoryId && categories.find(c => c.id === categoryId)?.is_premium && !user && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-amber-800">
              <Lock className="h-4 w-4" />
              <span className="font-medium">Premium Kategori</span>
            </div>
            <p className="text-sm text-amber-700 mt-1">
              Bu kategoriye itiraf paylaşmak için üye girişi yapmanız gerekmektedir. 
              <button 
                type="button"
                onClick={() => window.location.href = '/auth'}
                className="underline hover:no-underline ml-1"
              >
                Giriş yapmak için tıklayın.
              </button>
            </p>
          </div>
        )}

        {/* Konum Seçimi */}
        <div>
          <Label className="text-sm font-medium mb-2 block">📍 Konum (opsiyonel)</Label>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {citiesLoading ? (
                <div className="flex items-center gap-2 p-3 border rounded-lg col-span-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">İller yükleniyor...</span>
                </div>
              ) : (
                <>
                  <Select value={cityId} onValueChange={setCityId} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="İl seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id.toString()}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {districtsLoading ? (
                    <div className="flex items-center gap-2 p-3 border rounded-lg">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">İlçeler...</span>
                    </div>
                  ) : (
                    <Select 
                      value={districtId} 
                      onValueChange={setDistrictId} 
                      disabled={loading || !cityId || districts.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="İlçe seçin" />
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
                </>
              )}
            </div>

            {/* Üniversite Seçimi */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Üniversite (opsiyonel)</Label>
              {universitiesLoading ? (
                <div className="flex items-center gap-2 p-3 border rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Üniversiteler...</span>
                </div>
              ) : (
                <Select 
                  value={universityId} 
                  onValueChange={setUniversityId} 
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Üniversite seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.map((university) => (
                      <SelectItem key={university.id} value={university.id.toString()}>
                        {university.name?.trim()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Özel Konum */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Özel konum (opsiyonel)</Label>
              <Input
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                placeholder="Örn: Merkez Mahallesi, Kampüs, AVM..."
                maxLength={100}
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Paylaş Butonu */}
        <Button 
          type="submit" 
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all" 
          disabled={loading || !title.trim() || !content.trim() || !categoryId}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Paylaşılıyor...
            </>
          ) : (
            <>
              🚀 İtirafı Paylaş
            </>
          )}
        </Button>

        {/* Güvence Mesajı */}
        <div className="text-center text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          🔒 Gizlilik garantisi • IP adresi saklanmaz • Kimlik bilgisi istenmez
        </div>
      </form>
    </div>
  );
}
