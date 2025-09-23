const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { 
  createSubscription, 
  cancelSubscription, 
  getSubscription,
  getCustomer 
} = require('../config/stripe');

const router = express.Router();

// Get all available subscription plans
router.get('/plans', async (req, res) => {
  try {
    console.log('Fetching subscription plans...');
    const { pool } = require('../config/database');
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, name, description, price_monthly, stripe_price_id, features FROM subscription_plans WHERE is_active = true ORDER BY price_monthly'
      );

      console.log('Plans query result:', result.rows);
      res.json({
        plans: result.rows.map(plan => ({
          id: plan.id,
          name: plan.name,
          description: plan.description,
          priceMonthly: parseFloat(plan.price_monthly),
          stripePriceId: plan.stripe_price_id,
          features: plan.features
        }))
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ message: 'Failed to fetch subscription plans' });
  }
});

// Create a new subscription
router.post('/create', authenticateToken, [
  body('planId').isInt().withMessage('Valid plan ID is required'),
  body('paymentMethodId').notEmpty().withMessage('Payment method ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { planId, paymentMethodId } = req.body;
    const userId = req.user.id;

    const { pool } = require('../config/database');
    const client = await pool.connect();
    try {
      // Check if user already has an active subscription
      const existingSubscription = await client.query(
        'SELECT id FROM subscriptions WHERE user_id = $1 AND status = $2',
        [userId, 'active']
      );

      if (existingSubscription.rows.length > 0) {
        return res.status(400).json({ message: 'User already has an active subscription' });
      }

      // Get plan details
      const planResult = await client.query(
        'SELECT stripe_price_id FROM subscription_plans WHERE id = $1 AND is_active = true',
        [planId]
      );

      if (planResult.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid subscription plan' });
      }

      const stripePriceId = planResult.rows[0].stripe_price_id;

      // Create subscription in Stripe
      let stripeSubscription;
      try {
        stripeSubscription = await createSubscription(
          req.user.stripe_customer_id,
          stripePriceId,
          paymentMethodId
        );
      } catch (stripeError) {
        console.error('Stripe subscription creation failed:', stripeError);
        return res.status(500).json({ 
          message: 'Failed to create subscription. Please try again.' 
        });
      }

      // Save subscription to database
      const subscriptionResult = await client.query(
        `INSERT INTO subscriptions (user_id, plan_id, stripe_subscription_id, status, current_period_start, current_period_end)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, status, current_period_start, current_period_end`,
        [
          userId,
          planId,
          stripeSubscription.id,
          stripeSubscription.status,
          new Date(stripeSubscription.current_period_start * 1000),
          new Date(stripeSubscription.current_period_end * 1000)
        ]
      );

      res.status(201).json({
        message: 'Subscription created successfully',
        subscription: {
          id: subscriptionResult.rows[0].id,
          status: subscriptionResult.rows[0].status,
          currentPeriodStart: subscriptionResult.rows[0].current_period_start,
          currentPeriodEnd: subscriptionResult.rows[0].current_period_end,
          stripeSubscriptionId: stripeSubscription.id
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Subscription creation error:', error);
    res.status(500).json({ message: 'Failed to create subscription' });
  }
});

// Get user's current subscription
router.get('/current', authenticateToken, async (req, res) => {
  try {
    const { pool } = require('../config/database');
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          s.id, s.status, s.current_period_start, s.current_period_end, s.cancel_at_period_end,
          sp.name as plan_name, sp.description as plan_description, sp.price_monthly, sp.features
        FROM subscriptions s
        JOIN subscription_plans sp ON s.plan_id = sp.id
        WHERE s.user_id = $1 AND s.status = 'active'
        ORDER BY s.created_at DESC
        LIMIT 1
      `, [req.user.id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'No active subscription found' });
      }

      const subscription = result.rows[0];

      res.json({
        subscription: {
          id: subscription.id,
          status: subscription.status,
          currentPeriodStart: subscription.current_period_start,
          currentPeriodEnd: subscription.current_period_end,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          plan: {
            name: subscription.plan_name,
            description: subscription.plan_description,
            priceMonthly: parseFloat(subscription.price_monthly),
            features: subscription.features
          }
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ message: 'Failed to fetch subscription' });
  }
});

// Cancel subscription
router.post('/cancel', authenticateToken, [
  body('cancelAtPeriodEnd').isBoolean().withMessage('cancelAtPeriodEnd must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { cancelAtPeriodEnd = true } = req.body;
    const userId = req.user.id;

    const { pool } = require('../config/database');
    const client = await pool.connect();
    try {
      // Get user's active subscription
      const subscriptionResult = await client.query(
        'SELECT id, stripe_subscription_id FROM subscriptions WHERE user_id = $1 AND status = $2',
        [userId, 'active']
      );

      if (subscriptionResult.rows.length === 0) {
        return res.status(404).json({ message: 'No active subscription found' });
      }

      const subscription = subscriptionResult.rows[0];

      // Cancel subscription in Stripe
      let stripeSubscription;
      try {
        stripeSubscription = await cancelSubscription(
          subscription.stripe_subscription_id,
          cancelAtPeriodEnd
        );
      } catch (stripeError) {
        console.error('Stripe subscription cancellation failed:', stripeError);
        return res.status(500).json({ 
          message: 'Failed to cancel subscription. Please try again.' 
        });
      }

      // Update subscription in database
      await client.query(
        'UPDATE subscriptions SET cancel_at_period_end = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [cancelAtPeriodEnd, subscription.id]
      );

      res.json({
        message: cancelAtPeriodEnd 
          ? 'Subscription will be canceled at the end of the current period'
          : 'Subscription canceled immediately',
        subscription: {
          id: subscription.id,
          status: stripeSubscription.status,
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    res.status(500).json({ message: 'Failed to cancel subscription' });
  }
});

// Get subscription history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { pool } = require('../config/database');
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          s.id, s.status, s.current_period_start, s.current_period_end, s.created_at,
          sp.name as plan_name, sp.price_monthly
        FROM subscriptions s
        JOIN subscription_plans sp ON s.plan_id = sp.id
        WHERE s.user_id = $1
        ORDER BY s.created_at DESC
      `, [req.user.id]);

      res.json({
        subscriptions: result.rows.map(sub => ({
          id: sub.id,
          status: sub.status,
          currentPeriodStart: sub.current_period_start,
          currentPeriodEnd: sub.current_period_end,
          createdAt: sub.created_at,
          plan: {
            name: sub.plan_name,
            priceMonthly: parseFloat(sub.price_monthly)
          }
        }))
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching subscription history:', error);
    res.status(500).json({ message: 'Failed to fetch subscription history' });
  }
});

// Update subscription plan
router.post('/update-plan', authenticateToken, [
  body('planId').isInt().withMessage('Valid plan ID is required'),
  body('paymentMethodId').optional().notEmpty().withMessage('Payment method ID is required if provided')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { planId, paymentMethodId } = req.body;
    const userId = req.user.id;

    const { pool } = require('../config/database');
    const client = await pool.connect();
    try {
      // Get user's active subscription
      const subscriptionResult = await client.query(
        'SELECT id, stripe_subscription_id, plan_id FROM subscriptions WHERE user_id = $1 AND status = $2',
        [userId, 'active']
      );

      if (subscriptionResult.rows.length === 0) {
        return res.status(404).json({ message: 'No active subscription found' });
      }

      const currentSubscription = subscriptionResult.rows[0];

      // Check if user is trying to update to the same plan
      if (currentSubscription.plan_id === planId) {
        return res.status(400).json({ message: 'You are already subscribed to this plan' });
      }

      // Get new plan details
      const planResult = await client.query(
        'SELECT stripe_price_id FROM subscription_plans WHERE id = $1 AND is_active = true',
        [planId]
      );

      if (planResult.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid subscription plan' });
      }

      const newStripePriceId = planResult.rows[0].stripe_price_id;

      // Update subscription in Stripe
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      
      // Get the subscription item ID first
      const subscription = await stripe.subscriptions.retrieve(currentSubscription.stripe_subscription_id);
      const subscriptionItemId = subscription.items.data[0].id;
      
      const updateData = {
        items: [{
          id: subscriptionItemId,
          price: newStripePriceId,
        }],
        proration_behavior: 'create_prorations'
      };

      if (paymentMethodId) {
        updateData.default_payment_method = paymentMethodId;
      }

      let stripeSubscription;
      try {
        stripeSubscription = await stripe.subscriptions.update(
          currentSubscription.stripe_subscription_id,
          updateData
        );
      } catch (stripeError) {
        console.error('Stripe subscription update failed:', stripeError);
        return res.status(500).json({ 
          message: 'Failed to update subscription plan. Please try again.' 
        });
      }

      // Update subscription in database
      await client.query(
        'UPDATE subscriptions SET plan_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [planId, currentSubscription.id]
      );

      res.json({
        message: 'Subscription plan updated successfully',
        subscription: {
          id: currentSubscription.id,
          status: stripeSubscription.status,
          planId: planId
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Subscription plan update error:', error);
    res.status(500).json({ message: 'Failed to update subscription plan' });
  }
});

// Update payment method
router.post('/update-payment-method', authenticateToken, [
  body('paymentMethodId').notEmpty().withMessage('Payment method ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { paymentMethodId } = req.body;
    const userId = req.user.id;

    const { pool } = require('../config/database');
    const client = await pool.connect();
    try {
      // Get user's active subscription
      const subscriptionResult = await client.query(
        'SELECT stripe_subscription_id FROM subscriptions WHERE user_id = $1 AND status = $2',
        [userId, 'active']
      );

      if (subscriptionResult.rows.length === 0) {
        return res.status(404).json({ message: 'No active subscription found' });
      }

      const stripeSubscriptionId = subscriptionResult.rows[0].stripe_subscription_id;

      // Update payment method in Stripe
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      
      try {
        await stripe.subscriptions.update(stripeSubscriptionId, {
          default_payment_method: paymentMethodId,
        });
      } catch (stripeError) {
        console.error('Stripe payment method update failed:', stripeError);
        return res.status(500).json({ 
          message: 'Failed to update payment method. Please try again.' 
        });
      }

      res.json({
        message: 'Payment method updated successfully'
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Payment method update error:', error);
    res.status(500).json({ message: 'Failed to update payment method' });
  }
});

// Get box history
router.get('/boxes', authenticateToken, async (req, res) => {
  try {
    const { pool } = require('../config/database');
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          bh.id, bh.box_date, bh.items, bh.tracking_number, bh.status, bh.created_at,
          sp.name as plan_name
        FROM box_history bh
        JOIN subscriptions s ON bh.subscription_id = s.id
        JOIN subscription_plans sp ON s.plan_id = sp.id
        WHERE bh.user_id = $1
        ORDER BY bh.box_date DESC
      `, [req.user.id]);

      res.json({
        boxes: result.rows.map(box => ({
          id: box.id,
          boxDate: box.box_date,
          items: box.items,
          trackingNumber: box.tracking_number,
          status: box.status,
          createdAt: box.created_at,
          planName: box.plan_name
        }))
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching box history:', error);
    res.status(500).json({ message: 'Failed to fetch box history' });
  }
});

module.exports = router;
