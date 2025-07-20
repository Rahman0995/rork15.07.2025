#!/usr/bin/env node

const http = require('http');
const url = require('url');

console.log('🚀 Запуск простого бэкенд сервера...');

// Простой mock сервер для тестирования
const server = http.createServer((req, res) => {
  // Включаем CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  
  console.log(`📡 ${req.method} ${path}`);

  // Health check
  if (path === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0'
    }));
    return;
  }

  // API info
  if (path === '/api' || path === '/api/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      name: 'Military Management System API',
      version: '1.0.0',
      status: 'running',
      timestamp: new Date().toISOString(),
      environment: 'development'
    }));
    return;
  }

  // tRPC endpoints
  if (path.startsWith('/api/trpc/')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    
    // Простые mock ответы для tRPC
    if (path.includes('example.hi')) {
      const mockResponse = [{
        result: {
          data: {
            message: 'Hello from simple backend server!',
            timestamp: new Date().toISOString(),
            mock: false
          }
        }
      }];
      res.end(JSON.stringify(mockResponse));
      return;
    }
    
    // Auth login endpoint
    if (path.includes('auth.login')) {
      const mockResponse = [{
        result: {
          data: {
            success: true,
            user: {
              id: '1',
              email: 'admin@example.com',
              name: 'Администратор',
              rank: 'Полковник',
              role: 'admin',
              avatar: '',
              unit: 'Штаб',
              phone: '+7 (999) 123-45-67'
            },
            token: 'mock-jwt-token',
            refreshToken: 'mock-refresh-token'
          }
        }
      }];
      res.end(JSON.stringify(mockResponse));
      return;
    }
    
    // Auth register endpoint
    if (path.includes('auth.register')) {
      const mockResponse = [{
        result: {
          data: {
            success: true,
            user: {
              id: Math.random().toString(36).substr(2, 9),
              email: 'new@example.com',
              name: 'Новый пользователь',
              rank: 'Рядовой',
              role: 'soldier',
              avatar: '',
              unit: 'Подразделение',
              phone: ''
            },
            token: 'mock-jwt-token',
            refreshToken: 'mock-refresh-token'
          }
        }
      }];
      res.end(JSON.stringify(mockResponse));
      return;
    }
    
    // Auth verify endpoint
    if (path.includes('auth.verify')) {
      const mockResponse = [{
        result: {
          data: {
            success: true
          }
        }
      }];
      res.end(JSON.stringify(mockResponse));
      return;
    }
    
    if (path.includes('tasks.getAll')) {
      const mockResponse = [{
        result: {
          data: [
            {
              id: '1',
              title: 'Тестовая задача',
              description: 'Описание тестовой задачи',
              status: 'pending',
              priority: 'medium',
              assignedTo: 'Иванов А.П.',
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
        }
      }];
      res.end(JSON.stringify(mockResponse));
      return;
    }
    
    if (path.includes('reports.getAll')) {
      const mockResponse = [{
        result: {
          data: [
            {
              id: '1',
              title: 'Тестовый отчет',
              content: 'Содержание тестового отчета',
              status: 'draft',
              author: 'Иванов А.П.',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
        }
      }];
      res.end(JSON.stringify(mockResponse));
      return;
    }

    // Общий mock ответ для других tRPC запросов
    const mockResponse = [{
      result: {
        data: {
          message: 'Mock response from simple backend',
          timestamp: new Date().toISOString()
        }
      }
    }];
    res.end(JSON.stringify(mockResponse));
    return;
  }

  // 404 для всех остальных запросов
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    timestamp: new Date().toISOString()
  }));
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`✅ Простой бэкенд сервер запущен на http://${HOST}:${PORT}`);
  console.log(`❤️ Health Check: http://${HOST}:${PORT}/api/health`);
  console.log(`📡 API Base: http://${HOST}:${PORT}/api`);
  console.log('🔄 Нажмите Ctrl+C для остановки');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Получен SIGINT, завершаем сервер...');
  server.close(() => {
    console.log('✅ Сервер остановлен');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🔄 Получен SIGTERM, завершаем сервер...');
  server.close(() => {
    console.log('✅ Сервер остановлен');
    process.exit(0);
  });
});