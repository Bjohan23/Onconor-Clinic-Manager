import { apiClient } from '../../infrastructure/api/apiClient';

export const medicalExamService = {
  getAll: async () => apiClient.get('/medical-exams'),
  getById: async (id) => apiClient.get(`/medical-exams/${id}`),
  create: async (data) => apiClient.post('/medical-exams', data),
  update: async (id, data) => apiClient.put(`/medical-exams/${id}`, data),
  remove: async (id) => apiClient.delete(`/medical-exams/${id}`),
}; 