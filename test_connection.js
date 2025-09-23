const { connectDB } = require('./server/config/database');

async function testConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    await connectDB();
    console.log('✅ Database connection successful!');
    console.log('✅ Database migrations completed!');
    console.log('✅ Default subscription plans created!');
    
    // Test a simple query
    const { pool } = require('./server/config/database');
    const client = await pool.connect();
    
    try {
      const result = await client.query('SELECT COUNT(*) as count FROM subscription_plans');
      console.log(`✅ Found ${result.rows[0].count} subscription plans in database`);
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n📝 Please check:');
    console.log('1. PostgreSQL is running');
    console.log('2. DATABASE_URL is correct in your .env file');
    console.log('3. Database exists and is accessible');
    
    process.exit(1);
  }
}

testConnection();
