const express = require('express');
const { pool } = require('../config/database');
const { verifyWebhookSignature } = require('../config/stripe');

const router = express.Router();

// Middleware to capture raw body for Stripe webhook signature verification
// This MUST be applied before express.json() middleware
const rawBodyMiddleware = express.raw({ type: 'application/json' });

// Stripe webhook endpoint
router.post('/stripe-webhooks', rawBodyMiddleware, async (req, res) => {
  const signature = req.headers['stripe-signature'];
  
  if (!signature) {
    console.error('Missing stripe-signature header');
    return res.status(400).json({ message: 'Missing stripe-signature header' });
  }

  try {
    // Verify the webhook signature to ensure the request is from Stripe
    // This is critical for security - it prevents malicious actors from sending
    // forged webhook events to your application
    const event = verifyWebhookSignature(req.body, signature);
    
    console.log(`Received webhook event: ${event.type} (${event.id})`);

    // Handle different event types with a switch statement
    // This approach makes it easy to add new event handlers as needed
    switch (event.type) {
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
        
      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Always respond with 200 status code quickly
    // Stripe expects a quick response (within 30 seconds) and will retry
    // the webhook if it doesn't receive a 200 response
    res.status(200).json({ received: true });
    
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return res.status(400).json({ message: 'Webhook signature verification failed' });
  }
});

// Handler for successful invoice payments
// This updates the subscription's current_period_end date in our database
// to keep it in sync with Stripe's records
async function handleInvoicePaymentSucceeded(invoice) {
  try {
    console.log(`Processing payment succeeded for invoice: ${invoice.id}`);
    
    const client = await pool.connect();
    try {
      // Find the subscription in our database
      const subscriptionResult = await client.query(
        'SELECT id, user_id FROM subscriptions WHERE stripe_subscription_id = $1',
        [invoice.subscription]
      );

      if (subscriptionResult.rows.length === 0) {
        console.error(`Subscription not found for Stripe ID: ${invoice.subscription}`);
        return;
      }

      const subscription = subscriptionResult.rows[0];

      // Update the current_period_end date based on the invoice
      await client.query(
        `UPDATE subscriptions 
         SET current_period_end = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2`,
        [new Date(invoice.period_end * 1000), subscription.id]
      );

      // Record the payment in our payments table
      await client.query(
        `INSERT INTO payments (user_id, subscription_id, stripe_payment_intent_id, amount, currency, status, payment_method)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          subscription.user_id,
          subscription.id,
          invoice.payment_intent,
          invoice.amount_paid / 100, // Convert from cents
          invoice.currency,
          'succeeded',
          'card' // Default payment method
        ]
      );

      console.log(`Successfully updated subscription ${subscription.id} for user ${subscription.user_id}`);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error handling invoice.payment_succeeded:', error);
    throw error; // Re-throw to trigger webhook retry
  }
}

// Handler for subscription deletion/cancellation
// This updates the subscription status to 'canceled' in our database
async function handleSubscriptionDeleted(subscription) {
  try {
    console.log(`Processing subscription deleted: ${subscription.id}`);
    
    const client = await pool.connect();
    try {
      // Update subscription status to canceled
      const result = await client.query(
        `UPDATE subscriptions 
         SET status = 'canceled', updated_at = CURRENT_TIMESTAMP 
         WHERE stripe_subscription_id = $1`,
        [subscription.id]
      );

      if (result.rowCount === 0) {
        console.error(`Subscription not found for Stripe ID: ${subscription.id}`);
        return;
      }

      console.log(`Successfully canceled subscription ${subscription.id}`);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error handling customer.subscription.deleted:', error);
    throw error; // Re-throw to trigger webhook retry
  }
}

// Handler for subscription updates
// This keeps our database in sync with subscription changes in Stripe
async function handleSubscriptionUpdated(subscription) {
  try {
    console.log(`Processing subscription updated: ${subscription.id}`);
    
    const client = await pool.connect();
    try {
      // Update subscription details
      await client.query(
        `UPDATE subscriptions 
         SET status = $1, 
             current_period_start = $2, 
             current_period_end = $3, 
             cancel_at_period_end = $4,
             updated_at = CURRENT_TIMESTAMP 
         WHERE stripe_subscription_id = $5`,
        [
          subscription.status,
          new Date(subscription.current_period_start * 1000),
          new Date(subscription.current_period_end * 1000),
          subscription.cancel_at_period_end,
          subscription.id
        ]
      );

      console.log(`Successfully updated subscription ${subscription.id}`);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error handling customer.subscription.updated:', error);
    throw error; // Re-throw to trigger webhook retry
  }
}

// Handler for failed invoice payments
// This can be used to notify users or take other actions
async function handleInvoicePaymentFailed(invoice) {
  try {
    console.log(`Processing payment failed for invoice: ${invoice.id}`);
    
    const client = await pool.connect();
    try {
      // Find the subscription and user
      const result = await client.query(
        `SELECT s.id, s.user_id, u.email, u.first_name 
         FROM subscriptions s 
         JOIN users u ON s.user_id = u.id 
         WHERE s.stripe_subscription_id = $1`,
        [invoice.subscription]
      );

      if (result.rows.length === 0) {
        console.error(`Subscription not found for Stripe ID: ${invoice.subscription}`);
        return;
      }

      const { id: subscriptionId, user_id: userId, email, first_name } = result.rows[0];

      // Record the failed payment
      await client.query(
        `INSERT INTO payments (user_id, subscription_id, stripe_payment_intent_id, amount, currency, status, payment_method)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          userId,
          subscriptionId,
          invoice.payment_intent,
          invoice.amount_due / 100, // Convert from cents
          invoice.currency,
          'failed',
          'card'
        ]
      );

      // Here you could send an email notification to the user
      // or implement other business logic for failed payments
      console.log(`Payment failed for user ${email} (${first_name})`);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error handling invoice.payment_failed:', error);
    throw error; // Re-throw to trigger webhook retry
  }
}

// Handler for trial ending soon
// This can be used to notify users before their trial ends
async function handleTrialWillEnd(subscription) {
  try {
    console.log(`Processing trial will end for subscription: ${subscription.id}`);
    
    const client = await pool.connect();
    try {
      // Find the user
      const result = await client.query(
        `SELECT u.email, u.first_name 
         FROM subscriptions s 
         JOIN users u ON s.user_id = u.id 
         WHERE s.stripe_subscription_id = $1`,
        [subscription.id]
      );

      if (result.rows.length === 0) {
        console.error(`Subscription not found for Stripe ID: ${subscription.id}`);
        return;
      }

      const { email, first_name } = result.rows[0];

      // Here you could send an email notification to the user
      // about their trial ending soon
      console.log(`Trial ending soon for user ${email} (${first_name})`);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error handling customer.subscription.trial_will_end:', error);
    throw error; // Re-throw to trigger webhook retry
  }
}

module.exports = router;
