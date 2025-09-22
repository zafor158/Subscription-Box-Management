export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  stripeCustomerId: string;
  createdAt: string;
  subscription?: Subscription;
}

export interface Subscription {
  id: number;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  plan: Plan;
}

export interface Plan {
  id: number;
  name: string;
  description: string;
  priceMonthly: number;
  stripePriceId: string;
  features: string[];
}

export interface Box {
  id: number;
  boxDate: string;
  items: any[];
  trackingNumber?: string;
  status: string;
  createdAt: string;
  planName: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  message?: string;
  data?: T;
  [key: string]: any;
}
