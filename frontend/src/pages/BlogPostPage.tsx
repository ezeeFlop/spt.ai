import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import BlogPost from '../components/BlogPost';
import { blogApi } from '../services/api';
import type { BlogPostResponse } from '../types/api';

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const intl = useIntl();
  const navigate = useNavigate();
  const [post, setPost] = React.useState<BlogPostResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchPost = async () => {
      try {
        if (!slug) {
          throw new Error('No slug provided');
        }
        
        const response = await blogApi.getPostBySlug(slug);
        setPost(response.data);
      } catch (error) {
        console.error('Error fetching blog post:', error);
        setError(intl.formatMessage({ id: 'blog.error.fetch' }));
        // Optionally navigate to blog index after a delay
        setTimeout(() => navigate('/blog'), 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, navigate, intl]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-600">
        {error || intl.formatMessage({ id: 'blog.error.notFound' })}
      </div>
    );
  }

  return (
    <BlogPost
      frontMatter={{
        title: post.title,
        date: post.date,
        author: post.author,
        readingTime: post.reading_time,
        tags: post.tags,
      }}
      content={post.content}
    />
  );
};

export default BlogPostPage; 