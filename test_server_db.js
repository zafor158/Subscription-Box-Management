const { connectDB } = require('./server/config/database');
require('./server/node_modules/dotenv').config({ path: './server/.env' });

async function testServerDatabase() {
  console.log('Testing server database connection...');
  
  try {
    // Initialize database connection first
    await connectDB();
    
    // Get the pool after initialization
    const { pool } = require('./server/config/database');
    const client = await pool.connect();
    console.log('✅ Connected to database via server config');
    
    // Check current users
    const result = await client.query('SELECT COUNT(*) as count FROM users');
    console.log('Current user count:', result.rows[0].count);
    
    // List all users
    const users = await client.query('SELECT id, email, first_name, last_name, created_at FROM users ORDER BY created_at DESC');
    console.log('All users:');
    users.rows.forEach(user => {
      console.log(`  ID: ${user.id}, Email: ${user.email}, Name: ${user.first_name} ${user.last_name}, Created: ${user.created_at}`);
    });
    
    client.release();
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testServerDatabase();
