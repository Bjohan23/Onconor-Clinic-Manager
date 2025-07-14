import { apiClient } from '../../infrastructure/api/apiClient'

export const authService = {
  // Login de usuario
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials)
      return response
    } catch (error) {
      throw error
    }
  },

  // Registro de usuario
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData)
      return response
    } catch (error) {
      throw error
    }
  },

  // Logout
  logout: async () => {
    try {
      const response = await apiClient.post('/auth/logout')
      return response
    } catch (error) {
      // No es crítico si falla el logout del servidor
      console.warn('Error en logout del servidor:', error)
      return { success: true }
    }
  },

  // Verificar token
  verifyToken: async () => {
    try {
      const response = await apiClient.get('/auth/verify')
      return response
    } catch (error) {
      throw error
    }
  },

  // Refrescar token
  refreshToken: async () => {
    try {
      const response = await apiClient.post('/auth/refresh')
      return response
    } catch (error) {
      throw error
    }
  },

  // Cambiar contraseña
  changePassword: async (passwordData) => {
    try {
      const response = await apiClient.put('/auth/change-password', passwordData)
      return response
    } catch (error) {
      throw error
    }
  },

  // Solicitar reset de contraseña
  requestPasswordReset: async (email) => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email })
      return response
    } catch (error) {
      throw error
    }
  },

  // Reset de contraseña
  resetPassword: async (resetData) => {
    try {
      const response = await apiClient.post('/auth/reset-password', resetData)
      return response
    } catch (error) {
      throw error
    }
  }
}