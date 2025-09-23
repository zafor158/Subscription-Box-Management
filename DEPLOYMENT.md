# Vercel Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy from Project Root
```bash
vercel
```

### 4. Set Environment Variables
In your Vercel dashboard, add these environment variables:

#### Database
- `DATABASE_URL` - Your PostgreSQL connection string

#### Stripe
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key  
- `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook secret

#### JWT
- `JWT_SECRET` - Secret key for JWT tokens

#### Client
- `REACT_APP_API_URL` - Your Vercel domain + /api
- `REACT_APP_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

## 🔧 Troubleshooting

### Issue: "react-scripts: command not found"
**Solution**: The project is configured to install dependencies automatically during build.

### Issue: Build fails
**Solution**: 
1. Check that all environment variables are set
2. Ensure your database is accessible from Vercel
3. Verify Stripe keys are correct

### Issue: API routes not working
**Solution**: 
1. Check that `REACT_APP_API_URL` points to your Vercel domain
2. Ensure server environment variables are set

## 📁 Project Structure for Vercel

```
├── client/          # React frontend
├── server/          # Node.js backend  
├── vercel.json      # Vercel configuration
└── package.json     # Root package.json
```

## 🌐 After Deployment

1. **Update Stripe Webhooks**: Point to `https://your-domain.vercel.app/api/stripe-webhooks`
2. **Test the Application**: Visit your Vercel domain
3. **Monitor Logs**: Check Vercel dashboard for any issues

## 🔄 Redeploy

To redeploy after changes:
```bash
vercel --prod
```
