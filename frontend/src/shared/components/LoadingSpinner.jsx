import { useTheme } from '../contexts/ThemeContext'

export const LoadingSpinner = ({ size = 'md', text = 'Cargando...' }) => {
  const { colors } = useTheme()
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen" 
         style={{ backgroundColor: colors.background.primary }}>
      <div className="flex flex-col items-center space-y-4">
        <div
          className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-300`}
          style={{
            borderTopColor: colors.primary[500],
            borderRightColor: colors.primary[500]
          }}
        ></div>
        <p className="text-sm font-medium" style={{ color: colors.text.secondary }}>
          {text}
        </p>
      </div>
    </div>
  )
}

export const ButtonSpinner = ({ size = 'sm' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
  }

  return (
    <div
      className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-white border-t-transparent`}
    ></div>
  )
}