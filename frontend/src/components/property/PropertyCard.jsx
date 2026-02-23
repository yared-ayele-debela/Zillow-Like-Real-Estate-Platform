import { Link } from 'react-router-dom';
import { MapPinIcon } from '@heroicons/react/24/outline';
import FavoriteButton from './FavoriteButton';

const PropertyCard = ({ property, onFavoriteToggle, isFavorite = false }) => {
  const primaryImage = property.images?.find((img) => img.is_primary) || property.images?.[0];
  const imageUrl = primaryImage
    ? `${process.env.REACT_APP_API_URL?.replace('/api', '')}/storage/${primaryImage.image_path}`
    : '/placeholder-property.jpg';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <Link to={`/properties/${property.id}`}>
        <div className="relative h-48 bg-gray-200">
          {primaryImage ? (
            <img
              src={imageUrl}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
          {property.is_featured && (
            <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-semibold">
              Featured
            </span>
          )}
          <div
            className="absolute top-2 right-2"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <FavoriteButton
              propertyId={property.id}
              savesCount={property.saves || 0}
              onToggle={onFavoriteToggle}
            />
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/properties/${property.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-indigo-600 transition-colors">
            {property.title}
          </h3>
        </Link>

        <div className="flex items-center text-gray-600 mb-2">
          <MapPinIcon className="w-4 h-4 mr-1" />
          <span className="text-sm">
            {property.address}, {property.city}, {property.state} {property.zip_code}
          </span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-indigo-600">
            {property.formatted_price || `$${Number(property.price).toLocaleString()}`}
          </span>
          <span className="text-sm text-gray-500 capitalize">{property.status.replace('_', ' ')}</span>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 border-t pt-3">
          {property.bedrooms && (
            <span>
              <strong>{property.bedrooms}</strong> Bed{property.bedrooms !== 1 ? 's' : ''}
            </span>
          )}
          {property.bathrooms && (
            <span>
              <strong>{property.bathrooms}</strong> Bath{property.bathrooms !== 1 ? 's' : ''}
            </span>
          )}
          {property.square_feet && (
            <span>
              <strong>{Number(property.square_feet).toLocaleString()}</strong> sq ft
            </span>
          )}
        </div>

        {property.property_type && (
          <div className="mt-2">
            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded capitalize">
              {property.property_type}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyCard;
