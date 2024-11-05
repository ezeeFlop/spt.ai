import React from 'react';
import { Link } from 'react-router-dom';
import { BlogPost } from '../../types/blog';
import { formatDate } from '../../utils/date';

interface BlogCardProps {
  post: BlogPost;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  return (
    <article className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:-translate-y-1">
      <Link to={`/blog/${post.slug}`} className="block">
        {post.image_url ? (
          <img 
            src={post.image_url} 
            alt={post.title}
            className="w-full h-48 object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </Link>

      <div className="p-6 flex-1 flex flex-col">
        {/* Author Info */}
        <div className="flex items-center gap-3 mb-4">
          <img 
            src={post.author.avatar} 
            alt={post.author.name}
            className="w-8 h-8 rounded-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/default-avatar.png'; // Fallback avatar
            }}
          />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">
              {post.author.name}
            </span>
            <span className="text-xs text-gray-500">
              {formatDate(post.created_at)}
            </span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold mb-2 line-clamp-2">
          <Link 
            to={`/blog/${post.slug}`} 
            className="hover:text-primary-600 transition-colors"
          >
            {post.title}
          </Link>
        </h2>

        {/* Description */}
        <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
          {post.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map(tag => (
            <span 
              key={tag}
              className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
};
