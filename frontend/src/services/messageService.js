import api from './api';

const messageService = {
  // Send a message
  sendMessage: async (data) => {
    const response = await api.post('/messages', data);
    return response.data;
  },

  // Get user's messages
  getMessages: async (params = {}) => {
    const response = await api.get('/messages', { params });
    return response.data;
  },

  // Get a single message with thread
  getMessage: async (id) => {
    const response = await api.get(`/messages/${id}`);
    return response.data;
  },

  // Reply to a message
  reply: async (id, data) => {
    const response = await api.post(`/messages/${id}/reply`, data);
    return response.data;
  },

  // Request a tour
  requestTour: async (data) => {
    const response = await api.post('/messages/tour-request', data);
    return response.data;
  },

  // Mark message as read
  markAsRead: async (id) => {
    const response = await api.post(`/messages/${id}/read`);
    return response.data;
  },
};

export default messageService;
