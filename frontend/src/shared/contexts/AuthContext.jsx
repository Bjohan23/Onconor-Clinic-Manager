import { createContext, useContext, useEffect, useReducer } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext()

// Estados de autenticación
const authStates = {
  IDLE: 'idle',
  LOADING: 'loading',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
  ERROR: 'error'
}

// Reducer para manejar estado de autenticación
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        status: authStates.LOADING,
        error: null
      }
    
    case 'SET_AUTHENTICATED':
      return {
        ...state,
        status: authStates.AUTHENTICATED,
        user: action.payload.user,
        token: action.payload.token,
        error: null
      }
    
    case 'SET_UNAUTHENTICATED':
      return {
        ...state,
        status: authStates.UNAUTHENTICATED,
        user: null,
        token: null,
        error: null
      }
    
    case 'SET_ERROR':
      return {
        ...state,
        status: authStates.ERROR,
        error: action.payload,
        user: null,
        token: null
      }
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }
    
    default:
      return state
  }
}

// Estado inicial
const initialState = {
  status: authStates.IDLE,
  user: null,
  token: null,
  error: null
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Verificar si hay token guardado al inicializar
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      if (token && user) {
        try {
          // Verificar si el token sigue siendo válido
          const userData = JSON.parse(user)
          dispatch({
            type: 'SET_AUTHENTICATED',
            payload: { user: userData, token }
          })
        } catch (error) {
          // Token inválido, limpiar storage
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          dispatch({ type: 'SET_UNAUTHENTICATED' })
        }
      } else {
        dispatch({ type: 'SET_UNAUTHENTICATED' })
      }
    }

    initAuth()
  }, [])

  // Función de login
  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING' })
      
      const response = await authService.login(credentials)
      
      if (response.success && response.data) {
        const { user, token } = response.data
        
        // Guardar en localStorage
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        
        dispatch({
          type: 'SET_AUTHENTICATED',
          payload: { user, token }
        })
        
        return { success: true, data: response.data }
      } else {
        throw new Error(response.message || 'Error de autenticación')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error de conexión'
      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage
      })
      return { success: false, error: errorMessage }
    }
  }

  // Función de register
  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING' })
      
      const response = await authService.register(userData)
      
      if (response.success && response.data) {
        const { user, token } = response.data
        
        // Guardar en localStorage
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        
        dispatch({
          type: 'SET_AUTHENTICATED',
          payload: { user, token }
        })
        
        return { success: true, data: response.data }
      } else {
        throw new Error(response.message || 'Error de registro')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error de conexión'
      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage
      })
      return { success: false, error: errorMessage }
    }
  }

  // Función de logout
  const logout = async () => {
    try {
      // Opcional: llamar al endpoint de logout si existe
      await authService.logout()
    } catch (error) {
      console.error('Error en logout:', error)
    } finally {
      // Limpiar storage local
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      dispatch({ type: 'SET_UNAUTHENTICATED' })
    }
  }

  // Función para limpiar errores
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  // Funciones de utilidad
  const isAuthenticated = state.status === authStates.AUTHENTICATED
  const isLoading = state.status === authStates.LOADING
  const hasError = state.status === authStates.ERROR

  const value = {
    // Estado
    ...state,
    isAuthenticated,
    isLoading,
    hasError,
    
    // Acciones
    login,
    register,
    logout,
    clearError,
    
    // Estados disponibles
    authStates
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}