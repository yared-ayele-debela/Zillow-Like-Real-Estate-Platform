import api from './api';

export const reviewService = {
  // Get reviews for property or agent
  getReviews: async (params = {}) => {
    const response = await api.get('/reviews', { params });
    return response.data;
  },

  // Create review
  createReview: async (data) => {
    const response = await api.post('/reviews', data);
    return response.data;
  },

  // Update review
  updateReview: async (id, data) => {
    const response = await api.put(`/reviews/${id}`, data);
    return response.data;
  },

  // Delete review
  deleteReview: async (id) => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  },

  // Admin: Approve review
  approveReview: async (id) => {
    const response = await api.post(`/reviews/${id}/approve`);
    return response.data;
  },

  // Admin: Reject review
  rejectReview: async (id) => {
    const response = await api.post(`/reviews/${id}/reject`);
    return response.data;
  },
};
