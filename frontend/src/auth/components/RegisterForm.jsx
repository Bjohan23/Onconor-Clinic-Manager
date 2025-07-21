import { useState } from 'react'
import { useTheme } from '../../shared/contexts/ThemeContext'
import { authService } from '../../shared/services/authService'
import { useNavigate } from 'react-router-dom'

export const RegisterForm = () => {
  const { colors } = useTheme()
  const [formData, setFormData] = useState({
    establishment_id: '',
    person_num_doc: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
    setSuccess(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.establishment_id || !formData.person_num_doc || !formData.password) {
      setError('Establecimiento, documento y contraseña son requeridos')
      return
    }
    if (!formData.email && !formData.username) {
      setError('Debes ingresar un email o un nombre de usuario')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      await authService.register({
        establishment_id: formData.establishment_id,
        person_num_doc: formData.person_num_doc,
        email: formData.email || undefined,
        username: formData.username || undefined,
        password: formData.password
      })
      setSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.')
      setFormData({ establishment_id: '', person_num_doc: '', email: '', username: '', password: '', confirmPassword: '' })
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar usuario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: colors.background.secondary }}>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full" style={{ backgroundColor: colors.primary[500] }}>
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 01-8 0m8 0V5a4 4 0 00-8 0v2m8 0a4 4 0 01-8 0" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold" style={{ color: colors.text.primary }}>
            Crear cuenta
          </h2>
          <p className="mt-2 text-sm" style={{ color: colors.text.secondary }}>
            Regístrate para acceder a Onconor Clinic
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-8" style={{ backgroundColor: colors.background.primary, borderColor: colors.border.light }}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <div className="rounded-md p-4 border" style={{ backgroundColor: colors.error[50], borderColor: colors.error[200] }}><p className="text-sm font-medium" style={{ color: colors.error[600] }}>{error}</p></div>}
            {success && <div className="rounded-md p-4 border" style={{ backgroundColor: colors.success[50], borderColor: colors.success[200] }}><p className="text-sm font-medium" style={{ color: colors.success[600] }}>{success}</p></div>}
            <div>
              <label htmlFor="establishment_id" className="block text-sm font-medium mb-1" style={{ color: colors.text.secondary }}>ID de Establecimiento</label>
              <input id="establishment_id" name="establishment_id" type="number" required value={formData.establishment_id} onChange={handleChange} className="appearance-none relative block w-full px-3 py-2 border rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent" style={{ backgroundColor: colors.background.primary, borderColor: colors.border.medium, color: colors.text.primary }} placeholder="1" />
            </div>
            <div>
              <label htmlFor="person_num_doc" className="block text-sm font-medium mb-1" style={{ color: colors.text.secondary }}>Documento de Persona</label>
              <input id="person_num_doc" name="person_num_doc" type="text" required value={formData.person_num_doc} onChange={handleChange} className="appearance-none relative block w-full px-3 py-2 border rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent" style={{ backgroundColor: colors.background.primary, borderColor: colors.border.medium, color: colors.text.primary }} placeholder="DNI o documento" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: colors.text.secondary }}>Correo electrónico</label>
              <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="appearance-none relative block w-full px-3 py-2 border rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent" style={{ backgroundColor: colors.background.primary, borderColor: colors.border.medium, color: colors.text.primary }} placeholder="correo@ejemplo.com" />
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-1" style={{ color: colors.text.secondary }}>Nombre de usuario (opcional)</label>
              <input id="username" name="username" type="text" value={formData.username} onChange={handleChange} className="appearance-none relative block w-full px-3 py-2 border rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent" style={{ backgroundColor: colors.background.primary, borderColor: colors.border.medium, color: colors.text.primary }} placeholder="usuario123" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: colors.text.secondary }}>Contraseña</label>
              <input id="password" name="password" type="password" required value={formData.password} onChange={handleChange} className="appearance-none relative block w-full px-3 py-2 border rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent" style={{ backgroundColor: colors.background.primary, borderColor: colors.border.medium, color: colors.text.primary }} placeholder="••••••••" />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1" style={{ color: colors.text.secondary }}>Confirmar contraseña</label>
              <input id="confirmPassword" name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} className="appearance-none relative block w-full px-3 py-2 border rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent" style={{ backgroundColor: colors.background.primary, borderColor: colors.border.medium, color: colors.text.primary }} placeholder="••••••••" />
            </div>
            <div>
              <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" style={{ backgroundColor: colors.primary[600], focusRingColor: colors.primary[500] }}>
                {loading ? 'Registrando...' : 'Registrarse'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 