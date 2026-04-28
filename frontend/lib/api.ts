import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  signup: (email: string, password: string, fullName: string) =>
    api.post('/auth/signup', { email, password, fullName }),
  vendorSignup: (email: string, password: string, fullName: string, shopName: string) =>
    api.post('/auth/vendor-signup', { email, password, fullName, shopName }),
  getProfile: () => api.get('/auth/profile'),
  logout: () => api.post('/auth/logout'),
};

// Products API
export const productsAPI = {
  getAll: (filters?: any) => api.get('/products', { params: filters }),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  search: (query: string) => api.get('/products/search', { params: { q: query } }),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addItem: (productId: string, quantity: number) =>
    api.post('/cart/items', { productId, quantity }),
  updateItem: (itemId: string, quantity: number) =>
    api.put(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId: string) => api.delete(`/cart/items/${itemId}`),
  clearCart: () => api.delete('/cart'),
};

// Orders API
export const ordersAPI = {
  getAll: () => api.get('/orders'),
  getById: (id: string) => api.get(`/orders/${id}`),
  create: (data: any) => api.post('/orders', data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/orders/${id}/status`, { status }),
};

// Vendors API
export const vendorsAPI = {
  getById: (id: string) => api.get(`/vendors/${id}`),
  getProducts: (vendorId: string) =>
    api.get(`/vendors/${vendorId}/products`),
  updateProfile: (data: any) => api.put('/vendors/profile', data),
  getDashboard: () => api.get('/vendors/dashboard'),
};

// Reviews API
export const reviewsAPI = {
  getByProduct: (productId: string) =>
    api.get(`/reviews/product/${productId}`),
  create: (productId: string, data: any) =>
    api.post(`/reviews/product/${productId}`, data),
  update: (id: string, data: any) => api.put(`/reviews/${id}`, data),
  delete: (id: string) => api.delete(`/reviews/${id}`),
};

export default api;
