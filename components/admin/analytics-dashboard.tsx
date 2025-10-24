'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Users, FileText, DollarSign, TrendingUp } from 'lucide-react';

export function AnalyticsDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalRevenue: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/analytics');
      const data = await response.json();
      setStats(data.stats || stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Toplam Kullanıcı"
          value={stats.totalUsers}
          icon={Users}
          color="bg-primary"
        />
        <StatCard
          title="Toplam Gönderi"
          value={stats.totalPosts}
          icon={FileText}
          color="bg-secondary"
        />
        <StatCard
          title="Toplam Gelir"
          value={`₺${stats.totalRevenue}`}
          icon={DollarSign}
          color="bg-green-500"
        />
        <StatCard
          title="Aktif Kullanıcı"
          value={stats.activeUsers}
          icon={TrendingUp}
          color="bg-blue-500"
        />
      </div>
    </div>
  );
}
