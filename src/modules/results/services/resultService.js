import { apiClient } from '../../../services/apiClient.js'

export const resultService = {
  list: () => apiClient.get('/results'),
  create: (payload) => apiClient.post('/results', payload),
}
