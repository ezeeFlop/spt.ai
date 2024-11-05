import React from 'react';
import { useIntl } from 'react-intl';
import { X } from 'lucide-react';
import { Product } from '../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productData: Partial<Product>) => void;
  product?: Product;
  title: string;
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  product,
  title,
}) => {
  const intl = useIntl();
  const [formData, setFormData] = React.useState<Partial<Product>>(
    product || {
      name: '',
      description: '',
      cover_image: null,
      demo_video_link: null,
      frontend_url: '',
    }
  );

  React.useEffect(() => {
    if (product) {
      setFormData(product);
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
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
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {intl.formatMessage({ id: 'admin.products.coverImage' })}
            </label>
            <input
              type="url"
              value={formData.cover_image || ''}
              onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {intl.formatMessage({ id: 'admin.products.demoVideo' })}
            </label>
            <input
              type="url"
              value={formData.demo_video_link || ''}
              onChange={(e) => setFormData({ ...formData, demo_video_link: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="https://..."
            />
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
