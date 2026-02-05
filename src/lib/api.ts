const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('auth_token');
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('auth_token');
    if (!window.location.pathname.includes('/auth')) {
      window.location.href = '/auth';
    }
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Erro na requisição');
  }

  return data;
}

export const api = {
  get: (endpoint: string) => apiFetch(endpoint, { method: 'GET' }),
  post: (endpoint: string, body: any) => apiFetch(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint: string, body: any) => apiFetch(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint: string) => apiFetch(endpoint, { method: 'DELETE' }),
  
  // Auth specific
  login: (credentials: any) => apiFetch('/login', { method: 'POST', body: JSON.stringify(credentials) }),
  logout: () => apiFetch('/logout', { method: 'POST' }),
  me: () => apiFetch('/me', { method: 'GET' }),
};
