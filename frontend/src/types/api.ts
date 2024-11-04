export interface ApiError {
  error: string;
  detail?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

export interface SearchParams {
  query?: string;
  category?: string;
  sort_by?: string;
  page?: number;
  size?: number;
}

export interface ProductResponse {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  appUrl?: string;
  category?: string;
}

export interface AuthSyncResponse {
  status: string;
  user: {
    id: number;
    clerk_id: string;
    name: string;
    language: string;
  };
}

export interface CheckoutSessionResponse {
  id: string;
  url: string;
}

export interface BlogPost {
  title: string;
  description: string;
  content: string;
  slug: string;
  image_url?: string;
  reading_time: string;
  tags: string[];
}

export interface BlogPostResponse extends BlogPost {
  id: number;
  date: string;
  author: {
    name: string;
    avatar: string;
  };
}

export interface BlogPostCreate {
  title: string;
  description: string;
  content: string;
  slug: string;
  image_url?: string;
  tags: string[];
}

export interface BlogPostUpdate {
  title?: string;
  description?: string;
  content?: string;
  image_url?: string;
  tags?: string[];
}

export interface BlogPostResponse {
  id: number;
  title: string;
  description: string;
  content: string;
  slug: string;
  image_url?: string;
  reading_time: string;
  tags: string[];
  date: string;
  author: {
    id: number;
    name: string;
    avatar: string;
  };
}

export interface BlogPostListResponse {
  items: BlogPostResponse[];
  total: number;
  page: number;
  size: number;
}
