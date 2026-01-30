import axios, { AxiosError } from 'axios';

// API base URL - environment variable ile yapılandırılabilir
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Axios instance oluştur
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 saniye timeout
});

// Request interceptor - her istekte token ekle
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - hataları yakala
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Genel hata mesajları
    if (error.response) {
      // Server yanıt verdi ama hata kodu döndü
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // İstek gönderildi ama yanıt alınamadı
      console.error('Network Error:', error.message);
    } else {
      // İstek oluşturulurken hata
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
