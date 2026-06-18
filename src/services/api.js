const BASE_URL = 'http://localhost:8000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Token ${token}` } : {}),
  };
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.detail || data.error || Object.values(data)[0] || 'Request failed';
    throw new Error(Array.isArray(msg) ? msg[0] : msg);
  }
  return data;
};

export const api = {
  // Auth
  register: (data) =>
    fetch(`${BASE_URL}/auth/register/`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  login: (data) =>
    fetch(`${BASE_URL}/auth/login/`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  logout: () =>
    fetch(`${BASE_URL}/auth/logout/`, { method: 'POST', headers: getHeaders() }).then(handleResponse),
  me: () =>
    fetch(`${BASE_URL}/auth/me/`, { headers: getHeaders() }).then(handleResponse),

  // Books
  getBooks: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetch(`${BASE_URL}/books/?${q}`, { headers: getHeaders() }).then(handleResponse);
  },
  getBook: (id) => fetch(`${BASE_URL}/books/${id}/`, { headers: getHeaders() }).then(handleResponse),
  createBook: (data) =>
    fetch(`${BASE_URL}/books/`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  updateBook: (id, data) =>
    fetch(`${BASE_URL}/books/${id}/`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  deleteBook: (id) =>
    fetch(`${BASE_URL}/books/${id}/`, { method: 'DELETE', headers: getHeaders() }).then(() => ({})),

  // Categories
  getCategories: () => fetch(`${BASE_URL}/categories/`, { headers: getHeaders() }).then(handleResponse),
  createCategory: (data) =>
    fetch(`${BASE_URL}/categories/`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  updateCategory: (id, data) =>
    fetch(`${BASE_URL}/categories/${id}/`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  deleteCategory: (id) =>
    fetch(`${BASE_URL}/categories/${id}/`, { method: 'DELETE', headers: getHeaders() }).then(() => ({})),

  // Borrows
  getBorrows: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetch(`${BASE_URL}/borrows/?${q}`, { headers: getHeaders() }).then(handleResponse);
  },
  borrowBook: (bookId) =>
    fetch(`${BASE_URL}/borrows/`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ book: bookId }) }).then(handleResponse),
  returnBook: (recordId) =>
    fetch(`${BASE_URL}/borrows/${recordId}/return_book/`, { method: 'POST', headers: getHeaders() }).then(handleResponse),
  myBooks: () =>
    fetch(`${BASE_URL}/borrows/my_books/`, { headers: getHeaders() }).then(handleResponse),

  // Users
  getUsers: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetch(`${BASE_URL}/users/?${q}`, { headers: getHeaders() }).then(handleResponse);
  },
  updateUser: (id, data) =>
    fetch(`${BASE_URL}/users/${id}/`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  deleteUser: (id) =>
    fetch(`${BASE_URL}/users/${id}/`, { method: 'DELETE', headers: getHeaders() }).then(() => ({})),

  // Fines
  getFines: () => fetch(`${BASE_URL}/fines/`, { headers: getHeaders() }).then(handleResponse),
  createFine: (data) =>
    fetch(`${BASE_URL}/fines/`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  updateFine: (id, data) =>
    fetch(`${BASE_URL}/fines/${id}/`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
};
