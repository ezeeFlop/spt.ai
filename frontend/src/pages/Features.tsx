import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { productApi, userApi } from '../services/api';
import ProductCard from '../components/ProductCard';
import FAQ from '../components/FAQ';
import type { Product } from '../types';

const Features = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProducts, setUserProducts] = useState<number[]>([]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-16">
          {/* Products Section */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              {intl.formatMessage({ id: 'features.title' })}
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id.toString()}
                  name={product.name}
                  description={product.description}
                  imageUrl={product.cover_image || '/default-product-image.jpg'}
                  hasAccess={userProducts.includes(product.id)}
                  isSignedIn={isSignedIn}
                />
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <FAQ />
        </div>
      </div>
    </div>
  );
};

export default Features;