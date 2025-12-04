import api from '../lib/axios';

export const providerService = {
  // Get List dengan filter
  getAll: async (params) => {
    const response = await api.get('/providers', { params });
    return response.data;
  },

  // Get Detail
  getById: async (id) => {
    const response = await api.get(`/providers/${id}`);
    return response.data;
  },

  // Approve/Reject (Memanggil Endpoint Baru)
  verify: async (id, status, rejectionReason = '') => {
    const response = await api.put(`/providers/${id}/verify`, { status, rejectionReason });
    return response.data;
  }
};