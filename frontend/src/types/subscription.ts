export interface UserSubscription {
  id: number;
  user_id: string;
  tier_id: number;
  status: 'active' | 'inactive';
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface CheckoutSessionResponse {
  checkout_session_id: string;
  url: string;
}
