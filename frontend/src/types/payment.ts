export interface CheckoutSessionResponse {
  checkout_session_id: string;
  url: string; // Stripe checkout URL
}

export interface PaymentStatus {
  status: 'pending' | 'completed' | 'failed';
  tier_id: number;
  payment_id: string;
}

export interface TierSubscription {
  tier_id: number;
  status: 'active' | 'inactive';
  expires_at: string;
}
