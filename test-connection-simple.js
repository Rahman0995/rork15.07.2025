#!/usr/bin/env node

const http = require('http');

console.log('🔍 Тестирование подключения к бэкенду...');

// Список URL для тестирования
const testUrls = [
  'http://localhost:3000/api/health',
  'http://127.0.0.1:3000/api/health',
  'http://192.168.1.100:3000/api/health',
  'http://192.168.0.100:3000/api/health',
  'http://10.0.0.100:3000/api/health'
];

async function testUrl(url) {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve({ url, success: false, error: 'Timeout' });
    }, 5000);

    const req = http.get(url, (res) => {
      clearTimeout(timeout);
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ 
            url, 
            success: true, 
            status: res.statusCode,
            data: parsed 
          });
        } catch (e) {
          resolve({ 
            url, 
            success: false, 
            error: 'Invalid JSON response',
            data 
          });
        }
      });
    });

    req.on('error', (error) => {
      clearTimeout(timeout);
      resolve({ 
        url, 
        success: false, 
        error: error.message 
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      clearTimeout(timeout);
      resolve({ url, success: false, error: 'Request timeout' });
    });
  });
}

async function testAllUrls() {
  console.log('🔄 Тестируем подключения...\n');
  
  for (const url of testUrls) {
    console.log(`Тестируем: ${url}`);
    const result = await testUrl(url);
    
    if (result.success) {
      console.log(`✅ Успешно! Статус: ${result.status}`);
      console.log(`   Ответ: ${JSON.stringify(result.data, null, 2)}`);
      console.log(`\n🎉 Рабочий URL найден: ${url}\n`);
      
      // Тестируем tRPC endpoint
      console.log('🔄 Тестируем tRPC endpoint...');
      const trpcUrl = url.replace('/health', '/trpc/example.hi?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22name%22%3A%22Test%22%7D%7D%7D');
      const trpcResult = await testUrl(trpcUrl);
      
      if (trpcResult.success) {
        console.log('✅ tRPC endpoint работает!');
        console.log(`   Ответ: ${JSON.stringify(trpcResult.data, null, 2)}`);
      } else {
        console.log('❌ tRPC endpoint не работает:', trpcResult.error);
      }
      
      return;
    } else {
      console.log(`❌ Ошибка: ${result.error}`);
    }
    console.log('');
  }
  
  console.log('❌ Ни один URL не работает. Убедитесь, что бэкенд запущен.');
  console.log('\n💡 Для запуска бэкенда выполните:');
  console.log('   node start-backend-simple.js');
}

testAllUrls().catch(console.error);