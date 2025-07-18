const { spawn } = require('child_process');
const mysql = require('mysql2/promise');

async function testDatabaseConnection() {
  const connectionString = 'mysql://root:iIZFrgdMlpXAJrScrhPwSsYjmjKcyfLT@switchyard.proxy.rlwy.net:13348/railway';
  
  console.log('🔧 Testing Railway MySQL connection...');
  
  try {
    const connection = await mysql.createConnection(connectionString);
    console.log('✅ Railway MySQL connection successful!');
    await connection.end();
    return true;
  } catch (error) {
    console.error('❌ Railway MySQL connection failed:', error.message);
    return false;
  }
}

async function startApplication() {
  console.log('🚀 Starting Military Management App with Railway MySQL...\n');
  
  // Test database connection first
  const dbConnected = await testDatabaseConnection();
  
  if (!dbConnected) {
    console.log('⚠️  Database connection failed, but continuing with mock data fallback...\n');
  }
  
  // Set environment variables
  process.env.DATABASE_URL = 'mysql://root:iIZFrgdMlpXAJrScrhPwSsYjmjKcyfLT@switchyard.proxy.rlwy.net:13348/railway';
  process.env.MYSQL_MYSQL_URL = 'mysql://root:iIZFrgdMlpXAJrScrhPwSsYjmjKcyfLT@switchyard.proxy.rlwy.net:13348/railway';
  process.env.NODE_ENV = 'development';
  process.env.ENABLE_MOCK_DATA = 'true'; // Keep mock data as fallback
  
  console.log('🔧 Environment configured for Railway MySQL');
  console.log('📊 Database URL:', process.env.DATABASE_URL.replace(/:[^:@]*@/, ':****@'));
  console.log('🔄 Mock data fallback: enabled\n');
  
  // Start the backend
  console.log('🚀 Starting backend server...');
  const backend = spawn('bun', ['run', 'backend/index.ts'], {
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  // Start the frontend after a delay
  setTimeout(() => {
    console.log('🚀 Starting frontend...');
    const frontend = spawn('bunx', ['rork', 'start', '-p', 'jwjevnxtm1q2kz7xwsgmz', '--tunnel'], {
      stdio: 'inherit',
      env: { ...process.env }
    });
    
    frontend.on('close', (code) => {
      console.log(`Frontend process exited with code ${code}`);
      backend.kill();
    });
  }, 3000);
  
  backend.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\\n🔄 Shutting down gracefully...');
    backend.kill();
    process.exit(0);
  });
}

startApplication().catch(error => {
  console.error('💥 Failed to start application:', error);
  process.exit(1);
});