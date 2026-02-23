import { create } from 'zustand';
import { propertyService } from '../services/propertyService';

const usePropertyStore = create((set, get) => ({
  properties: [],
  currentProperty: null,
  filters: {
    search: '',
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
    zip_code: '',
    amenities: [],
    featured: false,
  },
  sortBy: 'created_at',
  sortOrder: 'desc',
  pagination: {
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1,
  },
  isLoading: false,
  error: null,

  // Set filters
  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
      pagination: { ...state.pagination, current_page: 1 },
    }));
  },

  // Set sorting
  setSorting: (sortBy, sortOrder = 'desc') => {
    set({ sortBy, sortOrder });
  },

  // Fetch properties
  fetchProperties: async (page = 1, customParams = null) => {
    set({ isLoading: true, error: null });
    try {
      const { filters, sortBy, sortOrder, pagination } = get();
      
      // Use custom params if provided (from URL), otherwise use store filters
      let params = customParams || {
        page,
        per_page: pagination.per_page,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      // If not using custom params, add filters from store
      if (!customParams) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== '' && value !== false && value !== null && value !== undefined) {
            if (Array.isArray(value)) {
              if (value.length > 0) {
                params[key] = value.join(',');
              }
            } else {
              params[key] = value;
            }
          }
        });
      }

      const response = await propertyService.getProperties(params);
      // Handle Laravel paginated response
      const data = response.data || response;
      set({
        properties: Array.isArray(data) ? data : (data.data || []),
        pagination: {
          current_page: data.current_page || response.current_page || 1,
          per_page: data.per_page || response.per_page || 15,
          total: data.total || response.total || 0,
          last_page: data.last_page || response.last_page || 1,
        },
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch properties',
        isLoading: false,
      });
    }
  },

  // Fetch single property
  fetchProperty: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const data = await propertyService.getProperty(id);
      // Backend returns: { property, price_history, nearby_properties, similar_properties, stats }
      set({ currentProperty: data.property || data, isLoading: false });
      return data; // Return full data object for components that need it
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch property',
        isLoading: false,
      });
      throw error;
    }
  },

  // Create property
  createProperty: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const result = await propertyService.createProperty(data);
      set({ isLoading: false });
      return result;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to create property',
        isLoading: false,
      });
      throw error;
    }
  },

  // Update property
  updateProperty: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const result = await propertyService.updateProperty(id, data);
      set({ isLoading: false });
      return result;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to update property',
        isLoading: false,
      });
      throw error;
    }
  },

  // Delete property
  deleteProperty: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await propertyService.deleteProperty(id);
      set((state) => ({
        properties: state.properties.filter((p) => p.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to delete property',
        isLoading: false,
      });
      throw error;
    }
  },

  // Clear current property
  clearCurrentProperty: () => {
    set({ currentProperty: null });
  },

  // Reset filters
  resetFilters: () => {
    set({
      filters: {
        search: '',
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
        zip_code: '',
        amenities: [],
        featured: false,
      },
      pagination: { ...get().pagination, current_page: 1 },
    });
  },
}));

export default usePropertyStore;
