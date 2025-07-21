import { apiClient } from '../../infrastructure/api/apiClient'

export const doctorService = {
  // Obtener todos los doctores activos
  getActiveDoctors: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.search) params.append('search', filters.search)
    if (filters.specialty) params.append('specialty', filters.specialty)
    if (filters.status) params.append('status', filters.status)
    
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
    if (filters.status) params.append('status', filters.status)
    
    return apiClient.get(`/doctors/paginated?${params.toString()}`)
  },

  // Obtener doctor por ID
  getDoctorById: async (id) => {
    return apiClient.get(`/doctors/${id}`)
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

  // Verificar disponibilidad de código médico
  checkMedicalCodeAvailability: async (medicalCode, excludeId = null) => {
    const params = new URLSearchParams()
    if (excludeId) params.append('excludeId', excludeId)
    
    const queryString = params.toString()
    const url = queryString 
      ? `/doctors/check-medical-code/${medicalCode}?${queryString}` 
      : `/doctors/check-medical-code/${medicalCode}`
    
    return apiClient.get(url)
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

  // Obtener horarios del doctor
  getDoctorSchedules: async (doctorId) => {
    return apiClient.get(`/doctors/${doctorId}/schedules`)
  },

  // Crear horario para doctor
  createDoctorSchedule: async (doctorId, scheduleData) => {
    return apiClient.post(`/doctors/${doctorId}/schedules`, scheduleData)
  },

  // Actualizar horario del doctor
  updateDoctorSchedule: async (doctorId, scheduleId, scheduleData) => {
    return apiClient.put(`/doctors/${doctorId}/schedules/${scheduleId}`, scheduleData)
  },

  // Eliminar horario del doctor
  deleteDoctorSchedule: async (doctorId, scheduleId) => {
    return apiClient.delete(`/doctors/${doctorId}/schedules/${scheduleId}`)
  },

  // Obtener disponibilidad del doctor
  getDoctorAvailability: async (doctorId, date) => {
    return apiClient.get(`/doctors/${doctorId}/availability?date=${date}`)
  },

  // Obtener pacientes del doctor
  getDoctorPatients: async (doctorId, page = 1, limit = 10) => {
    return apiClient.get(`/doctors/${doctorId}/patients?page=${page}&limit=${limit}`)
  },

  // Obtener tratamientos del doctor
  getDoctorTreatments: async (doctorId, status = null) => {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    
    const queryString = params.toString()
    const url = queryString 
      ? `/doctors/${doctorId}/treatments?${queryString}`
      : `/doctors/${doctorId}/treatments`
    
    return apiClient.get(url)
  },

  // Obtener especialidades del doctor
  getDoctorSpecialties: async (doctorId) => {
    return apiClient.get(`/doctors/${doctorId}/specialties`)
  },

  // Agregar especialidad al doctor
  addDoctorSpecialty: async (doctorId, specialtyId) => {
    return apiClient.post(`/doctors/${doctorId}/specialties`, { specialtyId })
  },

  // Eliminar especialidad del doctor
  removeDoctorSpecialty: async (doctorId, specialtyId) => {
    return apiClient.delete(`/doctors/${doctorId}/specialties/${specialtyId}`)
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

  // Subir archivo del doctor (foto, documento)
  uploadDoctorFile: async (doctorId, file, type = 'document') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    
    return apiClient.post(`/doctors/${doctorId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Obtener archivos del doctor
  getDoctorFiles: async (doctorId, type = null) => {
    const params = new URLSearchParams()
    if (type) params.append('type', type)
    
    const queryString = params.toString()
    const url = queryString 
      ? `/doctors/${doctorId}/files?${queryString}`
      : `/doctors/${doctorId}/files`
    
    return apiClient.get(url)
  },

  // Eliminar archivo del doctor
  deleteDoctorFile: async (doctorId, fileId) => {
    return apiClient.delete(`/doctors/${doctorId}/files/${fileId}`)
  },

  // Exportar datos del doctor
  exportDoctorData: async (doctorId, format = 'pdf') => {
    return apiClient.get(`/doctors/${doctorId}/export?format=${format}`, {
      responseType: 'blob'
    })
  },

  // Exportar lista de doctores
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

  // Obtener doctores por especialidad
  getDoctorsBySpecialty: async (specialtyId) => {
    return apiClient.get(`/doctors/specialty/${specialtyId}`)
  },

  // Obtener todas las especialidades (para filtros, etc.)
  getSpecialties: async () => {
    // Usa la ruta correcta del backend, por ejemplo /specialties/all
    return apiClient.get('/specialties/all')
  }
}