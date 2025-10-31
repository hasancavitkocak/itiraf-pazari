'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  MousePointer, 
  Calendar,
  Target,
  ExternalLink,
  BarChart3
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';

interface SponsoredContent {
  id: string;
  title: string;
  description?: string;
  link_url: string;
  button_text: string;
  is_active: boolean;
  position_type: 'top' | 'fixed_position' | 'mixed';
  fixed_position?: number;
  mix_frequency: number;
  target_categories?: string[];
  target_cities?: string[];
  start_date: string;
  end_date?: string;
  view_count: number;
  click_count: number;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface City {
  id: number;
  name: string;
}

export function SponsoredContentManagement() {
  const [sponsoredContent, setSponsoredContent] = useState<SponsoredContent[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<SponsoredContent | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link_url: '',
    button_text: 'Siteyi Ziyaret Et',
    author_name: 'anonymous',
    position_type: 'mixed' as 'top' | 'fixed_position' | 'mixed',
    fixed_position: 1,
    mix_frequency: 5,
    target_categories: [] as string[],
    target_cities: [] as string[],
    start_date: new Date().toISOString().split('T')[0],
    end_date: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {};
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      // Tüm fetch işlemlerini paralel yap
      const [contentResponse, categoriesResponse, citiesResponse] = await Promise.all([
        fetch('/api/admin/sponsored-content', { headers }),
        fetch('/api/categories'),
        fetch('/api/cities')
      ]);

      const [contentData, categoriesData, citiesData] = await Promise.all([
        contentResponse.json(),
        categoriesResponse.json(),
        citiesResponse.json()
      ]);

      setSponsoredContent(contentData.sponsoredContent || []);
      setCategories(categoriesData.categories || []);
      setCities(citiesData.cities || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.link_url) {
      toast.error('Başlık ve link zorunludur');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const method = editingContent ? 'PATCH' : 'POST';
      const url = editingContent 
        ? `/api/admin/sponsored-content/${editingContent.id}`
        : '/api/admin/sponsored-content';

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'İşlem başarısız');
      }

      toast.success(editingContent ? 'Güncellendi' : 'Oluşturuldu');
      setDialogOpen(false);
      resetForm();
      fetchData();

    } catch (error: any) {
      console.error('Error saving sponsored content:', error);
      toast.error(error.message || 'Kaydetme hatası');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu sponsorlu içeriği silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {};
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`/api/admin/sponsored-content/${id}`, {
        method: 'DELETE',
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Silme işlemi başarısız');
      }

      toast.success('Silindi');
      fetchData();

    } catch (error: any) {
      console.error('Error deleting sponsored content:', error);
      toast.error(error.message || 'Silme hatası');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`/api/admin/sponsored-content/${id}/toggle`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ is_active: !isActive })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Durum değiştirme başarısız');
      }

      toast.success(isActive ? 'Devre dışı bırakıldı' : 'Aktif edildi');
      fetchData();

    } catch (error: any) {
      console.error('Error toggling active status:', error);
      toast.error(error.message || 'Durum değiştirme hatası');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      link_url: '',
      button_text: 'Siteyi Ziyaret Et',
      author_name: 'anonymous',
      position_type: 'mixed',
      fixed_position: 1,
      mix_frequency: 5,
      target_categories: [],
      target_cities: [],
      start_date: new Date().toISOString().split('T')[0],
      end_date: ''
    });
    setEditingContent(null);
  };

  const openEditDialog = (content: SponsoredContent) => {
    setEditingContent(content);
    setFormData({
      title: content.title,
      description: content.description || '',
      link_url: content.link_url,
      button_text: content.button_text,
      author_name: (content as any).author_name || 'anonymous',
      position_type: content.position_type,
      fixed_position: content.fixed_position || 1,
      mix_frequency: content.mix_frequency,
      target_categories: content.target_categories || [],
      target_cities: content.target_cities || [],
      start_date: content.start_date.split('T')[0],
      end_date: content.end_date ? content.end_date.split('T')[0] : ''
    });
    setDialogOpen(true);
  };

  const getPositionText = (content: SponsoredContent) => {
    switch (content.position_type) {
      case 'top':
        return 'En üstte';
      case 'fixed_position':
        return `${content.fixed_position}. sırada`;
      case 'mixed':
        return `Her ${content.mix_frequency} gönderide`;
      default:
        return 'Karışık';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sponsorlu İçerik Yönetimi</h2>
          <p className="text-muted-foreground">
            Reklam ve sponsorlu içerikleri yönetin
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="gap-2">
              <Plus className="h-4 w-4" />
              Yeni Sponsorlu İçerik
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingContent ? 'Sponsorlu İçerik Düzenle' : 'Yeni Sponsorlu İçerik'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Başlık *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Sponsorlu içerik başlığı"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="author_name">Kullanıcı Adı</Label>
                  <Input
                    id="author_name"
                    value={formData.author_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
                    placeholder="anonymous"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="button_text">Buton Metni</Label>
                  <Input
                    id="button_text"
                    value={formData.button_text}
                    onChange={(e) => setFormData(prev => ({ ...prev, button_text: e.target.value }))}
                    placeholder="Siteyi Ziyaret Et"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="link_url">Link URL *</Label>
                  <Input
                    id="link_url"
                    type="url"
                    value={formData.link_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
                    placeholder="https://example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Kısa açıklama (opsiyonel)"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="link_url">Link URL *</Label>
                <Input
                  id="link_url"
                  type="url"
                  value={formData.link_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
                  placeholder="https://example.com"
                  required
                />
              </div>

              {/* Pozisyon Ayarları */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-medium">Pozisyon Ayarları</h4>
                
                <div className="space-y-2">
                  <Label>Gösterim Türü</Label>
                  <Select
                    value={formData.position_type}
                    onValueChange={(value: 'top' | 'fixed_position' | 'mixed') => 
                      setFormData(prev => ({ ...prev, position_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">En üstte göster</SelectItem>
                      <SelectItem value="fixed_position">Sabit pozisyonda göster</SelectItem>
                      <SelectItem value="mixed">Gönderiler arasına karıştır</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.position_type === 'fixed_position' && (
                  <div className="space-y-2">
                    <Label htmlFor="fixed_position">Sabit Pozisyon</Label>
                    <Input
                      id="fixed_position"
                      type="number"
                      min="1"
                      value={formData.fixed_position}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        fixed_position: parseInt(e.target.value) || 1 
                      }))}
                    />
                  </div>
                )}

                {formData.position_type === 'mixed' && (
                  <div className="space-y-2">
                    <Label htmlFor="mix_frequency">Karıştırma Sıklığı</Label>
                    <Input
                      id="mix_frequency"
                      type="number"
                      min="1"
                      value={formData.mix_frequency}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        mix_frequency: parseInt(e.target.value) || 5 
                      }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Her kaç gönderi arasında gösterilecek
                    </p>
                  </div>
                )}
              </div>

              {/* Tarih Aralığı */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Başlangıç Tarihi</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="end_date">Bitiş Tarihi (Opsiyonel)</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingContent ? 'Güncelle' : 'Oluştur'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                >
                  İptal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Toplam İçerik</p>
                <p className="text-2xl font-bold">{sponsoredContent.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Toplam Görüntülenme</p>
                <p className="text-2xl font-bold">
                  {sponsoredContent.reduce((sum, content) => sum + content.view_count, 0).toLocaleString('tr-TR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MousePointer className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Toplam Tıklama</p>
                <p className="text-2xl font-bold">
                  {sponsoredContent.reduce((sum, content) => sum + content.click_count, 0).toLocaleString('tr-TR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Aktif İçerik</p>
                <p className="text-2xl font-bold">
                  {sponsoredContent.filter(content => content.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* İçerik Listesi */}
      <div className="space-y-4">
        {sponsoredContent.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Henüz sponsorlu içerik bulunmuyor</p>
            </CardContent>
          </Card>
        ) : (
          sponsoredContent.map((content) => (
            <Card key={content.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{content.title}</h3>
                      <Badge variant={content.is_active ? 'default' : 'secondary'}>
                        {content.is_active ? 'Aktif' : 'Pasif'}
                      </Badge>
                      <Badge variant="outline">
                        {getPositionText(content)}
                      </Badge>
                    </div>
                    
                    {content.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {content.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{content.view_count.toLocaleString('tr-TR')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MousePointer className="h-3 w-3" />
                        <span>{content.click_count.toLocaleString('tr-TR')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(new Date(content.created_at), { 
                            addSuffix: true, 
                            locale: tr 
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        <a 
                          href={content.link_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          Link
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={content.is_active}
                      onCheckedChange={() => handleToggleActive(content.id, content.is_active)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(content)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(content.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}