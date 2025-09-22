import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { subscriptionAPI } from '../services/api';
import { Plan } from '../types';
import Layout from '../components/Layout/Layout';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51234567890abcdefghijklmnopqrstuvwxyz');

// Test Card Helper Component
const TestCardHelper: React.FC = () => {
  const [showHelper, setShowHelper] = useState(false);

  const testCards = [
    { type: 'Visa', number: '4242 4242 4242 4242', description: 'Basic Visa card' },
    { type: 'Visa Debit', number: '4000 0566 5566 5556', description: 'Visa debit card' },
    { type: 'Mastercard', number: '5555 5555 5555 4444', description: 'Basic Mastercard' },
    { type: 'American Express', number: '3782 822463 10005', description: 'American Express' },
  ];

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => setShowHelper(!showHelper)}
        className="text-sm text-indigo-600 hover:text-indigo-800 underline"
      >
        {showHelper ? 'Hide' : 'Show'} Test Card Numbers
      </button>
      
      {showHelper && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm font-medium text-blue-900 mb-2">💳 Test Card Numbers for Development:</p>
          <div className="space-y-2">
            {testCards.map((card, index) => (
              <div key={index} className="text-xs">
                <span className="font-medium text-blue-800">{card.type}:</span>
                <code className="ml-2 bg-white px-2 py-1 rounded border text-blue-700">{card.number}</code>
                <span className="ml-2 text-blue-600">({card.description})</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-blue-700 mt-2">
            <strong>Note:</strong> Use any future expiry date (e.g., 12/25) and any 3-digit CVC (e.g., 123)
          </p>
        </div>
      )}
    </div>
  );
};

// Subscription Form Component
const SubscriptionForm: React.FC<{ plan: Plan; onSuccess: () => void }> = ({ plan, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cardComplete, setCardComplete] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError('');

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Card element not found');
      setLoading(false);
      return;
    }

    // Card validation is handled by the onChange event
    if (!cardComplete) {
      setError('Please complete your card information');
      setLoading(false);
      return;
    }

    try {
      // Create payment method
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: 'Test User', // In a real app, get this from user profile
        },
      });

      if (pmError) {
        setError(pmError.message || 'Payment method creation failed');
        setLoading(false);
        return;
      }

      // Create subscription
      await subscriptionAPI.createSubscription({
        planId: plan.id,
        paymentMethodId: paymentMethod.id,
      });

      onSuccess();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Subscription creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div className="border border-gray-300 rounded-md p-3">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                fontFamily: 'system-ui, sans-serif',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#e53e3e',
                iconColor: '#e53e3e',
              },
            },
            hidePostalCode: true,
          }}
          onChange={(event) => {
            setCardComplete(event.complete);
            if (event.error) {
              setError(event.error.message);
            } else {
              setError('');
            }
          }}
        />
      </div>


      <button
        type="submit"
        disabled={!stripe || loading || !cardComplete}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
      >
        {loading ? 'Processing...' : `Subscribe for $${plan.priceMonthly}/month`}
      </button>
    </form>
  );
};

const Plans: React.FC = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await subscriptionAPI.getPlans();
        setPlans(response.plans);
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSubscribe = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowPaymentForm(true);
  };

  const handleSuccess = () => {
    setShowPaymentForm(false);
    setSelectedPlan(null);
    // Redirect to dashboard or show success message
    window.location.href = '/dashboard';
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Choose Your Perfect Plan
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Select the subscription plan that best fits your lifestyle and budget. 
              All plans include free shipping and can be canceled anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-lg p-8 ${
                  index === 1 ? 'ring-2 ring-indigo-600 transform scale-105' : ''
                }`}
              >
                {index === 1 && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-indigo-600">${plan.priceMonthly}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="text-center">
                  {user ? (
                    <button
                      className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                        index === 1
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          : 'bg-gray-900 hover:bg-gray-800 text-white'
                      }`}
                      onClick={() => handleSubscribe(plan)}
                    >
                      Subscribe Now
                    </button>
                  ) : (
                    <a
                      href="/register"
                      className={`w-full inline-block py-3 px-6 rounded-lg font-semibold transition-colors text-center ${
                        index === 1
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          : 'bg-gray-900 hover:bg-gray-800 text-white'
                      }`}
                    >
                      Get Started
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Frequently Asked Questions
            </h2>
            
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I cancel my subscription anytime?
                </h3>
                <p className="text-gray-600">
                  Yes! You can cancel your subscription at any time from your dashboard. 
                  Your subscription will remain active until the end of your current billing period.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  When will I receive my first box?
                </h3>
                <p className="text-gray-600">
                  Your first box will be shipped within 3-5 business days after your subscription is activated. 
                  You'll receive tracking information via email once your box ships.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What if I don't like the products in my box?
                </h3>
                <p className="text-gray-600">
                  We're confident you'll love your box! However, if you're not satisfied, 
                  contact our customer support team and we'll work to make it right.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I skip a month?
                </h3>
                <p className="text-gray-600">
                  Yes, you can skip any month from your dashboard. Simply go to your subscription 
                  settings and select "Skip Next Month" before your next billing date.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form Modal */}
        {showPaymentForm && selectedPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Subscribe to {selectedPlan.name}
                </h3>
                <button
                  onClick={() => setShowPaymentForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-600">
                  You will be charged <span className="font-semibold">${selectedPlan.priceMonthly}/month</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Cancel anytime from your dashboard
                </p>
              </div>

              <TestCardHelper />

              <Elements stripe={stripePromise}>
                <SubscriptionForm plan={selectedPlan} onSuccess={handleSuccess} />
              </Elements>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Plans;
