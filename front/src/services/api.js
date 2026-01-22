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
