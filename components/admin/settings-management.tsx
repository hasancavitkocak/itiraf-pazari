'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Setting {
  value: string;
  type: string;
}

interface Settings {
  [key: string]: Setting;
}

export default function SettingsManagement() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { adminFetch } = await import('@/lib/api-client');
      const data = await adminFetch('/api/admin/settings');
      setSettings(data);
    } catch (error: any) {
      console.error('Ayarlar yüklenirken hata:', error);
      setMessage(error.message || 'Ayarlar yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const { adminFetch } = await import('@/lib/api-client');
      const result = await adminFetch('/api/admin/settings', {
        method: 'POST',
        body: { settings },
      });

      setMessage('Ayarlar başarıyla güncellendi!');
      
      // Header için cache'i güncelle
      if (settings.site_logo?.value) {
        localStorage.setItem('site_logo', settings.site_logo.value);
      }
      if (settings.site_name?.value) {
        localStorage.setItem('site_name', settings.site_name.value);
      }
      
      // Sayfayı yenile ki header güncellensin
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error('Ayarlar kaydedilirken hata:', error);
      setMessage(error.message || 'Ayarlar kaydedilirken hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const { authenticatedFormFetch } = await import('@/lib/api-client');
      const response = await authenticatedFormFetch('/api/upload/logo', formData);

      const result = await response.json();

      if (response.ok) {
        // Ayarları güncelle
        setSettings(prev => ({
          ...prev,
          site_logo: {
            ...prev.site_logo,
            value: result.url
          }
        }));
        setMessage('Logo başarıyla yüklendi!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(result.error || 'Logo yüklenirken hata oluştu.');
      }
    } catch (error) {
      console.error('Logo yükleme hatası:', error);
      setMessage('Logo yüklenirken hata oluştu.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Site Ayarları</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('başarıyla') 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-6">
          {/* Logo Ayarı */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Logosu
            </label>
            <div className="space-y-4">
              {/* Dosya Yükleme */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <div className="text-center text-gray-500 text-sm self-center">
                  veya
                </div>
                <div className="flex-1">
                  <input
                    type="url"
                    value={settings.site_logo?.value || ''}
                    onChange={(e) => handleInputChange('site_logo', e.target.value)}
                    placeholder="Logo URL'si girin"
                    disabled={uploading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {uploading && (
                <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                  <span className="text-blue-700">Logo yükleniyor...</span>
                </div>
              )}
              
              {/* Logo Önizleme */}
              {settings.site_logo?.value && (
                <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                  <div className="relative">
                    <Image
                      src={settings.site_logo.value}
                      alt="Site Logosu"
                      width={200}
                      height={100}
                      className="max-h-24 w-auto object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
              
              <p className="text-sm text-gray-500">
                Dosya seçerek yükleyebilir veya URL girebilirsiniz. Logo ortalanmış şekilde görüntülenecektir. 
                <br />
                Önerilen boyut: 200x100px, Max dosya boyutu: 5MB
              </p>
            </div>
          </div>

          {/* Site Adı */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Adı
            </label>
            <input
              type="text"
              value={settings.site_name?.value || ''}
              onChange={(e) => handleInputChange('site_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Site Açıklaması */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Açıklaması
            </label>
            <textarea
              value={settings.site_description?.value || ''}
              onChange={(e) => handleInputChange('site_description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* İletişim E-postası */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İletişim E-postası
            </label>
            <input
              type="email"
              value={settings.contact_email?.value || ''}
              onChange={(e) => handleInputChange('contact_email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Bakım Modu */}
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.maintenance_mode?.value === 'true'}
                onChange={(e) => handleInputChange('maintenance_mode', e.target.checked ? 'true' : 'false')}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Bakım Modu (Site geçici olarak kapatılır)
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}