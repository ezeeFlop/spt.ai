import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { X, Upload } from 'lucide-react';
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
} from '@mdxeditor/editor';
import { mediaApi } from '../../services/api';
import '@mdxeditor/editor/style.css';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productData: Partial<Product>) => void;
  product?: Product;
  title: string;
}

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

const initialFormState = {
  name: '',
  description: '',
  cover_image: '',
  demo_video_link: '',
  frontend_url: '',
};

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  product,
  title,
}) => {
  const intl = useIntl();
  const [formData, setFormData] = React.useState<Partial<Product>>(initialFormState);
  const [editorKey, setEditorKey] = useState(0);
  const [isUploading, setIsUploading] = useState({ cover: false, video: false });

  React.useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        description: product.description || '',
        cover_image: product.cover_image || '',
        demo_video_link: product.demo_video_link || '',
        frontend_url: product.frontend_url || '',
      });
      setEditorKey(prev => prev + 1);
    } else {
      setFormData(initialFormState);
      setEditorKey(prev => prev + 1);
    }
  }, [product, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
      alert(intl.formatMessage({ id: `admin.products.error.upload.${type}` }));
    } finally {
      setIsUploading(prev => ({ ...prev, [type === 'image' ? 'cover' : 'video']: false }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {intl.formatMessage({ id: 'admin.products.description' })}
            </label>
            <MDXEditor
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
              className="w-full min-h-[300px] border rounded-md p-4 [&_.mdxeditor-toolbar]:!z-[9999] [&_.mdxeditor-popup-container]:!z-[9999]"
            />
          </div>
          <div>
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
          </div>
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
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white rounded-md py-2 hover:bg-indigo-700"
          >
            {intl.formatMessage({ id: product ? 'admin.products.edit' : 'admin.products.create' })}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
