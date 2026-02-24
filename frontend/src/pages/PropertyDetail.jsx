import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPinIcon,
  HomeIcon,
  CalendarIcon,
  Square3Stack3DIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import usePropertyStore from '../store/propertyStore';
import useAuthStore from '../store/authStore';
import ImageGallery from '../components/property/ImageGallery';
import PriceHistoryChart from '../components/property/PriceHistoryChart';
import NearbyProperties from '../components/property/NearbyProperties';
import ShareButtons from '../components/property/ShareButtons';
import RatingSummary from '../components/review/RatingSummary';
import ReviewsDisplay from '../components/review/ReviewsDisplay';
import ReviewForm from '../components/review/ReviewForm';
import ContactForm from '../components/message/ContactForm';
import TourRequestForm from '../components/message/TourRequestForm';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentProperty, fetchProperty, isLoading, error } = usePropertyStore();
  const { user, isAuthenticated } = useAuthStore();
  const [propertyData, setPropertyData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [reviewPagination, setReviewPagination] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showTourRequestForm, setShowTourRequestForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const fetchReviews = useCallback(async () => {
    if (!id) return;
    
    try {
      const { reviewService } = await import('../services/reviewService');
      const response = await reviewService.getReviews({
        property_id: id,
        approved_only: true,
      });
      
      // Handle paginated response - Laravel pagination returns data in 'data' property
      const reviewsData = response.reviews?.data || response.reviews || [];
      const paginationData = response.reviews || {};
      
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      setReviewSummary(response.summary || null);
      setReviewPagination(paginationData);
      
      console.log('Full reviews response:', response);
      console.log('Reviews data array:', reviewsData);
      console.log('Reviews count:', reviewsData.length);
      console.log('Review summary:', response.summary);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      console.error('Error details:', error.response?.data);
      // Set empty arrays on error
      setReviews([]);
      setReviewSummary(null);
      setReviewPagination(null);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchProperty(id).then((data) => {
        setPropertyData(data);
      });
      fetchReviews();
    }
  }, [id, fetchProperty, fetchReviews]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !currentProperty) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Property not found'}
        </div>
        <Link to="/properties" className="mt-4 text-indigo-600 hover:text-indigo-600">
          ← Back to Properties
        </Link>
      </div>
    );
  }

  const property = currentProperty;
  const priceHistory = propertyData?.price_history || [];
  const nearbyProperties = propertyData?.nearby_properties || [];
  const similarProperties = propertyData?.similar_properties || [];
  const stats = propertyData?.stats || {};


  const isOwner = isAuthenticated && user?.id === property.user_id;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/properties"
            className="text-indigo-600 hover:text-indigo-600 inline-flex items-center"
          >
            ← Back to Properties
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Image Gallery */}
        <div className="mb-8">
          <ImageGallery images={property.images || []} propertyTitle={property.title} />
          {property.is_featured && (
            <div className="mt-2">
              <span className="inline-block bg-yellow-400 text-yellow-900 px-3 py-1 rounded text-sm font-semibold">
                Featured Property
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title and Price */}
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
              <div className="flex items-center text-gray-600 mb-4">
                <MapPinIcon className="w-5 h-5 mr-2" />
                <span>
                  {property.address}, {property.city}, {property.state} {property.zip_code}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-4xl font-bold text-indigo-600">
                  {property.formatted_price || `$${Number(property.price).toLocaleString()}`}
                </span>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-white text-gray-700 rounded text-sm capitalize">
                    {property.status.replace('_', ' ')}
                  </span>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded text-sm capitalize">
                    {property.property_type}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Property Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {property.bedrooms && (
                  <div>
                    <div className="flex items-center text-gray-600 mb-1">
                      <HomeIcon className="w-5 h-5 mr-2" />
                      <span className="text-sm">Bedrooms</span>
                    </div>
                    <p className="text-2xl font-semibold">{property.bedrooms}</p>
                  </div>
                )}
                {property.bathrooms && (
                  <div>
                    <div className="flex items-center text-gray-600 mb-1">
                      <Square3Stack3DIcon className="w-5 h-5 mr-2" />
                      <span className="text-sm">Bathrooms</span>
                    </div>
                    <p className="text-2xl font-semibold">{property.bathrooms}</p>
                  </div>
                )}
                {property.square_feet && (
                  <div>
                    <div className="flex items-center text-gray-600 mb-1">
                      <Square3Stack3DIcon className="w-5 h-5 mr-2" />
                      <span className="text-sm">Square Feet</span>
                    </div>
                    <p className="text-2xl font-semibold">
                      {Number(property.square_feet).toLocaleString()}
                    </p>
                  </div>
                )}
                {property.year_built && (
                  <div>
                    <div className="flex items-center text-gray-600 mb-1">
                      <CalendarIcon className="w-5 h-5 mr-2" />
                      <span className="text-sm">Year Built</span>
                    </div>
                    <p className="text-2xl font-semibold">{property.year_built}</p>
                  </div>
                )}
              </div>
              {property.lot_size && (
                <div className="mt-4 pt-4 border-t">
                  <span className="text-sm text-gray-600">Lot Size: </span>
                  <span className="font-semibold">
                    {Number(property.lot_size).toLocaleString()} sq ft
                  </span>
                </div>
              )}
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((amenity) => (
                    <div
                      key={amenity.id}
                      className="flex items-center p-2 bg-gray-50 rounded"
                    >
                      <span className="text-sm text-gray-700">{amenity.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price History Chart */}
            {priceHistory.length > 0 && (
              <PriceHistoryChart priceHistory={priceHistory} />
            )}

            {/* Map */}
            {property.latitude && property.longitude && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Location</h2>
                <div className="h-64 bg-gray-200 rounded flex items-center justify-center">
                  {/* TODO: Integrate Mapbox or Google Maps */}
                  <p className="text-gray-500">
                    Map will be displayed here (Mapbox integration needed)
                  </p>
                </div>
              </div>
            )}

            {/* Nearby Properties */}
            {nearbyProperties.length > 0 && (
              <NearbyProperties properties={nearbyProperties} title="Nearby Properties" />
            )}

            {/* Similar Properties */}
            {similarProperties.length > 0 && (
              <NearbyProperties properties={similarProperties} title="Similar Properties" />
            )}

            {/* Rating Summary */}
            <RatingSummary summary={reviewSummary} />

            {/* Reviews */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Reviews</h2>
                {isAuthenticated && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-600"
                  >
                    Write a Review
                  </button>
                )}
              </div>
              <ReviewsDisplay
                reviews={reviews}
                pagination={reviewPagination}
                propertyId={property?.id}
                onRefresh={fetchReviews}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              {property.user && (
                <div className="space-y-2 mb-4">
                  <Link to={`/agents/${property.user.id}`} className="font-medium text-indigo-600 hover:text-indigo-600">
                    {property.user.name}
                  </Link>
                  {property.user.phone && <p className="text-sm text-gray-600">{property.user.phone}</p>}
                  <p className="text-sm text-gray-600">{property.user.email}</p>
                </div>
              )}

              {isAuthenticated && !isOwner ? (
                <div className="space-y-2">
                  <button
                    onClick={() => setShowContactForm(true)}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-600"
                  >
                    Contact Agent
                  </button>
                  <button
                    onClick={() => setShowTourRequestForm(true)}
                    className="w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                  >
                    Request Tour
                  </button>
                </div>
              ) : isOwner ? (
                <div className="space-y-2">
                  <Link
                    to={`/properties/${property.id}/edit`}
                    className="block w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-600 text-center"
                  >
                    Edit Property
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  Please <Link to="/login" className="text-indigo-600">login</Link> to contact
                  the agent
                </p>
              )}
            </div>

            {/* Property Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Property Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Views</span>
                  <span className="font-semibold">{stats.views || property.views || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saves</span>
                  <span className="font-semibold">{stats.saves || property.saves || 0}</span>
                </div>
                {stats.average_rating > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rating</span>
                    <span className="font-semibold">
                      {stats.average_rating} / 5.0 ({stats.reviews_count} reviews)
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Listed</span>
                  <span className="font-semibold">
                    {new Date(property.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Share Buttons */}
            <ShareButtons property={property} />
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      <ContactForm
        isOpen={showContactForm}
        onClose={() => setShowContactForm(false)}
        property={property}
        receiverId={property?.user_id}
        onSuccess={() => {
          alert('Message sent successfully!');
        }}
      />

      {/* Tour Request Form Modal */}
      <TourRequestForm
        isOpen={showTourRequestForm}
        onClose={() => setShowTourRequestForm(false)}
        property={property}
        receiverId={property?.user_id}
        onSuccess={() => {
          alert('Tour request submitted successfully!');
        }}
      />

      {/* Review Form Modal */}
      <ReviewForm
        isOpen={showReviewForm}
        onClose={() => setShowReviewForm(false)}
        propertyId={property?.id}
        onSuccess={() => {
          setShowReviewForm(false);
          fetchReviews();
        }}
      />
    </div>
  );
};

export default PropertyDetail;
