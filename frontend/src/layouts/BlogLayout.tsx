import React from 'react';
import { Outlet } from 'react-router-dom';
import { BlogSidebar } from '../components/blog/BlogSidebar';
import { BlogProvider } from '../context/BlogContext';

export const BlogLayout: React.FC = () => {
  return (
    <BlogProvider>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <main className="flex-1">
            <Outlet />
          </main>
          <BlogSidebar className="w-full lg:w-80" />
        </div>
      </div>
    </BlogProvider>
  );
};
