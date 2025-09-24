#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Subscription Box Management Platform - Environment Setup');
console.log('============================================================\n');

// Check if we're in the right directory
if (!fs.existsSync('server') || !fs.existsSync('client')) {
  console.error('❌ Please run this script from the project root directory');
  process.exit(1);
}

// Server .env template
const serverEnvTemplate = `# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/subscription_box_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=subscription_box_db
DB_USER=username
DB_PASSWORD=password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-this-very-long-and-secure-${Date.now()}
JWT_EXPIRES_IN=7d

# Stripe Configuration (using test keys for development)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000`;

// Client .env template
const clientEnvTemplate = `# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Stripe Configuration (using test keys for development)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here`;

// Create server .env if it doesn't exist
const serverEnvPath = path.join('server', '.env');
if (!fs.existsSync(serverEnvPath)) {
  fs.writeFileSync(serverEnvPath, serverEnvTemplate);
  console.log('✅ Created server/.env file');
} else {
  console.log('ℹ️  server/.env already exists');
}

// Create client .env if it doesn't exist
const clientEnvPath = path.join('client', '.env');
if (!fs.existsSync(clientEnvPath)) {
  fs.writeFileSync(clientEnvPath, clientEnvTemplate);
  console.log('✅ Created client/.env file');
} else {
  console.log('ℹ️  client/.env already exists');
}

console.log('\n📋 Next Steps:');
console.log('1. Update the DATABASE_URL in server/.env with your PostgreSQL credentials');
console.log('2. If you don\'t have PostgreSQL, install it or use a cloud database service');
console.log('3. Start the server: cd server && npm start');
console.log('4. Start the client: cd client && npm start');
console.log('5. Test the registration flow');

console.log('\n🔍 Database Setup Options:');
console.log('• Local PostgreSQL: Install and create database "subscription_box_db"');
console.log('• Cloud options: Supabase, Railway, Neon, or similar services');
console.log('• Docker: docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres');

console.log('\n⚠️  Important:');
console.log('• Update the JWT_SECRET with a secure random string');
console.log('• Update Stripe keys if you want to test payment functionality');
console.log('• The server will create all necessary database tables automatically');

console.log('\n✨ Setup complete! Check the REGISTRATION_FIX_GUIDE.md for detailed instructions.');
