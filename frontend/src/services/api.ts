import axios from 'axios';
import { AuthSyncResponse, CheckoutSessionResponse, PaginatedResponse } from '../types/api';
import { User, UserDetails } from '../types/user';
import { Product } from '../types/product';
import { Tier, TierCreate, TierUpdate } from '../types/tier';
import { BlogPost, BlogPostCreate, BlogPostUpdate } from '../types/blog';
import { PaymentStatus, TierSubscription } from '../types/payment';
import { UserSubscription } from '../types/subscription';
import { StripePrice } from '../types/stripe';
import { MediaFile } from '../types/media';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token

api.interceptors.request.use(async (config) => {
  const token = await window.Clerk?.session?.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Product API
export const productApi = {
  getAll: () => api.get<Product[]>('/products'),
  getById: (id: string) => api.get<Product>(`/products/${id}`),
  create: (productData: Partial<Product>) => api.post<Product>('/products', productData),
  update: (id: string, productData: Partial<Product>) => api.put<Product>(`/products/${id}`, productData),
  delete: (id: string) => api.delete(`/products/${id}`),
  getAppUrl: (id: string) => api.get<{appUrl: string}>(`/products/${id}/app-url`),
};

// Tier API
export const tierApi = {
  getAll: () => api.get<Tier[]>('/tiers'),
  create: (tierData: Partial<TierCreate>) => api.post<Tier>('/tiers', tierData),
  update: (id: string, tierData: Partial<TierUpdate>) => api.put<Tier>(`/tiers/${id}`, tierData),
  delete: (id: string) => api.delete(`/tiers/${id}`),
};

// User API
export const userApi = {
  getAll: () => api.get<User[]>('/users'),
  getMyDetails: () => api.get<UserDetails>('/users/me'),
  update: (id: string, userData: Partial<User>) => 
    api.put<User>(`/users/${id}`, userData),
};

// Auth API
export const authApi = {
  syncUser: async (clerkId: string, language?: string) => {
    try {
      const response = await api.post<AuthSyncResponse>('/auth/sync', {
        clerk_id: clerkId,
        language: language
      });
      return response.data;
    } catch (error) {
      console.error('Sync user error:', error);
      throw new Error('Failed to sync user');
    }
  },
  getUserDetails: async (userId: string) => {
    const response = await api.get<UserDetails>(`/users/${userId}`);
    return response.data;
  }
};

// Payment API
export const paymentApi = {
  createCheckoutSession: async (tierId: number): Promise<CheckoutSessionResponse> => {
    if (!tierId) {
      throw new Error('Tier ID is required');
    }
    const response = await api.post<CheckoutSessionResponse>(
      `/payments/create-checkout-session/${tierId}`
    );
    return response.data;
  },
  
  registerFreeTier: async (): Promise<TierSubscription> => {
    const response = await api.post<TierSubscription>('/payments/register-free-tier');
    return response.data;
  },

  getPaymentStatus: async (paymentId: string): Promise<PaymentStatus> => {
    const response = await api.get<PaymentStatus>(`/payments/status/${paymentId}`);
    return response.data;
  },

  getCurrentSubscription: async (): Promise<TierSubscription> => {
    const response = await api.get<TierSubscription>('/payments/current-subscription');
    return response.data;
  }
};

// Blog API
export const blogApi = {
  getAllPosts: (params?: { 
    skip?: number; 
    limit?: number; 
    tag?: string; 
    search?: string;
    authorId?: number;
    published?: boolean;
  }) => api.get<PaginatedResponse<BlogPost>>('/blog', { params }),
  
  getPostBySlug: (slug: string) => 
    api.get<BlogPost>(`/blog/${slug}`),
  
  createPost: (post: BlogPostCreate) => 
    api.post<BlogPost>('/blog', post),
  
  updatePost: (blogId: number, post: BlogPostUpdate) => 
    api.put<BlogPost>(`/blog/${blogId}`, post),
  
  deletePost: (slug: string) => 
    api.delete(`/blog/${slug}`),
    
  getPopularTags: (limit?: number) => 
    api.get<string[]>('/blog/tags', { params: { limit } }),
  getMenuPosts: () => api.get<BlogPost[]>('/blog/menu'),
};

export const statsApi = {
  getUserStats: async (timeRange: string) => {
    const response = await api.get(`/stats/users/${timeRange}`);
    return response.data;
  },

  getRevenueStats: async (timeRange: string) => {
    const response = await api.get(`/stats/revenue/${timeRange}`);
    return response.data;
  },

  getTotalRevenue: async () => {
    const response = await api.get('/stats/revenue');
    return response.data;
  }
};

export const subscriptionApi = {
  getCurrentSubscription: async () => {
    const response = await api.get<UserSubscription>('/payments/current-subscription');
    return response.data;
  },

  registerFreeTier: async () => {
    const response = await api.post<UserSubscription>('/payments/register-free-tier');
    return response.data;
  }
};

export const mediaApi = {
  upload: (type: 'image' | 'video' | 'document', formData: FormData) =>
    api.post<{ url: string }>(`/media/upload/${type}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  listFiles: (type: 'image' | 'video' | 'document') =>
    api.get<MediaFile[]>(`/media/files/${type}`),
    
  deleteFile: (type: 'image' | 'video' | 'document', filename: string) =>
    api.delete(`/media/${type}/${filename}`),
};

// Add to existing api object
export const stripeApi = {
  getAllPrices: async () => {
    const response = await api.get<StripePrice[]>('/stripe/prices');
    return response.data;
  },
  getPriceDetails: async (priceId: string) => {
    const response = await api.get<StripePrice>(`/stripe/price/${priceId}`);
    return response.data;
  }
};