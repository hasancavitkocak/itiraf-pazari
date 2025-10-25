'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Edit2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface BadWord {
  id: string;
  word: string;
  created_at: string;
}

export default function BadWordsPage() {
  const [badWords, setBadWords] = useState<BadWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [newWord, setNewWord] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingWord, setEditingWord] = useState('');
  const [adding, setAdding] = useState(false);

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
      fetchBadWords();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Yasaklı Kelimeler</h1>
          <Badge variant="secondary">
            {badWords.length} kelime
          </Badge>
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
              <div className="grid gap-2">
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

        {/* Test Alanı */}
        <Card>
          <CardHeader>
            <CardTitle>Filtreleme Testi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Test Metni:</label>
                <Input
                  placeholder="Filtrelenecek metni buraya yazın..."
                  onChange={(e) => {
                    // Burada gerçek zamanlı filtreleme gösterebiliriz
                  }}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                <strong>Filtreleme Kuralları:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>2 harf ve altı: Sadece ilk harf görünür (örn: "ab" → "a*")</li>
                  <li>3 harf: İlk ve son harf görünür (örn: "abc" → "a*c")</li>
                  <li>4+ harf: İlk ve son harf görünür, ortası yıldız (örn: "abcd" → "a**d")</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}