# Subscription Box Management Platform - Setup Guide

## Issue Identified: Registration Failed

The registration is failing because the server cannot connect to the database due to missing environment variables.

## Root Cause
- Missing `.env` file in the server directory
- Database connection string not configured
- Environment variables not set

## Solution Steps

### 1. Database Setup
You need to have PostgreSQL running locally or use a cloud database service.

**Option A: Local PostgreSQL**
1. Install PostgreSQL on your system
2. Create a database named `subscription_box_db`
3. Note your database credentials (username, password, host, port)

**Option B: Use a cloud database (recommended for testing)**
- Use services like Supabase, Railway, or Neon
- Get your connection string

### 2. Environment Configuration

Create a `.env` file in the `server` directory with the following content:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/subscription_box_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=subscription_box_db
DB_USER=username
DB_PASSWORD=password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-this-very-long-and-secure
JWT_EXPIRES_IN=7d

# Stripe Configuration (using test keys for development)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000
```

Create a `.env` file in the `client` directory with:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Stripe Configuration (using test keys for development)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

### 3. Quick Test Setup (No Database Required)

If you want to test the registration flow without setting up a database, you can temporarily modify the server to use mock data:

1. The server already has fallback mechanisms for Stripe (mock customers)
2. You can modify the database connection to use a mock database for testing

### 4. Verification Steps

After setting up the environment:

1. Start the server: `cd server && npm start`
2. Check the console for "✅ Database connected successfully"
3. Test registration in the frontend
4. Check browser network tab for any API errors

### 5. Common Issues and Solutions

**Issue**: "SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string"
**Solution**: Check your DATABASE_URL format and ensure password is properly quoted

**Issue**: "Database connection failed"
**Solution**: Verify PostgreSQL is running and credentials are correct

**Issue**: "Registration failed" in frontend
**Solution**: Check server console for detailed error messages

## Current Status
✅ Registration logic is working correctly
✅ Frontend form validation is working
✅ API endpoints are properly configured
❌ Database connection is missing environment variables
❌ Server cannot start without database connection

## Next Steps
1. Set up PostgreSQL database
2. Create `.env` files with proper credentials
3. Restart the server
4. Test registration flow
