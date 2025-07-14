import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

export const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth()
  const { colors, isDarkMode, toggleTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v3H8V5z" />
        </svg>
      )
    },
    { 
      name: 'Pacientes', 
      href: '/patients', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    },
    { 
      name: 'Citas', 
      href: '/appointments', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v16a2 2 0 002 2z" />
        </svg>
      ),
      disabled: true
    },
    { 
      name: 'Historiales', 
      href: '/medical-records', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      disabled: true
    },
  ]

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: colors.background.secondary }}>
      {/* Sidebar */}
      <div 
        className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 flex flex-col shadow-lg`}
        style={{ backgroundColor: colors.background.primary }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 border-b"
             style={{ borderColor: colors.border.light }}>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3"
                 style={{ backgroundColor: colors.primary[500] }}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m0 0h4M9 7h6m-6 4h6m-2 4h.01" />
              </svg>
            </div>
            {sidebarOpen && (
              <h1 className="text-xl font-bold" style={{ color: colors.text.primary }}>
                Onconor
              </h1>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                item.disabled 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-opacity-10'
              } ${
                isActive(item.href) && !item.disabled
                  ? 'text-white shadow-sm'
                  : ''
              }`}
              style={{
                backgroundColor: isActive(item.href) && !item.disabled ? colors.primary[600] : 'transparent',
                color: isActive(item.href) && !item.disabled ? 'white' : colors.text.secondary,
                ':hover': { backgroundColor: colors.primary[50] }
              }}
              onClick={(e) => item.disabled && e.preventDefault()}
            >
              <span className="mr-3">{item.icon}</span>
              {sidebarOpen && item.name}
            </Link>
          ))}
        </nav>

        {/* Theme Toggle */}
        <div className="px-4 py-4 border-t" style={{ borderColor: colors.border.light }}>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors"
            style={{ 
              color: colors.text.secondary,
              ':hover': { backgroundColor: colors.background.secondary }
            }}
          >
            {isDarkMode ? (
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
            {sidebarOpen && (isDarkMode ? 'Modo claro' : 'Modo oscuro')}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b shadow-sm"
                style={{ 
                  backgroundColor: colors.background.primary,
                  borderColor: colors.border.light 
                }}>
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg transition-colors"
              style={{ 
                color: colors.text.secondary,
                ':hover': { backgroundColor: colors.background.secondary }
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="ml-4 text-lg font-semibold" style={{ color: colors.text.primary }}>
              {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
            </h2>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ focusRingColor: colors.primary[500] }}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: colors.primary[100] }}>
                <span className="text-sm font-medium" style={{ color: colors.primary[600] }}>
                  {user?.firstName?.[0] || 'U'}
                </span>
              </div>
              <span className="hidden md:block font-medium" style={{ color: colors.text.primary }}>
                {user?.firstName || 'Usuario'}
              </span>
            </button>

            {userMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-48 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                style={{ backgroundColor: colors.background.primary }}
              >
                <div className="py-1">
                  <div className="px-4 py-2 text-sm border-b" style={{ 
                    color: colors.text.secondary,
                    borderColor: colors.border.light 
                  }}>
                    {user?.email}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm transition-colors"
                    style={{ 
                      color: colors.text.secondary,
                      ':hover': { backgroundColor: colors.background.secondary }
                    }}
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}