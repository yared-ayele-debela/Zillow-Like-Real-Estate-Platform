import api from './api';

export const savedSearchService = {
  // Get all saved searches
  getSavedSearches: async () => {
    const response = await api.get('/saved-searches');
    return response.data;
  },

  // Get single saved search
  getSavedSearch: async (id) => {
    const response = await api.get(`/saved-searches/${id}`);
    return response.data;
  },

  // Create saved search
  createSavedSearch: async (data) => {
    const response = await api.post('/saved-searches', data);
    return response.data;
  },

  // Update saved search
  updateSavedSearch: async (id, data) => {
    const response = await api.put(`/saved-searches/${id}`, data);
    return response.data;
  },

  // Delete saved search
  deleteSavedSearch: async (id) => {
    const response = await api.delete(`/saved-searches/${id}`);
    return response.data;
  },
};
