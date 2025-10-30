'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  MessageCircle, 
  UserCheck, 
  Calendar,
  CalendarDays,
  Eye,
  EyeOff,
  UserX,
  AlertTriangle,
  RefreshCw,
  BarChart3
} from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  activeUsers: number;
  activeUsersCount: number;
  todayPosts: number;
  todayComments: number;
  weekPosts: number;
  weekComments: number;
  totalRevenue: string;
  monthlyRevenue: string;
  topCategories: Array<{ name: string; count: number }>;
  hiddenPosts: number;
  bannedUsers: number;
  totalReports: number;
  pendingReports: number;
}

export function AnalyticsDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalPosts: 0,
    totalComments: 0,
    activeUsers: 0,
    activeUsersCount: 0,
    todayPosts: 0,
    todayComments: 0,
    weekPosts: 0,
    weekComments: 0,
    totalRevenue: '0.00',
    monthlyRevenue: '0.00',
    topCategories: [],
    hiddenPosts: 0,
    bannedUsers: 0,
    totalReports: 0,
    pendingReports: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/analytics', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Analytics data:', data);
      
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-2">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Yenile Butonu */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">📊 Analiz Dashboard</h2>
        <Button 
          onClick={fetchStats} 
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Yenile
        </Button>
      </div>

      {/* Ana İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Toplam Kullanıcı"
          value={(stats.totalUsers || 0).toLocaleString()}
          icon={Users}
          color="bg-blue-500"
          subtitle="Kayıtlı üye sayısı"
        />
        <StatCard
          title="Aktif Kullanıcı"
          value={(stats.activeUsers || 0).toLocaleString()}
          icon={TrendingUp}
          color="bg-green-500"
          subtitle="Son 7 günde aktif"
        />
        <StatCard
          title="Aktif Hesap"
          value={(stats.activeUsersCount || 0).toLocaleString()}
          icon={UserCheck}
          color="bg-yellow-500"
          subtitle="Pasif edilmemiş hesaplar"
        />
        <StatCard
          title="Yasaklı Kullanıcı"
          value={(stats.bannedUsers || 0).toLocaleString()}
          icon={UserX}
          color="bg-red-500"
          subtitle="Engellenmiş hesaplar"
        />
      </div>

      {/* İçerik İstatistikleri */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Toplam İtiraf"
          value={(stats.totalPosts || 0).toLocaleString()}
          icon={FileText}
          color="bg-purple-500"
          subtitle="Tüm gönderiler"
        />
        <StatCard
          title="Toplam Yorum"
          value={(stats.totalComments || 0).toLocaleString()}
          icon={MessageCircle}
          color="bg-indigo-500"
          subtitle="Tüm yorumlar"
        />
        <StatCard
          title="Gizli İçerik"
          value={(stats.hiddenPosts || 0).toLocaleString()}
          icon={EyeOff}
          color="bg-gray-500"
          subtitle="Moderatör tarafından gizlenen"
        />
        <StatCard
          title="Bekleyen Rapor"
          value={(stats.pendingReports || 0).toLocaleString()}
          icon={AlertTriangle}
          color="bg-orange-500"
          subtitle="İnceleme bekliyor"
        />
      </div>

      {/* Günlük ve Haftalık İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Bugünkü Aktivite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Yeni İtiraflar</span>
                <Badge variant="secondary">{stats.todayPosts}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Yeni Yorumlar</span>
                <Badge variant="secondary">{stats.todayComments}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Bu Haftaki Aktivite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Haftalık İtiraflar</span>
                <Badge variant="secondary">{stats.weekPosts}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Haftalık Yorumlar</span>
                <Badge variant="secondary">{stats.weekComments}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gelir İstatistikleri */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Gelir İstatistikleri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Toplam Gelir</span>
                <span className="text-lg font-bold text-green-600">₺{stats.totalRevenue}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Bu Ay</span>
                <span className="text-lg font-bold text-blue-600">₺{stats.monthlyRevenue}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              En Popüler Kategoriler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topCategories.slice(0, 5).map((category, index) => (
                <div key={category.name} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-sm">{category.name}</span>
                  </div>
                  <Badge variant="outline">{category.count}</Badge>
                </div>
              ))}
              {stats.topCategories.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Henüz kategori verisi yok
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Moderasyon İstatistikleri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Moderasyon Özeti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.totalReports}</p>
              <p className="text-sm text-muted-foreground">Toplam Rapor</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.pendingReports}</p>
              <p className="text-sm text-muted-foreground">Bekleyen Rapor</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">{stats.hiddenPosts}</p>
              <p className="text-sm text-muted-foreground">Gizli İçerik</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.bannedUsers}</p>
              <p className="text-sm text-muted-foreground">Yasaklı Kullanıcı</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
