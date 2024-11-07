import { useState, useEffect } from 'react';
import { blogApi } from '../services/api';
import type { BlogPost } from '../types/blog';

export const useMenuPosts = () => {
  const [menuPosts, setMenuPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenuPosts = async () => {
      try {
        const response = await blogApi.getMenuPosts();
        setMenuPosts(response.data);
      } catch (err) {
        console.error('Error fetching menu posts:', err);
        setError('Failed to load menu posts');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuPosts();
  }, []);

  return { menuPosts, loading, error };
};
