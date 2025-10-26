'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Edit2, Save, X, TestTube, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { filterBadWords, censorWord, clearCache } from '@/lib/word-filter';

interface BadWord {
  id: string;
  word: string;
  created_at: string;
}

export function BadWordsManagement() {
  const [badWords, setBadWords] = useState<BadWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [newWord, setNewWord] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingWord, setEditingWord] = useState('');
  const [adding, setAdding] = useState(false);
  const [testText, setTestText] = useState('');
  const [filteredText, setFilteredText] = useState('');
  const [clearingCache, setClearingCache] = useState(false);

  const fetchBadWords = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bad-words');
      const data = await response.json();
      setBadWords(data.badWords || []);
    } catch (error) {
      console.error('Error fetching bad words:', error);
      toast.error('Yasaklı kelimeler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadWords();
  }, []);

  // Test metni değiştiğinde filtreleme yap
  useEffect(() => {
    if (testText && badWords.length > 0) {
      const filtered = filterBadWords(testText, badWords);
      setFilteredText(filtered);
    } else {
      setFilteredText(testText);
    }
  }, [testText, badWords]);

  const handleAdd = async () => {
    if (!newWord.trim()) {
      toast.error('Kelime boş olamaz');
      return;
    }

    setAdding(true);
    try {
      const response = await fetch('/api/bad-words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: newWord.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Bir hata oluştu');
      }

      toast.success(data.message);
      setNewWord('');
      await clearCache(); // Cache'i temizle
      fetchBadWords();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setAdding(false);
    }
  };

  const handleEdit = (badWord: BadWord) => {
    setEditingId(badWord.id);
    setEditingWord(badWord.word);
  };

  const handleSaveEdit = async () => {
    if (!editingWord.trim()) {
      toast.error('Kelime boş olamaz');
      return;
    }

    try {
      const response = await fetch(`/api/bad-words/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: editingWord.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Bir hata oluştu');
      }

      toast.success(data.message);
      setEditingId(null);
      setEditingWord('');
      await clearCache(); // Cache'i temizle
      fetchBadWords();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingWord('');
  };

  const handleDelete = async (id: string, word: string) => {
    if (!confirm(`"${word}" kelimesini silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/bad-words/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Bir hata oluştu');
      }

      toast.success(data.message);
      await clearCache(); // Cache'i temizle
      fetchBadWords();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      await clearCache();
      toast.success('Cache temizlendi! Yeni yasaklı kelimeler artık aktif.');
    } catch (error: any) {
      toast.error('Cache temizlenirken hata oluştu');
    } finally {
      setClearingCache(false);
    }
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
        <h2 className="text-2xl font-bold">Yasaklı Kelimeler</h2>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {badWords.length} kelime
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearCache}
            disabled={clearingCache}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${clearingCache ? 'animate-spin' : ''}`} />
            {clearingCache ? 'Temizleniyor...' : 'Cache Temizle'}
          </Button>
        </div>
      </div>

      {/* Yeni Kelime Ekleme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Yeni Yasaklı Kelime Ekle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder="Yasaklı kelime girin..."
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              disabled={adding}
            />
            <Button 
              onClick={handleAdd} 
              disabled={adding || !newWord.trim()}
            >
              {adding ? 'Ekleniyor...' : 'Ekle'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Alanı */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Filtreleme Testi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Test Metni:</label>
            <Input
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Filtrelenecek metni buraya yazın..."
            />
          </div>
          {testText && (
            <div>
              <label className="text-sm font-medium mb-2 block">Filtrelenmiş Sonuç:</label>
              <div className="p-3 bg-muted rounded-lg">
                <span className="font-mono">{filteredText}</span>
              </div>
            </div>
          )}
          <div className="text-xs text-muted-foreground space-y-2">
            <div>
              <strong>Filtreleme Kuralları:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>2 harf ve altı: Sadece ilk harf görünür (örn: &quot;ab&quot; → &quot;{censorWord('ab')}&quot;)</li>
                <li>3 harf: İlk ve son harf görünür (örn: &quot;abc&quot; → &quot;{censorWord('abc')}&quot;)</li>
                <li>4+ harf: İlk ve son harf görünür, ortası yıldız (örn: &quot;abcd&quot; → &quot;{censorWord('abcd')}&quot;)</li>
              </ul>
            </div>
            <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
              <strong>Not:</strong> Yeni eklenen yasaklı kelimeler 30 saniye sonra otomatik olarak aktif olur. 
              Hemen aktif etmek için &quot;Cache Temizle&quot; butonunu kullanın.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kelime Listesi */}
      <Card>
        <CardHeader>
          <CardTitle>Mevcut Yasaklı Kelimeler</CardTitle>
        </CardHeader>
        <CardContent>
          {badWords.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Henüz yasaklı kelime eklenmemiş
            </p>
          ) : (
            <div className="grid gap-2 max-h-96 overflow-y-auto">
              {badWords.map((badWord) => (
                <motion.div
                  key={badWord.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  {editingId === badWord.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editingWord}
                        onChange={(e) => setEditingWord(e.target.value)}
                        className="flex-1"
                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                      />
                      <Button
                        size="sm"
                        onClick={handleSaveEdit}
                        disabled={!editingWord.trim()}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="font-mono bg-muted px-2 py-1 rounded">
                          {badWord.word}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          → {censorWord(badWord.word)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(badWord.created_at).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(badWord)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(badWord.id, badWord.word)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}