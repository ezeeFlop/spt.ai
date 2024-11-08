import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { useUser } from '@clerk/clerk-react';
import { productApi, userApi } from '../services/api';
import type { Product } from '../types/product';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Play, Lock } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const intl = useIntl();
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        
        const productResponse = await productApi.getById(id);
        setProduct(productResponse.data);
        
        if (isSignedIn) {
          const userDetails = (await userApi.getMyDetails()).data;
          console.log('User Details:', userDetails);
          console.log('User Tier Products:', userDetails?.tier?.products);
          console.log('Current Product ID:', id);
          
          const hasProductAccess = userDetails?.tier?.products?.some(
            p => p.id.toString() === id.toString()
          );
          
          console.log('Has Access:', hasProductAccess);
          setHasAccess(hasProductAccess || false);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(intl.formatMessage({ id: 'products.error' }));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isSignedIn, intl]);

  const handleTryProduct = () => {
    if (!isSignedIn) {
      navigate('/sign-in');
      return;
    }
    navigate('/pricing');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  // If user has access, show the product interface
  if (hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            </div>
            <iframe
              src={product.frontend_url}
              className="w-full h-[calc(100vh-12rem)]"
              title={product.name}
              sandbox="allow-same-origin allow-scripts allow-forms"
            />
          </div>
        </div>
      </div>
    );
  }

  // If user doesn't have access, show the product summary
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Product Summary */}
          <div className="relative">
            {product.cover_image && (
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={product.cover_image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <h1 className="text-4xl font-bold text-white mb-4">{product.name}</h1>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="prose prose-lg max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {product.description}
                  </ReactMarkdown>
                </div>

                {product.demo_video_link && (
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">
                      {intl.formatMessage({ id: 'products.demoVideo' })}
                    </h2>
                    <div className="aspect-w-16 aspect-h-9">
                      <iframe
                        src={product.demo_video_link}
                        title="Product Demo"
                        className="w-full h-full rounded-lg"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Lock className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-600">
                      {intl.formatMessage({ id: 'products.accessRequired' })}
                    </span>
                  </div>
                  <button
                    onClick={handleTryProduct}
                    className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
                  >
                    <Play className="h-5 w-5" />
                    {intl.formatMessage({ id: 'products.tryIt' })}
                  </button>
                  <p className="mt-4 text-sm text-gray-500 text-center">
                    {intl.formatMessage({ id: 'products.subscriptionInfo' })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
