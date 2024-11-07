import React from 'react';
import { Link } from 'react-router-dom';
import { useMenuPosts } from '../hooks/useMenuPosts';

export const BlogMenuItems: React.FC = () => {
  const { menuPosts, loading } = useMenuPosts();

  return (
    <div className="flex space-x-4">
      <Link
        to="/blog"
        className="inline-flex items-center text-gray-900 hover:text-primary-600 px-3 py-2 text-sm font-medium"
      >
        Blog
      </Link>
      {!loading && menuPosts.map((post) => (
        <div key={post.slug} className="relative">
          <Link
            to={`/blog/${post.slug}`}
            className="inline-flex items-center text-gray-900 hover:text-primary-600 px-3 py-2 text-sm font-medium"
          >
            {post.title}
          </Link>
        </div>
      ))}
    </div>
  );
};
