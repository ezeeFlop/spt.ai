export interface ContentResponse {
    content: string;
    locale: string;
    updated_at: string;
  }
  
export interface HomeContent {
  content: {
    hero: {
      title: string;
      subtitle: string;
      ctaPrimary: string;
      ctaSecondary: string;
    };
    features: {
      title: string;
      subtitle: string;
      items: Array<{
        icon: 'Brain' | 'Sparkles' | 'Zap';
        title: string;
        description: string;
        }>;
      };
    };
  }
  
  export interface ApiResponse<T> {
    data: T;
    message?: string;
  }