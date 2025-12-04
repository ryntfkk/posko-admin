import api from '../lib/axios';

export const financeService = {
  getPlatformStats: async () => {
    const response = await api.get('/earnings/platform-stats');
    return response.data;
  },
  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },
  updateSettings: async (data) => {
    const response = await api.put('/settings', data);
    return response.data;
  }
};