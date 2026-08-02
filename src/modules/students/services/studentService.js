import { apiClient } from '../../../services/apiClient.js'

export const studentService = {
  list: () => apiClient.get('/students'),
  create: (payload) => apiClient.post('/students', payload),
}
