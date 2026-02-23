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
};

export default adminService;
