import axios from 'axios';
import { AuthSyncResponse, CheckoutSessionResponse, PaginatedResponse, ProductResponse, SearchParams, BlogPost, BlogPostResponse, BlogPostCreate, BlogPostUpdate } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const productApi = {
  getAll: () => api.get<ProductResponse[]>('/products'),
  getById: (id: string) => api.get<ProductResponse>(`/products/${id}`),
  search: (params: SearchParams) => 
    api.get<PaginatedResponse<ProductResponse>>('/products/search', { params }),
  getCategories: () => api.get<string[]>('/products/categories'),
};

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
  }
};

export const paymentApi = {
  createCheckoutSession: async (priceId: string) => {
    if (!priceId) {
      throw new Error('Price ID is required for paid plans');
    }
    return api.post<CheckoutSessionResponse>('/payments/create-checkout-session', {
      priceId,
    });
  },
  
  registerFreeTier: async () => {
    return api.post<{ success: boolean }>('/auth/register-free-tier');
  },
};

export const blogApi = {
  getAllPosts: (params?: { 
    skip?: number; 
    limit?: number; 
    tag?: string; 
    search?: string;
    authorId?: number;
  }) => api.get<PaginatedResponse<BlogPostResponse>>('/blog', { params }),
  
  getPostBySlug: (slug: string) => 
    api.get<BlogPostResponse>(`/blog/${slug}`),
  
  createPost: (post: BlogPostCreate) => 
    api.post<BlogPostResponse>('/blog', post),
  
  updatePost: (slug: string, post: Partial<BlogPostUpdate>) => 
    api.put<BlogPostResponse>(`/blog/${slug}`, post),
  
  deletePost: (slug: string) => 
    api.delete(`/blog/${slug}`),
    
  getPopularTags: (limit?: number) => 
    api.get<string[]>('/blog/tags', { params: { limit } }),
    
  getAuthorPosts: (authorId: number, params?: { 
    skip?: number; 
    limit?: number; 
  }) => api.get<PaginatedResponse<BlogPostResponse>>('/blog/author/${authorId}', { params }),
};
