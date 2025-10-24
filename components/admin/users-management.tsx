'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Crown, Ban, Search, Shield } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface User {
  id: string;
  username: string | null;
  role: string;
  is_premium: boolean;
  premium_expires_at: string | null;
  is_banned: boolean;
  created_at: string;
}

export function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Kullanıcılar yüklenemedi');
      }
      
      setUsers(data.users || []);
    } catch (error: any) {
      console.error('Fetch users error:', error);
      toast.error(error.message || 'Kullanıcılar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const togglePremium = async (userId: string, currentStatus: boolean) => {
    try {
      const duration = prompt('Premium süresi seçin (monthly/yearly):', 'yearly');
      if (!duration || !['monthly', 'yearly'].includes(duration)) {
        toast.error('Geçerli bir süre seçin (monthly veya yearly)');
        return;
      }

      const response = await fetch('/api/admin/users/toggle-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: userId, 
          is_premium: !currentStatus,
          duration 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'İşlem başarısız');
      }

      toast.success('Premium durumu güncellendi');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'İşlem başarısız');
    }
  };

  const toggleBan = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/users/toggle-ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, is_banned: !currentStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'İşlem başarısız');
      }

      toast.success('Yasaklama durumu güncellendi');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'İşlem başarısız');
    }
  };

  const changeRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch('/api/admin/users/change-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, role: newRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'İşlem başarısız');
      }

      toast.success('Kullanıcı rolü güncellendi');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'İşlem başarısız');
    }
  };

  const filteredUsers = users.filter((user) =>
    (user.username?.toLowerCase().includes(search.toLowerCase())) ||
    user.id.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center">Kullanıcılar yükleniyor...</div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Kullanıcı Yönetimi</h2>
          <Badge variant="outline">{users.length} kullanıcı</Badge>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Kullanıcı adı veya ID ile ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kullanıcı</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Premium</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {user.username || 'Kullanıcı adı yok'}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {user.id.substring(0, 8)}...
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value) => changeRole(user.id, value)}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue>
                          <div className="flex items-center gap-1">
                            {user.role === 'admin' && <Shield className="h-3 w-3" />}
                            <span className="capitalize">{user.role}</span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">
                          <div className="flex items-center gap-2">
                            <span>User</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="moderator">
                          <div className="flex items-center gap-2">
                            <Shield className="h-3 w-3" />
                            <span>Moderator</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Shield className="h-3 w-3" />
                            <span>Admin</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {user.is_premium ? (
                      <Badge className="gap-1">
                        <Crown className="h-3 w-3" />
                        Premium
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.is_banned ? (
                      <Badge variant="destructive">Yasaklı</Badge>
                    ) : (
                      <Badge variant="outline">Aktif</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => togglePremium(user.id, user.is_premium)}
                      >
                        <Crown className="h-3 w-3 mr-1" />
                        {user.is_premium ? 'Kaldır' : 'Ekle'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleBan(user.id, user.is_banned)}
                      >
                        <Ban className="h-3 w-3 mr-1" />
                        {user.is_banned ? 'Kaldır' : 'Yasakla'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {search ? 'Arama kriterine uygun kullanıcı bulunamadı' : 'Henüz kullanıcı yok'}
          </div>
        )}
      </div>
    </Card>
  );
}