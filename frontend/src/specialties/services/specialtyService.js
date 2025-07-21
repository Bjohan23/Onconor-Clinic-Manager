import { apiClient } from '../../infrastructure/api/apiClient'

export const specialtyService = {
  // Obtener todas las especialidades activas
  getActiveSpecialties: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.search) params.append('search', filters.search)
    
    const queryString = params.toString()
    const url = queryString ? `/specialties/active?${queryString}` : '/specialties/active'
    
    return apiClient.get(url)
  },

  // Obtener especialidades con paginación
  getSpecialtiesWithPagination: async (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })
    
    if (filters.search) params.append('search', filters.search)
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString())
    
    const response = await apiClient.get(`/specialties/paginated?${params.toString()}`)
    // Mapea los campos correctamente
    if (response.success && Array.isArray(response.data?.specialties)) {
      response.data.specialties = response.data.specialties.map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        isActive: s.isActive,
        doctorCount: s.doctorCount,
        createdAt: s.createdAt || s.created_at,
        updatedAt: s.updatedAt || s.updated_at,
        flg_deleted: s.flg_deleted,
        deleted_at: s.deleted_at,
        user_created: s.user_created,
        user_updated: s.user_updated,
        user_deleted: s.user_deleted
      }))
    }
    return response
  },

  // Obtener especialidad por ID
  getSpecialtyById: async (id) => {
    return apiClient.get(`/specialties/${id}`)
  },

  // Obtener especialidad con médicos asociados
  getSpecialtyWithDoctors: async (id) => {
    return apiClient.get(`/specialties/${id}/doctors`)
  },

  // Crear nueva especialidad
  createSpecialty: async (specialtyData) => {
    return apiClient.post('/specialties', specialtyData)
  },

  // Actualizar especialidad
  updateSpecialty: async (id, specialtyData) => {
    return apiClient.put(`/specialties/${id}`, specialtyData)
  },

  // Desactivar especialidad (soft delete)
  deactivateSpecialty: async (id) => {
    return apiClient.delete(`/specialties/${id}`)
  },

  // Activar especialidad
  activateSpecialty: async (id) => {
    return apiClient.patch(`/specialties/${id}/activate`)
  },

  // Buscar especialidades
  searchSpecialties: async (searchParams) => {
    const params = new URLSearchParams()
    
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value)
      }
    })
    
    return apiClient.get(`/specialties/search?${params.toString()}`)
  },

  // Obtener estadísticas de especialidades
  getSpecialtyStats: async () => {
    const response = await apiClient.get('/specialties/stats');
    // Normaliza el formato para que siempre devuelva stats con las claves correctas
    if (response.success && response.data?.stats) {
      const stats = response.data.stats;
      return {
        ...response,
        data: {
          stats: {
            total: stats.total || 0,
            active: stats.active || 0,
            inactive: stats.inactive || 0,
            withDoctors: Array.isArray(stats.withDoctors)
              ? stats.withDoctors.map(s => ({
                  id: s.id,
                  name: s.name,
                  doctorCount: s.doctorCount || 0
                }))
              : []
          }
        }
      };
    }
    return response;
  },

  // Verificar disponibilidad de nombre
  checkNameAvailability: async (name, excludeId = null) => {
    const params = new URLSearchParams()
    if (excludeId) params.append('excludeId', excludeId)
    
    const queryString = params.toString()
    const url = queryString 
      ? `/specialties/check-name/${encodeURIComponent(name)}?${queryString}` 
      : `/specialties/check-name/${encodeURIComponent(name)}`
    
    return apiClient.get(url)
  },

  // Obtener todas las especialidades (incluye inactivas)
  getAllSpecialties: async (filters = {}) => {
    const params = new URLSearchParams()
    
    if (filters.search) params.append('search', filters.search)
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString())
    
    const queryString = params.toString()
    const url = queryString ? `/specialties/all?${queryString}` : '/specialties/all'
    
    const response = await apiClient.get(url)
    // Mapea los campos correctamente
    if (response.success && Array.isArray(response.data?.specialties)) {
      response.data.specialties = response.data.specialties.map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        isActive: s.isActive,
        doctorCount: s.doctorCount,
        createdAt: s.createdAt || s.created_at,
        updatedAt: s.updatedAt || s.updated_at,
        flg_deleted: s.flg_deleted,
        deleted_at: s.deleted_at,
        user_created: s.user_created,
        user_updated: s.user_updated,
        user_deleted: s.user_deleted
      }))
    }
    return response
  },

  // Exportar especialidades
  exportSpecialties: async (format = 'excel', filters = {}) => {
    const params = new URLSearchParams({ format })
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value)
      }
    })
    
    return apiClient.get(`/specialties/export?${params.toString()}`, {
      responseType: 'blob'
    })
  },

  // Obtener especialidades más populares
  getPopularSpecialties: async (limit = 5) => {
    return apiClient.get(`/specialties/popular?limit=${limit}`)
  },

  // Obtener especialidades con conteo de médicos
  getSpecialtiesWithDoctorCount: async () => {
    return apiClient.get('/specialties/with-doctor-count')
  }
}