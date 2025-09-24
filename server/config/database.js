const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  query_timeout: 10000,
  statement_timeout: 10000,
});

// Test database connection
const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
    
    // Run migrations
    await runMigrations();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
};

// Database migrations
const runMigrations = async () => {
  const client = await pool.connect();
  
  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        stripe_customer_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create subscription_plans table
    await client.query(`
      CREATE TABLE IF NOT EXISTS subscription_plans (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price_monthly DECIMAL(10,2) NOT NULL,
        stripe_price_id VARCHAR(255) NOT NULL,
        features JSONB,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create subscriptions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        plan_id INTEGER REFERENCES subscription_plans(id),
        stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        current_period_start TIMESTAMP,
        current_period_end TIMESTAMP,
        cancel_at_period_end BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create payments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        subscription_id INTEGER REFERENCES subscriptions(id),
        stripe_payment_intent_id VARCHAR(255),
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'usd',
        status VARCHAR(50) NOT NULL,
        payment_method VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create box_history table
    await client.query(`
      CREATE TABLE IF NOT EXISTS box_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        subscription_id INTEGER REFERENCES subscriptions(id),
        box_date DATE NOT NULL,
        items JSONB,
        tracking_number VARCHAR(100),
        status VARCHAR(50) DEFAULT 'shipped',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
      CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
      CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
      CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
      CREATE INDEX IF NOT EXISTS idx_box_history_user_id ON box_history(user_id);
    `);

    // Insert default subscription plans
    await client.query(`
      INSERT INTO subscription_plans (name, description, price_monthly, stripe_price_id, features)
      VALUES 
        ('Basic Box', 'Perfect for beginners - 3-4 curated items', 29.99, 'price_basic_monthly', '["3-4 curated items", "Monthly delivery", "Basic support"]'),
        ('Premium Box', 'For enthusiasts - 5-6 premium items', 49.99, 'price_premium_monthly', '["5-6 premium items", "Monthly delivery", "Priority support", "Exclusive items"]'),
        ('Deluxe Box', 'Ultimate experience - 7-8 luxury items', 79.99, 'price_deluxe_monthly', '["7-8 luxury items", "Monthly delivery", "VIP support", "Exclusive items", "Early access to new products"]')
      ON CONFLICT DO NOTHING
    `);

    console.log('✅ Database migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  connectDB,
  runMigrations
};