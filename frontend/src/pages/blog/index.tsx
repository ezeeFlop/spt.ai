import React from 'react';
import { BlogList } from '../../components/blog/BlogList';
import { BlogProvider } from '../../context/BlogContext';

export const BlogIndexPage: React.FC = () => {
  return (
    <BlogProvider>
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      <BlogList />
    </BlogProvider>
  );
};
