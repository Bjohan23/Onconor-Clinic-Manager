import { apiClient } from '../../infrastructure/api/apiClient'

export const userService = {
  // Obtener todos los usuarios activos
  getActiveUsers: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.search) params.append('search', filters.search)
    if (filters.role) params.append('role', filters.role)
    if (filters.status) params.append('status', filters.status)
    
    const queryString = params.toString()
    const url = queryString ? `/users/active?${queryString}` : '/users/active'
    
    return apiClient.get(url)
  },

  // Obtener usuarios con paginación
  getUsersWithPagination: async (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })
    
    if (filters.search) params.append('search', filters.search)
    if (filters.role) params.append('role', filters.role)
    if (filters.status) params.append('status', filters.status)
    
    return apiClient.get(`/users/paginated?${params.toString()}`)
  },

  // Obtener usuario por ID
  getUserById: async (id) => {
    return apiClient.get(`/users/${id}`)
  },

  // Obtener usuario por email
  getUserByEmail: async (email) => {
    return apiClient.get(`/users/email/${email}`)
  },

  // Crear nuevo usuario
  createUser: async (userData) => {
    return apiClient.post('/users', userData)
  },

  // Actualizar usuario
  updateUser: async (id, userData) => {
    return apiClient.put(`/users/${id}`, userData)
  },

  // Actualizar perfil del usuario actual
  updateProfile: async (userData) => {
    return apiClient.put('/users/profile', userData)
  },

  // Cambiar contraseña
  changePassword: async (passwordData) => {
    return apiClient.put('/users/change-password', passwordData)
  },

  // Desactivar usuario (soft delete)
  deactivateUser: async (id) => {
    return apiClient.delete(`/users/${id}`)
  },

  // Activar usuario
  activateUser: async (id) => {
    return apiClient.patch(`/users/${id}/activate`)
  },

  // Buscar usuarios
  searchUsers: async (searchParams) => {
    const params = new URLSearchParams()
    
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value)
      }
    })
    
    return apiClient.get(`/users/search?${params.toString()}`)
  },

  // Obtener estadísticas de usuarios
  getUserStats: async () => {
    return apiClient.get('/users/stats')
  },

  // Verificar disponibilidad de email
  checkEmailAvailability: async (email, excludeId = null) => {
    const params = new URLSearchParams()
    if (excludeId) params.append('excludeId', excludeId)
    
    const queryString = params.toString()
    const url = queryString 
      ? `/users/check-email/${email}?${queryString}` 
      : `/users/check-email/${email}`
    
    return apiClient.get(url)
  },

  // Obtener usuarios por rol
  getUsersByRole: async (role) => {
    return apiClient.get(`/users/role/${role}`)
  },

  // Asignar rol a usuario
  assignRole: async (userId, role) => {
    return apiClient.patch(`/users/${userId}/role`, { role })
  },

  // Obtener permisos del usuario
  getUserPermissions: async (userId) => {
    return apiClient.get(`/users/${userId}/permissions`)
  },

  // Actualizar permisos del usuario
  updateUserPermissions: async (userId, permissions) => {
    return apiClient.put(`/users/${userId}/permissions`, { permissions })
  },

  // Restablecer contraseña (admin)
  resetUserPassword: async (userId) => {
    return apiClient.post(`/users/${userId}/reset-password`)
  },

  // Obtener historial de actividad del usuario
  getUserActivity: async (userId, page = 1, limit = 20) => {
    return apiClient.get(`/users/${userId}/activity?page=${page}&limit=${limit}`)
  },

  // Bloquear usuario temporalmente
  blockUser: async (userId, reason, duration) => {
    return apiClient.patch(`/users/${userId}/block`, { reason, duration })
  },

  // Desbloquear usuario
  unblockUser: async (userId) => {
    return apiClient.patch(`/users/${userId}/unblock`)
  },

  // Exportar usuarios a Excel/CSV
  exportUsers: async (format = 'excel', filters = {}) => {
    const params = new URLSearchParams({ format })
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value)
      }
    })
    
    return apiClient.get(`/users/export?${params.toString()}`, {
      responseType: 'blob'
    })
  }
}