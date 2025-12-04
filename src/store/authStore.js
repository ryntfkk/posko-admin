import { create } from 'zustand';
import { authService } from '../services/authService';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authService.login(email, password);
      const { profile, tokens } = res.data;

      // VALIDASI ROLE: Hanya Admin yang boleh masuk
      if (profile.activeRole !== 'admin' && !profile.roles.includes('admin')) {
        throw new Error('Akses ditolak. Akun ini bukan Admin.');
      }

      // Simpan data
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('user', JSON.stringify(profile));

      set({ user: profile, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login gagal';
      set({ error: message, isLoading: false });
      throw new Error(message); // Lempar error agar bisa ditangkap UI
    }
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, isAuthenticated: false });
  },
}));