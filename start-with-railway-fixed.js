const { spawn, exec } = require('child_process');
const mysql = require('mysql2/promise');

async function killProcessOnPort(port) {
  return new Promise((resolve) => {
    exec(`lsof -ti:${port} | xargs kill -9`, (error) => {
      if (error) {
        console.log(`🔧 No process found on port ${port} or failed to kill`);
      } else {
        console.log(`✅ Killed process on port ${port}`);
      }
      resolve();
    });
  });
}

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
  
  // Kill any existing processes on ports
  console.log('🔧 Cleaning up existing processes...');
  await killProcessOnPort(3000);
  await killProcessOnPort(8081);
  
  // Test database connection first
  const dbConnected = await testDatabaseConnection();
  
  if (!dbConnected) {
    console.log('⚠️  Database connection failed, but continuing with mock data fallback...\n');
  }
  
  // Set environment variables
  process.env.DATABASE_URL = 'mysql://root:iIZFrgdMlpXAJrScrhPwSsYjmjKcyfLT@switchyard.proxy.rlwy.net:13348/railway';
  process.env.MYSQL_MYSQL_URL = 'mysql://root:iIZFrgdMlpXAJrScrhPwSsYjmjKcyfLT@switchyard.proxy.rlwy.net:13348/railway';
  process.env.NODE_ENV = 'development';
  process.env.ENABLE_MOCK_DATA = 'true';
  process.env.PORT = '3001'; // Use different port
  
  console.log('🔧 Environment configured for Railway MySQL');
  console.log('📊 Database URL:', process.env.DATABASE_URL.replace(/:[^:@]*@/, ':****@'));
  console.log('🔄 Mock data fallback: enabled');
  console.log('🌐 Backend will run on port 3001\n');
  
  // Start the backend
  console.log('🚀 Starting backend server...');
  const backend = spawn('bun', ['run', 'backend/index.ts'], {
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  // Start the frontend after a delay
  setTimeout(() => {
    console.log('🚀 Starting frontend...');
    
    // Try different approaches for frontend
    const frontendOptions = [
      ['bun', ['x', 'rork', 'start', '-p', 'jwjevnxtm1q2kz7xwsgmz', '--tunnel']],
      ['npx', ['rork', 'start', '-p', 'jwjevnxtm1q2kz7xwsgmz', '--tunnel']],
      ['bun', ['run', 'start']]
    ];
    
    let frontendStarted = false;
    
    function tryStartFrontend(optionIndex = 0) {
      if (optionIndex >= frontendOptions.length) {
        console.error('❌ Failed to start frontend with all methods');
        return;
      }
      
      const [command, args] = frontendOptions[optionIndex];
      console.log(`🔧 Trying to start frontend with: ${command} ${args.join(' ')}`);
      
      const frontend = spawn(command, args, {
        stdio: 'inherit',
        env: { ...process.env }
      });
      
      frontend.on('error', (error) => {
        console.error(`❌ Frontend start failed with ${command}:`, error.message);
        if (!frontendStarted) {
          tryStartFrontend(optionIndex + 1);
        }
      });
      
      frontend.on('spawn', () => {
        frontendStarted = true;
        console.log(`✅ Frontend started successfully with ${command}`);
      });
      
      frontend.on('close', (code) => {
        console.log(`Frontend process exited with code ${code}`);
        if (!frontendStarted) {
          tryStartFrontend(optionIndex + 1);
        } else {
          backend.kill();
        }
      });
    }
    
    tryStartFrontend();
    
  }, 5000);
  
  backend.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
  });
  
  backend.on('error', (error) => {
    console.error('❌ Backend failed to start:', error.message);
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🔄 Shutting down gracefully...');
    backend.kill();
    process.exit(0);
  });
}

startApplication().catch(error => {
  console.error('💥 Failed to start application:', error);
  process.exit(1);
});