import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { Lock, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  hasAccess: boolean;
  isSignedIn: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  id, 
  name, 
  description, 
  imageUrl,
  hasAccess,
  isSignedIn
}) => {
  const intl = useIntl();
  const navigate = useNavigate();

  const handleClick = () => {
    if (!isSignedIn) {
      navigate('/sign-in');
      return;
    }

    if (hasAccess) {
      navigate(`/products/${id}`);
    } else {
      navigate('/pricing');
    }
  };

  const truncatedDescription = description.length > 100 
    ? description.substring(0, 100) + '...'
    : description;

  return (
    <div 
      onClick={handleClick}
      className="group cursor-pointer overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 ease-out"
    >
      <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-t-lg bg-gray-200">
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          {hasAccess ? (
            <div className="flex items-center space-x-2 text-white">
              <Check className="h-6 w-6" />
              <span>{intl.formatMessage({ id: 'product.launch' })}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-white">
              <Lock className="h-6 w-6" />
              <span>{intl.formatMessage({ id: 'product.getAccess' })}</span>
            </div>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-700">{name}</h3>
        <div className="mt-1 text-lg text-gray-900 prose prose-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {truncatedDescription}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;