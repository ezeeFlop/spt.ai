import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { productApi, userApi } from '../services/api';
import ProductCard from '../components/ProductCard';
import FAQ from '../components/FAQ';
import type { Product } from '../types/product';
import { CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/solid';

const Features = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProducts, setUserProducts] = useState<number[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsResponse = await productApi.getAll();
        setProducts(productsResponse.data);

        if (isSignedIn) {
          const userDetails = await userApi.getMyDetails();
          const accessibleProductIds = userDetails.data.tier?.products.map(p => p.id) || [];
          setUserProducts(accessibleProductIds);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(intl.formatMessage({ id: 'features.error' }));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isSignedIn, intl]);

  useEffect(() => {
    // Check for success parameter in URL
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('payment') === 'success') {
      setShowSuccessMessage(true);
      // Remove the query parameter from URL after 5 seconds
      setTimeout(() => {
        navigate('/features', { replace: true });
      }, 5000);
    }
  }, [location, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-red-600 bg-red-50 px-4 py-3 rounded-lg shadow-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-50 p-4 rounded-lg shadow-lg transform animate-fade-in-down">
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
            <p className="text-sm font-medium text-green-800">
              {intl.formatMessage({ id: 'features.payment.success' })}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <SparklesIcon className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-4">
            {intl.formatMessage({ id: 'features.title' })}
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            {intl.formatMessage({ id: 'features.section.subtitle' })}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="bg-white rounded-lg"
            >
              <ProductCard
                id={product.id.toString()}
                name={product.name}
                description={product.description}
                imageUrl={product.cover_image || '/default-product-image.jpg'}
                hasAccess={userProducts.includes(product.id)}
                isSignedIn={isSignedIn}
              />
            </div>
          ))}
        </div>

        {/* FAQ Section with updated styling */}
        <div className="mt-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <FAQ />
        </div>
      </div>
    </div>
  );
};

export default Features;