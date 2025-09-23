const { connectDB } = require('./server/config/database');
const bcrypt = require('bcryptjs');
require('./server/node_modules/dotenv').config({ path: './server/.env' });

async function testRegistration() {
  console.log('Testing registration process...');
  
  // Initialize database connection first
  await connectDB();
  
  // Get the pool after initialization
  const { pool } = require('./server/config/database');
  const client = await pool.connect();
  
  try {
    // Test data
    const email = 'test@example.com';
    const password = 'password123';
    const firstName = 'Test';
    const lastName = 'User';
    
    console.log('1. Checking if user exists...');
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      console.log('User already exists, deleting for test...');
      await client.query('DELETE FROM users WHERE email = $1', [email]);
    }
    
    console.log('2. Hashing password...');
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    console.log('Password hashed successfully');
    
    console.log('3. Creating test Stripe customer ID...');
    const stripeCustomerId = `cus_test_${Date.now()}`;
    console.log('Test Stripe customer ID:', stripeCustomerId);
    
    console.log('4. Inserting user into database...');
    const result = await client.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, stripe_customer_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, first_name, last_name, stripe_customer_id, created_at`,
      [email, passwordHash, firstName, lastName, stripeCustomerId]
    );
    
    if (result.rows.length > 0) {
      console.log('✅ User registered successfully!');
      console.log('User data:', result.rows[0]);
      
      // Verify the user was actually stored
      const verifyUser = await client.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      
      if (verifyUser.rows.length > 0) {
        console.log('✅ User verified in database:', verifyUser.rows[0]);
      } else {
        console.log('❌ User not found in database after insertion');
      }
    } else {
      console.log('❌ Failed to insert user into database');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    client.release();
  }
}

// Run the test
testRegistration().then(() => {
  console.log('Test completed');
  process.exit(0);
}).catch(error => {
  console.error('Test error:', error);
  process.exit(1);
});
