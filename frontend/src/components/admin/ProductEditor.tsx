import React, { useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { Upload, ImageOff } from 'lucide-react';
import { Product } from '../../types/product';
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
import { mediaApi } from '../../services/api';
import '@mdxeditor/editor/style.css';
import { AIContentGenerator } from '../AIContentGenerator';
import { toast } from 'react-toastify';

interface ProductEditorProps {
  initialData?: Partial<Product>;
  onSubmit: (data: Partial<Product>) => Promise<void>;
  isEditing?: boolean;
}

const defaultProps = {
  isEditing: false,
  onSubmit: async () => {
    console.error('onSubmit prop not provided');
  },
} as const;

// Reuse the ImagePreview component from BlogPostEditor
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
        alt="Product preview"
        onError={() => setError(true)}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

const ProductEditor: React.FC<ProductEditorProps> = ({
  initialData,
  onSubmit = defaultProps.onSubmit,
  isEditing = defaultProps.isEditing,
}) => {
  const intl = useIntl();
  const editorRef = useRef<MDXEditorMethods>(null);
  const [formData, setFormData] = React.useState<Partial<Product>>(initialData || {
    name: '',
    description: '',
    cover_image: '',
    demo_video_link: '',
    frontend_url: '',
  });
  const [editorKey, setEditorKey] = useState(0);
  const [isUploading, setIsUploading] = useState({ cover: false, video: false });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting product:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async (file: File, type: 'image' | 'video', field: 'cover_image' | 'demo_video_link') => {
    if (!file) return;

    setIsUploading(prev => ({ ...prev, [type === 'image' ? 'cover' : 'video']: true }));
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await mediaApi.upload(type, formData);
      setFormData(prev => ({ ...prev, [field]: response.data.url }));
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast.error(intl.formatMessage({ id: `admin.products.error.upload.${type}` }));
    } finally {
      setIsUploading(prev => ({ ...prev, [type === 'image' ? 'cover' : 'video']: false }));
    }
  };

  const handleGeneratedContent = (generatedContent: string) => {
    setFormData(prev => ({
      ...prev,
      description: prev.description + '\n\n' + generatedContent
    }));
    if (editorRef.current) {
      editorRef.current.setMarkdown(formData.description + '\n\n' + generatedContent);
    }
    setEditorKey(prev => prev + 1);
  };

  const handleGeneratedImage = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      cover_image: imageUrl
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {intl.formatMessage({ id: 'admin.products.name' })}
        </label>
        <input
          type="text"
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          required
        />
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {intl.formatMessage({ id: 'admin.products.description' })}
          </label>
          <MDXEditor
            ref={editorRef}
            key={editorKey}
            markdown={formData.description || ''}
            onChange={(value) => setFormData({ ...formData, description: value })}
            plugins={[
              headingsPlugin(),
              listsPlugin(),
              quotePlugin(),
              thematicBreakPlugin(),
              markdownShortcutPlugin(),
              linkPlugin(),
              linkDialogPlugin(),
              imagePlugin({
                imageUploadHandler: async (file: File) => {
                  const formData = new FormData();
                  formData.append('file', file);
                  const response = await mediaApi.upload('image', formData);
                  return response.data.url;
                },
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
            className="w-full min-h-[300px] border rounded-md p-4"
          />
          
          <div className="mt-4 bg-gray-50 p-4 rounded-md border">
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

      {/* Cover Image Section */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {intl.formatMessage({ id: 'admin.products.coverImage' })}
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={formData.cover_image || ''}
            onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2"
            placeholder="https://..."
          />
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'image', 'cover_image')}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading.cover}
            />
            <button
              type="button"
              className={`px-4 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 ${
                isUploading.cover ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isUploading.cover}
            >
              {isUploading.cover ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-800" />
              ) : (
                <Upload className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="bg-white border rounded-md p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            {intl.formatMessage({ id: 'admin.products.imagePreview' })}
          </h4>
          <ImagePreview url={formData.cover_image || ''} />
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

      {/* Demo Video Link */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {intl.formatMessage({ id: 'admin.products.demoVideo' })}
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={formData.demo_video_link || ''}
            onChange={(e) => setFormData({ ...formData, demo_video_link: e.target.value })}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2"
            placeholder="https://..."
          />
          <div className="relative">
            <input
              type="file"
              accept="video/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'video', 'demo_video_link')}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading.video}
            />
            <button
              type="button"
              className={`px-4 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 ${
                isUploading.video ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isUploading.video}
            >
              {isUploading.video ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-800" />
              ) : (
                <Upload className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Frontend URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {intl.formatMessage({ id: 'admin.products.frontendUrl' })}
        </label>
        <input
          type="url"
          value={formData.frontend_url || ''}
          onChange={(e) => setFormData({ ...formData, frontend_url: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          required
          placeholder="https://..."
        />
      </div>

      {/* Submit Button */}
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
            id: isEditing ? 'admin.products.update' : 'admin.products.create',
          })}
        </button>
      </div>
    </form>
  );
};

export default ProductEditor;
