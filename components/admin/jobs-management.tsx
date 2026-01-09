'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Play, BarChart3, Clock, CheckCircle, XCircle, Calendar, TrendingUp, Plus, Edit, Trash2, Power, PowerOff } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface ConfessionLog {
  id: string;
  confession_content: string;
  category: string;
  location: string;
  metadata: any;
  scheduled_time: string;
  status: 'success' | 'failed';
  error_message?: string;
  created_at: string;
}

interface CronSchedule {
  id: string;
  time: string;
  label: string;
  is_active: boolean;
  category?: string;
  created_at: string;
  updated_at: string;
}

interface Stats {
  today: {
    totalPosts: number;
    successfulCrons: number;
    failedCrons: number;
    categoryBreakdown: Record<string, number>;
  };
  overall: {
    totalPosts: number;
    botPosts: number;
    userPosts: number;
  };
}

// Schedule Management Component
function ScheduleManagement() {
  const [schedules, setSchedules] = useState<CronSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSchedule, setEditingSchedule] = useState<CronSchedule | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    time: '',
    label: '',
    is_active: true,
    category: 'random'
  });

  const categories = [
    { value: 'random', label: 'Rastgele Kategori' },
    { value: 'ask', label: 'Aşk' },
    { value: 'arkadaslik', label: 'Arkadaşlık' },
    { value: 'aile', label: 'Aile' },
    { value: 'is', label: 'İş' },
    { value: 'okul', label: 'Okul' },
    { value: 'cinsellik', label: 'Cinsellik' },
    { value: 'kayip-esya', label: 'Kayıp Eşya' },
    { value: 'havadan-sudan', label: 'Havadan Sudan' },
    { value: 'gizli', label: 'Gizli' }
  ];

  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/admin/cron-schedules');
      const data = await response.json();
      if (data.success) {
        setSchedules(data.schedules);
      }
    } catch (error) {
      console.error('Schedule\'lar alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const url = editingSchedule 
        ? `/api/admin/cron-schedules/${editingSchedule.id}`
        : '/api/admin/cron-schedules';
      
      const method = editingSchedule ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchSchedules();
        setIsDialogOpen(false);
        setEditingSchedule(null);
        setFormData({ time: '', label: '', is_active: true, category: 'random' });
        alert(data.message);
      } else {
        alert(`Hata: ${data.error}`);
      }
    } catch (error) {
      alert(`Beklenmeyen hata: ${error}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu schedule\'ı silmek istediğinizden emin misiniz?')) return;
    
    try {
      const response = await fetch(`/api/admin/cron-schedules/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchSchedules();
        alert(data.message);
      } else {
        alert(`Hata: ${data.error}`);
      }
    } catch (error) {
      alert(`Beklenmeyen hata: ${error}`);
    }
  };

  const handleToggleActive = async (schedule: CronSchedule) => {
    try {
      const response = await fetch(`/api/admin/cron-schedules/${schedule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...schedule,
          is_active: !schedule.is_active
        })
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchSchedules();
      } else {
        alert(`Hata: ${data.error}`);
      }
    } catch (error) {
      alert(`Beklenmeyen hata: ${error}`);
    }
  };

  const openEditDialog = (schedule?: CronSchedule) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        time: schedule.time,
        label: schedule.label,
        is_active: schedule.is_active,
        category: schedule.category || 'random'
      });
    } else {
      setEditingSchedule(null);
      setFormData({ time: '', label: '', is_active: true, category: 'random' });
    }
    setIsDialogOpen(true);
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Cron Schedule Yönetimi</CardTitle>
            <CardDescription>
              Otomatik itiraf oluşturma zamanlarını yönetin
            </CardDescription>
          </div>
          <Button onClick={() => openEditDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Schedule
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Yükleniyor...</div>
        ) : (
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold">{schedule.time}</div>
                  <div>
                    <div className="font-medium">{schedule.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {schedule.category && schedule.category !== 'random' 
                        ? categories.find(c => c.value === schedule.category)?.label 
                        : 'Rastgele Kategori'}
                    </div>
                  </div>
                  <Badge variant={schedule.is_active ? 'default' : 'secondary'}>
                    {schedule.is_active ? 'Aktif' : 'Pasif'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(schedule)}
                  >
                    {schedule.is_active ? (
                      <PowerOff className="w-4 h-4" />
                    ) : (
                      <Power className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(schedule)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(schedule.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {schedules.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Henüz schedule bulunamadı
              </div>
            )}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSchedule ? 'Schedule Düzenle' : 'Yeni Schedule Ekle'}
              </DialogTitle>
              <DialogDescription>
                Otomatik itiraf oluşturma zamanı ayarlayın
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="time">Saat (HH:MM)</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="label">Etiket</Label>
                <Input
                  id="label"
                  placeholder="Örn: Sabah İtirafı"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="category">Kategori</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                İptal
              </Button>
              <Button onClick={handleSave}>
                {editingSchedule ? 'Güncelle' : 'Ekle'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

interface Stats {
  today: {
    totalPosts: number;
    successfulCrons: number;
    failedCrons: number;
    categoryBreakdown: Record<string, number>;
  };
  overall: {
    totalPosts: number;
    botPosts: number;
    userPosts: number;
  };
}

export function JobsManagement() {
  const [logs, setLogs] = useState<ConfessionLog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [manualLoading, setManualLoading] = useState(false);

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/admin/confession-logs');
      const data = await response.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Loglar alınamadı:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('İstatistikler alınamadı:', error);
    }
  };

  const runManualConfession = async () => {
    setManualLoading(true);
    try {
      const response = await fetch('/api/test-cron', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        alert(`✅ Manuel itiraf başarıyla oluşturuldu!\n\nKategori: ${data.post.category}\nKonum: ${data.metadata.il}, ${data.metadata.ilce}`);
        // Logları yenile
        await fetchLogs();
        await fetchStats();
      } else {
        alert(`❌ Hata: ${data.error}`);
      }
    } catch (error) {
      alert(`❌ Beklenmeyen hata: ${error}`);
    } finally {
      setManualLoading(false);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([fetchLogs(), fetchStats()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR');
  };

  const getStatusBadge = (status: string) => {
    return status === 'success' ? (
      <Badge variant="default" className="bg-green-500">
        <CheckCircle className="w-3 h-3 mr-1" />
        Başarılı
      </Badge>
    ) : (
      <Badge variant="destructive">
        <XCircle className="w-3 h-3 mr-1" />
        Başarısız
      </Badge>
    );
  };

  const getNextCronTime = () => {
    const now = new Date();
    const hour = now.getHours();
    
    const cronTimes = ['07:00', '09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00', '23:00', '01:00'];
    
    for (const time of cronTimes) {
      const [h] = time.split(':').map(Number);
      if (h > hour) return time;
    }
    return '07:00'; // Ertesi gün
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Otomatik İtiraf Sistemi</h2>
          <p className="text-muted-foreground">Cron job'lar ve itiraf üretim sistemi yönetimi</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runManualConfession} disabled={manualLoading}>
            <Play className="w-4 h-4 mr-2" />
            {manualLoading ? 'Oluşturuluyor...' : 'Manuel İtiraf Oluştur'}
          </Button>
          <Button variant="outline" onClick={refreshData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bugünkü İtiraflar</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.today.totalPosts}</div>
              <p className="text-xs text-muted-foreground">
                Başarılı: {stats.today.successfulCrons} | Başarısız: {stats.today.failedCrons}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam İtiraflar</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overall.totalPosts}</div>
              <p className="text-xs text-muted-foreground">
                Bot: {stats.overall.botPosts} | Kullanıcı: {stats.overall.userPosts}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Başarı Oranı</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.today.successfulCrons + stats.today.failedCrons > 0 
                  ? Math.round((stats.today.successfulCrons / (stats.today.successfulCrons + stats.today.failedCrons)) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Bugünkü cron job'lar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sonraki Cron</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getNextCronTime()}</div>
              <p className="text-xs text-muted-foreground">Türkiye saati</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Son Loglar</TabsTrigger>
          <TabsTrigger value="schedule">Cron Programı</TabsTrigger>
          <TabsTrigger value="categories">Kategori Dağılımı</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>İtiraf Logları</CardTitle>
              <CardDescription>
                Son oluşturulan itirafların detayları
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(log.status)}
                        <Badge variant="outline">{log.scheduled_time}</Badge>
                        <Badge variant="secondary">{log.category}</Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(log.created_at)}
                      </span>
                    </div>
                    
                    <div className="text-sm">
                      <strong>Konum:</strong> {log.location}
                    </div>
                    
                    {log.metadata && (
                      <div className="text-sm text-muted-foreground">
                        <strong>Profil:</strong> {log.metadata.yas} yaş, {log.metadata.meslek}, {log.metadata.cinsiyet}
                      </div>
                    )}
                    
                    <div className="text-sm bg-muted p-2 rounded">
                      <strong>İçerik:</strong> {log.confession_content.substring(0, 200)}
                      {log.confession_content.length > 200 && '...'}
                    </div>
                    
                    {log.error_message && (
                      <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        <strong>Hata:</strong> {log.error_message}
                      </div>
                    )}
                  </div>
                ))}
                
                {logs.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Henüz log bulunamadı
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <ScheduleManagement />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bugünkü Kategori Dağılımı</CardTitle>
              <CardDescription>
                Kategorilere göre oluşturulan itiraf sayıları
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.today.categoryBreakdown && Object.keys(stats.today.categoryBreakdown).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(stats.today.categoryBreakdown).map(([category, count]) => (
                    <div key={category} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="font-medium">{category}</span>
                      <Badge variant="outline">{count} itiraf</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Bugün henüz itiraf oluşturulmamış
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}