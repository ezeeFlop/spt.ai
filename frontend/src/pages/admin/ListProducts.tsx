import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Plus } from 'lucide-react';
import { productApi } from '../../services/api';
import { Product } from '../../types';
import ProductModal from '../../components/ProductModal';

const ListProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const intl = useIntl();

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await productApi.getAll();
        setProducts(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(intl.formatMessage({ id: 'admin.products.error.fetch' }));
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [intl]);

  const handleCreateProduct = async (productData: Partial<Product>) => {
    try {
      const response = await productApi.create(productData);
      setProducts([...products, response.data]);
      setIsModalOpen(false);
      alert(intl.formatMessage({ id: 'admin.products.success.create' }));
    } catch (error) {
      console.error('Error creating product:', error);
      alert(intl.formatMessage({ id: 'admin.products.error.create' }));
    }
  };

  const handleUpdateProduct = async (productData: Partial<Product>) => {
    if (!selectedProduct?.id) return;
    
    try {
      await productApi.update(selectedProduct.id.toString(), productData);
      setProducts(products.map(product => 
        product.id === selectedProduct.id ? { ...product, ...productData } : product
      ));
      setIsModalOpen(false);
      setSelectedProduct(undefined);
      alert(intl.formatMessage({ id: 'admin.products.success.update' }));
    } catch (error) {
      console.error('Error updating product:', error);
      alert(intl.formatMessage({ id: 'admin.products.error.update' }));
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (window.confirm(intl.formatMessage({ id: 'admin.products.confirmDelete' }))) {
      try {
        await productApi.delete(productId.toString());
        setProducts(products.filter(product => product.id !== productId));
        alert(intl.formatMessage({ id: 'admin.products.success.delete' }));
      } catch (error) {
        console.error('Error deleting product:', error);
        alert(intl.formatMessage({ id: 'admin.products.error.delete' }));
      }
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(undefined);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {intl.formatMessage({ id: 'admin.products.title' })}
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          {intl.formatMessage({ id: 'admin.products.create' })}
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {intl.formatMessage({ id: 'admin.products.empty' })}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {intl.formatMessage({ id: 'admin.products.name' })}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {intl.formatMessage({ id: 'admin.products.description' })}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {intl.formatMessage({ id: 'admin.products.frontendUrl' })}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {intl.formatMessage({ id: 'admin.products.actions' })}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map(product => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                  <td className="px-6 py-4">{product.description}</td>
                  <td className="px-6 py-4">
                    <a 
                      href={product.frontend_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {product.frontend_url}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      {intl.formatMessage({ id: 'admin.products.edit' })}
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      {intl.formatMessage({ id: 'admin.products.delete' })}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={selectedProduct ? handleUpdateProduct : handleCreateProduct}
        product={selectedProduct}
        title={intl.formatMessage({
          id: selectedProduct ? 'admin.products.edit' : 'admin.products.create'
        })}
      />
    </div>
  );
};

export default ListProducts; 