'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Calendar, User } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function ContactManagement() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/admin/contact');
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      toast.error('Mesajlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const toggleReadStatus = async (messageId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: messageId, is_read: !currentStatus }),
      });

      if (!response.ok) throw new Error();

      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, is_read: !currentStatus } : msg
        )
      );

      toast.success(currentStatus ? 'Okunmadı olarak işaretlendi' : 'Okundu olarak işaretlendi');
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const openMessageDialog = (message: ContactMessage) => {
    setSelectedMessage(message);
    setDialogOpen(true);
    
    // Mesajı okundu olarak işaretle
    if (!message.is_read) {
      toggleReadStatus(message.id, false);
    }
  };

  const unreadCount = messages.filter(msg => !msg.is_read).length;

  return (
    <>
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">İletişim Mesajları</h2>
            <div className="flex gap-2">
              <Badge variant="outline">{messages.length} toplam</Badge>
              {unreadCount > 0 && (
                <Badge variant="destructive">{unreadCount} okunmamış</Badge>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Durum</TableHead>
                  <TableHead>Gönderen</TableHead>
                  <TableHead>Konu</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((message) => (
                  <TableRow 
                    key={message.id}
                    className={!message.is_read ? 'bg-blue-50/50' : ''}
                  >
                    <TableCell>
                      {message.is_read ? (
                        <Badge variant="outline">Okundu</Badge>
                      ) : (
                        <Badge variant="destructive">Yeni</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span className="font-medium">{message.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="truncate font-medium">{message.subject}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {message.message}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(new Date(message.created_at), {
                            addSuffix: true,
                            locale: tr,
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openMessageDialog(message)}
                        >
                          Görüntüle
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleReadStatus(message.id, message.is_read)}
                        >
                          {message.is_read ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {messages.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              Henüz mesaj yok
            </div>
          )}
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Mesaj Detayı</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Gönderen</Label>
                <p className="text-sm">{selectedMessage.name}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Konu</Label>
                <p className="text-sm">{selectedMessage.subject}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Mesaj</Label>
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Gönderim Tarihi</Label>
                <p className="text-sm">
                  {new Date(selectedMessage.created_at).toLocaleString('tr-TR')}
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="ghost"
                  onClick={() => toggleReadStatus(selectedMessage.id, selectedMessage.is_read)}
                >
                  {selectedMessage.is_read ? 'Okunmadı İşaretle' : 'Okundu İşaretle'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}