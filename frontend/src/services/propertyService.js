import api from './api';

export const propertyService = {
  // Get filter options (includes amenities grouped by category)
  getFilterOptions: async () => {
    const response = await api.get('/search/filter-options');
    return response.data;
  },

  // Get all properties with filters
  getProperties: async (params = {}) => {
    const response = await api.get('/properties', { params });
    return response.data;
  },

  // Get single property
  getProperty: async (id) => {
    const response = await api.get(`/properties/${id}`);
    // Backend now returns property, price_history, nearby_properties, similar_properties, stats
    return response.data;
  },

  // Create property
  createProperty: async (data) => {
    const formData = new FormData();
    
    // Add all property fields
    Object.keys(data).forEach((key) => {
      if (key === 'images') {
        // Handle images separately
        data.images.forEach((image) => {
          formData.append('images[]', image);
        });
      } else if (key === 'amenities') {
        // Handle amenities array
        data.amenities.forEach((amenityId) => {
          formData.append('amenities[]', amenityId);
        });
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    const response = await api.post('/properties', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update property
  updateProperty: async (id, data) => {
    const formData = new FormData();
    
    Object.keys(data).forEach((key) => {
      if (key === 'images') {
        data.images.forEach((image) => {
          formData.append('images[]', image);
        });
      } else if (key === 'amenities') {
        data.amenities.forEach((amenityId) => {
          formData.append('amenities[]', amenityId);
        });
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    const response = await api.put(`/properties/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete property
  deleteProperty: async (id) => {
    const response = await api.delete(`/properties/${id}`);
    return response.data;
  },

  // Upload property image
  uploadImage: async (propertyId, image, isPrimary = false, altText = '') => {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('is_primary', isPrimary);
    if (altText) {
      formData.append('alt_text', altText);
    }

    const response = await api.post(`/properties/${propertyId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete property image
  deleteImage: async (propertyId, imageId) => {
    const response = await api.delete(`/properties/${propertyId}/images/${imageId}`);
    return response.data;
  },

  // Reorder images
  reorderImages: async (propertyId, images, primaryId = null) => {
    const response = await api.post(`/properties/${propertyId}/images/reorder`, {
      images,
      primary_id: primaryId,
    });
    return response.data;
  },

  // Agent-specific methods
  getMyProperties: async (params = {}) => {
    const response = await api.get('/agent/properties', { params });
    return response.data;
  },

  getPropertyStats: async (id) => {
    const response = await api.get(`/properties/${id}/stats`);
    return response.data;
  },

  updateAvailability: async (id, status) => {
    const response = await api.patch(`/properties/${id}/availability`, { status });
    return response.data;
  },
};
