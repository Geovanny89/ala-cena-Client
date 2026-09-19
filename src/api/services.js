import api from './axios';

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

export const pizzaFlavorService = {
  getAll: () => api.get('/pizza-flavors'),
  create: (data) => api.post('/pizza-flavors', data),
  update: (id, data) => api.put(`/pizza-flavors/${id}`, data),
  remove: (id) => api.delete(`/pizza-flavors/${id}`),
};

export const sodaFlavorService = {
  getAll: () => api.get('/soda-flavors'),
  create: (data) => api.post('/soda-flavors', data),
  update: (id, data) => api.put(`/soda-flavors/${id}`, data),
  remove: (id) => api.delete(`/soda-flavors/${id}`),
};

export const comboService = {
  getAll: (all = false) => api.get(`/combos${all ? '?all=true' : ''}`),
  getOne: (id) => api.get(`/combos/${id}`),
  create: (data) => api.post('/combos', data),
  update: (id, data) => api.put(`/combos/${id}`, data),
  remove: (id) => api.delete(`/combos/${id}`),
};

export const orderService = {
  getAll: () => api.get('/orders'),
  create: (data) => api.post('/orders', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  uploadReceipt: (id, formData) => api.patch(`/orders/${id}/receipt`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getMetrics: () => api.get('/orders/metrics'),
};
