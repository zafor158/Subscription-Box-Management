const { Pool } = require('pg');
require('dotenv').config();

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function fixSubscriptionPlans() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Fixing Subscription Plans Database\n');
    
    // First, delete all existing plans
    console.log('🗑️  Deleting all existing subscription plans...');
    await client.query('DELETE FROM subscription_plans');
    console.log('✅ All existing plans deleted');
    
    // Reset the sequence to start from 1
    await client.query('ALTER SEQUENCE subscription_plans_id_seq RESTART WITH 1');
    console.log('✅ Sequence reset');
    
    // Create unique subscription plans
    console.log('\n📦 Creating unique subscription plans...');
    
    const plans = [
      {
        name: 'Basic Box',
        description: 'Perfect for beginners - 3-4 curated items',
        price_monthly: 29.99,
        stripe_price_id: 'price_basic_monthly',
        features: [
          '3-4 curated items',
          'Monthly delivery',
          'Basic support',
          'Free shipping',
          'Cancel anytime'
        ]
      },
      {
        name: 'Premium Box',
        description: 'For enthusiasts - 5-6 premium items',
        price_monthly: 49.99,
        stripe_price_id: 'price_premium_monthly',
        features: [
          '5-6 premium items',
          'Monthly delivery',
          'Priority support',
          'Exclusive items',
          'Free shipping',
          'Cancel anytime',
          'Early access to new products'
        ]
      },
      {
        name: 'Deluxe Box',
        description: 'Ultimate experience - 7-8 luxury items',
        price_monthly: 79.99,
        stripe_price_id: 'price_deluxe_monthly',
        features: [
          '7-8 luxury items',
          'Monthly delivery',
          'VIP support',
          'Exclusive items',
          'Free shipping',
          'Cancel anytime',
          'Early access to new products',
          'Personalized curation',
          'Premium packaging'
        ]
      }
    ];
    
    for (const plan of plans) {
      const result = await client.query(`
        INSERT INTO subscription_plans (name, description, price_monthly, stripe_price_id, features, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, name, price_monthly
      `, [
        plan.name,
        plan.description,
        plan.price_monthly,
        plan.stripe_price_id,
        JSON.stringify(plan.features),
        true
      ]);
      
      console.log(`✅ Created ${plan.name}: $${plan.price_monthly}/month (ID: ${result.rows[0].id})`);
    }
    
    // Verify the results
    console.log('\n📊 Verification:');
    const verification = await client.query(`
      SELECT id, name, description, price_monthly, features
      FROM subscription_plans 
      ORDER BY price_monthly
    `);
    
    console.log('\nCurrent Subscription Plans:');
    console.log('=' .repeat(60));
    
    verification.rows.forEach((plan, index) => {
      console.log(`\n${index + 1}. ${plan.name}`);
      console.log(`   Price: $${plan.price_monthly}/month`);
      console.log(`   Description: ${plan.description}`);
      console.log(`   Features: ${JSON.parse(plan.features).join(', ')}`);
    });
    
    console.log(`\n✅ Successfully created ${verification.rows.length} unique subscription plans!`);
    
  } catch (error) {
    console.error('❌ Error fixing subscription plans:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

fixSubscriptionPlans();
