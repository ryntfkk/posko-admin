import api from '../lib/axios';

export const voucherService = {
  getAll: async () => {
    const response = await api.get('/vouchers/all'); // Endpoint baru
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/vouchers', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/vouchers/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/vouchers/${id}`);
    return response.data;
  }
};