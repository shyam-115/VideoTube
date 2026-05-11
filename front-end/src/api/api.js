import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Normalize an axios error into a consistent shape for the UI
export function normalizeApiError(err) {
  const data = err.response?.data;
  const message =
    data?.message ||
    (typeof data?.error === 'string' ? data.error : null) ||
    err.message ||
    'Request failed';
  return { message, status: err.response?.status };
}

// Automatically try to refresh the access token on 401, then retry the original request.
// If the refresh itself fails, dispatch a session-expired event so the UI can log the user out.
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      // Don't retry auth endpoints — a 401 here means bad credentials, not an expired session
      const skipRetryUrls = ['/auth/refresh-token', '/auth/login', '/auth/register', '/auth/send-otp'];
      if (skipRetryUrls.some((url) => originalRequest.url?.includes(url))) {
        return Promise.reject(normalizeApiError(err));
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((e) => Promise.reject(normalizeApiError(e)));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return api
        .post('/auth/refresh-token')
        .then((res) => {
          processQueue(null, res.data);
          return api(originalRequest);
        })
        .catch((refreshErr) => {
          processQueue(refreshErr, null);
          window.dispatchEvent(new CustomEvent('auth:sessionExpired'));
          return Promise.reject(normalizeApiError(refreshErr));
        })
        .finally(() => {
          isRefreshing = false;
        });
    }

    return Promise.reject(normalizeApiError(err));
  }
);

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  sendOtp: (data) => api.post('/auth/send-otp', data),
  register: (data) =>
    api.post('/auth/register', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getCurrentUser: () => api.get('/users/current-user'),
  refreshToken: () => api.post('/auth/refresh-token'),
  updateDetails: (data) => api.patch('/users/update-details', data),
  updateAvatar: (data) =>
    api.patch('/users/avatar', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateCoverImage: (data) =>
    api.patch('/users/cover-image', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const videoApi = {
  uploadVideo: (data) =>
    api.post('/videos/upload', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAllVideos: (params = {}) => api.get('/videos', { params }),
  searchVideos: (query, params = {}) => api.get('/videos', { params: { query, ...params } }),
  getVideoById: (id) => api.get(`/videos/${id}`),
  toggleLike: (id, type) => api.post(`/likes/${id}`, { type }),
  getLikesCount: (id) => api.get(`/likes/${id}/count`),
  getUserReaction: (id) => api.get(`/likes/status/${id}`),
};

export const subscriptionApi = {
  subscribe: (channelId) => api.post(`/subscriptions/${channelId}`),
  unsubscribe: (channelId) => api.delete(`/subscriptions/${channelId}`),
  getSubscriberCount: (channelId) => api.get(`/subscriptions/count/${channelId}`),
  isSubscribed: (channelId) => api.get(`/subscriptions/status/${channelId}`),
  getSubscribedChannels: () => api.get('/subscriptions/list'),
};

export const channelApi = {
  searchChannels: (query) => api.get('/users/search', { params: { query } }),
  getChannelProfileByUsername: (username) => api.get(`/users/c/${username}`),
  getChannelVideos: (channelId, params = {}) => api.get(`/videos/channel/${channelId}`, { params }),
};

export default api;
