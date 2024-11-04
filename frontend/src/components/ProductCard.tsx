import React from 'react';
import { Link } from 'react-router-dom';
import { useIntl } from 'react-intl';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ id, name, description, imageUrl }) => {
  const intl = useIntl();

  return (
    <Link to={`/products/${id}`} className="group">
      <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200">
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover object-center group-hover:opacity-75"
        />
      </div>
      <h3 className="mt-4 text-sm text-gray-700">{name}</h3>
      <p className="mt-1 text-lg font-medium text-gray-900">{description}</p>
    </Link>
  );
};

export default ProductCard;