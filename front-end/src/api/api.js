import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL,
  withCredentials: true,
});

/**
 * Normalize API error to a consistent shape for the UI.
 * @param {import('axios').AxiosError} err
 * @returns {{ message: string, code?: string, status?: number }}
 */
export function normalizeApiError(err) {
  const data = err.response?.data;
  const message =
    data?.message ||
    (typeof data?.error === 'string' ? data.error : null) ||
    err.message ||
    'Request failed';
  return {
    message,
    code: data?.code,
    status: err.response?.status,
  };
}

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
      if (originalRequest.url?.includes('/users/refresh-token')) {
        const normalized = normalizeApiError(err);
        return Promise.reject(normalized);
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
        .post('/users/refresh-token')
        .then((res) => {
          processQueue(null, res.data);
          return api(originalRequest);
        })
        .catch((refreshErr) => {
          processQueue(refreshErr, null);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth:sessionExpired'));
          }
          const normalized = normalizeApiError(refreshErr);
          return Promise.reject(normalized);
        })
        .finally(() => {
          isRefreshing = false;
        });
    }

    const normalized = normalizeApiError(err);
    return Promise.reject(normalized);
  }
);

export const authApi = {
  login: (data) => api.post('/users/login', data),
  logout: () => api.post('/users/logout'),
  register: (data) =>
    api.post('/users/register', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getCurrentUser: () => api.get('/users/current-user'),
  refreshToken: () => api.post('/users/refresh-token'),
  getUserProfile: (userId) => api.get(`/users/profile/${userId}`),
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
  isSubscribed: (channelId) => api.get(`/subscriptions/isSubscribed/${channelId}`),
  getSubscribedChannels: () => api.get('/subscriptions/subscribed'),
  getChannelSubscribers: (channelId) => api.get(`/subscriptions/subscribers/${channelId}`),
};

export const channelApi = {
  searchChannels: (query) => api.get('/users/search', { params: { query } }),
  getChannelProfileByUsername: (username) => api.get(`/users/c/${username}`),
  getChannelVideos: (channelId, params = {}) =>
    api.get(`/videos/channel/${channelId}`, { params }),
};

export default api;
