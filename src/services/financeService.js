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
  },
  
  // [BARU] Pembayaran (Transaksi Masuk)
  getAllPayments: async (params) => {
    const response = await api.get('/payments/all', { params });
    return response.data;
  },

  // [BARU] Pencairan (Uang Keluar ke Mitra)
  getAllEarnings: async (params) => {
    const response = await api.get('/earnings/all', { params });
    return response.data;
  },
  processPayout: async (id) => {
    const response = await api.patch(`/earnings/${id}/payout`);
    return response.data;
  }
};