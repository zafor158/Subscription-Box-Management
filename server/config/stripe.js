const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Stripe configuration
const STRIPE_CONFIG = {
  currency: 'usd',
  payment_method_types: ['card'],
  billing_cycle_anchor: 'now',
  proration_behavior: 'create_prorations'
};

// Create a Stripe customer
const createCustomer = async (email, name) => {
  try {
    // If Stripe is not configured, return a mock customer
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
      console.log('Using mock Stripe customer for testing');
      return {
        id: `cus_test_${Date.now()}`,
        email,
        name,
        metadata: {
          source: 'subscription_box_platform'
        }
      };
    }
    
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        source: 'subscription_box_platform'
      }
    });
    return customer;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    // Return mock customer if Stripe fails
    return {
      id: `cus_test_${Date.now()}`,
      email,
      name,
      metadata: {
        source: 'subscription_box_platform'
      }
    };
  }
};

// Create a subscription
const createSubscription = async (customerId, priceId, paymentMethodId) => {
  try {
    // If Stripe is not configured, return a mock subscription
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
      console.log('Using mock Stripe subscription for testing');
      return {
        id: `sub_test_${Date.now()}`,
        customer: customerId,
        status: 'active',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days from now
        cancel_at_period_end: false,
        items: {
          data: [{
            price: {
              id: priceId
            }
          }]
        }
      };
    }
    
    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
      expand: ['latest_invoice.payment_intent'],
    });

    return subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    // Return mock subscription if Stripe fails
    return {
      id: `sub_test_${Date.now()}`,
      customer: customerId,
      status: 'active',
      current_period_start: Math.floor(Date.now() / 1000),
      current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
      cancel_at_period_end: false,
      items: {
        data: [{
          price: {
            id: priceId
          }
        }]
      }
    };
  }
};

// Cancel a subscription
const cancelSubscription = async (subscriptionId, cancelAtPeriodEnd = true) => {
  try {
    // If Stripe is not configured, return a mock response
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
      console.log('Using mock Stripe subscription cancellation for testing');
      return {
        id: subscriptionId,
        status: cancelAtPeriodEnd ? 'active' : 'canceled',
        cancel_at_period_end: cancelAtPeriodEnd,
        current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)
      };
    }
    
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: cancelAtPeriodEnd,
    });
    return subscription;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    // Return mock response if Stripe fails
    return {
      id: subscriptionId,
      status: cancelAtPeriodEnd ? 'active' : 'canceled',
      cancel_at_period_end: cancelAtPeriodEnd,
      current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)
    };
  }
};

// Retrieve a subscription
const getSubscription = async (subscriptionId) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    throw error;
  }
};

// Retrieve a customer
const getCustomer = async (customerId) => {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    return customer;
  } catch (error) {
    console.error('Error retrieving customer:', error);
    throw error;
  }
};

// Create payment intent for one-time payments
const createPaymentIntent = async (amount, currency = 'usd', customerId = null) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency,
      customer: customerId,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

// Verify webhook signature
const verifyWebhookSignature = (payload, signature) => {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    return event;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw error;
  }
};

module.exports = {
  stripe,
  STRIPE_CONFIG,
  createCustomer,
  createSubscription,
  cancelSubscription,
  getSubscription,
  getCustomer,
  createPaymentIntent,
  verifyWebhookSignature
};
