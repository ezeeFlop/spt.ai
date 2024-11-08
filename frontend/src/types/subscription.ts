import { Tier } from "./tier";

export interface UserSubscription {
  id: number;
  user_id: string;
  tier_id: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  tier: Tier;
}

export interface TierSubscription {
  tier_id: number;
  status: string;
  expires_at: string;
}

export interface CheckoutSessionResponse {
  checkout_session_id: string;
  url: string;
}
