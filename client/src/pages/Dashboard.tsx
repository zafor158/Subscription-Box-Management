import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { subscriptionAPI } from '../services/api';
import { Subscription, Box } from '../types';
import Layout from '../components/Layout/Layout';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch current subscription
        try {
          const subscriptionResponse = await subscriptionAPI.getCurrentSubscription();
          setSubscription(subscriptionResponse.subscription);
        } catch (error) {
          // No active subscription
          setSubscription(null);
        }

        // Fetch box history
        try {
          const boxesResponse = await subscriptionAPI.getBoxHistory();
          setBoxes(boxesResponse.boxes);
        } catch (error) {
          console.error('Error fetching box history:', error);
        }
      } catch (error) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    if (window.confirm('Are you sure you want to cancel your subscription?')) {
      try {
        await subscriptionAPI.cancelSubscription(true);
        // Refresh subscription data
        const response = await subscriptionAPI.getCurrentSubscription();
        setSubscription(response.subscription);
      } catch (error) {
        setError('Failed to cancel subscription');
      }
    }
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your subscription and track your box deliveries.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          {/* Subscription Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Current Subscription Card */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Current Subscription
                </h2>
                
                {subscription ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {subscription.plan.name}
                        </h3>
                        <p className="text-gray-600">
                          ${subscription.plan.priceMonthly}/month
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          subscription.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {subscription.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Current Period:</span>
                        <p className="font-medium">
                          {new Date(subscription.currentPeriodStart).toLocaleDateString()} - {' '}
                          {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Next Billing:</span>
                        <p className="font-medium">
                          {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {subscription.cancelAtPeriodEnd && (
                      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
                        <p className="text-sm">
                          Your subscription will be canceled at the end of the current billing period.
                        </p>
                      </div>
                    )}

                    <div className="flex space-x-4">
                      <button
                        onClick={handleCancelSubscription}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Cancel Subscription
                      </button>
                      <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                        Update Payment Method
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Active Subscription
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Start your subscription journey today!
                    </p>
                    <a
                      href="/plans"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      View Plans
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Account Info Card */}
            <div>
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Account Information
                </h2>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Name:</span>
                    <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Email:</span>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Member Since:</span>
                    <p className="font-medium">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Box History */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Box History
            </h2>
            
            {boxes.length > 0 ? (
              <div className="space-y-4">
                {boxes.map((box) => (
                  <div key={box.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {box.planName} Box
                        </h3>
                        <p className="text-sm text-gray-600">
                          Delivered on {new Date(box.boxDate).toLocaleDateString()}
                        </p>
                        {box.trackingNumber && (
                          <p className="text-sm text-gray-600">
                            Tracking: {box.trackingNumber}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          box.status === 'delivered' 
                            ? 'bg-green-100 text-green-800' 
                            : box.status === 'shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {box.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Boxes Yet
                </h3>
                <p className="text-gray-600">
                  Your box history will appear here once you start receiving boxes.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
