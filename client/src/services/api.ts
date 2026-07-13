import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export const authApi = {
  register: (data: { name: string; email: string; password: string }) => api.post('/api/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/api/auth/login', data),
  me: () => api.get('/api/auth/me')
};

export const workspaceApi = {
  create: (name: string) => api.post('/api/workspaces', { name }),
  join: (inviteCode: string) => api.post('/api/workspaces/join', { inviteCode }),
  get: (id: string) => api.get(`/api/workspaces/${id}`),
  updateSettings: (id: string, data: { slackWebhookUrl?: string; notificationEmail?: string }) =>
    api.put(`/api/workspaces/${id}/settings`, data)
};

export const standupApi = {
  submit: (data: { did: string; doing: string; blockers?: string; date?: string }) => api.post('/api/standups', data),
  today: () => api.get('/api/standups/today'),
  workspace: () => api.get('/api/standups/workspace'),
  history: () => api.get('/api/standups/history')
};

export const digestApi = {
  generate: () => api.post('/api/digests/generate'),
  list: () => api.get('/api/digests'),
  send: (digestId: string, via: 'slack' | 'email' | 'both') => api.post('/api/digests/send', { digestId, via })
};
