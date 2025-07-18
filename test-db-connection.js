const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    console.log('🔧 Testing MySQL database connection...');
    
    const connection = await mysql.createConnection(process.env.DATABASE_URL || 'mysql://root:kGgDrdkxhrpUIJxOdRKgcFfeVqorbnEc@caboose.proxy.rlwy.net:35308/railway');
    
    console.log('✅ Connected to MySQL database successfully!');
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Test query successful:', rows);
    
    await connection.end();
    console.log('✅ Connection closed successfully');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();