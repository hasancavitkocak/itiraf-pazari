'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Trash2, Flag } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Post {
  id: string;
  content: string;
  is_hidden: boolean;
  reports_count: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

export function PostsManagement() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/admin/posts');
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      toast.error('Gönderiler yüklenemedi');
    } finally {
      setLoading(false);
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

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Gönderiler</h2>
          <Badge variant="outline">{posts.length} gönderi</Badge>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>İçerik</TableHead>
                <TableHead>İstatistikler</TableHead>
                <TableHead>Raporlar</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="max-w-md">
                    <p className="truncate">{post.content}</p>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div>{post.likes_count} beğeni</div>
                      <div>{post.comments_count} yorum</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {post.reports_count > 0 ? (
                      <Badge variant="destructive" className="gap-1">
                        <Flag className="h-3 w-3" />
                        {post.reports_count}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {post.is_hidden ? (
                      <Badge variant="secondary">Gizli</Badge>
                    ) : (
                      <Badge variant="outline">Görünür</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleVisibility(post.id, post.is_hidden)}
                      >
                        {post.is_hidden ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deletePost(post.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
}
