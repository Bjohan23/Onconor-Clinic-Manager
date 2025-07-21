import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTheme } from '../../shared/contexts/ThemeContext'
import { useAuth } from '../../shared/contexts/AuthContext'
import { useToast } from '../../shared/components/ui/Toast'
import { doctorService } from '../services/doctorService'
import { Button } from '../../shared/components/ui/Button'
import { Input, TextArea } from '../../shared/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '../../shared/components/ui/Card'
import { LoadingSpinner } from '../../shared/components/LoadingSpinner'

const EditDoctorPage = () => {
  const { colors } = useTheme()
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuth()
  const toast = useToast()
  
  const [loading, setLoading] = useState(false)
  const [loadingDoctor, setLoadingDoctor] = useState(true)
  const [errors, setErrors] = useState({})
  const [doctor, setDoctor] = useState(null)
  const [formData, setFormData] = useState({
    userId: user?.id || 1,
    medicalCode: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    specialtyId: '',
    licenseNumber: '',
    university: '',
    graduationYear: '',
    experience: '',
    consultationFee: '',
    bio: '',
    status: 'active'
  })

  // Cargar datos del doctor al montar
  useEffect(() => {
    if (id) {
      fetchDoctor()
    }
  }, [id])

  const fetchDoctor = async () => {
    try {
      setLoadingDoctor(true)
      const response = await doctorService.getDoctorById(id)
      
      if (response.success) {
        const doctorData = response.data?.doctor
        setDoctor(doctorData)
        
        setFormData({
          userId: doctorData.userId || user?.id || 1,
          medicalCode: doctorData.medicalCode || '',
          firstName: doctorData.firstName || '',
          lastName: doctorData.lastName || '',
          email: doctorData.email || '',
          phone: doctorData.phone || '',
          address: doctorData.address || '',
          specialtyId: doctorData.specialtyId || '',
          licenseNumber: doctorData.medicalLicense || doctorData.licenseNumber || '',
          university: doctorData.university || '',
          graduationYear: doctorData.graduationYear || '',
          experience: doctorData.experience || '',
          consultationFee: doctorData.consultationFee || '',
          bio: doctorData.bio || '',
          status: doctorData.status || 'active'
        })
      } else {
        toast.error(response.message || 'Error al cargar el doctor')
        navigate('/doctors')
      }
    } catch (err) {
      console.error('Error fetching doctor:', err)
      toast.error('Error de conexión al cargar el doctor')
      navigate('/doctors')
    } finally {
      setLoadingDoctor(false)
    }
  }

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
    if (!formData.medicalCode.trim()) {
      newErrors.medicalCode = 'El código médico es obligatorio'
    }
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Los nombres son obligatorios'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Los apellidos son obligatorios'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato de email inválido'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio'
    } else if (!/^(\+51)?\d{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Formato de teléfono inválido (ejemplo: +51987654321 o 987654321)'
    }

    if (!formData.specialtyId) {
      newErrors.specialtyId = 'La especialidad es obligatoria'
    }

    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'El número de colegiatura es obligatorio'
    }

    if (!formData.university.trim()) {
      newErrors.university = 'La universidad es obligatoria'
    }

    if (!formData.graduationYear) {
      newErrors.graduationYear = 'El año de graduación es obligatorio'
    } else {
      const year = parseInt(formData.graduationYear)
      const currentYear = new Date().getFullYear()
      if (year < 1950 || year > currentYear) {
        newErrors.graduationYear = 'Año de graduación inválido'
      }
    }

    if (!formData.experience) {
      newErrors.experience = 'Los años de experiencia son obligatorios'
    } else if (parseInt(formData.experience) < 0 || parseInt(formData.experience) > 50) {
      newErrors.experience = 'Años de experiencia inválidos (0-50)'
    }

    if (!formData.consultationFee) {
      newErrors.consultationFee = 'La tarifa de consulta es obligatoria'
    } else if (parseFloat(formData.consultationFee) <= 0) {
      newErrors.consultationFee = 'La tarifa debe ser mayor a 0'
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
      const doctorData = {
        ...formData,
        medicalCode: formData.medicalCode.trim().toUpperCase(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.replace(/\s/g, ''),
        address: formData.address.trim(),
        licenseNumber: formData.licenseNumber.trim(),
        university: formData.university.trim(),
        graduationYear: parseInt(formData.graduationYear),
        experience: parseInt(formData.experience),
        consultationFee: parseFloat(formData.consultationFee),
        bio: formData.bio.trim()
      }

      const response = await doctorService.updateDoctor(id, doctorData)
      
      if (response.success) {
        toast.success('Doctor actualizado exitosamente')
        navigate('/doctors')
      } else {
        setErrors({ 
          submit: response.message || 'Error al actualizar el doctor' 
        })
      }
    } catch (err) {
      console.error('Error updating doctor:', err)
      
      // Manejar errores específicos
      if (err.status === 409) {
        setErrors({ 
          medicalCode: 'Ya existe otro doctor con este código médico' 
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

  if (loadingDoctor) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" text="Cargando doctor..." center />
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold" style={{ color: colors.text.primary }}>
          Doctor no encontrado
        </h2>
        <p className="text-sm mt-2" style={{ color: colors.text.secondary }}>
          El doctor solicitado no existe o no tienes permisos para editarlo.
        </p>
        <Button
          onClick={() => navigate('/doctors')}
          className="mt-4"
        >
          Volver a Doctores
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text.primary }}>
            Editar Doctor
          </h1>
          <p className="text-sm" style={{ color: colors.text.secondary }}>
            Modifica la información de Dr. {doctor.firstName} {doctor.lastName}
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={() => navigate('/doctors')}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m0 7h18" />
            </svg>
          }
        >
          Volver a Doctores
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
                  Error al actualizar doctor
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
                label="Código Médico"
                name="medicalCode"
                type="text"
                required
                maxLength="10"
                placeholder="DOC001"
                value={formData.medicalCode}
                onChange={handleChange}
                error={errors.medicalCode}
                helperText="Código único del doctor (6-10 caracteres alfanuméricos)"
              />

              <Input
                label="Email"
                name="email"
                type="email"
                required
                placeholder="doctor@clinica.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                helperText="Correo electrónico profesional"
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

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text.secondary }}>
                  Estado <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  required
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: colors.background.primary,
                    borderColor: colors.border.medium,
                    color: colors.text.primary,
                    focusRingColor: colors.primary[400]
                  }}
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="busy">Ocupado</option>
                  <option value="available">Disponible</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <TextArea
                  label="Dirección"
                  name="address"
                  rows={2}
                  placeholder="Av. Principal 123, Distrito, Lima"
                  value={formData.address}
                  onChange={handleChange}
                  error={errors.address}
                  helperText="Dirección de residencia (opcional)"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información Profesional */}
        <Card>
          <CardHeader>
            <CardTitle>Información Profesional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text.secondary }}>
                  Especialidad <span className="text-red-500">*</span>
                </label>
                <select
                  name="specialtyId"
                  required
                  value={formData.specialtyId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: colors.background.primary,
                    borderColor: errors.specialtyId ? colors.error[300] : colors.border.medium,
                    color: colors.text.primary,
                    focusRingColor: colors.primary[400]
                  }}
                >
                  <option value="">Seleccionar especialidad</option>
                  <option value="1">Cardiología</option>
                  <option value="2">Neurología</option>
                  <option value="3">Pediatría</option>
                  <option value="4">Ginecología</option>
                  <option value="5">Traumatología</option>
                  <option value="6">Medicina General</option>
                  <option value="7">Dermatología</option>
                  <option value="8">Oftalmología</option>
                </select>
                {errors.specialtyId && (
                  <p className="text-xs mt-1" style={{ color: colors.error[600] }}>
                    {errors.specialtyId}
                  </p>
                )}
              </div>

              <Input
                label="Número de Colegiatura"
                name="licenseNumber"
                type="text"
                required
                placeholder="CMP12345"
                value={formData.licenseNumber}
                onChange={handleChange}
                error={errors.licenseNumber}
                helperText="Número de colegio médico"
              />

              <Input
                label="Universidad"
                name="university"
                type="text"
                required
                placeholder="Universidad Nacional Mayor de San Marcos"
                value={formData.university}
                onChange={handleChange}
                error={errors.university}
                helperText="Universidad donde estudió medicina"
              />

              <Input
                label="Año de Graduación"
                name="graduationYear"
                type="number"
                required
                min="1950"
                max={new Date().getFullYear()}
                placeholder="2015"
                value={formData.graduationYear}
                onChange={handleChange}
                error={errors.graduationYear}
              />

              <Input
                label="Años de Experiencia"
                name="experience"
                type="number"
                required
                min="0"
                max="50"
                placeholder="5"
                value={formData.experience}
                onChange={handleChange}
                error={errors.experience}
              />

              <Input
                label="Tarifa de Consulta (S/.)"
                name="consultationFee"
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="150.00"
                value={formData.consultationFee}
                onChange={handleChange}
                error={errors.consultationFee}
                helperText="Precio de consulta en soles"
              />

              <div className="md:col-span-2">
                <TextArea
                  label="Biografía Profesional"
                  name="bio"
                  rows={4}
                  placeholder="Describe la experiencia y especialización del doctor..."
                  value={formData.bio}
                  onChange={handleChange}
                  error={errors.bio}
                  helperText="Información adicional sobre el doctor (opcional)"
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
                onClick={() => navigate('/doctors')}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                }
              >
                {loading ? 'Actualizando Doctor...' : 'Actualizar Doctor'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

export default EditDoctorPage