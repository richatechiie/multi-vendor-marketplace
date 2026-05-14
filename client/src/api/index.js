import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Attach token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto logout on 401
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post("/auth/register", data),
  login: (data) => API.post("/auth/login", data),
  logout: () => API.post("/auth/logout"),
  me: () => API.get("/auth/me"),
  refresh: (refreshToken) => API.post("/auth/refresh", { refreshToken }),
};

// ── Products ──────────────────────────────────────────────────────────────────
export const productAPI = {
  list: (params) => API.get("/products", { params }),
  detail: (slug) => API.get(`/products/${slug}`),
  myProducts: (params) => API.get("/products/vendor/my", { params }),
  create: (data) => API.post("/products/vendor/create", data),
  update: (uuid, data) => API.put(`/products/vendor/${uuid}`, data),
  delete: (uuid) => API.delete(`/products/vendor/${uuid}`),
};

// ── Categories ────────────────────────────────────────────────────────────────
export const categoryAPI = {
  list: () => API.get("/categories"),
  create: (data) => API.post("/categories", data),
  update: (id, data) => API.put(`/categories/${id}`, data),
  delete: (id) => API.delete(`/categories/${id}`),
};

// ── Orders ────────────────────────────────────────────────────────────────────
export const orderAPI = {
  place: (data) => API.post("/orders", data),
  myOrders: (params) => API.get("/orders", { params }),
  detail: (uuid) => API.get(`/orders/${uuid}`),
  cancel: (uuid) => API.put(`/orders/${uuid}/cancel`),
};

// ── Vendor ────────────────────────────────────────────────────────────────────
export const vendorAPI = {
  profile: () => API.get("/vendor/profile"),
  updateProfile: (data) => API.put("/vendor/profile", data),
  dashboard: () => API.get("/vendor/dashboard"),
  orders: (params) => API.get("/vendor/orders", { params }),
  updateOrder: (id, data) => API.put(`/vendor/orders/${id}/status`, data),
  analytics: (params) => API.get("/vendor/analytics", { params }),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminAPI = {
  vendors: (params) => API.get("/admin/vendors", { params }),
  approveVendor: (id) => API.put(`/admin/vendors/${id}/approve`),
  rejectVendor: (id, data) => API.put(`/admin/vendors/${id}/reject`, data),
  suspendVendor: (id) => API.put(`/admin/vendors/${id}/suspend`),
  setCommission: (id, data) => API.put(`/admin/vendors/${id}/commission`, data),
  orders: (params) => API.get("/admin/orders", { params }),
  updateOrder: (uuid, data) => API.put(`/admin/orders/${uuid}/status`, data),
  commissions: (params) => API.get("/admin/commissions", { params }),
  markPaid: (id) => API.put(`/admin/commissions/${id}/pay`),
  analytics: () => API.get("/admin/analytics"),
  users: (params) => API.get("/admin/users", { params }),
  toggleUser: (id) => API.put(`/admin/users/${id}/toggle`),
};

export default API;
