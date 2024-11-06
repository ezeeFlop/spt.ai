import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { Lock, Check } from 'lucide-react';

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

  return (
    <div 
      onClick={handleClick}
      className="group cursor-pointer relative"
    >
      <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200">
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover object-center group-hover:opacity-75"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {hasAccess ? (
            <div className="flex items-center space-x-2 text-white">
              <Check className="h-6 w-6" />
              <span>{intl.formatMessage({ id: 'products.launch' })}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-white">
              <Lock className="h-6 w-6" />
              <span>{intl.formatMessage({ id: 'products.getAccess' })}</span>
            </div>
          )}
        </div>
      </div>
      <h3 className="mt-4 text-sm text-gray-700">{name}</h3>
      <p className="mt-1 text-lg font-medium text-gray-900">{description}</p>
    </div>
  );
};

export default ProductCard;