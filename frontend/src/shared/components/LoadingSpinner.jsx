import { useTheme } from '../contexts/ThemeContext'
import { getSpinnerConfig, spinnerUtils } from '../theme/theme'

export const LoadingSpinner = ({ 
  size = 'md', 
  variant = 'primary', 
  text = 'Cargando...',
  context = null,
  center = false,
  overlay = false,
  className = '',
  ...props 
}) => {
  const { isDarkMode } = useTheme()
  const theme = isDarkMode ? 'dark' : 'light'
  
  // Obtener configuración basada en contexto médico si se especifica
  const config = getSpinnerConfig(size, variant, theme, context)
  
  // Mensaje por defecto basado en contexto médico
  const defaultMessage = context && config.message || text
  
  const spinnerClasses = `${config.className} ${className}`
  
  const spinnerElement = (
    <div
      className={spinnerClasses}
      style={config.style}
      aria-label={defaultMessage}
      role="status"
      {...props}
    >
      <span className="sr-only">{defaultMessage}</span>
    </div>
  )
  
  // Overlay con fondo
  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl flex items-center gap-4">
          {spinnerElement}
          {defaultMessage && (
            <span className="text-gray-700 dark:text-gray-300">
              {defaultMessage}
            </span>
          )}
        </div>
      </div>
    )
  }
  
  // Centrado con mensaje
  if (center) {
    return (
      <div className={`flex items-center justify-center ${defaultMessage ? 'flex-col gap-2' : ''} min-h-64`}>
        {spinnerElement}
        {defaultMessage && (
          <span className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {defaultMessage}
          </span>
        )}
      </div>
    )
  }
  
  return spinnerElement
}

export const ButtonSpinner = ({ size = 'sm', variant = 'white' }) => {
  const { isDarkMode } = useTheme()
  
  const fullClass = spinnerUtils.getFullClass(size, variant, isDarkMode)
  
  return (
    <div className={fullClass} aria-hidden="true">
      <span className="sr-only">Cargando...</span>
    </div>
  )
}

// Spinner específicos para contextos médicos
export const PatientSpinner = (props) => (
  <LoadingSpinner context="patient" {...props} />
)

export const AppointmentSpinner = (props) => (
  <LoadingSpinner context="appointment" {...props} />
)

export const TreatmentSpinner = (props) => (
  <LoadingSpinner context="treatment" {...props} />
)

export const CriticalSpinner = (props) => (
  <LoadingSpinner context="critical" {...props} />
)

export const ReportSpinner = (props) => (
  <LoadingSpinner context="report" {...props} />
)

export const LabSpinner = (props) => (
  <LoadingSpinner context="lab" {...props} />
)

export const PrescriptionSpinner = (props) => (
  <LoadingSpinner context="prescription" {...props} />
)

export const BillingSpinner = (props) => (
  <LoadingSpinner context="billing" {...props} />
)