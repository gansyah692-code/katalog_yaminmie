const API_BASE = '/api';

// Token Management
export const getAuthToken = () => localStorage.getItem('katalogwa_token');
export const setAuthToken = (token) => localStorage.setItem('katalogwa_token', token);
export const cleanAuthToken = () => localStorage.removeItem('katalogwa_token');
export const isAuthenticated = () => !!getAuthToken();

// Auth Headers
const getHeaders = (isFormData = false) => {
  const token = getAuthToken();
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

// Error Handler
const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }
  return data;
};

// Store Settings
export const fetchStoreSettings = async () => {
  const res = await fetch(`${API_BASE}/store`);
  return handleResponse(res);
};

export const updateStoreSettings = async (settings) => {
  const isFormData = settings instanceof FormData;
  const res = await fetch(`${API_BASE}/store`, {
    method: 'PUT',
    headers: getHeaders(isFormData),
    body: isFormData ? settings : JSON.stringify(settings)
  });
  return handleResponse(res);
};

// Categories
export const fetchCategories = async () => {
  const res = await fetch(`${API_BASE}/categories`);
  return handleResponse(res);
};

export const createCategory = async (name) => {
  const res = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ name })
  });
  return handleResponse(res);
};

export const updateCategory = async (id, payload) => {
  const isFormData = payload instanceof FormData;
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: 'PUT',
    headers: getHeaders(isFormData),
    body: isFormData ? payload : JSON.stringify({ name: payload })
  });
  return handleResponse(res);
};

export const deleteCategory = async (id) => {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return handleResponse(res);
};

// Products
export const fetchProducts = async ({ categoryId = '', search = '' } = {}) => {
  const params = new URLSearchParams();
  if (categoryId) params.append('categoryId', categoryId);
  if (search) params.append('search', search);

  const url = `${API_BASE}/products${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url);
  return handleResponse(res);
};

export const createProduct = async (formData) => {
  const isFormData = formData instanceof FormData;
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: getHeaders(isFormData),
    body: isFormData ? formData : JSON.stringify(formData)
  });
  return handleResponse(res);
};

export const updateProduct = async (id, formData) => {
  const isFormData = formData instanceof FormData;
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: getHeaders(isFormData),
    body: isFormData ? formData : JSON.stringify(formData)
  });
  return handleResponse(res);
};

export const toggleProductStock = async (id) => {
  const res = await fetch(`${API_BASE}/products/${id}/stock`, {
    method: 'PATCH',
    headers: getHeaders()
  });
  return handleResponse(res);
};

export const deleteProduct = async (id) => {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return handleResponse(res);
};

// Auth
export const loginAdmin = async (email, password) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return handleResponse(res);
};

export const fetchAdminProfile = async () => {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getHeaders()
  });
  return handleResponse(res);
};

export const updateAdminProfile = async (profile) => {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(profile)
  });
  return handleResponse(res);
};

export const createOrder = async (order) => {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order)
  });
  return handleResponse(res);
};

export const fetchAdminOrders = async (status) => {
  const params = status ? `?status=${encodeURIComponent(status)}` : '';
  const res = await fetch(`${API_BASE}/orders/admin${params}`, {
    headers: getHeaders()
  });
  return handleResponse(res);
};

export const confirmOrder = async (id) => {
  const res = await fetch(`${API_BASE}/orders/admin/${encodeURIComponent(id)}/confirm`, {
    method: 'PATCH',
    headers: getHeaders()
  });
  return handleResponse(res);
};

export const deleteConfirmedOrder = async (id) => {
  const res = await fetch(`${API_BASE}/orders/admin/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (res.status === 404) {
    throw new Error('Endpoint hapus riwayat belum tersedia. Restart backend dari folder server, lalu coba lagi.');
  }
  return handleResponse(res);
};

export const fetchOrderStatus = async (trackingToken) => {
  const res = await fetch(`${API_BASE}/orders/track/${encodeURIComponent(trackingToken)}`);
  return handleResponse(res);
};
