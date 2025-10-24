'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';

interface Ad {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  link_url?: string;
  position: 'header' | 'sidebar' | 'footer' | 'between_posts';
  is_active: boolean;
  priority: number;
  created_at: string;
}

export function AdsManagement() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    image_url: string;
    link_url: string;
    position: 'header' | 'sidebar' | 'footer' | 'between_posts';
    is_active: boolean;
    priority: number;
  }>({
    title: '',
    content: '',
    image_url: '',
    link_url: '',
    position: 'sidebar',
    is_active: true,
    priority: 1
  });

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const response = await fetch('/api/admin/ads');
      const data = await response.json();
      setAds(data.ads || []);
    } catch (error) {
      console.error('Error fetching ads:', error);
      toast.error('Reklamlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingAd ? `/api/admin/ads/${editingAd.id}` : '/api/admin/ads';
      const method = editingAd ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(editingAd ? 'Reklam güncellendi' : 'Reklam oluşturuldu');
        fetchAds();
        resetForm();
      } else {
        toast.error('İşlem başarısız');
      }
    } catch (error) {
      console.error('Error saving ad:', error);
      toast.error('Hata oluştu');
    }
  };

  const handleEdit = (ad: Ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      content: ad.content,
      image_url: ad.image_url || '',
      link_url: ad.link_url || '',
      position: ad.position,
      is_active: ad.is_active,
      priority: ad.priority
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu reklamı silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/admin/ads/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Reklam silindi');
        fetchAds();
      } else {
        toast.error('Silme işlemi başarısız');
      }
    } catch (error) {
      console.error('Error deleting ad:', error);
      toast.error('Hata oluştu');
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/ads/${id}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive })
      });

      if (response.ok) {
        toast.success('Reklam durumu güncellendi');
        fetchAds();
      } else {
        toast.error('Güncelleme başarısız');
      }
    } catch (error) {
      console.error('Error toggling ad:', error);
      toast.error('Hata oluştu');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      image_url: '',
      link_url: '',
      position: 'sidebar',
      is_active: true,
      priority: 1
    });
    setEditingAd(null);
    setShowForm(false);
  };

  const getPositionLabel = (position: string) => {
    const labels = {
      header: 'Üst Bölüm',
      sidebar: 'Yan Panel',
      footer: 'Alt Bölüm',
      between_posts: 'Gönderiler Arası'
    };
    return labels[position as keyof typeof labels] || position;
  };

  if (loading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reklam Yönetimi</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Reklam
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingAd ? 'Reklamı Düzenle' : 'Yeni Reklam Oluştur'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Başlık</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="position">Konum</Label>
                  <Select value={formData.position} onValueChange={(value: any) => setFormData({ ...formData, position: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="header">Üst Bölüm</SelectItem>
                      <SelectItem value="sidebar">Yan Panel</SelectItem>
                      <SelectItem value="footer">Alt Bölüm</SelectItem>
                      <SelectItem value="between_posts">Gönderiler Arası</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="content">İçerik</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="image_url">Görsel URL</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <Label htmlFor="link_url">Link URL</Label>
                  <Input
                    id="link_url"
                    type="url"
                    value={formData.link_url}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Öncelik (1-10)</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Aktif</Label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingAd ? 'Güncelle' : 'Oluştur'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  İptal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {ads.map((ad) => (
          <Card key={ad.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{ad.title}</h3>
                    <Badge variant={ad.is_active ? 'default' : 'secondary'}>
                      {ad.is_active ? 'Aktif' : 'Pasif'}
                    </Badge>
                    <Badge variant="outline">
                      {getPositionLabel(ad.position)}
                    </Badge>
                    <Badge variant="outline">
                      Öncelik: {ad.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{ad.content}</p>
                  {ad.image_url && (
                    <p className="text-xs text-blue-600">Görsel: {ad.image_url}</p>
                  )}
                  {ad.link_url && (
                    <p className="text-xs text-green-600">Link: {ad.link_url}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleActive(ad.id, ad.is_active)}
                  >
                    {ad.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(ad)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(ad.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {ads.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Henüz reklam bulunmuyor.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}