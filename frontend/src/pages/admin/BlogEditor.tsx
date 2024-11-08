import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useIntl } from 'react-intl';
import BlogPostEditor from '../../components/admin/BlogPostEditor';
import { blogApi } from '../../services/api';
import type { BlogPostCreate, BlogPostUpdate } from '../../types/blog';

const BlogEditor: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const intl = useIntl();
  const [initialData, setInitialData] = React.useState<BlogPostUpdate | undefined>();
  const [loading, setLoading] = React.useState(!!slug);

  React.useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      
      try {
        const response = await blogApi.getPostBySlug(slug);
        setInitialData({
          title: response.data.title,
          content: response.data.content,
          description: response.data.description,
          image_url: response.data.image_url,
          tags: response.data.tags,
          published: response.data.published,
          in_menu: response.data.in_menu,
        });
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const handleSubmit = async (data: BlogPostCreate | BlogPostUpdate) => {
    try {
      if (slug) {
        const currentPost = await blogApi.getPostBySlug(slug);
        await blogApi.updatePost(currentPost.data.id, data);
      } else {
        await blogApi.createPost(data as BlogPostCreate);
      }
      navigate('/dashboard/blog');
    } catch (error) {
      console.error('Error saving post:', error);
      alert(intl.formatMessage({ id: 'admin.blog.error.save' }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <BlogPostEditor
      initialData={initialData}
      onSubmit={handleSubmit}
      isEditing={!!slug}
    />
  );
};

export default BlogEditor;
