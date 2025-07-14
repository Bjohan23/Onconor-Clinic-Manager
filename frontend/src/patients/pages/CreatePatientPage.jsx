import { useTheme } from '../../shared/contexts/ThemeContext'

const CreatePatientPage = () => {
  const { colors } = useTheme()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: colors.text.primary }}>
        Crear Paciente
      </h1>
      <div className="p-6 rounded-lg shadow-sm border"
           style={{ 
             backgroundColor: colors.background.primary,
             borderColor: colors.border.light 
           }}>
        <p style={{ color: colors.text.secondary }}>
          Formulario para crear paciente - En desarrollo
        </p>
      </div>
    </div>
  )
}

export default CreatePatientPage