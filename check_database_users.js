const { Pool } = require('pg');
require('dotenv').config();

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function checkUserData() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking BoxCraft Database User Data\n');
    
    // Get total user count
    const countResult = await client.query('SELECT COUNT(*) as total_users FROM users');
    const totalUsers = countResult.rows[0].total_users;
    
    console.log(`📊 Total Registered Users: ${totalUsers}\n`);
    
    if (totalUsers > 0) {
      // Get all users with their details
      const usersResult = await client.query(`
        SELECT 
          id, 
          email, 
          first_name, 
          last_name, 
          stripe_customer_id, 
          created_at,
          updated_at
        FROM users 
        ORDER BY created_at DESC
      `);
      
      console.log('👥 User Details:');
      console.log('=' .repeat(80));
      
      usersResult.rows.forEach((user, index) => {
        console.log(`\n${index + 1}. User ID: ${user.id}`);
        console.log(`   Name: ${user.first_name} ${user.last_name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Stripe Customer ID: ${user.stripe_customer_id}`);
        console.log(`   Registered: ${new Date(user.created_at).toLocaleString()}`);
        console.log(`   Last Updated: ${new Date(user.updated_at).toLocaleString()}`);
      });
      
      // Get subscription statistics
      const subscriptionStats = await client.query(`
        SELECT 
          COUNT(*) as total_subscriptions,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscriptions,
          COUNT(CASE WHEN status = 'canceled' THEN 1 END) as canceled_subscriptions
        FROM subscriptions
      `);
      
      const stats = subscriptionStats.rows[0];
      console.log('\n📦 Subscription Statistics:');
      console.log('=' .repeat(40));
      console.log(`Total Subscriptions: ${stats.total_subscriptions}`);
      console.log(`Active Subscriptions: ${stats.active_subscriptions}`);
      console.log(`Canceled Subscriptions: ${stats.canceled_subscriptions}`);
      
      // Get subscription plans data
      const plansResult = await client.query(`
        SELECT 
          COUNT(*) as total_plans,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_plans
        FROM subscription_plans
      `);
      
      const planStats = plansResult.rows[0];
      console.log('\n🎯 Subscription Plans:');
      console.log('=' .repeat(30));
      console.log(`Total Plans: ${planStats.total_plans}`);
      console.log(`Active Plans: ${planStats.active_plans}`);
      
      // Get recent registrations (last 5)
      const recentUsers = await client.query(`
        SELECT 
          first_name, 
          last_name, 
          email, 
          created_at
        FROM users 
        ORDER BY created_at DESC 
        LIMIT 5
      `);
      
      console.log('\n🕒 Recent Registrations (Last 5):');
      console.log('=' .repeat(50));
      recentUsers.rows.forEach((user, index) => {
        console.log(`${index + 1}. ${user.first_name} ${user.last_name} (${user.email})`);
        console.log(`   Registered: ${new Date(user.created_at).toLocaleString()}`);
      });
      
    } else {
      console.log('❌ No users found in the database.');
    }
    
    // Check database connection info
    console.log('\n🔗 Database Connection Info:');
    console.log('=' .repeat(30));
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Database URL: ${process.env.DATABASE_URL ? 'Connected to PostgreSQL' : 'Not configured'}`);
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkUserData();
