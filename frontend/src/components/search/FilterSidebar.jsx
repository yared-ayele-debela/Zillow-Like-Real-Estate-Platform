import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

const FilterSidebar = ({ isOpen, onClose, onApplyFilters }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterOptions, setFilterOptions] = useState({
    property_types: [],
    statuses: [],
    states: [],
    cities: [],
    amenities: {},
    bedroom_options: [],
    bathroom_options: [],
  });
  const [filters, setFilters] = useState({
    property_type: '',
    status: '',
    min_price: '',
    max_price: '',
    bedrooms: '',
    bathrooms: '',
    min_square_feet: '',
    max_square_feet: '',
    min_year_built: '',
    max_year_built: '',
    city: '',
    state: '',
    amenities: [],
    featured: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFilterOptions();
    loadFiltersFromURL();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const response = await api.get('/search/filter-options');
      setFilterOptions(response.data);
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
    }
  };

  const loadFiltersFromURL = () => {
    const urlFilters = {
      property_type: searchParams.get('property_type') || '',
      status: searchParams.get('status') || '',
      min_price: searchParams.get('min_price') || '',
      max_price: searchParams.get('max_price') || '',
      bedrooms: searchParams.get('bedrooms') || '',
      bathrooms: searchParams.get('bathrooms') || '',
      min_square_feet: searchParams.get('min_square_feet') || '',
      max_square_feet: searchParams.get('max_square_feet') || '',
      min_year_built: searchParams.get('min_year_built') || '',
      max_year_built: searchParams.get('max_year_built') || '',
      city: searchParams.get('city') || '',
      state: searchParams.get('state') || '',
      amenities: searchParams.get('amenities')
        ? searchParams.get('amenities').split(',')
        : [],
      featured: searchParams.get('featured') === 'true',
    };
    setFilters(urlFilters);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleAmenityToggle = (amenityId) => {
    setFilters((prev) => {
      const amenities = prev.amenities || [];
      const newAmenities = amenities.includes(amenityId)
        ? amenities.filter((id) => id !== amenityId)
        : [...amenities, amenityId];
      return { ...prev, amenities: newAmenities };
    });
  };

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams);
    
    // Clear existing filters
    [
      'property_type',
      'status',
      'min_price',
      'max_price',
      'bedrooms',
      'bathrooms',
      'min_square_feet',
      'max_square_feet',
      'min_year_built',
      'max_year_built',
      'city',
      'state',
      'amenities',
      'featured',
    ].forEach((key) => params.delete(key));

    // Add new filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== false && (Array.isArray(value) ? value.length > 0 : true)) {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.set(key, value.join(','));
          }
        } else {
          params.set(key, value);
        }
      }
    });

    params.set('page', '1'); // Reset to first page
    setSearchParams(params);

    if (onApplyFilters) {
      onApplyFilters(filters);
    }

    if (onClose) {
      onClose();
    }
  };

  const handleResetFilters = () => {
    const emptyFilters = {
      property_type: '',
      status: '',
      min_price: '',
      max_price: '',
      bedrooms: '',
      bathrooms: '',
      min_square_feet: '',
      max_square_feet: '',
      min_year_built: '',
      max_year_built: '',
      city: '',
      state: '',
      amenities: [],
      featured: false,
    };
    setFilters(emptyFilters);

    // Clear URL params
    const params = new URLSearchParams(searchParams);
    [
      'property_type',
      'status',
      'min_price',
      'max_price',
      'bedrooms',
      'bathrooms',
      'min_square_feet',
      'max_square_feet',
      'min_year_built',
      'max_year_built',
      'city',
      'state',
      'amenities',
      'featured',
    ].forEach((key) => params.delete(key));
    params.set('page', '1');
    setSearchParams(params);

    if (onApplyFilters) {
      onApplyFilters(emptyFilters);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative min-h-full flex items-start justify-center p-4 md:p-8">
        <div className="relative w-full max-w-6xl bg-white rounded-xl shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10 rounded-t-xl">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <FunnelIcon className="w-5 h-5 mr-2" />
            Filters
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Property Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Type
            </label>
            <div className="space-y-2">
              {filterOptions.property_types?.map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="radio"
                    name="property_type"
                    value={type}
                    checked={filters.property_type === type}
                    onChange={(e) => handleFilterChange('property_type', e.target.value)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">{type}</span>
                </label>
              ))}
              <button
                onClick={() => handleFilterChange('property_type', '')}
                className="text-xs text-indigo-600 hover:text-indigo-800"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="space-y-2">
              {filterOptions.statuses?.map((status) => (
                <label key={status} className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={filters.status === status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">
                    {status.replace('_', ' ')}
                  </span>
                </label>
              ))}
              <button
                onClick={() => handleFilterChange('status', '')}
                className="text-xs text-indigo-600 hover:text-indigo-800"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.min_price}
                  onChange={(e) => handleFilterChange('min_price', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.max_price}
                  onChange={(e) => handleFilterChange('max_price', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bedrooms
            </label>
            <select
              value={filters.bedrooms}
              onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Any</option>
              {filterOptions.bedroom_options?.map((beds) => (
                <option key={beds} value={beds}>
                  {beds}+ Bedrooms
                </option>
              ))}
            </select>
          </div>

          {/* Bathrooms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bathrooms
            </label>
            <select
              value={filters.bathrooms}
              onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Any</option>
              {filterOptions.bathroom_options?.map((baths) => (
                <option key={baths} value={baths}>
                  {baths}+ Bathrooms
                </option>
              ))}
            </select>
          </div>

          {/* Square Feet */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Square Feet
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Min"
                value={filters.min_square_feet}
                onChange={(e) => handleFilterChange('min_square_feet', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.max_square_feet}
                onChange={(e) => handleFilterChange('max_square_feet', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Year Built */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year Built
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Min"
                value={filters.min_year_built}
                onChange={(e) => handleFilterChange('min_year_built', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.max_year_built}
                onChange={(e) => handleFilterChange('max_year_built', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <input
              type="text"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              placeholder="Enter city"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State
            </label>
            <select
              value={filters.state}
              onChange={(e) => handleFilterChange('state', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Any State</option>
              {filterOptions.states?.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          {/* Amenities */}
          {filterOptions.amenities && Object.keys(filterOptions.amenities).length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amenities
              </label>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {Object.entries(filterOptions.amenities).map(([category, amenities]) => (
                  <div key={category} className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      {category}
                    </h4>
                    {amenities.map((amenity) => (
                      <label key={amenity.id} className="flex items-center py-1">
                        <input
                          type="checkbox"
                          checked={filters.amenities?.includes(amenity.id)}
                          onChange={() => handleAmenityToggle(amenity.id)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{amenity.name}</span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Featured */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.featured}
                onChange={(e) => handleFilterChange('featured', e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Featured Properties Only</span>
            </label>
          </div>
          </div>

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-white border-t pt-4 pb-4 flex items-center justify-end gap-2">
            <button
              onClick={handleResetFilters}
              className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Reset Filters
            </button>
            <button
              onClick={handleApplyFilters}
              className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
