import { forwardRef, useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'

export const Input = forwardRef(({
  type = 'text',
  label,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  size = 'md',
  variant = 'default',
  icon,
  rightIcon,
  className = '',
  ...props
}, ref) => {
  const { colors } = useTheme()
  const [focused, setFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const variants = {
    default: {
      bg: colors.background.primary,
      border: error ? colors.error[300] : focused ? colors.primary[400] : colors.border.medium,
      text: colors.text.primary,
      placeholder: colors.text.tertiary
    },
    filled: {
      bg: colors.background.secondary,
      border: error ? colors.error[300] : focused ? colors.primary[400] : 'transparent',
      text: colors.text.primary,
      placeholder: colors.text.tertiary
    },
    outlined: {
      bg: 'transparent',
      border: error ? colors.error[300] : focused ? colors.primary[400] : colors.border.medium,
      text: colors.text.primary,
      placeholder: colors.text.tertiary
    }
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  }

  const variantConfig = variants[variant]
  const inputType = type === 'password' && showPassword ? 'text' : type

  return (
    <div className="space-y-1">
      {label && (
        <label 
          className="block text-sm font-medium"
          style={{ color: colors.text.secondary }}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span style={{ color: colors.text.tertiary }}>
              {icon}
            </span>
          </div>
        )}
        
        <input
          ref={ref}
          type={inputType}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            block w-full rounded-lg border
            focus:outline-none focus:ring-2 focus:ring-offset-1
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
            ${sizes[size]}
            ${icon ? 'pl-10' : ''}
            ${rightIcon || type === 'password' ? 'pr-10' : ''}
            ${className}
          `}
          style={{
            backgroundColor: variantConfig.bg,
            borderColor: variantConfig.border,
            color: variantConfig.text,
            focusRingColor: colors.primary[400]
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        
        {(rightIcon || type === 'password') && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {type === 'password' ? (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="focus:outline-none"
                style={{ color: colors.text.tertiary }}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            ) : (
              <span style={{ color: colors.text.tertiary }}>
                {rightIcon}
              </span>
            )}
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <p 
          className="text-xs"
          style={{ color: error ? colors.error[600] : colors.text.tertiary }}
        >
          {error || helperText}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export const TextArea = forwardRef(({
  label,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  rows = 3,
  variant = 'default',
  className = '',
  ...props
}, ref) => {
  const { colors } = useTheme()
  const [focused, setFocused] = useState(false)

  const variants = {
    default: {
      bg: colors.background.primary,
      border: error ? colors.error[300] : focused ? colors.primary[400] : colors.border.medium,
      text: colors.text.primary,
      placeholder: colors.text.tertiary
    },
    filled: {
      bg: colors.background.secondary,
      border: error ? colors.error[300] : focused ? colors.primary[400] : 'transparent',
      text: colors.text.primary,
      placeholder: colors.text.tertiary
    }
  }

  const variantConfig = variants[variant]

  return (
    <div className="space-y-1">
      {label && (
        <label 
          className="block text-sm font-medium"
          style={{ color: colors.text.secondary }}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`
          block w-full px-3 py-2 rounded-lg border text-sm
          focus:outline-none focus:ring-2 focus:ring-offset-1
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
          resize-vertical
          ${className}
        `}
        style={{
          backgroundColor: variantConfig.bg,
          borderColor: variantConfig.border,
          color: variantConfig.text,
          focusRingColor: colors.primary[400]
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      
      {(error || helperText) && (
        <p 
          className="text-xs"
          style={{ color: error ? colors.error[600] : colors.text.tertiary }}
        >
          {error || helperText}
        </p>
      )}
    </div>
  )
})

TextArea.displayName = 'TextArea'