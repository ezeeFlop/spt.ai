import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistance } from 'date-fns';
import { Clock, Calendar } from 'lucide-react';
import { useIntl } from 'react-intl';
import { blogApi } from '../../services/api';
import type { BlogPostResponse } from '../../types/api';

const BlogIndex = () => {
  const intl = useIntl();
  const [posts, setPosts] = React.useState<BlogPostResponse[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await blogApi.getAllPosts({ limit: 10 });
        setPosts(response.data.items);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError(intl.formatMessage({ id: 'blog.error.fetch' }));
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [intl]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {intl.formatMessage({ id: 'blog.title' })}
          </h1>
          <p className="mt-2 text-lg leading-8 text-gray-600">
            {intl.formatMessage({ id: 'blog.subtitle' })}
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.slug} className="flex flex-col items-start">
              <div className="flex items-center gap-x-4 text-xs">
                <time dateTime={post.date} className="text-gray-500 flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  {formatDistance(new Date(post.date), new Date(), { addSuffix: true })}
                </time>
                <div className="flex items-center text-gray-500">
                  <Clock className="mr-1 h-4 w-4" />
                  {post.reading_time}
                </div>
              </div>
              <div className="group relative">
                <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
                  <Link to={`/blog/${post.slug}`}>
                    <span className="absolute inset-0" />
                    {post.title}
                  </Link>
                </h3>
                <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600">{post.description}</p>
              </div>
              <div className="relative mt-8 flex items-center gap-x-4">
                <img src={post.author.avatar} alt="" className="h-10 w-10 rounded-full bg-gray-50" />
                <div className="text-sm leading-6">
                  <p className="font-semibold text-gray-900">
                    <span className="absolute inset-0" />
                    {post.author.name}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogIndex; 