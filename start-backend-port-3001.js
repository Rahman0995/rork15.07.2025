const { spawn, exec } = require('child_process');

async function killProcessOnPort(port) {
  return new Promise((resolve) => {
    exec(`lsof -ti:${port} | xargs kill -9`, (error) => {
      if (error) {
        console.log(`🔧 No process found on port ${port}`);
      } else {
        console.log(`✅ Killed process on port ${port}`);
      }
      resolve();
    });
  });
}

async function startBackend() {
  console.log('🚀 Starting backend on port 3001...\n');
  
  // Kill any existing process on port 3001
  await killProcessOnPort(3001);
  
  // Set environment variables
  process.env.DATABASE_URL = 'mysql://root:iIZFrgdMlpXAJrScrhPwSsYjmjKcyfLT@switchyard.proxy.rlwy.net:13348/railway';
  process.env.MYSQL_MYSQL_URL = 'mysql://root:iIZFrgdMlpXAJrScrhPwSsYjmjKcyfLT@switchyard.proxy.rlwy.net:13348/railway';
  process.env.NODE_ENV = 'development';
  process.env.ENABLE_MOCK_DATA = 'true';
  process.env.PORT = '3001';
  
  console.log('🔧 Environment configured');
  console.log('🌐 Backend will run on: http://localhost:3001');
  console.log('📡 API will be at: http://localhost:3001/api');
  console.log('🔗 tRPC endpoint: http://localhost:3001/api/trpc\n');
  
  // Start the backend
  const backend = spawn('bun', ['run', 'backend/index.ts'], {
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  backend.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
  });
  
  backend.on('error', (error) => {
    console.error('❌ Backend failed to start:', error.message);
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🔄 Shutting down backend...');
    backend.kill();
    process.exit(0);
  });
}

startBackend().catch(error => {
  console.error('💥 Failed to start backend:', error);
  process.exit(1);
});