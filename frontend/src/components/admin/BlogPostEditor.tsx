import React from 'react';
import { useIntl } from 'react-intl';
import MDEditor from '@uiw/react-md-editor';
import { BlogPostCreate, BlogPostUpdate } from '../../types/blog';

interface BlogPostEditorProps {
  initialData?: BlogPostUpdate;
  onSubmit: (data: BlogPostCreate | BlogPostUpdate) => Promise<void>;
  isEditing?: boolean;
}

const defaultProps = {
  isEditing: false,
  onSubmit: async () => {
    console.error('onSubmit prop not provided');
  },
} as const;

const BlogPostEditor: React.FC<BlogPostEditorProps> = ({
  initialData,
  onSubmit = defaultProps.onSubmit,
  isEditing = defaultProps.isEditing,
}) => {
  const intl = useIntl();
  const [title, setTitle] = React.useState(initialData?.title || '');
  const [content, setContent] = React.useState(initialData?.content || '');
  const [description, setDescription] = React.useState(initialData?.description || '');
  const [imageUrl, setImageUrl] = React.useState(initialData?.image_url || '');
  const [tags, setTags] = React.useState<string[]>(initialData?.tags || []);
  const [published, setPublished] = React.useState(initialData?.published || false);
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!onSubmit || typeof onSubmit !== 'function') {
      console.error('BlogPostEditor: onSubmit prop must be a function');
      return;
    }

    setSubmitting(true);

    try {
      const postData = {
        title,
        content,
        description,
        image_url: imageUrl,
        tags,
        published,
      };

      await onSubmit(postData);
    } catch (error) {
      console.error('Error submitting post:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          {intl.formatMessage({ id: 'admin.blog.form.title' })}
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          {intl.formatMessage({ id: 'admin.blog.form.description' })}
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          required
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
          {intl.formatMessage({ id: 'admin.blog.form.content' })}
        </label>
        <MDEditor
          value={content}
          onChange={(value) => setContent(value || '')}
          preview="edit"
          height={400}
        />
      </div>

      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
          {intl.formatMessage({ id: 'admin.blog.form.imageUrl' })}
        </label>
        <input
          type="url"
          id="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
          {intl.formatMessage({ id: 'admin.blog.form.tags' })}
        </label>
        <input
          type="text"
          id="tags"
          value={tags.join(', ')}
          onChange={(e) => setTags(e.target.value.split(',').map((tag) => tag.trim()))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          placeholder="tag1, tag2, tag3"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="published"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
          {intl.formatMessage({ id: 'admin.blog.form.published' })}
        </label>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {submitting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
          ) : null}
          {intl.formatMessage({
            id: isEditing ? 'admin.blog.form.update' : 'admin.blog.form.create',
          })}
        </button>
      </div>
    </form>
  );
};

export default BlogPostEditor;
