const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { generateToken, authenticateToken } = require('../middleware/auth');
const { createCustomer } = require('../config/stripe');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

// Register new user
router.post('/register', registerValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const client = await pool.connect();
    try {
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create Stripe customer
      const stripeCustomer = await createCustomer(email, `${firstName} ${lastName}`);

      // Insert user into database
      const result = await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, stripe_customer_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, email, first_name, last_name, stripe_customer_id, created_at`,
        [email, passwordHash, firstName, lastName, stripeCustomer.id]
      );

      const user = result.rows[0];
      const token = generateToken(user.id);

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          stripeCustomerId: user.stripe_customer_id
        },
        token
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login user
router.post('/login', loginValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, email, password_hash, first_name, last_name, stripe_customer_id FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const user = result.rows[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Generate token
      const token = generateToken(user.id);

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          stripeCustomerId: user.stripe_customer_id
        },
        token
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      // Get user with subscription info
      const result = await client.query(`
        SELECT 
          u.id, u.email, u.first_name, u.last_name, u.stripe_customer_id, u.created_at,
          s.id as subscription_id, s.status as subscription_status, s.current_period_end,
          sp.name as plan_name, sp.price_monthly
        FROM users u
        LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
        LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
        WHERE u.id = $1
      `, [req.user.id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const userData = result.rows[0];

      res.json({
        user: {
          id: userData.id,
          email: userData.email,
          firstName: userData.first_name,
          lastName: userData.last_name,
          stripeCustomerId: userData.stripe_customer_id,
          createdAt: userData.created_at,
          subscription: userData.subscription_id ? {
            id: userData.subscription_id,
            status: userData.subscription_status,
            currentPeriodEnd: userData.current_period_end,
            plan: {
              name: userData.plan_name,
              priceMonthly: userData.price_monthly
            }
          } : null
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('email').optional().isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { firstName, lastName, email } = req.body;
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (firstName) {
      updateFields.push(`first_name = $${paramCount++}`);
      updateValues.push(firstName);
    }
    if (lastName) {
      updateFields.push(`last_name = $${paramCount++}`);
      updateValues.push(lastName);
    }
    if (email) {
      updateFields.push(`email = $${paramCount++}`);
      updateValues.push(email);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(req.user.id);

    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING id, email, first_name, last_name`,
        updateValues
      );

      res.json({
        message: 'Profile updated successfully',
        user: {
          id: result.rows[0].id,
          email: result.rows[0].email,
          firstName: result.rows[0].first_name,
          lastName: result.rows[0].last_name
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

module.exports = router;
