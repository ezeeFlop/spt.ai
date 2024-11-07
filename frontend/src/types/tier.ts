import { Product } from './product';

export interface TierBase {
  name: string;
  description: string;
  price: number;
  billing_period: string;
  tokens: number;
  stripe_price_id: string | null;
  popular?: boolean;
  is_free: boolean;
  type?: 'recurring' | 'one_time';
  currency?: string;
}

export interface Tier extends TierBase {
  id: number;
  products?: Product[];
  product_ids?: number[];
}

export interface TierInUser extends TierBase {
  id: number;
}

export interface TierWithProducts extends TierBase {
  id: number;
  products: Product[];
}

export interface TierCreate extends TierBase {
  product_ids: number[];
}

export interface TierUpdate {
  name?: string;
  description?: string;
  price?: number;
  billing_period?: string;
  tokens?: number;
  stripe_price_id?: string;
  popular?: boolean;
  product_ids?: number[];
  is_free?: boolean;
}
