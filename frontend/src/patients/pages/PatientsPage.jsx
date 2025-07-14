import { useTheme } from '../../shared/contexts/ThemeContext'

const PatientsPage = () => {
  const { colors } = useTheme()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: colors.text.primary }}>
        Pacientes
      </h1>
      <div className="p-6 rounded-lg shadow-sm border"
           style={{ 
             backgroundColor: colors.background.primary,
             borderColor: colors.border.light 
           }}>
        <p style={{ color: colors.text.secondary }}>
          Lista de pacientes - En desarrollo
        </p>
      </div>
    </div>
  )
}

export default PatientsPage