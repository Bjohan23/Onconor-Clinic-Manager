import { apiClient } from '../../infrastructure/api/apiClient';

export const treatmentService = {
  getAll: async () => apiClient.get('/treatments'),
  getById: async (id) => apiClient.get(`/treatments/${id}`),
  create: async (data) => apiClient.post('/treatments', data),
  update: async (id, data) => apiClient.put(`/treatments/${id}`, data),
  remove: async (id) => apiClient.delete(`/treatments/${id}`),
  getTreatmentsWithPagination: async (page, limit, filters) =>
    apiClient.get('/treatments', { params: { page, limit, ...filters } }),
}; 