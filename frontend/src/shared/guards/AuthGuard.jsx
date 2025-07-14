import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from '../components/LoadingSpinner'

export const AuthGuard = ({ children }) => {
  const { isAuthenticated, isLoading, status, authStates } = useAuth()
  const location = useLocation()

  // Mostrar spinner mientras se verifica la autenticación
  if (status === authStates.IDLE || isLoading) {
    return <LoadingSpinner />
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }} 
        replace 
      />
    )
  }

  return children
}

export const GuestGuard = ({ children }) => {
  const { isAuthenticated, isLoading, status, authStates } = useAuth()

  // Mostrar spinner mientras se verifica la autenticación
  if (status === authStates.IDLE || isLoading) {
    return <LoadingSpinner />
  }

  // Si está autenticado, redirigir al dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}