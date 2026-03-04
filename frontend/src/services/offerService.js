import api from './api';

export const offerService = {
  getOffers: async (params = {}) => {
    const response = await api.get('/agent/offers', { params });
    return response.data;
  },

  getOffer: async (id) => {
    const response = await api.get(`/agent/offers/${id}`);
    return response.data;
  },

  createOffer: async (data) => {
    const response = await api.post('/agent/offers', data);
    return response.data;
  },

  updateOffer: async (id, data) => {
    const response = await api.put(`/agent/offers/${id}`, data);
    return response.data;
  },

  deleteOffer: async (id) => {
    const response = await api.delete(`/agent/offers/${id}`);
    return response.data;
  },
};
