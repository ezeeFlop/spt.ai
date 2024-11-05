import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { blogApi } from '../../services/api';
import { BlogPost } from '../../types/blog';

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = React.useState<BlogPost | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchPost = async () => {
      try {
        if (!slug) {
          navigate('/blog');
          return;
        }
        setLoading(true);
        const response = await blogApi.getPostBySlug(slug);
        setPost(response.data);
      } catch (err) {
        setError('Failed to load blog post');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="text-center text-red-600 py-8">
        {error || 'Post not found'}
      </div>
    );
  }

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      {post.image_url && (
        <img 
          src={post.image_url} 
          alt={post.title}
          className="w-full h-[400px] object-cover rounded-lg mb-8"
        />
      )}
      
      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
      
      <div className="flex items-center gap-4 mb-8">
        <img 
          src={post.author.avatar} 
          alt={post.author.name}
          className="w-12 h-12 rounded-full"
        />
        <div>
          <p className="font-medium">{post.author.name}</p>
          <p className="text-sm text-gray-600">
            {new Date(post.created_at).toLocaleDateString()} · {post.reading_time}
          </p>
        </div>
      </div>
      
      <div className="prose prose-lg max-w-none">
        {post.content}
      </div>
      
      <div className="flex flex-wrap gap-2 mt-8">
        {post.tags.map(tag => (
          <span 
            key={tag}
            className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
};
