export interface StripePrice {
  id: string;
  amount: number;
  currency: string;
  type: 'recurring' | 'one_time';
  billing_period: string | null;
  product_name: string | null;
  product_description: string | null;
}
