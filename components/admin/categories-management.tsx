'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Save, X, GripVertical, Eye, EyeOff, FileText, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description?: string;
  is_premium: boolean;
  is_active: boolean;
  order_index: number;
  posts_count?: number;
  created_at: string;
}

export function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: '',
    description: '',
    is_premium: false,
    is_active: true,
    order_index: 1
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // Cache busting için timestamp ekle
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/admin/categories?t=${timestamp}`, {
        cache: 'no-store'
      });
      const data = await response.json();
      console.log('Admin categories response:', data);
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Kategoriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Kategori adı gerekli');
      return;
    }

    // Slug otomatik oluştur
    const slug = formData.slug || formData.name
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    try {
      // Supabase session token'ı al
      const { data: { session } } = await (await import('@/lib/supabase')).supabase.auth.getSession();

      if (!session || !session.access_token) {
        toast.error('Oturum bulunamadı');
        return;
      }

      const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : '/api/admin/categories';
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ ...formData, slug })
      });

      if (response.ok) {
        toast.success(editingCategory ? 'Kategori güncellendi' : 'Kategori oluşturuldu');
        fetchCategories();
        resetForm();
      } else {
        const error = await response.json();
        toast.error(error.error || 'İşlem başarısız');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Hata oluştu');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      description: category.description || '',
      is_premium: category.is_premium,
      is_active: category.is_active,
      order_index: category.order_index
    });
    setShowForm(true);
  };

  const toggleActive = async (categoryId: string, currentStatus: boolean) => {
    try {
      // Supabase session token'ı al
      const { data: { session } } = await (await import('@/lib/supabase')).supabase.auth.getSession();

      if (!session || !session.access_token) {
        toast.error('Oturum bulunamadı');
        return;
      }

      const response = await fetch(`/api/admin/categories/${categoryId}/toggle-active`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });

      if (response.ok) {
        toast.success(`Kategori ${!currentStatus ? 'aktif' : 'pasif'} edildi`);
        fetchCategories();
      } else {
        const error = await response.json();
        toast.error(error.error || 'İşlem başarısız');
      }
    } catch (error) {
      console.error('Error toggling category status:', error);
      toast.error('Hata oluştu');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz? Bu kategorideki tüm gönderiler etkilenecek.')) return;

    try {
      // Supabase session token'ı al
      const { data: { session } } = await (await import('@/lib/supabase')).supabase.auth.getSession();

      if (!session || !session.access_token) {
        toast.error('Oturum bulunamadı');
        return;
      }

      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        toast.success('Kategori silindi');
        fetchCategories();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Silme işlemi başarısız');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Hata oluştu');
    }
  };

  const updateOrder = async (categoryId: string, newOrder: number) => {
    try {
      // Supabase session token'ı al
      const { data: { session } } = await (await import('@/lib/supabase')).supabase.auth.getSession();

      if (!session || !session.access_token) {
        toast.error('Oturum bulunamadı');
        return;
      }

      const response = await fetch(`/api/admin/categories/${categoryId}/order`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ order_index: newOrder })
      });

      if (response.ok) {
        fetchCategories();
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      icon: '',
      description: '',
      is_premium: false,
      is_active: true,
      order_index: categories.length + 1
    });
    setEditingCategory(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-bold">Kategori Yönetimi</h2>
        <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Yeni Kategori
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingCategory ? 'Kategoriyi Düzenle' : 'Yeni Kategori Oluştur'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Kategori Adı</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Örn: Aşk"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug (URL)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="Otomatik oluşturulur"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="icon">İkon (Emoji)</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="💕"
                    maxLength={2}
                  />
                </div>
                <div>
                  <Label htmlFor="order_index">Sıra</Label>
                  <Input
                    id="order_index"
                    type="number"
                    min="1"
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Kategori açıklaması..."
                  rows={2}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_premium"
                    checked={formData.is_premium}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_premium: checked })}
                  />
                  <Label htmlFor="is_premium">Premium Kategori (Üyelik gerekli)</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Aktif Kategori (Kullanıcılara gösterilir)</Label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingCategory ? 'Güncelle' : 'Oluştur'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="h-4 w-4 mr-2" />
                  İptal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {categories.map((category) => (
          <Card key={category.id} className={!category.is_active ? 'opacity-60 border-dashed' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                    <div className={`text-2xl ${!category.is_active ? 'grayscale' : ''}`}>
                      {category.icon}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{category.name}</h3>
                      <Badge variant="outline" className="text-xs">#{category.order_index}</Badge>
                      
                      {category.is_premium && (
                        <Badge variant="secondary" className="text-xs">Premium</Badge>
                      )}
                      
                      {!category.is_active && (
                        <Badge variant="destructive" className="text-xs">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Pasif
                        </Badge>
                      )}
                      
                      {category.is_active && (
                        <Badge variant="outline" className="text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          Aktif
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Slug: {category.slug}</span>
                      {category.posts_count !== undefined && (
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          <span>{category.posts_count} gönderi</span>
                        </div>
                      )}
                    </div>
                    
                    {category.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Sıralama Butonları */}
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateOrder(category.id, category.order_index - 1)}
                      disabled={category.order_index === 1}
                      title="Yukarı taşı"
                    >
                      ↑
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateOrder(category.id, category.order_index + 1)}
                      disabled={category.order_index === categories.length}
                      title="Aşağı taşı"
                    >
                      ↓
                    </Button>
                  </div>

                  {/* İşlemler Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem onClick={() => handleEdit(category)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Düzenle
                      </DropdownMenuItem>

                      <DropdownMenuItem 
                        onClick={() => toggleActive(category.id, category.is_active)}
                        className={category.is_active ? 'text-orange-600' : 'text-green-600'}
                      >
                        {category.is_active ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Pasif Et
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Aktif Et
                          </>
                        )}
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem 
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Sil
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {categories.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Henüz kategori bulunmuyor.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
