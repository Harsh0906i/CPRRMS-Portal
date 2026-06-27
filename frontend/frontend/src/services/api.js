import axios from 'axios';
import { store } from '../store';
import { logout, setToken } from '../features/authSlice';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Send cookies (refresh token) with requests
});

// Request Interceptor: Attach access token if present
api.interceptors.request.use(
  config => {
    const state = store.getState();
    const token = state.auth.token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle token refresh on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // If request fails with 401 and it hasn't been retried yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      
      // If we are already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token using cookie-based refresh endpoint
        const response = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        const newToken = response.data.token;

        // Save new token in Redux store
        store.dispatch(setToken(newToken));

        // Resolve queued requests
        processQueue(null, newToken);
        isRefreshing = false;

        // Retry the original request
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token is expired or invalid; log user out
        processQueue(refreshError, null);
        isRefreshing = false;
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }

    // Pass along other errors
    return Promise.reject(error);
  }
);

export default api;
