export interface BlogAuthor {
  id: number;
  name: string;
  avatar_url?: string;
  bio?: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  description: string;
  created_at: string;
  updated_at: string;
  reading_time: string;
  image_url?: string;
  tags: string[];
  author: BlogAuthor;
  published: boolean;
}

export interface BlogPostCreate {
  title: string;
  content: string;
  description: string;
  image_url?: string;
  tags: string[];
  published?: boolean;
}

export interface BlogPostUpdate extends Partial<BlogPostCreate> {}
