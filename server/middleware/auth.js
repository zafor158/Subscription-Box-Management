const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key-for-development-only';
    const decoded = jwt.verify(token, secret);
    
    // Get user from database
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, email, first_name, last_name, stripe_customer_id FROM users WHERE id = $1',
        [decoded.id]
      );
      
      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      req.user = result.rows[0];
      next();
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Authentication error' });
  }
};

// Generate JWT token
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'fallback-secret-key-for-development-only';
  return jwt.sign(
    { id: userId },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key-for-development-only';
    const decoded = jwt.verify(token, secret);
    
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, email, first_name, last_name, stripe_customer_id FROM users WHERE id = $1',
        [decoded.id]
      );
      
      req.user = result.rows.length > 0 ? result.rows[0] : null;
    } finally {
      client.release();
    }
  } catch (error) {
    req.user = null;
  }
  
  next();
};

module.exports = {
  authenticateToken,
  generateToken,
  optionalAuth
};
