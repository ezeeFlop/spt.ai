import { User } from "./user";

export interface ApiError {
  error: string;
  detail?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SearchParams {
  query: string;
  category?: string;
  priceRange?: [number, number];
}

export interface AuthSyncResponse {
  status: string;
  user: User;
}

export interface CheckoutSessionResponse {
  id: string;
  url: string;
}
