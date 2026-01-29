'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, RotateCcw, Clock, CheckCircle, XCircle, Bot } from 'lucide-react';

interface JobLog {
  id: string;
  action: string;
  details: any;
  created_at: string;
}

interface JobResult {
  success: boolean;
  post_id?: number;
  category?: string;
  city?: string;
  district?: string;
  mood?: string;
  length?: string;
  word_count?: number;
  error?: string;
}

export function JobsManagement() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastResult, setLastResult] = useState<JobResult | null>(null);
  const [logs, setLogs] = useState<JobLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setIsLoadingLogs(true);
      const response = await fetch('/api/admin/confession-logs');
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const generateConfession = async () => {
    try {
      setIsGenerating(true);
      setLastResult(null);

      const response = await fetch('/api/auto-confession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer itirafpazari_cron_2025_secure_key`
        }
      });

      const result = await response.json();
      setLastResult(result);
      
      if (result.success) {
        await fetchLogs(); // Logları yenile
      }

    } catch (error) {
      console.error('Error generating confession:', error);
      setLastResult({
        success: false,
        error: 'Network error occurred'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const testHuggingFace = async () => {
    try {
      setIsGenerating(true);
      const response = await fetch('/api/test-huggingface?category=aşk&mood=romantic&length=medium');
      const result = await response.json();
      
      alert(`Test Result:\n${result.confession}\n\nSource: ${result.metadata?.source}`);
    } catch (error) {
      alert('Test failed: ' + error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Bot className="w-6 h-6" />
          Otomatik İtiraf Sistemi
        </h2>
        <Button onClick={fetchLogs} variant="outline" size="sm">
          <RotateCcw className="w-4 h-4 mr-2" />
          Yenile
        </Button>
      </div>

      {/* Manuel İşlemler */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            Manuel İşlemler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={generateConfession}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Otomatik İtiraf Oluştur
            </Button>
            
            <Button 
              onClick={testHuggingFace}
              disabled={isGenerating}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
              AI Test Et
            </Button>
          </div>

          {/* Son Sonuç */}
          {lastResult && (
            <div className={`p-4 rounded-lg border ${
              lastResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {lastResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="font-medium">
                  {lastResult.success ? 'Başarılı!' : 'Hata!'}
                </span>
              </div>
              
              {lastResult.success ? (
                <div className="space-y-1 text-sm">
                  <p><strong>Post ID:</strong> {lastResult.post_id}</p>
                  <p><strong>Kategori:</strong> {lastResult.category}</p>
                  <p><strong>Konum:</strong> {lastResult.city}{lastResult.district ? ` / ${lastResult.district}` : ''}</p>
                  <p><strong>Mood:</strong> {lastResult.mood}</p>
                  <p><strong>Uzunluk:</strong> {lastResult.length}</p>
                  <p><strong>Kelime Sayısı:</strong> {lastResult.word_count}</p>
                </div>
              ) : (
                <p className="text-sm text-red-600">{lastResult.error}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Otomatik Zamanlama Bilgisi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            GitHub Actions Zamanlaması
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Otomatik itiraf oluşturma - Her gün farklı saatlerde:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <Badge variant="outline">Her 73 dakika</Badge>
              <Badge variant="outline">Her 97 dakika</Badge>
              <Badge variant="outline">Her 127 dakika</Badge>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Günde 40+ kez otomatik itiraf oluşturulur</p>
              <p>• Her gün farklı saatlerde çalışır</p>
              <p>• Vercel Pro gerektirmez, tamamen ücretsiz</p>
              <p>• AI destekli gerçekçi itiraflar + rastgele konum</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Logları */}
      <Card>
        <CardHeader>
          <CardTitle>Son İşlemler</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingLogs ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loglar yükleniyor...</span>
            </div>
          ) : logs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Henüz log kaydı yok.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {logs.slice(0, 10).map((log) => (
                <div key={log.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary">{log.action}</Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(log.created_at).toLocaleString('tr-TR')}
                    </span>
                  </div>
                  <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}