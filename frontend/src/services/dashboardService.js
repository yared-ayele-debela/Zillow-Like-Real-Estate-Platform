import api from './api';

const dashboardService = {
  getDashboard: async () => {
    const response = await api.get('/agent/dashboard');
    return response.data;
  },
};

export default dashboardService;
