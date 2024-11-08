import React, { useRef } from 'react';
import { useIntl } from 'react-intl';
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  toolbarPlugin,
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  UndoRedo,
  CodeToggle,
  MDXEditorMethods,
} from '@mdxeditor/editor';
import { BlogPostCreate, BlogPostUpdate } from '../../types/blog';
import { mediaApi } from '../../services/api';
import '@mdxeditor/editor/style.css';
import { Upload, ImageOff } from 'lucide-react';
import { AIContentGenerator } from '../AIContentGenerator';

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

const imageUploadHandler = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await mediaApi.upload('image', formData);
    return response.data.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

const ImagePreview: React.FC<{ url: string }> = ({ url }) => {
  const [error, setError] = React.useState(false);

  if (!url) {
    return (
      <div className="flex items-center justify-center aspect-square max-h-64 bg-gray-100 rounded-md">
        <div className="text-gray-400 flex flex-col items-center">
          <ImageOff className="h-8 w-8 mb-2" />
          <span className="text-sm">No image selected</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center aspect-square max-h-64 bg-gray-100 rounded-md">
        <div className="text-red-400 flex flex-col items-center">
          <ImageOff className="h-8 w-8 mb-2" />
          <span className="text-sm">Failed to load image</span>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-square max-h-64 overflow-hidden rounded-md">
      <img
        src={url}
        alt="Blog post preview"
        onError={() => setError(true)}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

const BlogPostEditor: React.FC<BlogPostEditorProps> = ({
  initialData,
  onSubmit = defaultProps.onSubmit,
  isEditing = defaultProps.isEditing,
}) => {
  const intl = useIntl();
  const editorRef = useRef<MDXEditorMethods>(null);
  const [title, setTitle] = React.useState(initialData?.title || '');
  const [content, setContent] = React.useState(initialData?.content || '');
  const [description, setDescription] = React.useState(initialData?.description || '');
  const [imageUrl, setImageUrl] = React.useState(initialData?.image_url || '');
  const [tags, setTags] = React.useState<string[]>(initialData?.tags || []);
  const [published, setPublished] = React.useState(initialData?.published || false);
  const [inMenu, setInMenu] = React.useState(initialData?.in_menu || false);
  const [submitting, setSubmitting] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);

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
        in_menu: inMenu,
      };

      await onSubmit(postData);
    } catch (error) {
      console.error('Error submitting post:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await mediaApi.upload('image', formData);
      setImageUrl(response.data.url);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(intl.formatMessage({ id: 'admin.blog.error.upload.image' }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleGeneratedContent = (generatedContent: string) => {
    setContent((prevContent) => {
      const newContent = prevContent + '\n\n' + generatedContent;
      if (editorRef.current) {
        editorRef.current.setMarkdown(newContent);
      }
      return newContent;
    });
  };

  const handleGeneratedImage = (imageUrl: string) => {
    setImageUrl(imageUrl);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto">
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
        <div className="space-y-4">
          <MDXEditor
            ref={editorRef}
            markdown={content}
            onChange={(value) => setContent(value)}
            plugins={[
              headingsPlugin(),
              listsPlugin(),
              quotePlugin(),
              thematicBreakPlugin(),
              markdownShortcutPlugin(),
              linkPlugin(),
              linkDialogPlugin(),
              imagePlugin({
                imageUploadHandler,
                imageAutocompleteSuggestions: []
              }),
              tablePlugin(),
              codeBlockPlugin(),
              codeMirrorPlugin(),
              diffSourcePlugin(),
              toolbarPlugin({
                toolbarContents: () => (
                  <>
                    <UndoRedo />
                    <BlockTypeSelect />
                    <BoldItalicUnderlineToggles />
                    <CodeToggle />
                    <CreateLink />
                    <InsertImage />
                    <InsertTable />
                    <InsertThematicBreak />
                    <ListsToggle />
                  </>
                )
              })
            ]}
            contentEditableClassName="prose dark:prose-invert max-w-none"
            className="w-full min-h-[600px] border rounded-md p-4"
          />
          
          <div className="bg-gray-50 p-4 rounded-md border">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              {intl.formatMessage({ id: 'ai.content.generate' })}
            </h3>
            <AIContentGenerator
              type="markdown"
              onGenerated={handleGeneratedContent}
              placeholder={intl.formatMessage({ id: 'ai.content.placeholder' })}
              locale={intl.locale}
              className="mt-2"
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
          {intl.formatMessage({ id: 'admin.blog.form.imageUrl' })}
        </label>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="url"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="flex-1 mt-1 block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="https://..."
            />
            <div className="relative mt-1">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
              />
              <button
                type="button"
                className={`px-4 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 ${
                  isUploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isUploading}
              >
                {isUploading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-800" />
                ) : (
                  <Upload className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          
          <div className="bg-white border rounded-md p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              {intl.formatMessage({ id: 'admin.blog.form.imagePreview' })}
            </h4>
            <ImagePreview url={imageUrl} />
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md border">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              {intl.formatMessage({ id: 'ai.image.generate' })}
            </h3>
            <AIContentGenerator
              type="image"
              onGenerated={handleGeneratedImage}
              placeholder={intl.formatMessage({ id: 'ai.image.placeholder' })}
              className="mt-2"
            />
          </div>
        </div>
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

      <div className="flex items-center space-x-4">
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

        <div className="flex items-center">
          <input
            type="checkbox"
            id="in_menu"
            checked={inMenu}
            onChange={(e) => setInMenu(e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="in_menu" className="ml-2 block text-sm text-gray-900">
            Show in Menu
          </label>
        </div>
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
