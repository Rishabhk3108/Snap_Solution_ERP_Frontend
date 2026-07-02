import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : '/api',
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const detail: string = err.response?.data?.detail ?? '';
      // Only force-logout when the token itself is missing or invalid.
      // A 401 due to insufficient role ("Role can't access this api") should
      // NOT log the user out — React Query will simply surface the error.
      const isTokenError =
        detail.includes('No token provided') ||
        detail.includes('Wrong access token') ||
        detail.includes('Token expired') ||
        detail === 'Forbidden';

      if (isTokenError) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default client;
