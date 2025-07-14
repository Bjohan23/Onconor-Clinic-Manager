import { apiClient } from '../../infrastructure/api/apiClient';

export const paymentService = {
  getAll: async () => apiClient.get('/payments'),
  getById: async (id) => apiClient.get(`/payments/${id}`),
  create: async (data) => apiClient.post('/payments', data),
  update: async (id, data) => apiClient.put(`/payments/${id}`, data),
  remove: async (id) => apiClient.delete(`/payments/${id}`),
}; 