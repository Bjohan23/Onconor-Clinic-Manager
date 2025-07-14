import { useTheme } from '../../contexts/ThemeContext'

export const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  shadow = 'md',
  hover = false,
  className = '',
  onClick,
  ...props
}) => {
  const { colors } = useTheme()

  const variants = {
    default: {
      bg: colors.background.primary,
      border: colors.border.light
    },
    elevated: {
      bg: colors.background.primary,
      border: 'transparent'
    },
    outlined: {
      bg: 'transparent',
      border: colors.border.medium
    },
    filled: {
      bg: colors.background.secondary,
      border: 'transparent'
    },
    medical: {
      bg: colors.background.primary,
      border: colors.primary[200]
    },
    critical: {
      bg: colors.error[50],
      border: colors.error[200]
    },
    success: {
      bg: colors.success[50],
      border: colors.success[200]
    },
    warning: {
      bg: colors.warning[50],
      border: colors.warning[200]
    }
  }

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  }

  const shadows = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  }

  const variantConfig = variants[variant]

  return (
    <div
      className={`
        rounded-lg border
        ${paddings[padding]}
        ${shadows[shadow]}
        ${hover ? 'transition-all duration-200 hover:shadow-lg hover:-translate-y-1' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{
        backgroundColor: variantConfig.bg,
        borderColor: variantConfig.border
      }}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
}

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`pb-4 border-b border-gray-200 mb-4 ${className}`} {...props}>
    {children}
  </div>
)

export const CardTitle = ({ children, className = '', ...props }) => {
  const { colors } = useTheme()
  
  return (
    <h3 
      className={`text-lg font-semibold ${className}`} 
      style={{ color: colors.text.primary }}
      {...props}
    >
      {children}
    </h3>
  )
}

export const CardDescription = ({ children, className = '', ...props }) => {
  const { colors } = useTheme()
  
  return (
    <p 
      className={`text-sm mt-1 ${className}`} 
      style={{ color: colors.text.secondary }}
      {...props}
    >
      {children}
    </p>
  )
}

export const CardContent = ({ children, className = '', ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
)

export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`pt-4 border-t border-gray-200 mt-4 ${className}`} {...props}>
    {children}
  </div>
)