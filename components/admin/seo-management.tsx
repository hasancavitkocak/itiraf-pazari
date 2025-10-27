'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Search, 
  Globe, 
  BarChart3, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  RefreshCw,
  Eye,
  TrendingUp,
  FileText,
  Image,
  Link,
  Smartphone,
  Zap,
  Shield,
  Target,
  Loader2
} from 'lucide-react';

interface SEOSettings {
  site_title: string;
  site_description: string;
  site_keywords: string;
  google_analytics_id: string;
  google_search_console_id: string;
  google_adsense_id: string;
  facebook_pixel_id: string;
  twitter_site: string;
  og_image: string;
  robots_txt: string;
  canonical_url: string;
  schema_org_type: string;
  enable_breadcrumbs: boolean;
  enable_structured_data: boolean;
  enable_open_graph: boolean;
  enable_twitter_cards: boolean;
  meta_author: string;
  meta_publisher: string;
  language: string;
  region: string;
}

interface SEOAnalysis {
  title: { exists: boolean; length: number; optimized: boolean };
  description: { exists: boolean; length: number; optimized: boolean };
  headings: { h1_count: number; h2_count: number; h3_count: number };
  images: { total: number; with_alt: number; without_alt: number };
  links: { internal: number; external: number };
  performance: { load_time: number; mobile_friendly: boolean; https: boolean };
}

interface IndexingStatus {
  total_pages: number;
  indexed_pages: number;
  not_indexed: number;
  last_crawl: string;
  sitemap_submitted: boolean;
  coverage_issues: string[];
}

