import { apiClient } from '../../infrastructure/api/apiClient';

export const medicalRecordService = {
  getAll: async () => apiClient.get('/medical-records'),
  getById: async (id) => apiClient.get(`/medical-records/${id}`),
  create: async (data) => apiClient.post('/medical-records', data),
  update: async (id, data) => apiClient.put(`/medical-records/${id}`, data),
  remove: async (id) => apiClient.delete(`/medical-records/${id}`),
}; 