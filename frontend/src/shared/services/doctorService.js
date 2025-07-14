import { apiClient } from '../../infrastructure/api/apiClient'

export const doctorService = {
  // Obtener todos los doctores activos
  getActiveDoctors: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.search) params.append('search', filters.search)
    if (filters.specialty) params.append('specialty', filters.specialty)
    if (filters.available) params.append('available', filters.available)
    
    const queryString = params.toString()
    const url = queryString ? `/doctors/active?${queryString}` : '/doctors/active'
    
    return apiClient.get(url)
  },

  // Obtener doctores con paginación
  getDoctorsWithPagination: async (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })
    
    if (filters.search) params.append('search', filters.search)
    if (filters.specialty) params.append('specialty', filters.specialty)
    if (filters.available) params.append('available', filters.available)
    
    return apiClient.get(`/doctors/paginated?${params.toString()}`)
  },

  // Obtener doctor por ID
  getDoctorById: async (id) => {
    return apiClient.get(`/doctors/${id}`)
  },

  // Obtener doctor por número de colegiado
  getDoctorByLicenseNumber: async (licenseNumber) => {
    return apiClient.get(`/doctors/license/${licenseNumber}`)
  },

  // Crear nuevo doctor
  createDoctor: async (doctorData) => {
    return apiClient.post('/doctors', doctorData)
  },

  // Actualizar doctor
  updateDoctor: async (id, doctorData) => {
    return apiClient.put(`/doctors/${id}`, doctorData)
  },

  // Desactivar doctor (soft delete)
  deactivateDoctor: async (id) => {
    return apiClient.delete(`/doctors/${id}`)
  },

  // Activar doctor
  activateDoctor: async (id) => {
    return apiClient.patch(`/doctors/${id}/activate`)
  },

  // Buscar doctores
  searchDoctors: async (searchParams) => {
    const params = new URLSearchParams()
    
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value)
      }
    })
    
    return apiClient.get(`/doctors/search?${params.toString()}`)
  },

  // Obtener estadísticas de doctores
  getDoctorStats: async () => {
    return apiClient.get('/doctors/stats')
  },

  // Verificar disponibilidad de número de colegiado
  checkLicenseAvailability: async (licenseNumber, excludeId = null) => {
    const params = new URLSearchParams()
    if (excludeId) params.append('excludeId', excludeId)
    
    const queryString = params.toString()
    const url = queryString 
      ? `/doctors/check-license/${licenseNumber}?${queryString}` 
      : `/doctors/check-license/${licenseNumber}`
    
    return apiClient.get(url)
  },

  // Obtener especialidades del doctor
  getDoctorSpecialties: async (doctorId) => {
    return apiClient.get(`/doctors/${doctorId}/specialties`)
  },

  // Asignar especialidad a doctor
  assignSpecialtyToDoctor: async (doctorId, specialtyId) => {
    return apiClient.post(`/doctors/${doctorId}/specialties`, { specialtyId })
  },

  // Quitar especialidad del doctor
  removeSpecialtyFromDoctor: async (doctorId, specialtyId) => {
    return apiClient.delete(`/doctors/${doctorId}/specialties/${specialtyId}`)
  },

  // Obtener horarios del doctor
  getDoctorSchedules: async (doctorId) => {
    return apiClient.get(`/doctors/${doctorId}/schedules`)
  },

  // Configurar horarios del doctor
  setDoctorSchedules: async (doctorId, schedules) => {
    return apiClient.put(`/doctors/${doctorId}/schedules`, { schedules })
  },

  // Obtener disponibilidad del doctor
  getDoctorAvailability: async (doctorId, date = null, duration = 30) => {
    const params = new URLSearchParams({ duration: duration.toString() })
    if (date) params.append('date', date)
    
    return apiClient.get(`/doctors/${doctorId}/availability?${params.toString()}`)
  },

  // Obtener citas del doctor
  getDoctorAppointments: async (doctorId, status = null, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    
    if (status) params.append('status', status)
    
    return apiClient.get(`/doctors/${doctorId}/appointments?${params.toString()}`)
  },

  // Obtener citas del doctor por fecha
  getDoctorAppointmentsByDate: async (doctorId, date) => {
    return apiClient.get(`/doctors/${doctorId}/appointments/date/${date}`)
  },

  // Obtener pacientes del doctor
  getDoctorPatients: async (doctorId, page = 1, limit = 10) => {
    return apiClient.get(`/doctors/${doctorId}/patients?page=${page}&limit=${limit}`)
  },

  // Obtener tratamientos del doctor
  getDoctorTreatments: async (doctorId, active = null) => {
    const params = new URLSearchParams()
    if (active !== null) params.append('active', active.toString())
    
    const queryString = params.toString()
    const url = queryString 
      ? `/doctors/${doctorId}/treatments?${queryString}`
      : `/doctors/${doctorId}/treatments`
    
    return apiClient.get(url)
  },

  // Obtener prescripciones del doctor
  getDoctorPrescriptions: async (doctorId, page = 1, limit = 10) => {
    return apiClient.get(`/doctors/${doctorId}/prescriptions?page=${page}&limit=${limit}`)
  },

  // Obtener certificaciones del doctor
  getDoctorCertifications: async (doctorId) => {
    return apiClient.get(`/doctors/${doctorId}/certifications`)
  },

  // Agregar certificación al doctor
  addDoctorCertification: async (doctorId, certificationData) => {
    return apiClient.post(`/doctors/${doctorId}/certifications`, certificationData)
  },

  // Actualizar certificación del doctor
  updateDoctorCertification: async (doctorId, certificationId, certificationData) => {
    return apiClient.put(`/doctors/${doctorId}/certifications/${certificationId}`, certificationData)
  },

  // Eliminar certificación del doctor
  removeDoctorCertification: async (doctorId, certificationId) => {
    return apiClient.delete(`/doctors/${doctorId}/certifications/${certificationId}`)
  },

  // Obtener experiencia del doctor
  getDoctorExperience: async (doctorId) => {
    return apiClient.get(`/doctors/${doctorId}/experience`)
  },

  // Agregar experiencia al doctor
  addDoctorExperience: async (doctorId, experienceData) => {
    return apiClient.post(`/doctors/${doctorId}/experience`, experienceData)
  },

  // Actualizar experiencia del doctor
  updateDoctorExperience: async (doctorId, experienceId, experienceData) => {
    return apiClient.put(`/doctors/${doctorId}/experience/${experienceId}`, experienceData)
  },

  // Eliminar experiencia del doctor
  removeDoctorExperience: async (doctorId, experienceId) => {
    return apiClient.delete(`/doctors/${doctorId}/experience/${experienceId}`)
  },

  // Obtener educación del doctor
  getDoctorEducation: async (doctorId) => {
    return apiClient.get(`/doctors/${doctorId}/education`)
  },

  // Agregar educación al doctor
  addDoctorEducation: async (doctorId, educationData) => {
    return apiClient.post(`/doctors/${doctorId}/education`, educationData)
  },

  // Actualizar educación del doctor
  updateDoctorEducation: async (doctorId, educationId, educationData) => {
    return apiClient.put(`/doctors/${doctorId}/education/${educationId}`, educationData)
  },

  // Eliminar educación del doctor
  removeDoctorEducation: async (doctorId, educationId) => {
    return apiClient.delete(`/doctors/${doctorId}/education/${educationId}`)
  },

  // Subir foto del doctor
  uploadDoctorPhoto: async (doctorId, file) => {
    const formData = new FormData()
    formData.append('photo', file)
    
    return apiClient.post(`/doctors/${doctorId}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Eliminar foto del doctor
  deleteDoctorPhoto: async (doctorId) => {
    return apiClient.delete(`/doctors/${doctorId}/photo`)
  },

  // Subir documento del doctor
  uploadDoctorDocument: async (doctorId, file, type = 'license') => {
    const formData = new FormData()
    formData.append('document', file)
    formData.append('type', type)
    
    return apiClient.post(`/doctors/${doctorId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Obtener documentos del doctor
  getDoctorDocuments: async (doctorId, type = null) => {
    const params = new URLSearchParams()
    if (type) params.append('type', type)
    
    const queryString = params.toString()
    const url = queryString 
      ? `/doctors/${doctorId}/documents?${queryString}`
      : `/doctors/${doctorId}/documents`
    
    return apiClient.get(url)
  },

  // Eliminar documento del doctor
  deleteDoctorDocument: async (doctorId, documentId) => {
    return apiClient.delete(`/doctors/${doctorId}/documents/${documentId}`)
  },

  // Obtener reseñas del doctor
  getDoctorReviews: async (doctorId, page = 1, limit = 10) => {
    return apiClient.get(`/doctors/${doctorId}/reviews?page=${page}&limit=${limit}`)
  },

  // Obtener calificación promedio del doctor
  getDoctorRating: async (doctorId) => {
    return apiClient.get(`/doctors/${doctorId}/rating`)
  },

  // Marcar doctor como no disponible
  setDoctorUnavailable: async (doctorId, reason, startDate, endDate) => {
    return apiClient.patch(`/doctors/${doctorId}/unavailable`, {
      reason,
      startDate,
      endDate
    })
  },

  // Marcar doctor como disponible
  setDoctorAvailable: async (doctorId) => {
    return apiClient.patch(`/doctors/${doctorId}/available`)
  },

  // Obtener doctores por especialidad
  getDoctorsBySpecialty: async (specialtyId) => {
    return apiClient.get(`/doctors/specialty/${specialtyId}`)
  },

  // Obtener doctores disponibles
  getAvailableDoctors: async (date = null, time = null) => {
    const params = new URLSearchParams()
    if (date) params.append('date', date)
    if (time) params.append('time', time)
    
    const queryString = params.toString()
    const url = queryString 
      ? `/doctors/available?${queryString}`
      : '/doctors/available'
    
    return apiClient.get(url)
  },

  // Obtener reporte del doctor
  getDoctorReport: async (doctorId, startDate, endDate) => {
    const params = new URLSearchParams({
      startDate,
      endDate
    })
    
    return apiClient.get(`/doctors/${doctorId}/report?${params.toString()}`)
  },

  // Exportar doctores
  exportDoctors: async (format = 'excel', filters = {}) => {
    const params = new URLSearchParams({ format })
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value)
      }
    })
    
    return apiClient.get(`/doctors/export?${params.toString()}`, {
      responseType: 'blob'
    })
  },

  // Obtener doctores más populares
  getPopularDoctors: async (limit = 10) => {
    return apiClient.get(`/doctors/popular?limit=${limit}`)
  },

  // Obtener doctores con más citas
  getDoctorsWithMostAppointments: async (period = 'month', limit = 10) => {
    return apiClient.get(`/doctors/most-appointments?period=${period}&limit=${limit}`)
  }
}