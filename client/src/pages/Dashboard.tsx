import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { subscriptionAPI, authAPI } from '../services/api';
import { Subscription, Box } from '../types';
import Layout from '../components/Layout/Layout';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [totalMonthlyCost, setTotalMonthlyCost] = useState(0);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch current subscriptions
        try {
          const subscriptionResponse = await subscriptionAPI.getCurrentSubscriptions();
          setSubscriptions(subscriptionResponse.subscriptions);
          setTotalMonthlyCost(subscriptionResponse.totalMonthlyCost);
        } catch (error) {
          // No active subscriptions
          setSubscriptions([]);
          setTotalMonthlyCost(0);
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

  const handleCancelSubscription = async (subscriptionId: number) => {
    if (window.confirm('Are you sure you want to cancel this subscription? This will take effect at the end of your current billing period.')) {
      try {
        setCancelLoading(true);
        await subscriptionAPI.cancelSubscription(true);
        // Refresh subscription data
        const response = await subscriptionAPI.getCurrentSubscriptions();
        setSubscriptions(response.subscriptions);
        setTotalMonthlyCost(response.totalMonthlyCost);
      } catch (error) {
        setError('Failed to cancel subscription');
      } finally {
        setCancelLoading(false);
      }
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setProfileLoading(true);
      await authAPI.updateProfile(profileData);
      setSuccessMessage('Profile updated successfully!');
      setShowEditProfile(false);
      // Update user context
      window.location.reload(); // Simple refresh to update user data
    } catch (error) {
      setError('Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    try {
      setPaymentLoading(true);
      // Simulate payment method update
      const mockPaymentMethodId = `pm_${Date.now()}`;
      await authAPI.updatePaymentMethod(mockPaymentMethodId);
      setSuccessMessage('Payment method updated successfully!');
      setShowPaymentModal(false);
    } catch (error) {
      setError('Failed to update payment method');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleAddSampleBox = async () => {
    try {
      const response = await subscriptionAPI.addSampleBox();
      setBoxes(prev => [response.box, ...prev]);
      setSuccessMessage('Sample box added to your history!');
    } catch (error) {
      setError('Failed to add sample box');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
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
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {user?.firstName}! 👋
                </h1>
                <p className="text-gray-600 mt-2">
                  Manage your subscription and track your box deliveries.
                </p>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Account Settings
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Current Subscription Card */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg leading-6 font-medium text-gray-900">
                      Active Subscriptions
                    </h2>
                    {subscriptions.length > 0 && (
                      <div className="text-sm text-gray-500">
                        Total: ${totalMonthlyCost.toFixed(2)}/month
                      </div>
                    )}
                  </div>
                  
                  {subscriptions.length > 0 ? (
                    <div className="space-y-4">
                      {subscriptions.map((subscription) => (
                        <div key={subscription.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                  </svg>
                                </div>
                              </div>
                              <div className="ml-3">
                                <h3 className="text-lg font-medium text-gray-900">
                                  {subscription.plan.name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  ${subscription.plan.priceMonthly}/month
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                subscription.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="text-xs font-medium text-gray-500">Current Period</div>
                              <div className="mt-1 text-sm text-gray-900">
                                {new Date(subscription.currentPeriodStart).toLocaleDateString()} - {' '}
                                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="text-xs font-medium text-gray-500">Next Billing</div>
                              <div className="mt-1 text-sm text-gray-900">
                                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          {subscription.cancelAtPeriodEnd && (
                            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded-md mb-3">
                              <p className="text-sm">
                                This subscription will be canceled at the end of the current billing period.
                              </p>
                            </div>
                          )}

                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleCancelSubscription(subscription.id)}
                              disabled={cancelLoading}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                            >
                              {cancelLoading ? 'Canceling...' : 'Cancel Subscription'}
                            </button>
                            <button className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                              Update Payment
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="mx-auto h-12 w-12 text-gray-400">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A9.971 9.971 0 0124 24c4.004 0 7.625 2.371 9.287 6.286M30 14a6 6 0 11-12 0 6 6 0 0112 0zm12 6a4 4 0 11-8 0 4 4 0 018 0zm-28 0a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No Active Subscriptions</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Start your subscription journey today and discover amazing products!
                      </p>
                      <div className="mt-6">
                        <a
                          href="/plans"
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <svg className="-ml-1 mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          View Plans
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Account Info Card */}
            <div>
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Account Information
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-indigo-600">
                            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user?.firstName} {user?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{user?.email}</div>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4">
                      <dl className="space-y-3">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                          <dd className="text-sm text-gray-900">
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : 'N/A'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Customer ID</dt>
                          <dd className="text-sm text-gray-900 font-mono">
                            {user?.stripeCustomerId?.substring(0, 12)}...
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div className="pt-4">
                      <button 
                        onClick={() => setShowEditProfile(true)}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Box History */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Box History
                </h2>
                
                {boxes.length > 0 ? (
                  <div className="space-y-4">
                    {boxes.map((box) => (
                      <div key={box.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                              </div>
                            </div>
                            <div className="ml-4">
                              <h3 className="text-sm font-medium text-gray-900">
                                {box.planName} Box
                              </h3>
                              <p className="text-sm text-gray-500">
                                Delivered on {new Date(box.boxDate).toLocaleDateString()}
                              </p>
                              {box.trackingNumber && (
                                <p className="text-xs text-gray-400">
                                  Tracking: {box.trackingNumber}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              box.status === 'delivered' 
                                ? 'bg-green-100 text-green-800' 
                                : box.status === 'shipped'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {box.status.charAt(0).toUpperCase() + box.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        {box.items && box.items.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-500 mb-2">Items in this box:</p>
                            <div className="flex flex-wrap gap-2">
                              {box.items.map((item, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-800">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A9.971 9.971 0 0124 24c4.004 0 7.625 2.371 9.287 6.286M30 14a6 6 0 11-12 0 6 6 0 0112 0zm12 6a4 4 0 11-8 0 4 4 0 018 0zm-28 0a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No Boxes Yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Your box history will appear here once you start receiving boxes.
                    </p>
                    {subscriptions.length > 0 && (
                      <div className="mt-6">
                        <button
                          onClick={handleAddSampleBox}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <svg className="-ml-1 mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          Add Sample Box
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="fixed top-4 right-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md shadow-lg z-50">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{successMessage}</p>
              </div>
              <div className="ml-auto pl-3">
                <button onClick={() => setSuccessMessage('')} className="text-green-400 hover:text-green-600">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="fixed top-4 right-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md shadow-lg z-50">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Profile Modal */}
        {showEditProfile && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Edit Profile</h3>
                  <button onClick={() => setShowEditProfile(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEditProfile(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {profileLoading ? 'Updating...' : 'Update Profile'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Update Payment Method Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Update Payment Method</h3>
                  <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-blue-700">
                          This is a demo. In a real application, you would integrate with Stripe Elements to securely collect payment method information.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowPaymentModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdatePaymentMethod}
                      disabled={paymentLoading}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {paymentLoading ? 'Updating...' : 'Update Payment Method'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Layout>
    );
  };

  export default Dashboard;