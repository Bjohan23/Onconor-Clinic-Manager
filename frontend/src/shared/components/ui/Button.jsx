import { useTheme } from '../../contexts/ThemeContext'
import { ButtonSpinner } from '../LoadingSpinner'

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  icon = null,
  ...props
}) => {
  const { colors, isDarkMode } = useTheme()

  const variants = {
    primary: {
      bg: colors.primary[600],
      bgHover: colors.primary[700],
      bgDisabled: colors.gray[300],
      text: colors.text.inverse,
      textDisabled: colors.gray[500]
    },
    secondary: {
      bg: colors.secondary[600],
      bgHover: colors.secondary[700],
      bgDisabled: colors.gray[300],
      text: colors.text.inverse,
      textDisabled: colors.gray[500]
    },
    outline: {
      bg: 'transparent',
      bgHover: colors.primary[50],
      bgDisabled: 'transparent',
      text: colors.primary[600],
      textDisabled: colors.gray[400],
      border: colors.primary[300],
      borderHover: colors.primary[400]
    },
    ghost: {
      bg: 'transparent',
      bgHover: colors.gray[100],
      bgDisabled: 'transparent',
      text: colors.text.primary,
      textDisabled: colors.gray[400]
    },
    danger: {
      bg: colors.error[600],
      bgHover: colors.error[700],
      bgDisabled: colors.gray[300],
      text: colors.text.inverse,
      textDisabled: colors.gray[500]
    },
    success: {
      bg: colors.success[600],
      bgHover: colors.success[700],
      bgDisabled: colors.gray[300],
      text: colors.text.inverse,
      textDisabled: colors.gray[500]
    },
    warning: {
      bg: colors.warning[600],
      bgHover: colors.warning[700],
      bgDisabled: colors.gray[300],
      text: colors.text.inverse,
      textDisabled: colors.gray[500]
    }
  }

  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  }

  const variantConfig = variants[variant]
  const isDisabled = disabled || loading

  const baseStyles = {
    backgroundColor: isDisabled ? variantConfig.bgDisabled : variantConfig.bg,
    color: isDisabled ? variantConfig.textDisabled : variantConfig.text,
    borderColor: variantConfig.border || 'transparent',
    borderWidth: variantConfig.border ? '1px' : '0'
  }

  const hoverStyles = !isDisabled ? {
    ':hover': {
      backgroundColor: variantConfig.bgHover,
      borderColor: variantConfig.borderHover || variantConfig.border || 'transparent'
    }
  } : {}

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={!isDisabled ? onClick : undefined}
      className={`
        inline-flex items-center justify-center
        font-medium rounded-lg
        border transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50
        ${sizes[size]}
        ${className}
      `}
      style={{
        ...baseStyles,
        focusRingColor: colors.primary[500],
        ...hoverStyles
      }}
      {...props}
    >
      {loading && (
        <ButtonSpinner size={size === 'xs' || size === 'sm' ? 'sm' : 'md'} />
      )}
      {!loading && icon && (
        <span className={`${children ? 'mr-2' : ''}`}>
          {icon}
        </span>
      )}
      {!loading && children}
    </button>
  )
}

export const IconButton = ({ icon, ...props }) => (
  <Button {...props}>
    {icon}
  </Button>
)