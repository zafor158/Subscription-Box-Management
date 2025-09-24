# Subscription Box Management Platform

A full-stack web application for managing subscription box services with user authentication, payment processing, and subscription management.

## 🚀 Features

- **User Authentication**: Secure registration and login system with JWT tokens
- **Subscription Management**: Create, update, and manage subscription plans
- **Payment Processing**: Integrated Stripe payment system for secure transactions
- **Dashboard**: User-friendly dashboard for managing subscriptions
- **Responsive Design**: Modern UI built with React and Tailwind CSS
- **Database Integration**: PostgreSQL database with proper schema design

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **JWT** for authentication
- **Stripe** for payment processing
- **bcrypt** for password hashing

### Deployment
- **Vercel** for frontend deployment
- **Vercel** for backend API deployment

## 📁 Project Structure

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts (Auth)
│   │   ├── services/      # API service functions
│   │   └── types/         # TypeScript type definitions
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── server/                # Node.js backend application
│   ├── routes/            # API route handlers
│   ├── middleware/        # Custom middleware
│   ├── config/            # Configuration files
│   └── package.json       # Backend dependencies
├── database/              # Database schema and sample data
│   ├── schema.sql         # Database schema
│   └── sample_data.sql    # Sample data for testing
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Stripe account (for payment processing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/zafor158/Subscription-Box-Management.git
   cd Subscription-Box-Management
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd server
   npm install
   
   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**
   
   **Backend Environment** (`server/.env`):
   ```env
   DATABASE_URL="postgresql://username:password@hostname:port/database?sslmode=require&channel_binding=require"
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=30d
   STRIPE_SECRET_KEY=your_stripe_secret_key_here
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
   STRIPE_WEBHOOK_SECRET=your_webhook_secret_here
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

   **Frontend Environment** (`client/.env`):
   ```env
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
   ```

4. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb subscription_box_db
   
   # Run schema and sample data
   psql -d subscription_box_db -f database/schema.sql
   psql -d subscription_box_db -f database/sample_data.sql
   ```

5. **Start the application**
   ```bash
   # Start backend server (from server directory)
   npm start
   
   # Start frontend development server (from client directory)
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)

### Subscription Endpoints

- `GET /api/subscriptions/plans` - Get all subscription plans
- `POST /api/subscriptions/subscribe` - Create new subscription
- `GET /api/subscriptions/user/:userId` - Get user subscriptions
- `PUT /api/subscriptions/:id` - Update subscription
- `DELETE /api/subscriptions/:id` - Cancel subscription

### Webhook Endpoints

- `POST /api/webhooks/stripe` - Stripe webhook handler

## 🔧 Development

### Available Scripts

**Frontend (client directory):**
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run eject      # Eject from Create React App
```

**Backend (server directory):**
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
```

### Database Schema

The application uses PostgreSQL with the following main tables:
- `users` - User accounts and profiles
- `subscription_plans` - Available subscription plans
- `subscriptions` - User subscriptions
- `payments` - Payment records

## 🚀 Deployment

### Vercel Deployment

1. **Frontend Deployment**
   - Connect your GitHub repository to Vercel
   - Set build command: `cd client && npm run build`
   - Set output directory: `client/build`

2. **Backend Deployment**
   - Deploy server as Vercel serverless functions
   - Set environment variables in Vercel dashboard
   - Configure database connection string

### Environment Variables for Production

Make sure to set these environment variables in your deployment platform:

**Backend:**
- `DATABASE_URL`
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `CLIENT_URL`

**Frontend:**
- `REACT_APP_API_URL`
- `REACT_APP_STRIPE_PUBLISHABLE_KEY`

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- CORS protection
- Input validation and sanitization
- Secure environment variable handling
- Stripe webhook signature verification

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/zafor158/Subscription-Box-Management/issues) page
2. Create a new issue with detailed description
3. Contact the development team

## 🙏 Acknowledgments

- Stripe for payment processing
- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- PostgreSQL community for the robust database system

---

**Happy Coding! 🎉**
