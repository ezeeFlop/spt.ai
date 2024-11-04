export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  appUrl?: string;
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