import { useState, useEffect, createContext, useContext } from 'react'
import { useTheme } from '../../contexts/ThemeContext'

// Context para el Toast
const ToastContext = createContext()

// Hook personalizado para usar el toast
export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast debe ser usado dentro de ToastProvider')
  }
  return context
}

// Provider del Toast
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random()
    const toast = { id, message, type, duration }
    
    setToasts(prev => [...prev, toast])
    
    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
    
    return id
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const success = (message, duration) => addToast(message, 'success', duration)
  const error = (message, duration) => addToast(message, 'error', duration)
  const warning = (message, duration) => addToast(message, 'warning', duration)
  const info = (message, duration) => addToast(message, 'info', duration)

  return (
    <ToastContext.Provider value={{ 
      addToast, 
      removeToast, 
      success, 
      error, 
      warning, 
      info 
    }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

// Contenedor de toasts
const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  )
}

// Componente Toast individual
const Toast = ({ message, type = 'info', onClose }) => {
  const { colors } = useTheme()
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Animación de entrada
    setTimeout(() => setIsVisible(true), 10)
  }, [])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const typeConfigs = {
    success: {
      bg: colors.success[50],
      border: colors.success[200],
      text: colors.success[800],
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    },
    error: {
      bg: colors.error[50],
      border: colors.error[200],
      text: colors.error[800],
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )
    },
    warning: {
      bg: colors.warning[50],
      border: colors.warning[200],
      text: colors.warning[800],
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )
    },
    info: {
      bg: colors.info[50],
      border: colors.info[200],
      text: colors.info[800],
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      )
    }
  }

  const config = typeConfigs[type] || typeConfigs.info

  return (
    <div
      className={`
        flex items-start p-4 rounded-lg border shadow-lg transition-all duration-300 transform
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isLeaving ? 'scale-95' : 'scale-100'}
      `}
      style={{
        backgroundColor: config.bg,
        borderColor: config.border,
        color: config.text,
        minWidth: '320px',
        maxWidth: '400px'
      }}
    >
      <div className="flex-shrink-0 mr-3 mt-0.5">
        {config.icon}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-5">
          {message}
        </p>
      </div>
      
      <button
        onClick={handleClose}
        className="flex-shrink-0 ml-3 p-1 rounded-md transition-colors hover:bg-black hover:bg-opacity-10"
        style={{ color: config.text }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

// Hook para confirmaciones con toast
export const useConfirm = () => {
  const toast = useToast()
  
  const confirm = (message, onConfirm, onCancel = null) => {
    return new Promise((resolve) => {
      const handleConfirm = () => {
        if (onConfirm) onConfirm()
        resolve(true)
      }
      
      const handleCancel = () => {
        if (onCancel) onCancel()
        resolve(false)
      }
      
      // Crear un toast personalizado con botones
      const toastId = toast.addToast(
        <ConfirmationToast 
          message={message} 
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />, 
        'warning', 
        0 // No auto-remove
      )
    })
  }
  
  return { confirm }
}

// Componente de confirmación
const ConfirmationToast = ({ message, onConfirm, onCancel }) => {
  const { colors } = useTheme()
  
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">{message}</p>
      <div className="flex space-x-2 justify-end">
        <button
          onClick={onCancel}
          className="px-3 py-1 text-xs rounded-md border transition-colors"
          style={{
            backgroundColor: colors.background.primary,
            borderColor: colors.border.medium,
            color: colors.text.secondary
          }}
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className="px-3 py-1 text-xs rounded-md transition-colors"
          style={{
            backgroundColor: colors.error[500],
            color: 'white'
          }}
        >
          Confirmar
        </button>
      </div>
    </div>
  )
}

// Exportaciones nombradas
export { Toast }

// Exportación por defecto
export default Toast