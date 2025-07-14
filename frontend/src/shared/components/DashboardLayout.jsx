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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
      name: 'Doctores', 
      href: '/doctors', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    { 
      name: 'Especialidades', 
      href: '/specialties', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m0 0h4M9 7h6m-6 4h6m-2 4h.01" />
        </svg>
      ),
      disabled: true
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
      name: 'Reportes', 
      href: '/reports', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
    <div className="h-screen flex overflow-hidden" 
         style={{ backgroundColor: colors.background.secondary }}>
      {/* Sidebar */}
      <div 
        className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 flex flex-col shadow-xl`}
        style={{ 
          backgroundColor: colors.background.primary,
          borderRight: `1px solid ${colors.border.light}`
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 border-b"
             style={{ borderColor: colors.border.light }}>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mr-3 shadow-lg"
                 style={{ 
                   background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)` 
                 }}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold" style={{ color: colors.text.primary }}>
                  Onconor
                </h1>
                <p className="text-xs" style={{ color: colors.text.tertiary }}>
                  Clinic Manager
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const active = isActive(item.href) && !item.disabled
            
            return (
              <Link
                key={item.name}
                to={item.disabled ? '#' : item.href}
                className={`
                  flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200
                  ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
                  ${active ? 'shadow-lg transform scale-105' : ''}
                `}
                style={{
                  background: active 
                    ? `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`
                    : item.disabled 
                      ? 'transparent'
                      : colors.background.secondary,
                  color: active ? colors.text.inverse : colors.text.secondary,
                  boxShadow: active ? `0 8px 25px ${colors.primary[500]}30` : 'none'
                }}
                onClick={(e) => item.disabled && e.preventDefault()}
              >
                <span className="mr-3 flex-shrink-0">{item.icon}</span>
                {sidebarOpen && (
                  <span className="truncate">{item.name}</span>
                )}
                {!sidebarOpen && !item.disabled && (
                  <div className="absolute left-16 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.name}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Theme Toggle */}
        <div className="px-4 py-4 border-t" style={{ borderColor: colors.border.light }}>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:shadow-md"
            style={{ 
              backgroundColor: colors.background.secondary,
              color: colors.text.secondary
            }}
          >
            <span className="mr-3 flex-shrink-0">
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </span>
            {sidebarOpen && (
              <span className="truncate">
                {isDarkMode ? 'Modo claro' : 'Modo oscuro'}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 shadow-sm border-b"
                style={{ 
                  backgroundColor: colors.background.primary,
                  borderColor: colors.border.light 
                }}>
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg transition-colors hover:shadow-md"
              style={{ 
                color: colors.text.secondary,
                backgroundColor: colors.background.secondary
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="ml-4">
              <h2 className="text-lg font-semibold" style={{ color: colors.text.primary }}>
                {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
              </h2>
              <p className="text-xs" style={{ color: colors.text.tertiary }}>
                Bienvenido de vuelta, {user?.firstName || 'Usuario'}
              </p>
            </div>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-3 text-sm rounded-xl px-3 py-2 transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ 
                backgroundColor: colors.background.secondary,
                focusRingColor: colors.primary[500] 
              }}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-inner"
                   style={{ 
                     background: `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.primary[500]} 100%)` 
                   }}>
                <span className="text-sm font-semibold text-white">
                  {user?.firstName?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="font-medium" style={{ color: colors.text.primary }}>
                  {user?.firstName || 'Usuario'}
                </p>
                <p className="text-xs" style={{ color: colors.text.tertiary }}>
                  {user?.role || 'Administrador'}
                </p>
              </div>
              <svg className="w-4 h-4" style={{ color: colors.text.tertiary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {userMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 z-50 border"
                style={{ 
                  backgroundColor: colors.background.primary,
                  borderColor: colors.border.light
                }}
              >
                <div className="p-4 border-b" style={{ borderColor: colors.border.light }}>
                  <p className="text-sm font-medium" style={{ color: colors.text.primary }}>
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs" style={{ color: colors.text.secondary }}>
                    {user?.email}
                  </p>
                </div>
                <div className="py-2">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-red-50 flex items-center"
                    style={{ color: colors.error[600] }}
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
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