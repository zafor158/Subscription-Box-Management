import axios from 'axios';
import { AuthResponse, User, Plan, Subscription, Box } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getProfile: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (userData: {
    firstName?: string;
    lastName?: string;
    email?: string;
  }): Promise<{ user: User }> => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },
};

// Subscription API
export const subscriptionAPI = {
  getPlans: async (): Promise<{ plans: Plan[] }> => {
    const response = await api.get('/subscriptions/plans');
    return response.data;
  },

  createSubscription: async (data: {
    planId: number;
    paymentMethodId: string;
  }): Promise<{ subscription: Subscription }> => {
    const response = await api.post('/subscriptions/create', data);
    return response.data;
  },

  getCurrentSubscription: async (): Promise<{ subscription: Subscription }> => {
    const response = await api.get('/subscriptions/current');
    return response.data;
  },

  cancelSubscription: async (cancelAtPeriodEnd: boolean = true): Promise<{ subscription: Subscription }> => {
    const response = await api.post('/subscriptions/cancel', { cancelAtPeriodEnd });
    return response.data;
  },

  getSubscriptionHistory: async (): Promise<{ subscriptions: Subscription[] }> => {
    const response = await api.get('/subscriptions/history');
    return response.data;
  },

  getBoxHistory: async (): Promise<{ boxes: Box[] }> => {
    const response = await api.get('/subscriptions/boxes');
    return response.data;
  },
};

export default api;
