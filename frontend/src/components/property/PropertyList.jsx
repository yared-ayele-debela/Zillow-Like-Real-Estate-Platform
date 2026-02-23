import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FunnelIcon } from '@heroicons/react/24/outline';
import usePropertyStore from '../../store/propertyStore';
import PropertyCard from './PropertyCard';
import SearchBar from '../search/SearchBar';
import FilterSidebar from '../search/FilterSidebar';
import SaveSearchModal from '../search/SaveSearchModal';
import useAuthStore from '../../store/authStore';

const PropertyList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    properties,
    isLoading,
    error,
    pagination,
    filters,
    fetchProperties,
    setFilters,
  } = usePropertyStore();
  const { user, isAuthenticated } = useAuthStore();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [showSaveSearch, setShowSaveSearch] = useState(false);

  useEffect(() => {
    // Sync URL params with filters
    const urlFilters = {
      search: searchParams.get('search') || '',
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
      amenities: searchParams.get('amenities')?.split(',') || [],
      featured: searchParams.get('featured') === 'true',
    };

    setFilters(urlFilters);
  }, [searchParams, setFilters]);

  useEffect(() => {
    const page = parseInt(searchParams.get('page')) || 1;
    // Build params from URL for API call
    const params = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    params.page = page;
    
    // Fetch properties with current filters from URL
    fetchProperties(page, params);
  }, [searchParams, fetchProperties]);

  const handleFavoriteToggle = (propertyId) => {
    // TODO: Implement favorite toggle
    console.log('Toggle favorite for property:', propertyId);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage);
    setSearchParams(params);
  };

  if (isLoading && properties.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar onSearch={() => fetchProperties(1)} />
      </div>

      {/* Header with Filters and View Toggle */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Properties ({pagination.total})
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700"
            >
              <FunnelIcon className="w-5 h-5" />
              Filters
            </button>
            {isAuthenticated && searchParams.toString() && (
              <button
                onClick={() => setShowSaveSearch(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
              >
                Save Search
              </button>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${
              viewMode === 'grid'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${
              viewMode === 'list'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* Sort and Active Filters */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Sort by:</label>
          <select
            value={`${searchParams.get('sort_by') || 'created_at'}_${searchParams.get('sort_order') || 'desc'}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('_');
              const params = new URLSearchParams(searchParams);
              params.set('sort_by', sortBy);
              params.set('sort_order', sortOrder);
              params.set('page', '1');
              setSearchParams(params);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          >
            <option value="created_at_desc">Newest First</option>
            <option value="created_at_asc">Oldest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="square_feet_desc">Largest First</option>
            <option value="views_desc">Most Viewed</option>
            <option value="saves_desc">Most Saved</option>
          </select>
        </div>

        {/* Active Filters Display */}
        {searchParams.toString() && (
          <div className="flex flex-wrap gap-2">
            {Array.from(searchParams.entries()).map(([key, value]) => {
              if (key === 'page' || key === 'per_page' || key === 'sort_by' || key === 'sort_order') {
                return null;
              }
              return (
                <span
                  key={key}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                >
                  {key}: {value}
                  <button
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.delete(key);
                      setSearchParams(params);
                    }}
                    className="ml-2 text-indigo-600 hover:text-indigo-800"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Filter Sidebar */}
      <FilterSidebar
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={() => {
          fetchProperties(1);
          setShowFilters(false);
        }}
      />

      {/* Save Search Modal */}
      <SaveSearchModal
        isOpen={showSaveSearch}
        onClose={() => setShowSaveSearch(false)}
        filters={Object.fromEntries(searchParams.entries())}
        onSave={() => {
          setShowSaveSearch(false);
          alert('Search saved successfully!');
        }}
      />

      {properties.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No properties found</p>
          <p className="text-gray-400 mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }
          >
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onFavoriteToggle={handleFavoriteToggle}
                isFavorite={false} // TODO: Get from favorites store
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>

              {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 ||
                    page === pagination.last_page ||
                    (page >= pagination.current_page - 2 &&
                      page <= pagination.current_page + 2)
                )
                .map((page, index, array) => (
                  <div key={page} className="flex items-center gap-2">
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 border rounded ${
                        pagination.current_page === page
                          ? 'bg-indigo-600 text-white'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  </div>
                ))}

              <button
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}
                className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PropertyList;