export function SEOManagement() {
  const [settings, setSettings] = useState<SEOSettings>({
    site_title: '',
    site_description: '',
    site_keywords: '',
    google_analytics_id: '',
    google_search_console_id: '',
    google_adsense_id: '',
    facebook_pixel_id: '',
    twitter_site: '',
    og_image: '',
    robots_txt: '',
    canonical_url: '',
    schema_org_type: '',
    enable_breadcrumbs: true,
    enable_structured_data: true,
    enable_open_graph: true,
    enable_twitter_cards: true,
    meta_author: '',
    meta_publisher: '',
    language: '',
    region: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);
  const [indexingStatus, setIndexingStatus] = useState<IndexingStatus | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/seo');
      const data = await response.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching SEO settings:', error);
      toast.error('SEO ayarları yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kaydetme başarısız');
      }

      toast.success('SEO ayarları başarıyla kaydedildi');
    } catch (error: any) {
      toast.error(error.message || 'Kaydetme başarısız');
    } finally {
      setSaving(false);
    }
  };

  const runSEOAnalysis = async () => {
    try {
      setAnalyzing(true);
      const response = await fetch('/api/admin/seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze_page', url: settings.canonical_url }),
      });

      const data = await response.json();
      if (data.success) {
        setAnalysis(data.analysis);
        toast.success('SEO analizi tamamlandı');
      }
    } catch (error) {
      toast.error('SEO analizi başarısız');
    } finally {
      setAnalyzing(false);
    }
  };

  const checkIndexing = async () => {
    try {
      const response = await fetch('/api/admin/seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check_indexing' }),
      });

      const data = await response.json();
      if (data.success) {
        setIndexingStatus(data.indexing_status);
        toast.success('İndexleme durumu güncellendi');
      }
    } catch (error) {
      toast.error('İndexleme durumu alınamadı');
    }
  };

  const getSEOScore = () => {
    if (!analysis) return 0;
    
    let score = 0;
    if (analysis.title.optimized) score += 20;
    if (analysis.description.optimized) score += 20;
    if (analysis.headings.h1_count === 1) score += 15;
    if (analysis.images.with_alt / analysis.images.total > 0.8) score += 15;
    if (analysis.performance.mobile_friendly) score += 15;
    if (analysis.performance.https) score += 15;
    
    return score;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">SEO Yönetimi</h2>
          <p className="text-muted-foreground">Site SEO ayarlarını yönetin ve performansı izleyin</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={runSEOAnalysis} disabled={analyzing}>
            {analyzing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
            SEO Analizi
          </Button>
          <Button variant="outline" onClick={checkIndexing}>
            <RefreshCw className="h-4 w-4 mr-2" />
            İndexleme Durumu
          </Button>
        </div>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Ayarlar
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analiz
          </TabsTrigger>
          <TabsTrigger value="indexing" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            İndexleme
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Araçlar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Temel SEO Ayarları */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Temel SEO Ayarları
                </CardTitle>
                <CardDescription>Site başlığı, açıklama ve anahtar kelimeler</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="site_title">Site Başlığı</Label>
                  <Input
                    id="site_title"
                    value={settings.site_title}
                    onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
                    placeholder="Site başlığınızı girin"
                  />
                  <p className="text-xs text-muted-foreground">
                    Karakter sayısı: {settings.site_title.length}/60 
                    {settings.site_title.length > 60 && <span className="text-red-500 ml-1">⚠️ Çok uzun</span>}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="site_description">Site Açıklaması</Label>
                  <Textarea
                    id="site_description"
                    value={settings.site_description}
                    onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                    rows={3}
                    placeholder="Site açıklamanızı girin"
                  />
                  <p className="text-xs text-muted-foreground">
                    Karakter sayısı: {settings.site_description.length}/160
                    {settings.site_description.length > 160 && <span className="text-red-500 ml-1">⚠️ Çok uzun</span>}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="site_keywords">Anahtar Kelimeler</Label>
                  <Input
                    id="site_keywords"
                    value={settings.site_keywords}
                    onChange={(e) => setSettings({ ...settings, site_keywords: e.target.value })}
                    placeholder="anahtar, kelime, listesi"
                  />
                  <p className="text-xs text-muted-foreground">Virgülle ayırarak yazın</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="canonical_url">Canonical URL</Label>
                  <Input
                    id="canonical_url"
                    value={settings.canonical_url}
                    onChange={(e) => setSettings({ ...settings, canonical_url: e.target.value })}
                    placeholder="https://itirafpazari.com"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tracking ve Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Tracking ve Analytics
                </CardTitle>
                <CardDescription>Google Analytics, Search Console ve diğer tracking kodları</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
                  <Input
                    id="google_analytics_id"
                    value={settings.google_analytics_id}
                    onChange={(e) => setSettings({ ...settings, google_analytics_id: e.target.value })}
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="google_search_console_id">Google Search Console ID</Label>
                  <Input
                    id="google_search_console_id"
                    value={settings.google_search_console_id}
                    onChange={(e) => setSettings({ ...settings, google_search_console_id: e.target.value })}
                    placeholder="verification code"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="google_adsense_id">Google AdSense ID</Label>
                  <Input
                    id="google_adsense_id"
                    value={settings.google_adsense_id}
                    onChange={(e) => setSettings({ ...settings, google_adsense_id: e.target.value })}
                    placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facebook_pixel_id">Facebook Pixel ID</Label>
                  <Input
                    id="facebook_pixel_id"
                    value={settings.facebook_pixel_id}
                    onChange={(e) => setSettings({ ...settings, facebook_pixel_id: e.target.value })}
                    placeholder="XXXXXXXXXXXXXXX"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Social Media ve Open Graph
                </CardTitle>
                <CardDescription>Sosyal medya paylaşımları için meta tags</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="twitter_site">Twitter Hesabı</Label>
                  <Input
                    id="twitter_site"
                    value={settings.twitter_site}
                    onChange={(e) => setSettings({ ...settings, twitter_site: e.target.value })}
                    placeholder="@itirafpazari"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="og_image">Open Graph Görseli</Label>
                  <Input
                    id="og_image"
                    value={settings.og_image}
                    onChange={(e) => setSettings({ ...settings, og_image: e.target.value })}
                    placeholder="/og-image.jpg"
                  />
                  <p className="text-xs text-muted-foreground">Önerilen boyut: 1200x630px</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_author">Meta Author</Label>
                  <Input
                    id="meta_author"
                    value={settings.meta_author}
                    onChange={(e) => setSettings({ ...settings, meta_author: e.target.value })}
                    placeholder="İtiraf Pazarı"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_publisher">Meta Publisher</Label>
                  <Input
                    id="meta_publisher"
                    value={settings.meta_publisher}
                    onChange={(e) => setSettings({ ...settings, meta_publisher: e.target.value })}
                    placeholder="İtiraf Pazarı"
                  />
                </div>
              </CardContent>
            </Card>

            {/* SEO Özellikleri */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  SEO Özellikleri
                </CardTitle>
                <CardDescription>SEO özelliklerini etkinleştirin/devre dışı bırakın</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Breadcrumbs</Label>
                    <p className="text-xs text-muted-foreground">Sayfa yolu navigasyonu</p>
                  </div>
                  <Switch
                    checked={settings.enable_breadcrumbs}
                    onCheckedChange={(checked) => setSettings({ ...settings, enable_breadcrumbs: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Structured Data</Label>
                    <p className="text-xs text-muted-foreground">JSON-LD schema markup</p>
                  </div>
                  <Switch
                    checked={settings.enable_structured_data}
                    onCheckedChange={(checked) => setSettings({ ...settings, enable_structured_data: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Open Graph</Label>
                    <p className="text-xs text-muted-foreground">Facebook paylaşım meta tags</p>
                  </div>
                  <Switch
                    checked={settings.enable_open_graph}
                    onCheckedChange={(checked) => setSettings({ ...settings, enable_open_graph: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Twitter Cards</Label>
                    <p className="text-xs text-muted-foreground">Twitter paylaşım meta tags</p>
                  </div>
                  <Switch
                    checked={settings.enable_twitter_cards}
                    onCheckedChange={(checked) => setSettings({ ...settings, enable_twitter_cards: checked })}
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Dil</Label>
                    <Input
                      id="language"
                      value={settings.language}
                      onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                      placeholder="tr-TR"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="region">Bölge</Label>
                    <Input
                      id="region"
                      value={settings.region}
                      onChange={(e) => setSettings({ ...settings, region: e.target.value })}
                      placeholder="TR"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Robots.txt */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Robots.txt
              </CardTitle>
              <CardDescription>Arama motoru botları için yönergeler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="robots_txt">Robots.txt İçeriği</Label>
                <Textarea
                  id="robots_txt"
                  value={settings.robots_txt}
                  onChange={(e) => setSettings({ ...settings, robots_txt: e.target.value })}
                  rows={8}
                  className="font-mono text-sm"
                  placeholder="User-agent: *&#10;Allow: /&#10;Disallow: /admin/"
                />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ExternalLink className="h-3 w-3" />
                  <a 
                    href={`${settings.canonical_url}/robots.txt`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Canlı robots.txt dosyasını görüntüle
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} size="lg">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Ayarları Kaydet
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {analysis ? (
            <div className="space-y-6">
              {/* SEO Skoru */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    SEO Skoru
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-primary">{getSEOScore()}/100</div>
                    <div className="flex-1">
                      <Progress value={getSEOScore()} className="h-3" />
                      <p className="text-sm text-muted-foreground mt-1">
                        {getSEOScore() >= 80 ? 'Mükemmel' : getSEOScore() >= 60 ? 'İyi' : 'İyileştirme Gerekli'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Title Analizi */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      {analysis.title.optimized ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                      )}
                      Sayfa Başlığı
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uzunluk:</span>
                        <span className={analysis.title.length > 60 ? 'text-red-500' : 'text-green-500'}>
                          {analysis.title.length} karakter
                        </span>
                      </div>
                      <Progress value={(analysis.title.length / 60) * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground">Önerilen: 50-60 karakter</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Description Analizi */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      {analysis.description.optimized ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                      )}
                      Meta Açıklama
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uzunluk:</span>
                        <span className={analysis.description.length > 160 ? 'text-red-500' : 'text-green-500'}>
                          {analysis.description.length} karakter
                        </span>
                      </div>
                      <Progress value={(analysis.description.length / 160) * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground">Önerilen: 150-160 karakter</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Başlık Yapısı */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      {analysis.headings.h1_count === 1 ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                      )}
                      Başlık Yapısı
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>H1:</span>
                        <Badge variant={analysis.headings.h1_count === 1 ? "default" : "destructive"}>
                          {analysis.headings.h1_count}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>H2:</span>
                        <Badge variant="secondary">{analysis.headings.h2_count}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>H3:</span>
                        <Badge variant="secondary">{analysis.headings.h3_count}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Görsel Analizi */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      Görseller
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Toplam:</span>
                        <span>{analysis.images.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Alt text ile:</span>
                        <span className="text-green-500">{analysis.images.with_alt}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Alt text olmadan:</span>
                        <span className="text-red-500">{analysis.images.without_alt}</span>
                      </div>
                      <Progress 
                        value={(analysis.images.with_alt / analysis.images.total) * 100} 
                        className="h-2" 
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Link Analizi */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Link className="h-4 w-4" />
                      Linkler
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>İç linkler:</span>
                        <span className="text-blue-500">{analysis.links.internal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dış linkler:</span>
                        <span className="text-purple-500">{analysis.links.external}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Toplam:</span>
                        <span>{analysis.links.internal + analysis.links.external}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Performans */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Performans
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Yüklenme süresi:</span>
                        <span className={analysis.performance.load_time < 3 ? 'text-green-500' : 'text-red-500'}>
                          {analysis.performance.load_time}s
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mobil uyumlu:</span>
                        {analysis.performance.mobile_friendly ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex justify-between">
                        <span>HTTPS:</span>
                        {analysis.performance.https ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">SEO Analizi Yapılmadı</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Sitenizin SEO performansını analiz etmek için butona tıklayın
                </p>
                <Button onClick={runSEOAnalysis} disabled={analyzing}>
                  {analyzing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                  SEO Analizi Başlat
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="indexing" className="space-y-6">
          {indexingStatus ? (
            <div className="space-y-6">
              {/* İndexleme Özeti */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Toplam Sayfa</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{indexingStatus.total_pages}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">İndexlenen</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-500">{indexingStatus.indexed_pages}</div>
                    <Progress 
                      value={(indexingStatus.indexed_pages / indexingStatus.total_pages) * 100} 
                      className="h-2 mt-2" 
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">İndexlenmemiş</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-500">{indexingStatus.not_indexed}</div>
                  </CardContent>
                </Card>
              </div>

              {/* İndexleme Detayları */}
              <Card>
                <CardHeader>
                  <CardTitle>İndexleme Durumu</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Son tarama:</span>
                    <span className="text-muted-foreground">
                      {new Date(indexingStatus.last_crawl).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Sitemap gönderildi:</span>
                    {indexingStatus.sitemap_submitted ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>

                  {indexingStatus.coverage_issues.length > 0 && (
                    <div className="space-y-2">
                      <Label>Kapsam Sorunları:</Label>
                      <div className="space-y-1">
                        {indexingStatus.coverage_issues.map((issue, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <AlertCircle className="h-3 w-3 text-yellow-500" />
                            <span>{issue}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Globe className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">İndexleme Durumu Bilinmiyor</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Google Search Console'dan indexleme durumunu kontrol edin
                </p>
                <Button onClick={checkIndexing}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Durumu Kontrol Et
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Google Araçları */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Google Araçları
                </CardTitle>
                <CardDescription>Google SEO araçlarına hızlı erişim</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Google Search Console
                  </a>
                </Button>
                
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Google Analytics
                  </a>
                </Button>
                
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://pagespeed.web.dev" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    PageSpeed Insights
                  </a>
                </Button>
                
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://search.google.com/test/mobile-friendly" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Mobile-Friendly Test
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Validation Araçları */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Validation Araçları
                </CardTitle>
                <CardDescription>SEO ve markup validation araçları</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Rich Results Test
                  </a>
                </Button>
                
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://validator.w3.org" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    HTML Validator
                  </a>
                </Button>
                
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://cards-dev.twitter.com/validator" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Twitter Card Validator
                  </a>
                </Button>
                
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://developers.facebook.com/tools/debug/" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Facebook Debugger
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Site Araçları */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Site Araçları
                </CardTitle>
                <CardDescription>Sitenizin SEO dosyalarına erişim</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={`${settings.canonical_url}/sitemap.xml`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Sitemap.xml
                  </a>
                </Button>
                
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={`${settings.canonical_url}/robots.txt`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Robots.txt
                  </a>
                </Button>
                
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={`${settings.canonical_url}/manifest.json`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Manifest.json
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Hızlı Aksiyonlar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Hızlı Aksiyonlar
                </CardTitle>
                <CardDescription>SEO görevlerini hızlıca gerçekleştirin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={runSEOAnalysis} disabled={analyzing}>
                  {analyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                  SEO Analizi Yap
                </Button>
                
                <Button variant="outline" className="w-full justify-start" onClick={checkIndexing}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  İndexleme Durumu
                </Button>
                
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={`https://www.google.com/search?q=site:${settings.canonical_url.replace('https://', '')}`} target="_blank" rel="noopener noreferrer">
                    <Eye className="h-4 w-4 mr-2" />
                    Google'da Görüntüle
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
