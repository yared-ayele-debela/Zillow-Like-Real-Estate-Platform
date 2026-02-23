import api from './api';

export const favoriteService = {
  // Toggle favorite status
  toggleFavorite: async (propertyId) => {
    const response = await api.post(`/properties/${propertyId}/favorite/toggle`);
    return response.data;
  },

  // Check if property is favorited
  checkFavorite: async (propertyId) => {
    const response = await api.get(`/properties/${propertyId}/favorite/check`);
    return response.data;
  },

  // Get user's favorites
  getFavorites: async (page = 1) => {
    const response = await api.get('/favorites', {
      params: { page },
    });
    return response.data;
  },

  // Remove from favorites
  removeFavorite: async (propertyId) => {
    const response = await api.delete(`/favorites/${propertyId}`);
    return response.data;
  },
};
