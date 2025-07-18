const mysql = require('mysql2/promise');

async function testDatabaseConnection() {
  const connectionString = 'mysql://root:iIZFrgdMlpXAJrScrhPwSsYjmjKcyfLT@switchyard.proxy.rlwy.net:13348/railway';
  
  console.log('🔧 Testing Railway MySQL connection...');
  console.log('Connection string:', connectionString.replace(/:[^:@]*@/, ':****@'));
  
  try {
    // Create connection
    const connection = await mysql.createConnection(connectionString);
    console.log('✅ Successfully connected to Railway MySQL database!');
    
    // Test query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Test query successful:', rows);
    
    // Show database info
    const [dbInfo] = await connection.execute('SELECT DATABASE() as current_db, VERSION() as version');
    console.log('📊 Database info:', dbInfo[0]);
    
    // Show existing tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Existing tables:', tables.length > 0 ? tables : 'No tables found');
    
    // Close connection
    await connection.end();
    console.log('✅ Connection closed successfully');
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error errno:', error.errno);
    return false;
  }
}

// Run the test
testDatabaseConnection()
  .then(success => {
    if (success) {
      console.log('\n🎉 Railway MySQL database is ready to use!');
    } else {
      console.log('\n💥 Database connection failed. Please check your credentials.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });