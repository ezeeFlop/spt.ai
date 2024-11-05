export interface Product {
  id: number;
  name: string;
  description: string;
  cover_image: string | null;
  demo_video_link: string | null;
  frontend_url: string;
  tiers?: Array<Tier>;
  category?: string;
}

export interface ProductCreate {
  name: string;
  description: string;
  cover_image?: string;
  demo_video_link?: string;
  frontend_url: string;
}

export interface ProductUpdate {
  name?: string;
  description?: string;
  cover_image?: string;
  demo_video_link?: string;
  frontend_url?: string;
}
