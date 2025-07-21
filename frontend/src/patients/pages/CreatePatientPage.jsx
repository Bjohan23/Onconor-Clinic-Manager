import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../shared/contexts/ThemeContext'
import { useAuth } from '../../shared/contexts/AuthContext'
import { patientService } from '../services/patientService'
import { Button } from '../../shared/components/ui/Button'
import { Input, TextArea } from '../../shared/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '../../shared/components/ui/Card'

const CreatePatientPage = () => {
  const { colors } = useTheme()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    userId: user?.id || 1, // ID del usuario que está creando el paciente
    dni: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    address: '',
    emergencyContact: '',
    email: '', // Campo adicional
    bloodType: '', // Campo adicional
    allergies: '', // Campo adicional
    medicalNotes: '' // Campo adicional
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Validaciones obligatorias
    if (!formData.dni.trim()) {
      newErrors.dni = 'El DNI es obligatorio'
    } else if (!/^\d{8}$/.test(formData.dni.trim())) {
      newErrors.dni = 'El DNI debe tener exactamente 8 dígitos'
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Los nombres son obligatorios'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Los apellidos son obligatorios'
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'La fecha de nacimiento es obligatoria'
    } else {
      const birthDate = new Date(formData.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      if (age < 0 || age > 120) {
        newErrors.dateOfBirth = 'Fecha de nacimiento inválida'
      }
    }

    if (!formData.gender) {
      newErrors.gender = 'El género es obligatorio'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio'
    } else if (!/^(\+51)?\d{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Formato de teléfono inválido (ejemplo: +51987654321 o 987654321)'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es obligatoria'
    }

    if (!formData.emergencyContact.trim()) {
      newErrors.emergencyContact = 'El contacto de emergencia es obligatorio'
    }

    // Validaciones opcionales
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato de email inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      // Preparar datos para enviar
      const patientData = {
        userId: user?.id || 1, // ID del usuario que está creando el paciente
        dni: formData.dni.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: formData.dateOfBirth, // Campo requerido que faltaba
        gender: formData.gender, // Campo requerido que faltaba
        phone: formData.phone.replace(/\s/g, ''), // Quitar espacios
        address: formData.address.trim(),
        emergencyContact: formData.emergencyContact.trim(),
      }

      // Agregar campos opcionales solo si tienen valor
      if (formData.email.trim()) {
        patientData.email = formData.email.trim()
      }
      if (formData.bloodType) {
        patientData.bloodType = formData.bloodType
      }
      if (formData.allergies.trim()) {
        patientData.allergies = formData.allergies.trim()
      }
      if (formData.medicalNotes.trim()) {
        patientData.medicalNotes = formData.medicalNotes.trim()
      }

      const response = await patientService.createPatient(patientData)
      
      if (response.success) {
        navigate('/patients', {
          state: { 
            message: 'Paciente creado exitosamente',
            type: 'success'
          }
        })
      } else {
        setErrors({ 
          submit: response.message || 'Error al crear el paciente' 
        })
      }
    } catch (err) {
      console.error('Error creating patient:', err)
      
      // Manejar errores específicos
      if (err.status === 409) {
        setErrors({ 
          dni: 'Ya existe un paciente con este DNI' 
        })
      } else if (err.status === 400) {
        setErrors({ 
          submit: err.message || 'Datos inválidos. Verifica la información.' 
        })
      } else {
        setErrors({ 
          submit: 'Error de conexión. Inténtalo nuevamente.' 
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const calculateAge = (birthDate) => {
    if (!birthDate) return ''
    const today = new Date()
    const birth = new Date(birthDate)
    const age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1
    }
    return age
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text.primary }}>
            Nuevo Paciente
          </h1>
          <p className="text-sm" style={{ color: colors.text.secondary }}>
            Registra la información del nuevo paciente en el sistema
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={() => navigate('/patients')}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m0 7h18" />
            </svg>
          }
        >
          Volver a Pacientes
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error General */}
        {errors.submit && (
          <Card variant="critical">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3" style={{ color: colors.error[500] }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-medium" style={{ color: colors.error[700] }}>
                  Error al crear paciente
                </h3>
                <p className="text-sm" style={{ color: colors.error[600] }}>
                  {errors.submit}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Información Personal */}
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="DNI"
                name="dni"
                type="text"
                required
                maxLength="8"
                placeholder="12345678"
                value={formData.dni}
                onChange={handleChange}
                error={errors.dni}
                helperText="Documento Nacional de Identidad (8 dígitos)"
              />

              <Input
                label="Nombres"
                name="firstName"
                type="text"
                required
                placeholder="Juan Carlos"
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
              />

              <Input
                label="Apellidos"
                name="lastName"
                type="text"
                required
                placeholder="Pérez García"
                value={formData.lastName}
                onChange={handleChange}
                error={errors.lastName}
              />

              <Input
                label="Fecha de Nacimiento"
                name="dateOfBirth"
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={handleChange}
                error={errors.dateOfBirth}
                helperText={formData.dateOfBirth ? `Edad: ${calculateAge(formData.dateOfBirth)} años` : ''}
              />

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text.secondary }}>
                  Género <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: colors.background.primary,
                    borderColor: errors.gender ? colors.error[300] : colors.border.medium,
                    color: colors.text.primary,
                    focusRingColor: colors.primary[400]
                  }}
                >
                  <option value="">Seleccionar género</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
                {errors.gender && (
                  <p className="text-xs mt-1" style={{ color: colors.error[600] }}>
                    {errors.gender}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información de Contacto */}
        <Card>
          <CardHeader>
            <CardTitle>Información de Contacto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Teléfono"
                name="phone"
                type="tel"
                required
                placeholder="+51987654321"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                helperText="Incluye código de país para Perú (+51)"
              />

              <Input
                label="Contacto de Emergencia"
                name="emergencyContact"
                type="text"
                required
                placeholder="María García - 999888777"
                value={formData.emergencyContact}
                onChange={handleChange}
                error={errors.emergencyContact}
                helperText="Nombre y teléfono de contacto de emergencia"
              />

              <div className="md:col-span-2">
                <TextArea
                  label="Dirección"
                  name="address"
                  required
                  rows={3}
                  placeholder="Av. Principal 123, Distrito, Lima"
                  value={formData.address}
                  onChange={handleChange}
                  error={errors.address}
                  helperText="Dirección completa de residencia"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información Médica */}
        <Card>
          <CardHeader>
            <CardTitle>Información Médica (Opcional)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text.secondary }}>
                  Tipo de Sangre
                </label>
                <select
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: colors.background.primary,
                    borderColor: colors.border.medium,
                    color: colors.text.primary,
                    focusRingColor: colors.primary[400]
                  }}
                >
                  <option value="">Seleccionar tipo de sangre</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <TextArea
                label="Alergias Conocidas"
                name="allergies"
                rows={2}
                placeholder="Penicilina, mariscos, etc."
                value={formData.allergies}
                onChange={handleChange}
                helperText="Lista de alergias conocidas separadas por comas"
              />

              <div className="md:col-span-2">
                <TextArea
                  label="Notas Médicas"
                  name="medicalNotes"
                  rows={3}
                  placeholder="Información médica adicional relevante..."
                  value={formData.medicalNotes}
                  onChange={handleChange}
                  helperText="Información médica adicional que pueda ser relevante"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botones de Acción */}
        <Card>
          <CardContent>
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/patients')}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={loading}
                disabled={loading}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                }
              >
                {loading ? 'Creando Paciente...' : 'Crear Paciente'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

export default CreatePatientPage