#!/usr/bin/env node

const http = require('http');
const url = require('url');

console.log('🚀 Starting mock backend server...');

// Mock data
const mockTasks = [
  {
    id: '1',
    title: 'Проверка оборудования',
    description: 'Ежедневная проверка состояния оборудования',
    status: 'pending',
    priority: 'high',
    assignedTo: 'Иванов А.П.',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const mockReports = [
  {
    id: '1',
    title: 'Отчет о дежурстве',
    content: 'Дежурство прошло без происшествий',
    status: 'pending',
    type: 'daily',
    authorId: '1',
    author: 'Иванов А.П.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const mockUser = {
  id: '1',
  name: 'Иванов А.П.',
  email: 'ivanov@example.com',
  role: 'officer',
  unit: 'Первая рота'
};

// Helper function to create tRPC response
function createTRPCResponse(data) {
  return {
    result: {
      data: data
    }
  };
}

// Helper function to create tRPC batch response
function createTRPCBatchResponse(results) {
  return results.map((result, index) => ({
    result: {
      data: result
    }
  }));
}

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  console.log(`📡 ${req.method} ${pathname}`);

  // Health check
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      mock: true
    }));
    return;
  }

  // API info
  if (pathname === '/api' || pathname === '/api/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      name: 'Mock Military Management System API',
      version: '1.0.0',
      status: 'running',
      mock: true,
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // tRPC endpoints
  if (pathname.startsWith('/api/trpc/')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    
    // Parse the tRPC path
    const trpcPath = pathname.replace('/api/trpc/', '');
    const procedures = trpcPath.split(',');
    
    console.log('📋 tRPC procedures:', procedures);
    
    // Handle batch requests
    if (procedures.length > 1) {
      const results = procedures.map(procedure => {
        switch (procedure) {
          case 'tasks.getAll':
            return mockTasks;
          case 'reports.getAll':
            return mockReports;
          case 'auth.verify':
            return mockUser;
          case 'example.hi':
            return { message: 'Hello from mock backend!', mock: true };
          default:
            return { message: `Mock response for ${procedure}`, mock: true };
        }
      });
      
      res.end(JSON.stringify(createTRPCBatchResponse(results)));
    } else {
      // Handle single requests
      const procedure = procedures[0];
      let result;
      
      switch (procedure) {
        case 'tasks.getAll':
          result = mockTasks;
          break;
        case 'reports.getAll':
          result = mockReports;
          break;
        case 'auth.verify':
          result = mockUser;
          break;
        case 'example.hi':
          result = { 
            message: 'Hello from mock backend!', 
            mock: true,
            timestamp: new Date().toISOString()
          };
          break;
        default:
          result = { 
            message: `Mock response for ${procedure}`, 
            mock: true,
            timestamp: new Date().toISOString()
          };
      }
      
      res.end(JSON.stringify(createTRPCResponse(result)));
    }
    return;
  }

  // 404 for other routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    error: 'Not Found',
    message: 'Mock backend - endpoint not found',
    mock: true
  }));
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`✅ Mock backend server running on http://${HOST}:${PORT}`);
  console.log(`📡 API Base: http://${HOST}:${PORT}/api`);
  console.log(`❤️ Health Check: http://${HOST}:${PORT}/api/health`);
  console.log(`📋 tRPC Endpoint: http://${HOST}:${PORT}/api/trpc`);
  console.log('🔧 This is a mock server for development');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Shutting down mock backend...');
  server.close(() => {
    console.log('✅ Mock backend stopped');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🔄 Shutting down mock backend...');
  server.close(() => {
    console.log('✅ Mock backend stopped');
    process.exit(0);
  });
});