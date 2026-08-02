import { apiClient } from './apiClient.js'

export const authApi = {
  login: (payload) => apiClient.post('/auth/login', payload),
  refresh: (refreshToken) => apiClient.post('/auth/refresh', { refreshToken }),
  register: (payload) => apiClient.post('/auth/register', payload),
  activateValidate: (payload) => apiClient.post('/auth/activate/validate', payload),
  activateComplete: (payload) => apiClient.post('/auth/activate/complete', payload),
}
