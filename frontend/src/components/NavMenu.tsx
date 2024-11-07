import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMenuPosts } from '../hooks/useMenuPosts';

export const NavMenu: React.FC = () => {
  const { menuPosts, loading } = useMenuPosts();
  const navigate = useNavigate();

  if (loading || menuPosts.length === 0) return null;

  return (
    <div className="relative group">
      <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
        Blog
      </button>
      <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <div className="py-1">
          {menuPosts.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              {post.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
