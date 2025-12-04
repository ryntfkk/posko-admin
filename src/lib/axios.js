import axios from 'axios';

// Ambil URL dari env atau default ke localhost
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL,
  withCredentials: true, // PENTING: Agar cookie refresh token dikirim/diterima
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor Request: Pasang Access Token dari LocalStorage ke Header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor Response: Handle Token Expired (401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Jika error 401 (Unauthorized) dan belum pernah retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Panggil endpoint refresh token backend
        // Backend akan membaca cookie 'posko_refresh_token' secara otomatis karena withCredentials: true
        const { data } = await api.post('/auth/refresh-token');
        
        // Simpan token baru
        const newAccessToken = data.data.tokens.accessToken;
        localStorage.setItem('accessToken', newAccessToken);

        // Update header request yang gagal tadi dan ulangi
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Jika refresh gagal (token refresh juga expired/invalid), logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;