import React from 'react';
import { useParams } from 'react-router-dom';

const ProductPage = () => {
  const { id } = useParams();
  const [appUrl, setAppUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    // In a real application, fetch the app URL from your backend
    const fetchAppUrl = async () => {
      // Simulated API call
      const response = await fetch(`/api/products/${id}`);
      const data = await response.json();
      setAppUrl(data.appUrl);
    };

    fetchAppUrl();
  }, [id]);

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