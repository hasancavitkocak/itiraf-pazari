'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Ban, 
  Search, 
  Shield, 
  Calendar, 
  User, 
  UserX, 
  UserCheck, 
  FileText, 
  MessageCircle,
  Eye,
  EyeOff,
  MoreHorizontal,
  RefreshCw,
  Filter
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { tr } from 'date-fns/locale';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface User {
  id: string;
  username: string | null;
  nickname: string | null;
  role: string;
  is_banned: boolean;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
  posts_count: number;
  comments_count: number;
}

export function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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

  const toggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/users/toggle-active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, is_active: !currentStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'İşlem başarısız');
      }

      toast.success(`Kullanıcı ${!currentStatus ? 'aktif' : 'pasif'} edildi`);
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

  const filteredUsers = users.filter((user) => {
    const searchLower = search.toLowerCase();
    const userDate = format(new Date(user.created_at), 'dd.MM.yyyy', { locale: tr });
    
    // Arama filtresi
    const matchesSearch = !search || (
      (user.username?.toLowerCase().includes(searchLower)) ||
      (user.nickname?.toLowerCase().includes(searchLower)) ||
      user.id.toLowerCase().includes(searchLower) ||
      userDate.includes(searchLower) ||
      formatDistanceToNow(new Date(user.created_at), { 
        addSuffix: true, 
        locale: tr 
      }).toLowerCase().includes(searchLower)
    );

    // Rol filtresi
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    // Durum filtresi
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && !user.is_banned && user.is_active) ||
      (statusFilter === 'banned' && user.is_banned) ||
      (statusFilter === 'inactive' && !user.is_active && !user.is_banned);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getUserStats = () => {
    const total = users.length;
    const active = users.filter(u => !u.is_banned && u.is_active).length;
    const banned = users.filter(u => u.is_banned).length;
    const inactive = users.filter(u => !u.is_active && !u.is_banned).length;
    const admins = users.filter(u => u.role === 'admin').length;
    const moderators = users.filter(u => u.role === 'moderator').length;

    return { total, active, banned, inactive, admins, moderators };
  };

  const stats = getUserStats();

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Kullanıcılar yükleniyor...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header ve İstatistikler */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">👥 Kullanıcı Yönetimi</h2>
          <p className="text-muted-foreground">Kullanıcıları yönetin ve moderasyon işlemlerini gerçekleştirin</p>
        </div>
        <Button onClick={fetchUsers} disabled={loading} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Yenile
        </Button>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Toplam</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Aktif</p>
                <p className="text-xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <EyeOff className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pasif</p>
                <p className="text-xl font-bold">{stats.inactive}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserX className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Yasaklı</p>
                <p className="text-xl font-bold">{stats.banned}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Admin</p>
                <p className="text-xl font-bold">{stats.admins}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Moderatör</p>
                <p className="text-xl font-bold">{stats.moderators}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtreler */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Kullanıcı adı, nickname, ID veya kayıt tarihi ile ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Rol filtresi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Roller</SelectItem>
                <SelectItem value="user">Kullanıcı</SelectItem>
                <SelectItem value="moderator">Moderatör</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Durum filtresi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Pasif</SelectItem>
                <SelectItem value="banned">Yasaklı</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Kullanıcı Tablosu */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kullanıcı</TableHead>
                  <TableHead>Aktivite</TableHead>
                  <TableHead>Kayıt Tarihi</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                          user.is_banned ? 'bg-red-500' : 
                          !user.is_active ? 'bg-gray-500' : 
                          'bg-blue-500'
                        }`}>
                          {(user.nickname || user.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">
                            {user.nickname || user.username || 'İsimsiz Kullanıcı'}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {user.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3 text-muted-foreground" />
                          <span>{user.posts_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3 text-muted-foreground" />
                          <span>{user.comments_count || 0}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">
                            {format(new Date(user.created_at), 'dd.MM.yyyy', { locale: tr })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(user.created_at), { 
                              addSuffix: true, 
                              locale: tr 
                            })}
                          </div>
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
                              {(user.role === 'admin' || user.role === 'moderator') && 
                                <Shield className="h-3 w-3" />
                              }
                              <span className="capitalize">
                                {user.role === 'user' ? 'Kullanıcı' : 
                                 user.role === 'moderator' ? 'Moderatör' : 
                                 user.role === 'admin' ? 'Admin' : user.role}
                              </span>
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3" />
                              <span>Kullanıcı</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="moderator">
                            <div className="flex items-center gap-2">
                              <Shield className="h-3 w-3" />
                              <span>Moderatör</span>
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
                      <div className="flex flex-col gap-1">
                        {user.is_banned ? (
                          <Badge variant="destructive" className="w-fit">
                            <UserX className="h-3 w-3 mr-1" />
                            Yasaklı
                          </Badge>
                        ) : !user.is_active ? (
                          <Badge variant="secondary" className="w-fit">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Pasif
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="w-fit">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Aktif
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Eye className="h-4 w-4 mr-2" />
                                Detayları Gör
                              </DropdownMenuItem>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Kullanıcı Detayları</DialogTitle>
                                <DialogDescription>
                                  {user.nickname || user.username || 'İsimsiz Kullanıcı'} kullanıcısının detaylı bilgileri
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Kullanıcı ID</label>
                                    <p className="text-sm text-muted-foreground font-mono">{user.id}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Nickname</label>
                                    <p className="text-sm text-muted-foreground">{user.nickname || 'Yok'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Username</label>
                                    <p className="text-sm text-muted-foreground">{user.username || 'Yok'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Rol</label>
                                    <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Gönderi Sayısı</label>
                                    <p className="text-sm text-muted-foreground">{user.posts_count || 0}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Yorum Sayısı</label>
                                    <p className="text-sm text-muted-foreground">{user.comments_count || 0}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Kayıt Tarihi</label>
                                    <p className="text-sm text-muted-foreground">
                                      {format(new Date(user.created_at), 'dd.MM.yyyy HH:mm', { locale: tr })}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Son Giriş</label>
                                    <p className="text-sm text-muted-foreground">
                                      {user.last_login ? 
                                        format(new Date(user.last_login), 'dd.MM.yyyy HH:mm', { locale: tr }) : 
                                        'Bilinmiyor'
                                      }
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem 
                            onClick={() => toggleActive(user.id, user.is_active)}
                            className={user.is_active ? 'text-orange-600' : 'text-green-600'}
                          >
                            {user.is_active ? (
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

                          <DropdownMenuItem 
                            onClick={() => toggleBan(user.id, user.is_banned)}
                            className={user.is_banned ? 'text-green-600' : 'text-red-600'}
                          >
                            {user.is_banned ? (
                              <>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Yasağı Kaldır
                              </>
                            ) : (
                              <>
                                <Ban className="h-4 w-4 mr-2" />
                                Yasakla
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">
                {search || roleFilter !== 'all' || statusFilter !== 'all' 
                  ? 'Filtrelere uygun kullanıcı bulunamadı' 
                  : 'Henüz kullanıcı yok'
                }
              </p>
              <p className="text-sm">
                {search || roleFilter !== 'all' || statusFilter !== 'all' 
                  ? 'Farklı filtreler deneyebilir veya filtreleri temizleyebilirsiniz'
                  : 'İlk kullanıcının kaydolmasını bekleyin'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}