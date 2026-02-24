import api from './api';

const adminService = {
  // Dashboard
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  getAnalytics: async () => {
    const response = await api.get('/admin/analytics');
    return response.data;
  },

  // User Management
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  updateUser: async (id, data) => {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Property Management
  getProperties: async (params = {}) => {
    const response = await api.get('/admin/properties', { params });
    return response.data;
  },

  approveProperty: async (id) => {
    const response = await api.post(`/admin/properties/${id}/approve`);
    return response.data;
  },

  rejectProperty: async (id, reason) => {
    const response = await api.post(`/admin/properties/${id}/reject`, { reason });
    return response.data;
  },

  featureProperty: async (id) => {
    const response = await api.post(`/admin/properties/${id}/feature`);
    return response.data;
  },

  // Review Moderation
  getPendingReviews: async (params = {}) => {
    const response = await api.get('/admin/reviews/pending', { params });
    return response.data;
  },

  approveReview: async (id) => {
    const response = await api.post(`/admin/reviews/${id}/approve`);
    return response.data;
  },

  rejectReview: async (id) => {
    const response = await api.post(`/admin/reviews/${id}/reject`);
    return response.data;
  },

  // Location Management
  getLocations: async (params = {}) => {
    const response = await api.get('/admin/locations', { params });
    return response.data;
  },

  createLocation: async (payload) => {
    const response = await api.post('/admin/locations', payload);
    return response.data;
  },

  updateLocation: async (id, payload) => {
    const response = await api.put(`/admin/locations/${id}`, payload);
    return response.data;
  },

  deleteLocation: async (id) => {
    const response = await api.delete(`/admin/locations/${id}`);
    return response.data;
  },

  syncLocations: async () => {
    const response = await api.post('/admin/locations/sync');
    return response.data;
  },

  // Site & Email Settings
  getSettings: async () => {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  updateSiteSettings: async (payload) => {
    const response = await api.put('/admin/settings/site', payload);
    return response.data;
  },

  updateEmailSettings: async (payload) => {
    const response = await api.put('/admin/settings/email', payload);
    return response.data;
  },
};

export default adminService;
