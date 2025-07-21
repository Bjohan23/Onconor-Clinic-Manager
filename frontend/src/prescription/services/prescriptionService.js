import { apiClient } from '../../infrastructure/api/apiClient';

export const prescriptionService = {
  getAll: async () => apiClient.get('/prescriptions'),
  getById: async (id) => apiClient.get(`/prescriptions/${id}`),
  create: async (data) => apiClient.post('/prescriptions', data),
  update: async (id, data) => apiClient.put(`/prescriptions/${id}`, data),
  remove: async (id) => apiClient.delete(`/prescriptions/${id}`),
  getPrescriptionsWithPagination: async (page, limit, filters) =>
    apiClient.get('/prescriptions', { params: { page, limit, ...filters } }),
}; 