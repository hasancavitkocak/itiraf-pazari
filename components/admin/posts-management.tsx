'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, EyeOff, Trash2, Flag, Edit, MapPin, Calendar, Heart, MessageCircle, ThumbsDown } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

interface Post {
  id: string;
  title?: string;
  content: string;
  is_hidden: boolean;
  reports_count: number;
  likes_count: number;
  dislikes_count: number;
  comments_count: number;
  created_at: string;
  author_id?: string;
  category_id?: string;
  custom_location?: string;
  categories?: {
    id: string;
    name: string;
    slug: string;
    icon: string;
  };
  cities?: {
    name: string;
  };
  districts?: {
    name: string;
  };
}

export function PostsManagement() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 10;

  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    category_id: '',
    custom_location: ''
  });

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, [currentPage]);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/admin/posts?page=${currentPage}&limit=${postsPerPage}`);
      const data = await response.json();
      setPosts(data.posts || []);
      setTotalPages(Math.ceil((data.total || 0) / postsPerPage));
    } catch (error) {
      toast.error('Gönderiler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setEditForm({
      title: post.title || '',
      content: post.content,
      category_id: post.category_id || '',
      custom_location: post.custom_location || ''
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingPost) return;

    try {
      const response = await fetch(`/api/admin/posts/${editingPost.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        toast.success('Gönderi güncellendi');
        fetchPosts();
        setEditDialogOpen(false);
        setEditingPost(null);
      } else {
        toast.error('Güncelleme başarısız');
      }
    } catch (error) {
      toast.error('Hata oluştu');
    }
  };

  const toggleVisibility = async (postId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/posts/toggle-visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, is_hidden: !currentStatus }),
      });

      if (!response.ok) throw new Error();

      toast.success('Gönderi durumu güncellendi');
      fetchPosts();
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const deletePost = async (postId: string) => {
    if (!confirm('Bu gönderiyi silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch('/api/admin/posts/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId }),
      });

      if (!response.ok) throw new Error();

      toast.success('Gönderi silindi');
      fetchPosts();
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-bold">Gönderi Yönetimi</h2>
        <Badge variant="outline" className="text-sm">
          Toplam {posts.length} gönderi
        </Badge>
      </div>

      <div className="grid gap-4">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                {/* Başlık ve Kategori */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1 space-y-2">
                    {post.title && (
                      <h3 className="font-semibold text-lg">{post.title}</h3>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      {post.categories && (
                        <Badge variant="secondary" className="gap-1">
                          <span>{post.categories.icon}</span>
                          <span>{post.categories.name}</span>
                        </Badge>
                      )}
                      {post.custom_location && (
                        <Badge variant="outline" className="gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{post.custom_location}</span>
                        </Badge>
                      )}
                      {(post.cities || post.districts) && (
                        <Badge variant="outline" className="gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>
                            {post.cities?.name}
                            {post.districts?.name && ` / ${post.districts.name}`}
                          </span>
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {post.is_hidden ? (
                      <Badge variant="destructive">Gizli</Badge>
                    ) : (
                      <Badge variant="default">Görünür</Badge>
                    )}
                    {post.reports_count > 0 && (
                      <Badge variant="destructive" className="gap-1">
                        <Flag className="h-3 w-3" />
                        {post.reports_count} şikayet
                      </Badge>
                    )}
                  </div>
                </div>

                {/* İçerik */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                </div>

                {/* İstatistikler */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>{post.likes_count} beğeni</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsDown className="h-4 w-4" />
                    <span>{post.dislikes_count || 0} beğenmeme</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comments_count} yorum</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: tr })}</span>
                  </div>
                </div>

                {/* İşlem Butonları */}
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  <Dialog open={editDialogOpen && editingPost?.id === post.id} onOpenChange={setEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(post)}
                        className="gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Düzenle
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Gönderiyi Düzenle</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="edit-title">Başlık</Label>
                          <Input
                            id="edit-title"
                            value={editForm.title}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            placeholder="Gönderi başlığı..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-content">İçerik</Label>
                          <Textarea
                            id="edit-content"
                            value={editForm.content}
                            onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                            rows={6}
                            placeholder="Gönderi içeriği..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-category">Kategori</Label>
                          <Select value={editForm.category_id} onValueChange={(value) => setEditForm({ ...editForm, category_id: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Kategori seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  <div className="flex items-center gap-2">
                                    <span>{category.icon}</span>
                                    <span>{category.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="edit-location">Özel Konum</Label>
                          <Input
                            id="edit-location"
                            value={editForm.custom_location}
                            onChange={(e) => setEditForm({ ...editForm, custom_location: e.target.value })}
                            placeholder="Özel konum..."
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleSaveEdit}>Kaydet</Button>
                          <Button variant="outline" onClick={() => setEditDialogOpen(false)}>İptal</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleVisibility(post.id, post.is_hidden)}
                    className="gap-1"
                  >
                    {post.is_hidden ? (
                      <>
                        <Eye className="h-3 w-3" />
                        Göster
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3" />
                        Gizle
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deletePost(post.id)}
                    className="gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Sil
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {posts.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Henüz gönderi bulunmuyor.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Önceki
          </Button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Sonraki
          </Button>
        </div>
      )}
    </div>
  );
}