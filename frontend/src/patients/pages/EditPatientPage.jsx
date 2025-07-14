import { useTheme } from '../../shared/contexts/ThemeContext'

const EditPatientPage = () => {
  const { colors } = useTheme()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: colors.text.primary }}>
        Editar Paciente
      </h1>
      <div className="p-6 rounded-lg shadow-sm border"
           style={{ 
             backgroundColor: colors.background.primary,
             borderColor: colors.border.light 
           }}>
        <p style={{ color: colors.text.secondary }}>
          Formulario para editar paciente - En desarrollo
        </p>
      </div>
    </div>
  )
}

export default EditPatientPage