import { TierInUser, TierWithProducts } from "./tier";

export interface User {
  id: number;
  clerk_id: string;
  email: string;
  name: string;
  language: string;
  role: string;
  first_connection: string;
  last_connection: string;
  api_calls_count: number;
  api_max_calls: number;
  subscribed_tiers: TierInUser[];
  tier?: TierWithProducts;
}

export interface UserDetails {
  id: number;
  clerk_id: string;
  email: string;
  name: string;
  language: string;
  role: string;
  tier?: TierWithProducts;
  api_calls_count: number;
  api_max_calls: number;
  is_active: boolean;
}

export interface UserUpdate {
  email?: string;
  name?: string;
  language?: string;
  role?: string;
  tier?: string;
  api_calls_count?: number;
  api_max_calls?: number;
}
