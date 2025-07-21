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
      )
    },
    { 
      name: 'Citas', 
      href: '/appointments', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v16a2 2 0 002 2z" />
        </svg>
      )
    },
    // --- TEAM 3 ---
    { 
      name: 'Historiales Médicos', 
      href: '/medical-records', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
      )
    },
    { 
      name: 'Tratamientos', 
      href: '/treatments', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 014-4h4" />
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={2} fill="none"/>
        </svg>
      )
    },
    { 
      name: 'Prescripciones', 
      href: '/prescriptions', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      name: 'Exámenes Médicos', 
      href: '/medical-exams', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={2} fill="none"/>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h4l3 3" />
        </svg>
      )
    },
    { 
      name: 'Facturación', 
      href: '/invoices', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l2-2 4 4m0 0V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2z" />
        </svg>
      )
    },
    { 
      name: 'Pagos', 
      href: '/payments', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect width="20" height="14" x="2" y="5" rx="2" stroke="currentColor" strokeWidth={2} fill="none"/>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 10h20" />
        </svg>
      )
    },
    // --- FIN TEAM 3 ---
    { 
      name: 'Reportes', 
      href: '/reports', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      name: 'Horarios', 
      href: '/schedules', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
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
    <div className="h-screen flex overflow-hidden relative" 
         style={{ 
           background: isDarkMode 
             ? 'linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 25%, #16213e 50%, #0f0f1e 75%)'
             : 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%)',
           backgroundSize: '400% 400%',
           animation: 'gradientBg 20s ease infinite'
         }}>
      
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full opacity-5 animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-gradient-to-r from-pink-400 to-red-600 rounded-full opacity-5 animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Sidebar */}
      <div 
        className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-500 flex flex-col dashboard-sidebar glass-dark backdrop-blur-xl border-r border-white/10`}
        style={{ 
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          zIndex: 1000
        }}
      >
        {/* Modern Logo */}
        <div className="flex items-center justify-center h-20 px-4 border-b border-white/10">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mr-3 bg-gradient-primary neon-blue animate-pulse-glow">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent neon-text">
                  Onconor
                </h1>
                <p className="text-xs text-gray-400 tracking-wider uppercase">
                  Clinic Manager
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6">
          <div className="space-y-2" style={{ paddingBottom: '80px' }}>
            {navigation.map((item) => {
              const active = isActive(item.href) && !item.disabled
              
              return (
                <Link
                  key={item.name}
                  to={item.disabled ? '#' : item.href}
                  className={`
                    group relative flex items-center rounded-2xl transition-all duration-300
                    ${sidebarOpen ? 'px-4 py-4' : 'px-3 py-4 justify-center'}
                    text-sm font-medium
                    ${item.disabled ? 'opacity-40 cursor-not-allowed' : 'hover:transform hover:scale-105 card-hover'}
                    ${active ? 'shadow-xl transform scale-105 neon-blue' : ''}
                  `}
                  style={{
                    background: active 
                      ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%)'
                      : item.disabled 
                        ? 'transparent'
                        : 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: active ? 'blur(20px)' : 'blur(10px)',
                    border: active ? '1px solid rgba(102, 126, 234, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                    color: active ? '#ffffff' : '#cbd5e1',
                    boxShadow: active ? '0 0 30px rgba(102, 126, 234, 0.4)' : 'none'
                  }}
                  onClick={(e) => item.disabled && e.preventDefault()}
                  title={!sidebarOpen ? item.name : undefined}
                >
                  <span className={`flex-shrink-0 ${sidebarOpen ? 'mr-3' : ''}`}>{item.icon}</span>
                  {sidebarOpen && (
                    <span className="truncate">{item.name}</span>
                  )}
                  {!sidebarOpen && !item.disabled && (
                    <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Theme Toggle - Fixed at bottom */}
        <div className="px-4 py-4 border-t bg-inherit" style={{ borderColor: colors.border.light }}>
          <button
            onClick={toggleTheme}
            className={`
              group relative w-full flex items-center text-sm font-medium rounded-xl transition-all duration-200 hover:shadow-md
              ${sidebarOpen ? 'px-3 py-3' : 'px-3 py-3 justify-center'}
            `}
            style={{ 
              backgroundColor: colors.background.secondary,
              color: colors.text.secondary
            }}
            title={!sidebarOpen ? (isDarkMode ? 'Modo claro' : 'Modo oscuro') : undefined}
          >
            <span className={`flex-shrink-0 ${sidebarOpen ? 'mr-3' : ''}`}>
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
            {!sidebarOpen && (
              <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {isDarkMode ? 'Modo claro' : 'Modo oscuro'}
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden dashboard-content">
        {/* Modern Header */}
        <header className="h-20 flex items-center justify-between px-8 glass backdrop-blur-xl border-b border-white/10 dashboard-header"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  zIndex: 999
                }}>
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-3 rounded-2xl transition-all duration-300 hover:transform hover:scale-110 glass"
              style={{ 
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#cbd5e1'
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="ml-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Bienvenido de vuelta, <span className="text-blue-400 font-medium">{user?.firstName || 'Usuario'}</span>
              </p>
            </div>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-4 text-sm rounded-2xl px-4 py-3 transition-all duration-300 hover:transform hover:scale-105 glass focus:outline-none card-hover"
              style={{ 
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-primary neon-blue animate-pulse-glow">
                <span className="text-sm font-bold text-white">
                  {user?.firstName?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="font-semibold text-white">
                  {user?.firstName || 'Usuario'}
                </p>
                <p className="text-xs text-blue-400 uppercase tracking-wider">
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
        <main className="flex-1 overflow-auto p-6 relative">
          {children}
        </main>
      </div>

      {/* CSS Animations ya están definidas en index.css */}
    </div>
  )
}