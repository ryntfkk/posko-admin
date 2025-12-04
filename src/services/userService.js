import api from '../lib/axios';

export const userService = {
  // Mengambil daftar user dengan pagination dan pencarian
  getAll: async (params) => {
    // Endpoint sesuai backend: /api/auth/users
    const response = await api.get('/auth/users', { params });
    return response.data;
  },

  // Mengubah status user (Active/Inactive)
  toggleStatus: async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    // Endpoint sesuai backend: /api/auth/users/:id/status
    const response = await api.patch(`/auth/users/${id}/status`, { status: newStatus });
    return response.data;
  },

  // Update Data User (Admin)
  update: async (id, data) => {
    const response = await api.put(`/auth/users/${id}`, data);
    return response.data;
  }
};