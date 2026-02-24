import api from './api';

export const agentService = {
  getAgentDetail: async (id, params = {}) => {
    const response = await api.get(`/agents/${id}`, { params });
    return response.data;
  },
};

