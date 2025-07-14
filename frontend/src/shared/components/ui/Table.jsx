import { useTheme } from '../../contexts/ThemeContext'
import { LoadingSpinner } from '../LoadingSpinner'

export const Table = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No hay datos disponibles',
  hover = true,
  striped = false,
  className = '',
  ...props
}) => {
  const { colors } = useTheme()

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" text="Cargando datos..." />
      </div>
    )
  }

  return (
    <div className={`overflow-x-auto rounded-lg border ${className}`} 
         style={{ borderColor: colors.border.light }}>
      <table className="min-w-full divide-y" 
             style={{ backgroundColor: colors.background.primary }}>
        <thead style={{ backgroundColor: colors.background.secondary }}>
          <tr>
            {columns.map((column, index) => (
              <th
                key={column.key || index}
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${column.className || ''}`}
                style={{ 
                  color: colors.text.secondary,
                  textAlign: column.align || 'left'
                }}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y" style={{ backgroundColor: colors.background.primary }}>
          {data.length === 0 ? (
            <tr>
              <td 
                colSpan={columns.length}
                className="px-6 py-8 text-center text-sm"
                style={{ color: colors.text.tertiary }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                className={`
                  ${hover ? 'hover:bg-gray-50 dark:hover:bg-gray-700' : ''}
                  ${striped && rowIndex % 2 === 1 ? 'bg-gray-25 dark:bg-gray-800' : ''}
                  transition-colors duration-150
                `}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={column.key || colIndex}
                    className={`px-6 py-4 whitespace-nowrap text-sm ${column.cellClassName || ''}`}
                    style={{ 
                      color: colors.text.primary,
                      textAlign: column.align || 'left'
                    }}
                  >
                    {column.render ? column.render(row[column.key], row, rowIndex) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export const TableActions = ({ children, className = '' }) => (
  <div className={`flex items-center space-x-2 ${className}`}>
    {children}
  </div>
)

export const TableStatus = ({ status, variant = 'default' }) => {
  const { colors } = useTheme()
  
  const variants = {
    success: {
      bg: colors.success[50],
      text: colors.success[800],
      border: colors.success[200]
    },
    warning: {
      bg: colors.warning[50],
      text: colors.warning[800],
      border: colors.warning[200]
    },
    error: {
      bg: colors.error[50],
      text: colors.error[800],
      border: colors.error[200]
    },
    info: {
      bg: colors.info[50],
      text: colors.info[800],
      border: colors.info[200]
    },
    secondary: {
      bg: colors.secondary[50],
      text: colors.secondary[800],
      border: colors.secondary[200]
    },
    default: {
      bg: colors.gray[100],
      text: colors.gray[800],
      border: colors.gray[200]
    }
  }

  const config = variants[variant]

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
      style={{
        backgroundColor: config.bg,
        color: config.text,
        borderColor: config.border
      }}
    >
      {status}
    </span>
  )
}