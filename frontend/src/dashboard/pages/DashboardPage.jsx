import { useTheme } from '../../shared/contexts/ThemeContext'

const DashboardPage = () => {
  const { colors } = useTheme()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: colors.text.primary }}>
        Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stats Cards */}
        <div className="p-6 rounded-lg shadow-sm border"
             style={{ 
               backgroundColor: colors.background.primary,
               borderColor: colors.border.light 
             }}>
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: colors.primary[100] }}>
              <svg className="w-6 h-6" style={{ color: colors.primary[600] }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                Total Pacientes
              </p>
              <p className="text-2xl font-semibold" style={{ color: colors.text.primary }}>
                1,234
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg shadow-sm border"
             style={{ 
               backgroundColor: colors.background.primary,
               borderColor: colors.border.light 
             }}>
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: colors.secondary[100] }}>
              <svg className="w-6 h-6" style={{ color: colors.secondary[600] }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v16a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                Citas Hoy
              </p>
              <p className="text-2xl font-semibold" style={{ color: colors.text.primary }}>
                24
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg shadow-sm border"
             style={{ 
               backgroundColor: colors.background.primary,
               borderColor: colors.border.light 
             }}>
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: colors.warning[100] }}>
              <svg className="w-6 h-6" style={{ color: colors.warning[600] }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                Pendientes
              </p>
              <p className="text-2xl font-semibold" style={{ color: colors.text.primary }}>
                8
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg shadow-sm border"
             style={{ 
               backgroundColor: colors.background.primary,
               borderColor: colors.border.light 
             }}>
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: colors.success[100] }}>
              <svg className="w-6 h-6" style={{ color: colors.success[600] }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                Completadas
              </p>
              <p className="text-2xl font-semibold" style={{ color: colors.text.primary }}>
                16
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage