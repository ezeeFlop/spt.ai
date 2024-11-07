/*export interface Product {
  id: number;
  name: string;
  description: string;
  cover_image: string | null;
  demo_video_link: string | null;
  frontend_url: string;
  tiers: Array<Tier>;
  category?: string;
}

export interface PricingTier {
  name: string;
  price: number;
  stripePriceId: string;
  features: Array<{
    text: string;
    included: boolean;
  }>;
  popular?: boolean;
}

export interface Tier {
  id: number;
  name: string;
  description: string;
  price: number;
  billing_period: string;
  tokens: number;
  stripe_price_id: string | null;
  products?: Product[];
  product_ids?: number[];
  popular?: boolean;
  is_free: boolean;
}

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

export interface TierInUser {
  id: number;
  name: string;
  description: string;
  price: number;
  billing_period: string;
  tokens: number;
  stripe_price_id?: string;
  popular: boolean;
  is_free: boolean;
}

export interface TierWithProducts extends TierInUser {
  products: Product[];
}
  */