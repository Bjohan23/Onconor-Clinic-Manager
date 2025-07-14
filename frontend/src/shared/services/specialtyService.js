import { apiClient } from '../../infrastructure/api/apiClient'

export const specialtyService = {
  // Obtener todas las especialidades activas
  getActiveSpecialties: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.search) params.append('search', filters.search)
    if (filters.department) params.append('department', filters.department)
    
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
    if (filters.department) params.append('department', filters.department)
    
    return apiClient.get(`/specialties/paginated?${params.toString()}`)
  },

  // Obtener especialidad por ID
  getSpecialtyById: async (id) => {
    return apiClient.get(`/specialties/${id}`)
  },

  // Obtener especialidad por nombre
  getSpecialtyByName: async (name) => {
    return apiClient.get(`/specialties/name/${encodeURIComponent(name)}`)
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
    return apiClient.get('/specialties/stats')
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

  // Obtener doctores de una especialidad
  getSpecialtyDoctors: async (specialtyId, active = true) => {
    const params = new URLSearchParams()
    if (active !== null) params.append('active', active.toString())
    
    const queryString = params.toString()
    const url = queryString 
      ? `/specialties/${specialtyId}/doctors?${queryString}`
      : `/specialties/${specialtyId}/doctors`
    
    return apiClient.get(url)
  },

  // Asignar doctor a especialidad
  assignDoctorToSpecialty: async (specialtyId, doctorId) => {
    return apiClient.post(`/specialties/${specialtyId}/doctors`, { doctorId })
  },

  // Quitar doctor de especialidad
  removeDoctorFromSpecialty: async (specialtyId, doctorId) => {
    return apiClient.delete(`/specialties/${specialtyId}/doctors/${doctorId}`)
  },

  // Obtener citas de una especialidad
  getSpecialtyAppointments: async (specialtyId, status = null, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    
    if (status) params.append('status', status)
    
    return apiClient.get(`/specialties/${specialtyId}/appointments?${params.toString()}`)
  },

  // Obtener tratamientos de una especialidad
  getSpecialtyTreatments: async (specialtyId, active = null) => {
    const params = new URLSearchParams()
    if (active !== null) params.append('active', active.toString())
    
    const queryString = params.toString()
    const url = queryString 
      ? `/specialties/${specialtyId}/treatments?${queryString}`
      : `/specialties/${specialtyId}/treatments`
    
    return apiClient.get(url)
  },

  // Obtener procedimientos de una especialidad
  getSpecialtyProcedures: async (specialtyId) => {
    return apiClient.get(`/specialties/${specialtyId}/procedures`)
  },

  // Agregar procedimiento a especialidad
  addProcedureToSpecialty: async (specialtyId, procedureData) => {
    return apiClient.post(`/specialties/${specialtyId}/procedures`, procedureData)
  },

  // Actualizar procedimiento de especialidad
  updateSpecialtyProcedure: async (specialtyId, procedureId, procedureData) => {
    return apiClient.put(`/specialties/${specialtyId}/procedures/${procedureId}`, procedureData)
  },

  // Eliminar procedimiento de especialidad
  removeSpecialtyProcedure: async (specialtyId, procedureId) => {
    return apiClient.delete(`/specialties/${specialtyId}/procedures/${procedureId}`)
  },

  // Obtener equipamiento de una especialidad
  getSpecialtyEquipment: async (specialtyId) => {
    return apiClient.get(`/specialties/${specialtyId}/equipment`)
  },

  // Agregar equipamiento a especialidad
  addEquipmentToSpecialty: async (specialtyId, equipmentData) => {
    return apiClient.post(`/specialties/${specialtyId}/equipment`, equipmentData)
  },

  // Actualizar equipamiento de especialidad
  updateSpecialtyEquipment: async (specialtyId, equipmentId, equipmentData) => {
    return apiClient.put(`/specialties/${specialtyId}/equipment/${equipmentId}`, equipmentData)
  },

  // Eliminar equipamiento de especialidad
  removeSpecialtyEquipment: async (specialtyId, equipmentId) => {
    return apiClient.delete(`/specialties/${specialtyId}/equipment/${equipmentId}`)
  },

  // Obtener horarios de una especialidad
  getSpecialtySchedules: async (specialtyId) => {
    return apiClient.get(`/specialties/${specialtyId}/schedules`)
  },

  // Configurar horarios de especialidad
  setSpecialtySchedules: async (specialtyId, schedules) => {
    return apiClient.put(`/specialties/${specialtyId}/schedules`, { schedules })
  },

  // Obtener disponibilidad de especialidad
  getSpecialtyAvailability: async (specialtyId, date = null) => {
    const params = new URLSearchParams()
    if (date) params.append('date', date)
    
    const queryString = params.toString()
    const url = queryString 
      ? `/specialties/${specialtyId}/availability?${queryString}`
      : `/specialties/${specialtyId}/availability`
    
    return apiClient.get(url)
  },

  // Obtener departamentos únicos
  getDepartments: async () => {
    return apiClient.get('/specialties/departments')
  },

  // Obtener especialidades por departamento
  getSpecialtiesByDepartment: async (department) => {
    return apiClient.get(`/specialties/department/${encodeURIComponent(department)}`)
  },

  // Obtener reporte de especialidades
  getSpecialtyReport: async (specialtyId, startDate, endDate) => {
    const params = new URLSearchParams({
      startDate,
      endDate
    })
    
    return apiClient.get(`/specialties/${specialtyId}/report?${params.toString()}`)
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

  // Subir imagen de especialidad
  uploadSpecialtyImage: async (specialtyId, file) => {
    const formData = new FormData()
    formData.append('image', file)
    
    return apiClient.post(`/specialties/${specialtyId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Eliminar imagen de especialidad
  deleteSpecialtyImage: async (specialtyId) => {
    return apiClient.delete(`/specialties/${specialtyId}/image`)
  },

  // Obtener especialidades más populares
  getPopularSpecialties: async (limit = 10) => {
    return apiClient.get(`/specialties/popular?limit=${limit}`)
  },

  // Obtener especialidades con más citas
  getSpecialtiesWithMostAppointments: async (period = 'month', limit = 10) => {
    return apiClient.get(`/specialties/most-appointments?period=${period}&limit=${limit}`)
  }
}