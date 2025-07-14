import { createContext, useContext, useEffect, useState } from 'react'
import { getTheme } from '../theme/theme'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Verificar preferencia guardada o preferencia del sistema
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      return savedTheme === 'dark'
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  const theme = getTheme(isDarkMode ? 'dark' : 'light')

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newMode = !prev
      localStorage.setItem('theme', newMode ? 'dark' : 'light')
      return newMode
    })
  }

  // Aplicar clase al html para CSS global
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
    document.documentElement.style.setProperty('--primary-color', theme.primary[500])
    document.documentElement.style.setProperty('--secondary-color', theme.secondary[500])
    document.documentElement.style.setProperty('--background-primary', theme.background.primary)
    document.documentElement.style.setProperty('--text-primary', theme.text.primary)
  }, [isDarkMode, theme])

  const value = {
    isDarkMode,
    theme,
    toggleTheme,
    colors: theme,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}