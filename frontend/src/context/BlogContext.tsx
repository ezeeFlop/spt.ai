import React, { createContext, useContext, useState, useEffect } from 'react';
import { blogApi } from '../services/api';
import type { BlogPost } from '../types/blog';

interface BlogContextType {
  posts: BlogPost[];
  tags: string[];
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMorePosts: () => Promise<void>;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export const BlogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await blogApi.getPopularTags();
        setTags(response.data);
      } catch (err) {
        console.error('Error fetching tags:', err);
      }
    };

    fetchTags();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await blogApi.getAllPosts({
          limit: LIMIT,
          skip: 0,
          published: true,
          tag: selectedTag || undefined
        });
        console.log("Blog", response.data);
        setPosts(response.data.items);
        setHasMore(response.data.items.length === LIMIT);
        setPage(1);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load blog posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [selectedTag]);

  const loadMorePosts = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await blogApi.getAllPosts({
        limit: LIMIT,
        skip: page * LIMIT,
        tag: selectedTag || undefined
      });
      setPosts(prev => [...prev, ...response.data.items]);
      setHasMore(response.data.items.length === LIMIT);
      setPage(prev => prev + 1);
    } catch (err) {
      console.error('Error loading more posts:', err);
      setError('Failed to load more posts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BlogContext.Provider 
      value={{ 
        posts, 
        tags, 
        selectedTag, 
        setSelectedTag, 
        loading, 
        error, 
        hasMore, 
        loadMorePosts 
      }}
    >
      {children}
    </BlogContext.Provider>
  );
};

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
};