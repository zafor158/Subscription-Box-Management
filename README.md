# Subscription Box Management Platform

A full-featured e-commerce platform for a fictional monthly subscription box service. Users can visit a landing page, choose a subscription plan, and sign up for recurring monthly billing. Authenticated users can access a dashboard to manage their subscription and view a history of past boxes they've received.

## 🚀 Features

### Backend Features
- **User Authentication**: JWT-based authentication system
- **Subscription Management**: Full CRUD operations for subscriptions
- **Stripe Integration**: Complete payment processing with Stripe
- **Webhook Handling**: Secure webhook endpoints for Stripe events
- **Database Management**: PostgreSQL with comprehensive schema
- **Security**: Rate limiting, CORS, helmet security headers

### Frontend Features
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS
- **Responsive Design**: Mobile-first responsive design
- **User Dashboard**: Complete subscription management interface
- **Authentication**: Login/register with form validation
- **Plan Selection**: Beautiful subscription plan comparison
- **Box History**: Track past deliveries and shipments

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **JWT** for authentication
- **Stripe** for payment processing
- **bcryptjs** for password hashing
- **express-validator** for input validation

### Frontend
- **React** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API calls
- **Stripe Elements** for payment forms

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Stripe account with API keys
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/zafor158/Subscription-Box-Management-Platform.git
   cd Subscription-Box-Management-Platform
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   
   Copy the example environment file:
   ```bash
   cp server/env.example server/.env
   ```
   
   Update the `.env` file with your actual values:
   ```env
   # Database Configuration
   DATABASE_URL=postgresql://username:password@localhost:5432/subscription_box_db
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=subscription_box_db
   DB_USER=username
   DB_PASSWORD=password

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d

   # Stripe Configuration
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Frontend URL (for CORS)
   CLIENT_URL=http://localhost:3000
   ```

4. **Set up the database**
   
   Create a PostgreSQL database:
   ```sql
   CREATE DATABASE subscription_box_db;
   ```
   
   The application will automatically run migrations on startup.

5. **Set up Stripe**
   
   - Create a Stripe account at [stripe.com](https://stripe.com)
   - Get your API keys from the Stripe dashboard
   - Set up webhook endpoints in your Stripe dashboard:
     - URL: `http://localhost:5000/api/stripe-webhooks`
     - Events to listen for:
       - `invoice.payment_succeeded`
       - `customer.subscription.deleted`
       - `customer.subscription.updated`
       - `invoice.payment_failed`
       - `customer.subscription.trial_will_end`

## 🚀 Running the Application

### Development Mode

Start both frontend and backend in development mode:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:3000`

### Production Mode

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Start the backend**
   ```bash
   npm run server
   ```

## 📁 Project Structure

```
subscription-box-platform/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript types
│   └── public/             # Static assets
├── server/                 # Node.js backend
│   ├── config/             # Configuration files
│   ├── middleware/         # Express middleware
│   ├── routes/             # API routes
│   └── index.js            # Server entry point
├── package.json            # Root package.json
└── README.md              # This file
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Rate Limiting**: Protection against brute force attacks
- **CORS**: Configured for secure cross-origin requests
- **Helmet**: Security headers for Express
- **Input Validation**: express-validator for request validation
- **Webhook Verification**: Stripe signature verification

## 💳 Stripe Integration

The application includes comprehensive Stripe integration:

### Payment Processing
- Create customers in Stripe
- Handle subscription creation and management
- Process recurring payments
- Handle payment failures

### Webhook Handling
- **invoice.payment_succeeded**: Update subscription period
- **customer.subscription.deleted**: Mark subscription as canceled
- **customer.subscription.updated**: Sync subscription status
- **invoice.payment_failed**: Handle failed payments
- **customer.subscription.trial_will_end**: Notify about trial ending

## 🗄 Database Schema

The application uses the following main tables:

- **users**: User accounts and authentication
- **subscription_plans**: Available subscription plans
- **subscriptions**: User subscriptions
- **payments**: Payment history
- **box_history**: Delivery history

## 🧪 Testing

To test the application:

1. **Start the application** in development mode
2. **Register a new account** at `http://localhost:3000/register`
3. **View available plans** at `http://localhost:3000/plans`
4. **Access the dashboard** at `http://localhost:3000/dashboard`

## 🚨 Important Notes

### Webhook Security
The webhook endpoint (`/api/stripe-webhooks`) is critical for security:
- Uses `express.raw({ type: 'application/json' })` middleware
- Verifies Stripe signatures to prevent forged events
- Responds quickly with 200 status codes
- Includes comprehensive error handling

### Environment Variables
Never commit your `.env` file to version control. The `env.example` file shows the required variables without sensitive values.

### Database Migrations
The application automatically runs database migrations on startup. For production, consider using a proper migration tool.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the console logs for error messages
2. Verify your environment variables are set correctly
3. Ensure PostgreSQL is running and accessible
4. Check that your Stripe webhook is configured properly

## 🔮 Future Enhancements

- Email notifications for subscription events
- Advanced analytics and reporting
- Multi-currency support
- Gift subscriptions
- Referral program
- Mobile app
- Admin dashboard
- Advanced subscription management features
