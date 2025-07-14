import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../shared/contexts/AuthContext'
import { useTheme } from '../../shared/contexts/ThemeContext'
import { ButtonSpinner } from '../../shared/components/LoadingSpinner'

export const LoginForm = () => {
  const { login, isLoading, error, clearError } = useAuth()
  const { colors, isDarkMode, toggleTheme } = useTheme()
  
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpiar error cuando el usuario empiece a escribir
    if (error) {
      clearError()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.identifier || !formData.password) {
      return
    }
    await login(formData)
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: colors.background.secondary }}
    >
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full"
               style={{ backgroundColor: colors.primary[500] }}>
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m0 0h4M9 7h6m-6 4h6m-2 4h.01" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold" style={{ color: colors.text.primary }}>
            Onconor Clinic
          </h2>
          <p className="mt-2 text-sm" style={{ color: colors.text.secondary }}>
            Inicia sesión en tu cuenta
          </p>
        </div>

        {/* Form */}
        <div 
          className="bg-white rounded-lg shadow-lg p-8"
          style={{ 
            backgroundColor: colors.background.primary,
            borderColor: colors.border.light 
          }}
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error Alert */}
            {error && (
              <div 
                className="rounded-md p-4 border"
                style={{ 
                  backgroundColor: colors.error[50],
                  borderColor: colors.error[200]
                }}
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5" style={{ color: colors.error[500] }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium" style={{ color: colors.error[600] }}>
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* identifier */}
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium mb-1"
                     style={{ color: colors.text.secondary }}>
                Correo electrónico
              </label>
              <input
                id="identifier"
                name="identifier"
                type="identifier"
                autoComplete="identifier"
                required
                value={formData.identifier}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent"
                style={{
                  backgroundColor: colors.background.primary,
                  borderColor: colors.border.medium,
                  color: colors.text.primary,
                  focusRingColor: colors.primary[500]
                }}
                placeholder="correo@ejemplo.com"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1"
                     style={{ color: colors.text.secondary }}>
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{
                    backgroundColor: colors.background.primary,
                    borderColor: colors.border.medium,
                    color: colors.text.primary
                  }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg className="h-5 w-5" style={{ color: colors.text.tertiary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 focus:ring-2"
                  style={{ 
                    accentColor: colors.primary[500],
                    borderColor: colors.border.medium 
                  }}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm"
                       style={{ color: colors.text.secondary }}>
                  Recordarme
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium hover:underline"
                  style={{ color: colors.primary[600] }}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading || !formData.identifier || !formData.password}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{
                  backgroundColor: colors.primary[600],
                  focusRingColor: colors.primary[500]
                }}
              >
                {isLoading ? (
                  <ButtonSpinner />
                ) : (
                  <>
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                      <svg className="h-5 w-5 text-white group-hover:text-gray-200" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    Iniciar sesión
                  </>
                )}
              </button>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <span className="text-sm" style={{ color: colors.text.secondary }}>
                ¿No tienes una cuenta?{' '}
                <Link
                  to="/register"
                  className="font-medium hover:underline"
                  style={{ color: colors.primary[600] }}
                >
                  Regístrate aquí
                </Link>
              </span>
            </div>
          </form>
        </div>

        {/* Theme Toggle */}
        <div className="text-center">
          <button
            onClick={toggleTheme}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              color: colors.text.secondary,
              backgroundColor: colors.background.primary,
              borderColor: colors.border.light,
              focusRingColor: colors.primary[500]
            }}
          >
            {isDarkMode ? (
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
            {isDarkMode ? 'Modo claro' : 'Modo oscuro'}
          </button>
        </div>
      </div>
    </div>
  )
}