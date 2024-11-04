import { useIntl } from 'react-intl';
import ProductCard from '../components/ProductCard';
import FAQ from '../components/FAQ';

const products = [
  {
    id: 'text-analyzer',
    name: 'Text Analyzer AI',
    description: 'Advanced text analysis and processing',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
  },
  {
    id: 'image-processor',
    name: 'Image Processor AI',
    description: 'Intelligent image processing and recognition',
    imageUrl: 'https://images.unsplash.com/photo-1561736778-92e52a7769ef',
  },
  // Add more products as needed
];

const Features = () => {
  const intl = useIntl();

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
                <ProductCard key={product.id} {...product} />
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