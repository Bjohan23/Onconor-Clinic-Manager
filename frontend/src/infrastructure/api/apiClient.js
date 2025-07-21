import axios from 'axios'

// Configuración base de Axios
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/v1/api',
  timeout: import.meta.env.VITE_API_TIMEOUT || 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => {
    // Retornar directamente la data de la respuesta
    return response.data
  },
  async (error) => {
    const originalRequest = error.config

    // Si el error es 401 (No autorizado) y no hemos intentado refrescar el token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Intentar refrescar el token
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post(
            `${apiClient.defaults.baseURL}/auth/refresh`,
            { refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
          )

          if (response.data.success && response.data.data.token) {
            const newToken = response.data.data.token
            localStorage.setItem('token', newToken)
            
            // Reintentar la petición original con el nuevo token
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return apiClient(originalRequest)
          }
        }
      } catch (refreshError) {
        console.error('Error al refrescar token:', refreshError)
      }

      // Si no se pudo refrescar, limpiar storage y redirigir a login
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      
      // Redirigir a login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    // Manejar otros errores
    const errorMessage = error.response?.data?.message || error.message || 'Error de conexión'
    const errorResponse = {
      success: false,
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    }

    return Promise.reject(errorResponse)
  }
)

export { apiClient }

// Métodos de conveniencia
export const api = {
  get: (url, config) => apiClient.get(url, config),
  post: (url, data, config) => apiClient.post(url, data, config),
  put: (url, data, config) => apiClient.put(url, data, config),
  patch: (url, data, config) => apiClient.patch(url, data, config),
  delete: (url, config) => apiClient.delete(url, config),
}