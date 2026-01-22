import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

export const userAPI = {
  getAll: (page, search) => api.get('/users', { params: { page, search } }),
  getAllActive: () => api.get('/users/allActive'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  toggleStatus: (id) => api.patch(`/users/${id}/toggle-status`)
};

export const postAPI = {
  getAll: (page, search) => api.get('/posts', { params: { page, search } }),
  getAllActive: () => api.get('/posts/allActive'),
  getById: (id) => api.get(`/posts/${id}`),
  create: (data) => api.post('/posts', data),
  update: (id, data) => api.put(`/posts/${id}`, data),
  delete: (id) => api.delete(`/posts/${id}`),
  toggleStatus: (id) => api.patch(`/posts/${id}/toggle-status`)
};

export const commentAPI = {
  getAll: (page, search, postId) => api.get('/comments', { params: { page, search, postId } }),
  getById: (id) => api.get(`/comments/${id}`),
  create: (data) => api.post('/comments', data),
  update: (id, data) => api.put(`/comments/${id}`, data),
  delete: (id) => api.delete(`/comments/${id}`),
  toggleStatus: (id) => api.patch(`/comments/${id}/toggle-status`)
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard')
};

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  refresh: (data) => api.post('/auth/refresh', data),
  logout: (data) => api.post('/auth/logout', data),
  getLoggedInUsers: () => api.get('/auth/logged-in'),
  getAllAuthUsers: () => api.get('/auth/all'),
  changePassword: (data) => api.post('/auth/change-password', data),
  updateAuthUser: (userId, data) => api.put(`/auth/user/${userId}`, data)
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await authAPI.refresh({ refreshToken });
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
          return api(originalRequest);
        } catch (err) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/';
          return Promise.reject(err);
        }
      }
    }
    return Promise.reject(error);
  }
);
