const https = require('https');
const http = require('http');

// Test konfigürasyonu
const config = {
  url: 'https://www.itirafpazari.com', // İtiraf Pazarı canlı site URL'i
  concurrent: 25, // Eş zamanlı istek sayısı
  totalRequests: 250, // Toplam istek sayısı
  timeout: 10000 // Timeout (ms)
};

// Test edilecek endpoint'ler
const endpoints = [
  '/',
  '/api/posts',
  '/api/categories',
  '/auth',
  '/contact'
];

class LoadTester {
  constructor(config) {
    this.config = config;
    this.results = {
      total: 0,
      success: 0,
      failed: 0,
      timeouts: 0,
      responseTimes: [],
      errors: []
    };
  }

  async makeRequest(url) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const protocol = url.startsWith('https') ? https : http;
      
      const req = protocol.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          
          resolve({
            success: true,
            statusCode: res.statusCode,
            responseTime,
            size: data.length
          });
        });
      });

      req.on('error', (error) => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        resolve({
          success: false,
          error: error.message,
          responseTime
        });
      });

      req.setTimeout(this.config.timeout, () => {
        req.destroy();
        resolve({
          success: false,
          error: 'Timeout',
          responseTime: this.config.timeout
        });
      });
    });
  }

  async runTest() {
    console.log(`🚀 Yük testi başlatılıyor...`);
    console.log(`📊 Konfigürasyon:`);
    console.log(`   - URL: ${this.config.url}`);
    console.log(`   - Eş zamanlı istek: ${this.config.concurrent}`);
    console.log(`   - Toplam istek: ${this.config.totalRequests}`);
    console.log(`   - Timeout: ${this.config.timeout}ms`);
    console.log('');

    const startTime = Date.now();
    const promises = [];

    // Her endpoint için test yap
    for (const endpoint of endpoints) {
      const fullUrl = this.config.url + endpoint;
      console.log(`🔍 Test ediliyor: ${endpoint}`);
      
      // Eş zamanlı istekler gönder
      for (let i = 0; i < this.config.concurrent; i++) {
        promises.push(this.testEndpoint(fullUrl, endpoint));
      }
    }

    // Tüm testleri bekle
    await Promise.all(promises);

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    this.printResults(totalTime);
  }

  async testEndpoint(url, endpoint) {
    const requestsPerEndpoint = Math.floor(this.config.totalRequests / endpoints.length);
    
    for (let i = 0; i < requestsPerEndpoint; i++) {
      const result = await this.makeRequest(url);
      this.processResult(result, endpoint);
      
      // Küçük bir gecikme ekle
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  processResult(result, endpoint) {
    this.results.total++;
    
    if (result.success) {
      this.results.success++;
      this.results.responseTimes.push(result.responseTime);
    } else {
      this.results.failed++;
      
      if (result.error === 'Timeout') {
        this.results.timeouts++;
      }
      
      this.results.errors.push({
        endpoint,
        error: result.error,
        time: new Date().toISOString()
      });
    }
  }

  printResults(totalTime) {
    console.log('\n📈 YÜK TESTİ SONUÇLARI');
    console.log('========================');
    
    // Genel istatistikler
    console.log(`⏱️  Toplam süre: ${totalTime}ms (${(totalTime/1000).toFixed(2)}s)`);
    console.log(`📊 Toplam istek: ${this.results.total}`);
    console.log(`✅ Başarılı: ${this.results.success} (${((this.results.success/this.results.total)*100).toFixed(1)}%)`);
    console.log(`❌ Başarısız: ${this.results.failed} (${((this.results.failed/this.results.total)*100).toFixed(1)}%)`);
    console.log(`⏰ Timeout: ${this.results.timeouts}`);
    
    if (this.results.responseTimes.length > 0) {
      // Yanıt süresi istatistikleri
      const sortedTimes = this.results.responseTimes.sort((a, b) => a - b);
      const avg = sortedTimes.reduce((a, b) => a + b, 0) / sortedTimes.length;
      const min = sortedTimes[0];
      const max = sortedTimes[sortedTimes.length - 1];
      const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
      
      console.log('\n🕐 YANIT SÜRESİ İSTATİSTİKLERİ');
      console.log('==============================');
      console.log(`📊 Ortalama: ${avg.toFixed(2)}ms`);
      console.log(`⚡ En hızlı: ${min}ms`);
      console.log(`🐌 En yavaş: ${max}ms`);
      console.log(`📈 95. yüzdelik: ${p95}ms`);
      
      // İstek/saniye hesapla
      const rps = (this.results.success / (totalTime / 1000)).toFixed(2);
      console.log(`🚀 İstek/saniye: ${rps} RPS`);
    }
    
    // Hatalar
    if (this.results.errors.length > 0) {
      console.log('\n❌ HATALAR');
      console.log('===========');
      this.results.errors.slice(0, 10).forEach((error, index) => {
        console.log(`${index + 1}. ${error.endpoint}: ${error.error}`);
      });
      
      if (this.results.errors.length > 10) {
        console.log(`... ve ${this.results.errors.length - 10} hata daha`);
      }
    }
    
    // Performans değerlendirmesi
    console.log('\n🎯 PERFORMANS DEĞERLENDİRMESİ');
    console.log('=============================');
    
    const successRate = (this.results.success / this.results.total) * 100;
    const avgResponseTime = this.results.responseTimes.length > 0 
      ? this.results.responseTimes.reduce((a, b) => a + b, 0) / this.results.responseTimes.length 
      : 0;
    
    if (successRate >= 99 && avgResponseTime < 500) {
      console.log('🟢 Mükemmel! Site yüksek yük altında çok iyi performans gösteriyor.');
    } else if (successRate >= 95 && avgResponseTime < 1000) {
      console.log('🟡 İyi! Site kabul edilebilir performans gösteriyor.');
    } else if (successRate >= 90 && avgResponseTime < 2000) {
      console.log('🟠 Orta! Bazı optimizasyonlar gerekebilir.');
    } else {
      console.log('🔴 Dikkat! Site yük altında zorlanıyor, optimizasyon gerekli.');
    }
  }
}

// Test çalıştır
if (require.main === module) {
  const tester = new LoadTester(config);
  tester.runTest().catch(console.error);
}

module.exports = LoadTester;