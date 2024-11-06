import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { blogApi } from '../../services/api';
import { BlogPost } from '../../types/blog';
import BlogPostComponent from '../../components/BlogPost';

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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <BlogPostComponent
        frontMatter={{
          title: post.title,
          date: post.created_at,
          author: {
            name: post.author.name,
            avatar: post.author.avatar_url || '/images/default-avatar.png'
          },
          readingTime: post.reading_time,
          tags: post.tags
        }}
        content={post.content}
      />
    </div>
  );
};
