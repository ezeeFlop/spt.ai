import React from 'react';
import { useParams } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { productApi } from '../services/api';
import type { ApiError } from '../types/api';

const ProductPage = () => {
  const { id } = useParams();
  const intl = useIntl();
  const [appUrl, setAppUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchAppUrl = async () => {
      try {
        const response = await productApi.getById(id!);
        if (response.data.appUrl) {
          setAppUrl(response.data.appUrl);
        }
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.error || intl.formatMessage({ id: 'error.product.fetch' }));
        console.error('Error fetching product:', err);
      }
    };

    if (id) {
      fetchAppUrl();
    }
  }, [id, intl]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!appUrl) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-7xl bg-white rounded-lg shadow-sm overflow-hidden">
        <iframe
          src={appUrl}
          className="w-full h-[calc(100vh-2rem)]"
          title="AI Application"
          sandbox="allow-same-origin allow-scripts allow-forms"
        />
      </div>
    </div>
  );
};

export default ProductPage;