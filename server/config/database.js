const { Pool } = require('pg');

// Mock database for testing when PostgreSQL is not available
const mockUsers = [];
const mockSubscriptions = [];
const mockPlans = [
  {
    id: 1,
    name: 'Basic Box',
    description: 'Perfect for beginners - 3-4 curated items',
    price_monthly: 29.99,
    stripe_price_id: 'price_basic_monthly',
    features: ['3-4 curated items', 'Monthly delivery', 'Basic support'],
    is_active: true
  },
  {
    id: 2,
    name: 'Premium Box',
    description: 'For enthusiasts - 5-6 premium items',
    price_monthly: 49.99,
    stripe_price_id: 'price_premium_monthly',
    features: ['5-6 premium items', 'Monthly delivery', 'Priority support', 'Exclusive items'],
    is_active: true
  },
  {
    id: 3,
    name: 'Deluxe Box',
    description: 'Ultimate experience - 7-8 luxury items',
    price_monthly: 79.99,
    stripe_price_id: 'price_deluxe_monthly',
    features: ['7-8 luxury items', 'Monthly delivery', 'VIP support', 'Exclusive items', 'Early access to new products'],
    is_active: true
  }
];

let nextUserId = 1;
let nextSubscriptionId = 1;

// Mock pool for testing
const mockPool = {
  connect: async () => {
    return {
      query: async (sql, params = []) => {
        console.log('Mock DB Query:', sql, params);
        
        // Handle user registration
        if (sql.includes('SELECT id FROM users WHERE email = $1')) {
          const email = params[0];
          const existingUser = mockUsers.find(u => u.email === email);
          return { rows: existingUser ? [existingUser] : [] };
        }
        
        // Handle user insertion
        if (sql.includes('INSERT INTO users')) {
          const [email, passwordHash, firstName, lastName, stripeCustomerId] = params;
          const newUser = {
            id: nextUserId++,
            email,
            password_hash: passwordHash,
            first_name: firstName,
            last_name: lastName,
            stripe_customer_id: stripeCustomerId,
            created_at: new Date().toISOString()
          };
          mockUsers.push(newUser);
          return { rows: [newUser] };
        }
        
        // Handle user login
        if (sql.includes('SELECT id, email, password_hash, first_name, last_name, stripe_customer_id FROM users WHERE email = $1')) {
          const email = params[0];
          const user = mockUsers.find(u => u.email === email);
          return { rows: user ? [user] : [] };
        }
        
        // Handle profile fetch
        if (sql.includes('SELECT') && sql.includes('FROM users u') && sql.includes('WHERE u.id = $1')) {
          const userId = params[0];
          const user = mockUsers.find(u => u.id === userId);
          if (user) {
            return { 
              rows: [{
                ...user,
                subscription_id: null,
                subscription_status: null,
                current_period_end: null,
                plan_name: null,
                price_monthly: null
              }] 
            };
          }
          return { rows: [] };
        }
        
        // Handle user lookup by ID
        if (sql.includes('SELECT id, email, first_name, last_name, stripe_customer_id FROM users WHERE id = $1')) {
          const userId = params[0];
          const user = mockUsers.find(u => u.id === userId);
          return { rows: user ? [user] : [] };
        }
        
        // Handle subscription plans
        if (sql.includes('FROM subscription_plans') && sql.includes('WHERE is_active = true')) {
          return { rows: mockPlans };
        }
        
        // Handle subscription creation
        if (sql.includes('INSERT INTO subscriptions')) {
          const [userId, planId, stripeSubscriptionId, status, currentPeriodStart, currentPeriodEnd] = params;
          const newSubscription = {
            id: nextSubscriptionId++,
            user_id: userId,
            plan_id: planId,
            stripe_subscription_id: stripeSubscriptionId,
            status: status,
            current_period_start: currentPeriodStart,
            current_period_end: currentPeriodEnd,
            cancel_at_period_end: false,
            created_at: new Date().toISOString()
          };
          mockSubscriptions.push(newSubscription);
          return { rows: [newSubscription] };
        }
        
        // Handle current subscription fetch
        if (sql.includes('FROM subscriptions s') && sql.includes('WHERE s.user_id = $1') && sql.includes('AND s.status = \'active\'')) {
          const userId = params[0];
          const subscription = mockSubscriptions.find(s => s.user_id === userId && s.status === 'active');
          if (subscription) {
            const plan = mockPlans.find(p => p.id === subscription.plan_id);
            return { 
              rows: [{
                ...subscription,
                plan_name: plan?.name || 'Unknown Plan',
                plan_description: plan?.description || '',
                price_monthly: plan?.price_monthly || 0,
                features: plan?.features || []
              }]
            };
          }
          return { rows: [] };
        }
        
        // Handle box history
        if (sql.includes('FROM box_history bh') && sql.includes('WHERE bh.user_id = $1')) {
          const userId = params[0];
          // Return sample box history for testing
          return { 
            rows: [
              {
                id: 1,
                box_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
                items: ['Premium Coffee Beans', 'Artisan Chocolate', 'Handcrafted Mug', 'Tea Sampler'],
                tracking_number: 'TRK123456789',
                status: 'delivered',
                created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                plan_name: 'Premium Box'
              },
              {
                id: 2,
                box_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 60 days ago
                items: ['Organic Skincare Set', 'Bath Bombs', 'Essential Oils', 'Face Mask'],
                tracking_number: 'TRK987654321',
                status: 'delivered',
                created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                plan_name: 'Premium Box'
              }
            ]
          };
        }
        
        return { rows: [] };
      },
      release: () => {}
    };
  }
};

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for Neon
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased timeout for Neon
  query_timeout: 10000,
  statement_timeout: 10000,
});

// Test database connection
const connectDB = async () => {
  try {
    // Try to connect to real database first
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
    
    // Run migrations
    await runMigrations();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('🔄 Falling back to mock database for testing...');
    
    // Use mock database for testing
    global.mockDatabase = true;
    await runMigrations();
  }
};

// Database migrations
const runMigrations = async () => {
  const client = global.mockDatabase ? await mockPool.connect() : await pool.connect();
  
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
  pool: global.mockDatabase ? mockPool : pool,
  connectDB,
  runMigrations
};
