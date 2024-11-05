import React from 'react';
import { BlogCard } from './BlogCard';
import { useBlog } from '../../context/BlogContext';

export const BlogList: React.FC = () => {
  const { posts, loading, error, hasMore, loadMorePosts } = useBlog();

  if (error) {
    return (
      <div className="text-center text-red-600 py-8">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
      
      {loading && (
        <div className="text-center py-4">
          <span className="loading loading-spinner loading-md"></span>
        </div>
      )}
      
      {hasMore && !loading && (
        <div className="text-center">
          <button
            onClick={loadMorePosts}
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};
