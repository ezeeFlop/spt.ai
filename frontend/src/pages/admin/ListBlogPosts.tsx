import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Edit2, Trash2, Plus, Eye } from 'lucide-react';
import { blogApi } from '../../services/api';
import type { BlogPost } from '../../types/blog';
import { Link } from 'react-router-dom';

const ListBlogPosts: React.FC = () => {
  const intl = useIntl();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await blogApi.getAllPosts({ limit: 100 });
        console.log("admin Blog", response.data);
        setPosts(response.data.items);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleDelete = async (slug: string) => {
    if (window.confirm(intl.formatMessage({ id: 'admin.blog.confirmDelete' }))) {
      try {
        await blogApi.deletePost(slug);
        setPosts(posts.filter(post => post.slug !== slug));
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {intl.formatMessage({ id: 'admin.blog.title' })}
        </h1>
        <Link
          to="/dashboard/blog/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          {intl.formatMessage({ id: 'admin.blog.create' })}
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {intl.formatMessage({ id: 'admin.blog.empty' })}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {intl.formatMessage({ id: 'admin.blog.table.title' })}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {intl.formatMessage({ id: 'admin.blog.table.author' })}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {intl.formatMessage({ id: 'admin.blog.table.status' })}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {intl.formatMessage({ id: 'admin.blog.table.date' })}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Menu
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {intl.formatMessage({ id: 'admin.blog.table.actions' })}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{post.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={post.author.avatar_url || '/images/default-avatar.png'}
                        alt=""
                        className="h-8 w-8 rounded-full"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {post.author.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        post.published
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(post.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        post.in_menu
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {post.in_menu ? 'In Menu' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3">
                      <Link
                        to={`/blog/${post.slug}`}
                        target="_blank"
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <Eye className="h-5 w-5" />
                      </Link>
                      <Link
                        to={`/dashboard/blog/${post.slug}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit2 className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(post.slug)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListBlogPosts;
