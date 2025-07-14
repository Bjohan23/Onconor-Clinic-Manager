import { apiClient } from '../../infrastructure/api/apiClient'

export const patientService = {
  // Obtener todos los pacientes activos
  getActivePatients: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.search) params.append('search', filters.search)
    if (filters.gender) params.append('gender', filters.gender)
    if (filters.ageRange) params.append('ageRange', filters.ageRange)
    if (filters.bloodType) params.append('bloodType', filters.bloodType)
    
    const queryString = params.toString()
    const url = queryString ? `/patients/active?${queryString}` : '/patients/active'
    
    return apiClient.get(url)
  },

  // Obtener pacientes con paginación
  getPatientsWithPagination: async (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })
    
    if (filters.search) params.append('search', filters.search)
    if (filters.gender) params.append('gender', filters.gender)
    if (filters.ageRange) params.append('ageRange', filters.ageRange)
    if (filters.bloodType) params.append('bloodType', filters.bloodType)
    
    return apiClient.get(`/patients/paginated?${params.toString()}`)
  },

  // Obtener paciente por ID
  getPatientById: async (id) => {
    return apiClient.get(`/patients/${id}`)
  },

  // Obtener paciente por DNI
  getPatientByDni: async (dni) => {
    return apiClient.get(`/patients/dni/${dni}`)
  },

  // Crear nuevo paciente
  createPatient: async (patientData) => {
    return apiClient.post('/patients', patientData)
  },

  // Actualizar paciente
  updatePatient: async (id, patientData) => {
    return apiClient.put(`/patients/${id}`, patientData)
  },

  // Desactivar paciente (soft delete)
  deactivatePatient: async (id) => {
    return apiClient.delete(`/patients/${id}`)
  },

  // Activar paciente
  activatePatient: async (id) => {
    return apiClient.patch(`/patients/${id}/activate`)
  },

  // Buscar pacientes
  searchPatients: async (searchParams) => {
    const params = new URLSearchParams()
    
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value)
      }
    })
    
    return apiClient.get(`/patients/search?${params.toString()}`)
  },

  // Obtener estadísticas de pacientes
  getPatientStats: async () => {
    return apiClient.get('/patients/stats')
  },

  // Verificar disponibilidad de DNI
  checkDniAvailability: async (dni, excludeId = null) => {
    const params = new URLSearchParams()
    if (excludeId) params.append('excludeId', excludeId)
    
    const queryString = params.toString()
    const url = queryString 
      ? `/patients/check-dni/${dni}?${queryString}` 
      : `/patients/check-dni/${dni}`
    
    return apiClient.get(url)
  },

  // Obtener historial médico del paciente
  getPatientMedicalHistory: async (patientId, page = 1, limit = 10) => {
    return apiClient.get(`/patients/${patientId}/medical-history?page=${page}&limit=${limit}`)
  },

  // Obtener citas del paciente
  getPatientAppointments: async (patientId, status = null, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    
    if (status) params.append('status', status)
    
    return apiClient.get(`/patients/${patientId}/appointments?${params.toString()}`)
  },

  // Obtener tratamientos del paciente
  getPatientTreatments: async (patientId, active = null) => {
    const params = new URLSearchParams()
    if (active !== null) params.append('active', active.toString())
    
    const queryString = params.toString()
    const url = queryString 
      ? `/patients/${patientId}/treatments?${queryString}`
      : `/patients/${patientId}/treatments`
    
    return apiClient.get(url)
  },

  // Obtener prescripciones del paciente
  getPatientPrescriptions: async (patientId, page = 1, limit = 10) => {
    return apiClient.get(`/patients/${patientId}/prescriptions?page=${page}&limit=${limit}`)
  },

  // Obtener laboratorios del paciente
  getPatientLabResults: async (patientId, page = 1, limit = 10) => {
    return apiClient.get(`/patients/${patientId}/lab-results?page=${page}&limit=${limit}`)
  },

  // Obtener alergias del paciente
  getPatientAllergies: async (patientId) => {
    return apiClient.get(`/patients/${patientId}/allergies`)
  },

  // Agregar alergia al paciente
  addPatientAllergy: async (patientId, allergyData) => {
    return apiClient.post(`/patients/${patientId}/allergies`, allergyData)
  },

  // Actualizar alergia del paciente
  updatePatientAllergy: async (patientId, allergyId, allergyData) => {
    return apiClient.put(`/patients/${patientId}/allergies/${allergyId}`, allergyData)
  },

  // Eliminar alergia del paciente
  removePatientAllergy: async (patientId, allergyId) => {
    return apiClient.delete(`/patients/${patientId}/allergies/${allergyId}`)
  },

  // Obtener contactos de emergencia
  getEmergencyContacts: async (patientId) => {
    return apiClient.get(`/patients/${patientId}/emergency-contacts`)
  },

  // Agregar contacto de emergencia
  addEmergencyContact: async (patientId, contactData) => {
    return apiClient.post(`/patients/${patientId}/emergency-contacts`, contactData)
  },

  // Actualizar contacto de emergencia
  updateEmergencyContact: async (patientId, contactId, contactData) => {
    return apiClient.put(`/patients/${patientId}/emergency-contacts/${contactId}`, contactData)
  },

  // Eliminar contacto de emergencia
  removeEmergencyContact: async (patientId, contactId) => {
    return apiClient.delete(`/patients/${patientId}/emergency-contacts/${contactId}`)
  },

  // Subir archivo de paciente (imagen, documento)
  uploadPatientFile: async (patientId, file, type = 'document') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    
    return apiClient.post(`/patients/${patientId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Obtener archivos del paciente
  getPatientFiles: async (patientId, type = null) => {
    const params = new URLSearchParams()
    if (type) params.append('type', type)
    
    const queryString = params.toString()
    const url = queryString 
      ? `/patients/${patientId}/files?${queryString}`
      : `/patients/${patientId}/files`
    
    return apiClient.get(url)
  },

  // Eliminar archivo del paciente
  deletePatientFile: async (patientId, fileId) => {
    return apiClient.delete(`/patients/${patientId}/files/${fileId}`)
  },

  // Exportar datos del paciente
  exportPatientData: async (patientId, format = 'pdf') => {
    return apiClient.get(`/patients/${patientId}/export?format=${format}`, {
      responseType: 'blob'
    })
  },

  // Exportar lista de pacientes
  exportPatients: async (format = 'excel', filters = {}) => {
    const params = new URLSearchParams({ format })
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value)
      }
    })
    
    return apiClient.get(`/patients/export?${params.toString()}`, {
      responseType: 'blob'
    })
  },

  // Obtener pacientes por rango de edad
  getPatientsByAgeRange: async (minAge, maxAge) => {
    return apiClient.get(`/patients/age-range?min=${minAge}&max=${maxAge}`)
  },

  // Obtener pacientes por tipo de sangre
  getPatientsByBloodType: async (bloodType) => {
    return apiClient.get(`/patients/blood-type/${bloodType}`)
  },

  // Obtener pacientes con citas próximas
  getPatientsWithUpcomingAppointments: async (days = 7) => {
    return apiClient.get(`/patients/upcoming-appointments?days=${days}`)
  },

  // Obtener pacientes con tratamientos activos
  getPatientsWithActiveTreatments: async () => {
    return apiClient.get('/patients/active-treatments')
  },

  // Marcar paciente como crítico
  markPatientAsCritical: async (patientId, reason) => {
    return apiClient.patch(`/patients/${patientId}/mark-critical`, { reason })
  },

  // Quitar estado crítico del paciente
  unmarkPatientAsCritical: async (patientId) => {
    return apiClient.patch(`/patients/${patientId}/unmark-critical`)
  },

  // Obtener pacientes críticos
  getCriticalPatients: async () => {
    return apiClient.get('/patients/critical')
  }
}