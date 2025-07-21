import { apiClient } from '../../infrastructure/api/apiClient';

export const invoiceService = {
  getAll: async () => apiClient.get('/invoices'),
  getById: async (id) => apiClient.get(`/invoices/${id}`),
  create: async (data) => apiClient.post('/invoices', data),
  update: async (id, data) => apiClient.put(`/invoices/${id}`, data),
  remove: async (id) => apiClient.delete(`/invoices/${id}`),
  getInvoicesWithPagination: async (page, limit, filters) =>
    apiClient.get('/invoices', { params: { page, limit, ...filters } }),
}; 