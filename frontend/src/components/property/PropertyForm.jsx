import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import usePropertyStore from '../../store/propertyStore';
import ImageUpload from './ImageUpload';
import { propertyService } from '../../services/propertyService';
import AgentLayout from '../agent/AgentLayout';

const PropertyForm = ({ property: propData = null, isEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { createProperty, updateProperty, fetchProperty, currentProperty, isLoading } = usePropertyStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [availableAmenities, setAvailableAmenities] = useState([]);
  const [error, setError] = useState('');
  const [loadingProperty, setLoadingProperty] = useState(false);
  const [loadingAmenities, setLoadingAmenities] = useState(false);

  const property = propData || currentProperty;
  const isEditing = isEdit || !!id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: property || {
      title: '',
      description: '',
      property_type: 'house',
      status: 'for_sale',
      price: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      country: 'USA',
      bedrooms: '',
      bathrooms: '',
      square_feet: '',
      year_built: '',
      lot_size: '',
      virtual_tour_url: '',
      video_tour_url: '',
    },
  });

  const totalSteps = 5;

  useEffect(() => {
    if (isEditing && id && !property) {
      setLoadingProperty(true);
      fetchProperty(id)
        .then(() => setLoadingProperty(false))
        .catch(() => setLoadingProperty(false));
    }
  }, [id, isEditing, property, fetchProperty]);

  useEffect(() => {
    if (property) {
      setImages(property.images || []);
      setAmenities(property.amenities?.map((a) => a.id) || []);
    }
  }, [property]);

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        setLoadingAmenities(true);
        const filterOptions = await propertyService.getFilterOptions();
        const groupedAmenities = filterOptions?.amenities || {};
        const flattenedAmenities = Object.values(groupedAmenities).flat();
        setAvailableAmenities(flattenedAmenities);
      } catch (err) {
        console.error('Failed to load amenities:', err);
        setAvailableAmenities([]);
      } finally {
        setLoadingAmenities(false);
      }
    };

    fetchAmenities();
  }, []);

  const onSubmit = async (data) => {
    setError('');
    try {
      const formData = {
        ...data,
        images: images.filter((img) => img.file).map((img) => img.file),
        amenities: amenities,
      };

      if (isEditing && property) {
        await updateProperty(property.id, formData);
      } else {
        await createProperty(formData);
      }

      navigate('/properties');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save property');
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAmenityToggle = (amenityId) => {
    setAmenities((prev) =>
      prev.includes(amenityId)
        ? prev.filter((id) => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  if (loadingProperty) {
    return (
      <AgentLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AgentLayout>
    );
  }

  return (
    <AgentLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {isEditing ? 'Edit Property' : 'Create New Property'}
        </h1>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <div
              key={step}
              className={`flex-1 h-2 mx-1 rounded ${
                step <= currentStep ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-600 text-center">
          Step {currentStep} of {totalSteps}
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

        <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                {...register('title', { required: 'Title is required' })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Beautiful 3 Bedroom House"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                {...register('description', {
                  required: 'Description is required',
                  minLength: {
                    value: 50,
                    message: 'Description must be at least 50 characters',
                  },
                })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Describe your property in detail..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Type *
                </label>
                <select
                  {...register('property_type', { required: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="condo">Condo</option>
                  <option value="land">Land</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  {...register('status', { required: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="for_sale">For Sale</option>
                  <option value="for_rent">For Rent</option>
                  <option value="sold">Sold</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price *
              </label>
              <input
                {...register('price', {
                  required: 'Price is required',
                  min: { value: 0, message: 'Price must be positive' },
                })}
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="500000"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {currentStep === 2 && (
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <h2 className="text-xl font-semibold mb-4">Location</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <input
                {...register('address', { required: 'Address is required' })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="123 Main Street"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  {...register('city', { required: 'City is required' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="New York"
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  {...register('state', { required: 'State is required' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="NY"
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code *
                </label>
                <input
                  {...register('zip_code', { required: 'ZIP code is required' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="10001"
                />
                {errors.zip_code && (
                  <p className="mt-1 text-sm text-red-600">{errors.zip_code.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  {...register('country')}
                  type="text"
                  defaultValue="USA"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Details */}
        {currentStep === 3 && (
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <h2 className="text-xl font-semibold mb-4">Property Details</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bedrooms
                </label>
                <input
                  {...register('bedrooms', { min: 0 })}
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bathrooms
                </label>
                <input
                  {...register('bathrooms', { min: 0 })}
                  type="number"
                  min="0"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Square Feet
                </label>
                <input
                  {...register('square_feet', { min: 0 })}
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year Built
                </label>
                <input
                  {...register('year_built', {
                    min: 1800,
                    max: new Date().getFullYear(),
                  })}
                  type="number"
                  min="1800"
                  max={new Date().getFullYear()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lot Size (sq ft)
              </label>
              <input
                {...register('lot_size', { min: 0 })}
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Virtual tour URL (3D / 360°)
                </label>
                <input
                  {...register('virtual_tour_url')}
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://my-3d-tour.example.com"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Link to a Matterport or other interactive 3D/360° tour.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video tour URL
                </label>
                <input
                  {...register('video_tour_url')}
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://youtube.com/..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  Public video link (YouTube, Vimeo, or similar).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Amenities */}
        {currentStep === 4 && (
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <h2 className="text-xl font-semibold mb-4">Amenities</h2>

            {loadingAmenities ? (
              <div className="text-center py-8 text-gray-500">
                <p>Loading amenities...</p>
              </div>
            ) : availableAmenities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No amenities available. Please add amenities in the admin panel.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {availableAmenities.map((amenity) => (
                  <label
                    key={amenity.id}
                    className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={amenities.includes(amenity.id)}
                      onChange={() => handleAmenityToggle(amenity.id)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">{amenity.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 5: Images */}
        {currentStep === 5 && (
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <h2 className="text-xl font-semibold mb-4">Property Images</h2>
            <p className="text-sm text-gray-600 mb-4">
              Upload at least one image. The first image will be set as primary.
            </p>

            <ImageUpload
              images={images}
              onImagesChange={setImages}
            />
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-600"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-600 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : isEditing ? 'Update Property' : 'Create Property'}
            </button>
          )}
        </div>
        </form>
      </div>
    </AgentLayout>
  );
};

export default PropertyForm;
