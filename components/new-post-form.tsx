'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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

interface NewPostFormProps {
  categories: Category[];
  categoriesLoading: boolean;
  onPostCreated: () => void;
}

export function NewPostForm({ categories, categoriesLoading, onPostCreated }: NewPostFormProps) {
  const { user, profile } = useAuth();
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('İtiraf içeriği boş olamaz');
      return;
    }

    if (!categoryId) {
      toast.error('Lütfen bir kategori seçin');
      return;
    }

    const selectedCategory = categories.find(c => c.id === categoryId);
    if (selectedCategory?.is_premium && !profile?.is_premium) {
      toast.error('Bu kategori premium üyeler için özeldir');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: content.trim(), 
          categoryId: categoryId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Bir hata oluştu');
      }

      toast.success('İtirafınız paylaşıldı!');
      setContent('');
      setCategoryId('');
      onPostCreated();
    } catch (error: any) {
      console.error('Post creation error:', error);
      toast.error(error.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yeni İtiraf Paylaş</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                      disabled={category.is_premium && !profile?.is_premium}
                    >
                      <div className="flex items-center gap-2">
                        <span>{category.name}</span>
                        {category.is_premium && <Lock className="h-3 w-3 text-secondary" />}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !content.trim() || !categoryId}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Paylaşılıyor...
              </>
            ) : (
              'İtiraf Paylaş'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}