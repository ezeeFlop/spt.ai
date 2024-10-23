import React, { createContext, useContext, useState } from 'react';
import type { Product } from '../types';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
}

const defaultProducts: Product[] = [
  {
    id: 'neural-text-analyzer',
    name: 'Neural Text Analyzer',
    description: 'Advanced NLP for text analysis and understanding',
    imageUrl: 'https://images.unsplash.com/photo-1655720828018-edd2daec9349',
    category: 'Language Processing'
  },
  {
    id: 'quantum-image-processor',
    name: 'Quantum Image Processor',
    description: 'Next-gen image analysis and enhancement',
    imageUrl: 'https://images.unsplash.com/photo-1675271591211-126ad94e495d',
    category: 'Computer Vision'
  },
  {
    id: 'deep-learning-studio',
    name: 'Deep Learning Studio',
    description: 'Visual deep learning model creation',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995',
    category: 'Machine Learning'
  },
  {
    id: 'ai-code-assistant',
    name: 'AI Code Assistant',
    description: 'Intelligent code completion and analysis',
    imageUrl: 'https://images.unsplash.com/photo-1671726203638-83742a2721a1',
    category: 'Development Tools'
  }
];

const ProductContext = createContext<ProductContextType>({
  products: defaultProducts,
  loading: false,
  error: null,
});

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  return (
    <ProductContext.Provider value={{ products: defaultProducts, loading, error }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);