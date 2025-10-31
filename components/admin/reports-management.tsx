'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, AlertTriangle, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Report {
  id: string;
  reason: string;
  created_at: string;
  posts: {
    id: string;
    title?: string;
    content: string;
    is_hidden: boolean;
    categories: {
      name: string;
    };
  };
}

export function ReportsManagement() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPost, setSelectedPost] = useState<Report | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const reportsPerPage = 10;

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports?page=${currentPage}&limit=${reportsPerPage}`);
      const data = await response.json();
      setReports(data.reports || []);
      setTotalPages(Math.ceil((data.total || 0) / reportsPerPage));
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Raporlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);



  const handleDelete = async (reportId: string) => {
    if (!confirm('Bu raporu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Bir hata oluştu');
      }

      toast.success(data.message);
      fetchReports();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const openPostDialog = (report: Report) => {
    setSelectedPost(report);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Rapor Yönetimi</h2>
        <Badge variant="secondary">
          {reports.length} rapor
        </Badge>
      </div>

      {reports.length === 0 ? (
        <Card className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Henüz rapor yok</h3>
          <p className="text-muted-foreground">
            Kullanıcılar tarafından bildirilen gönderiler burada görünecek
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {report.posts.categories.name}
                        </Badge>
                        {report.posts.is_hidden && (
                          <Badge variant="destructive">Gizli</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(report.created_at), {
                            addSuffix: true,
                            locale: tr,
                          })}
                        </span>
                      </div>

                      {report.posts.title && (
                        <h3 className="font-semibold">{report.posts.title}</h3>
                      )}

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {report.posts.content}
                      </p>

                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">
                          <strong>Rapor Nedeni:</strong> {report.reason}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openPostDialog(report)}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Görüntüle
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(report.id)}
                        className="gap-2 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        Sil
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
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

      {/* Post Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rapor Detayı</DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {selectedPost.posts.categories.name}
                </Badge>
                {selectedPost.posts.is_hidden && (
                  <Badge variant="destructive">Gizli</Badge>
                )}
              </div>

              {selectedPost.posts.title && (
                <div>
                  <h3 className="font-semibold text-lg">{selectedPost.posts.title}</h3>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">İçerik:</h4>
                <p className="text-sm bg-muted p-3 rounded-lg">
                  {selectedPost.posts.content}
                </p>
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800 mb-1">Rapor Nedeni:</h4>
                <p className="text-sm text-red-700">{selectedPost.reason}</p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    handleDelete(selectedPost.id);
                    setDialogOpen(false);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  Raporu Sil
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
