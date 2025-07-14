import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../shared/contexts/ThemeContext'
import { useToast } from '../../shared/components/ui/Toast'
import { doctorService } from '../services/doctorService'
import { Button } from '../../shared/components/ui/Button'
import { Input } from '../../shared/components/ui/Input'
import { Card } from '../../shared/components/ui/Card'
import { Table, TableStatus, TableActions } from '../../shared/components/ui/Table'
import { LoadingSpinner } from '../../shared/components/LoadingSpinner'

const DoctorsPage = () => {
  const { colors } = useTheme()
  const navigate = useNavigate()
  const toast = useToast()
  
  // Estados
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [specialtyFilter, setSpecialtyFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Cargar doctores al montar componente y cuando cambien filtros
  useEffect(() => {
    fetchDoctors()
  }, [currentPage, itemsPerPage, searchTerm, specialtyFilter, statusFilter])

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const filters = {}
      if (searchTerm.trim()) filters.search = searchTerm.trim()
      if (specialtyFilter) filters.specialty = specialtyFilter
      if (statusFilter) filters.status = statusFilter

      const response = await doctorService.getDoctorsWithPagination(
        currentPage, 
        itemsPerPage, 
        filters
      )

      if (response.success) {
        setDoctors(response.data.doctors || [])
        setTotalPages(response.data.totalPages || 1)
        setTotalItems(response.data.totalItems || 0)
      } else {
        setError(response.message || 'Error al cargar doctores')
      }
    } catch (err) {
      console.error('Error fetching doctors:', err)
      setError(err.message || 'Error de conexión al servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleSpecialtyFilter = (value) => {
    setSpecialtyFilter(value)
    setCurrentPage(1)
  }

  const handleStatusFilter = (value) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const handleDeactivate = async (doctorId, doctorName) => {
    const confirmed = await new Promise((resolve) => {
      const handleConfirm = () => {
        toast.removeToast(toastId)
        resolve(true)
      }
      
      const handleCancel = () => {
        toast.removeToast(toastId)
        resolve(false)
      }
      
      const toastId = toast.addToast(
        <div className="space-y-3">
          <p className="text-sm font-medium">
            ¿Estás seguro de que deseas desactivar al doctor <strong>{doctorName}</strong>?
          </p>
          <div className="flex space-x-2 justify-end">
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-xs rounded-md border transition-colors"
              style={{
                backgroundColor: colors.background.primary,
                borderColor: colors.border.medium,
                color: colors.text.secondary
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="px-3 py-1 text-xs rounded-md transition-colors"
              style={{
                backgroundColor: colors.error[500],
                color: 'white'
              }}
            >
              Desactivar
            </button>
          </div>
        </div>,
        'warning',
        0
      )
    })

    if (confirmed) {
      try {
        const response = await doctorService.deactivateDoctor(doctorId)
        if (response.success) {
          toast.success(`Doctor ${doctorName} desactivado exitosamente`)
          fetchDoctors()
        } else {
          toast.error(response.message || 'Error al desactivar doctor')
        }
      } catch (err) {
        console.error('Error deactivating doctor:', err)
        toast.error('Error de conexión al desactivar doctor')
      }
    }
  }

  const formatPhone = (phone) => {
    if (!phone) return '-'
    if (phone.startsWith('+51')) {
      return phone
    }
    return phone.startsWith('9') ? `+51 ${phone}` : phone
  }

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'activo':
        return 'success'
      case 'inactive':
      case 'inactivo':
        return 'error'
      case 'busy':
      case 'ocupado':
        return 'warning'
      case 'available':
      case 'disponible':
        return 'info'
      default:
        return 'default'
    }
  }

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'Activo'
      case 'inactive':
        return 'Inactivo'
      case 'busy':
        return 'Ocupado'
      case 'available':
        return 'Disponible'
      default:
        return status || 'Sin estado'
    }
  }

  // Configuración de columnas de la tabla
  const columns = [
    {
      key: 'medicalCode',
      title: 'Código Médico',
      render: (code) => (
        <span className="font-mono text-sm font-medium" style={{ color: colors.primary[600] }}>
          {code || '-'}
        </span>
      )
    },
    {
      key: 'fullName',
      title: 'Nombre Completo',
      render: (_, doctor) => (
        <div>
          <div className="font-medium" style={{ color: colors.text.primary }}>
            Dr. {doctor.firstName} {doctor.lastName}
          </div>
          <div className="text-xs" style={{ color: colors.text.tertiary }}>
            {doctor.email || 'Sin email'}
          </div>
        </div>
      )
    },
    {
      key: 'specialties',
      title: 'Especialidades',
      render: (specialties) => (
        <div className="space-y-1">
          {specialties && specialties.length > 0 ? (
            specialties.slice(0, 2).map((specialty, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 text-xs rounded-full"
                style={{
                  backgroundColor: colors.secondary[50],
                  color: colors.secondary[700],
                  border: `1px solid ${colors.secondary[200]}`
                }}
              >
                {specialty.name || specialty}
              </span>
            ))
          ) : (
            <span className="text-xs" style={{ color: colors.text.tertiary }}>
              Sin especialidades
            </span>
          )}
          {specialties && specialties.length > 2 && (
            <span className="text-xs" style={{ color: colors.text.tertiary }}>
              +{specialties.length - 2} más
            </span>
          )}
        </div>
      )
    },
    {
      key: 'phone',
      title: 'Teléfono',
      render: (phone) => (
        <span className="text-sm font-mono">{formatPhone(phone)}</span>
      )
    },
    {
      key: 'status',
      title: 'Estado',
      render: (status) => (
        <TableStatus 
          status={getStatusText(status)}
          variant={getStatusVariant(status)}
        />
      )
    },
    {
      key: 'createdAt',
      title: 'Fecha Registro',
      render: (date) => (
        <span className="text-sm">
          {date ? new Date(date).toLocaleDateString('es-PE') : '-'}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Acciones',
      align: 'center',
      render: (_, doctor) => (
        <TableActions>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/doctors/edit/${doctor.id}`)}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
          >
            Editar
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate(`/doctors/${doctor.id}/schedule`)}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v16a2 2 0 002 2z" />
              </svg>
            }
          >
            Horarios
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeactivate(doctor.id, `${doctor.firstName} ${doctor.lastName}`)}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            }
          >
            Desactivar
          </Button>
        </TableActions>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text.primary }}>
            Gestión de Doctores
          </h1>
          <p className="text-sm" style={{ color: colors.text.secondary }}>
            Administra la información de todos los doctores de la clínica
          </p>
        </div>
        <Button
          onClick={() => navigate('/doctors/create')}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          }
        >
          Nuevo Doctor
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Buscar por nombre, código o email..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
          <div>
            <select
              value={specialtyFilter}
              onChange={(e) => handleSpecialtyFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: colors.background.primary,
                borderColor: colors.border.medium,
                color: colors.text.primary,
                focusRingColor: colors.primary[400]
              }}
            >
              <option value="">Todas las especialidades</option>
              <option value="cardiologia">Cardiología</option>
              <option value="neurologia">Neurología</option>
              <option value="pediatria">Pediatría</option>
              <option value="ginecologia">Ginecología</option>
              <option value="traumatologia">Traumatología</option>
              <option value="medicina-general">Medicina General</option>
            </select>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: colors.background.primary,
                borderColor: colors.border.medium,
                color: colors.text.primary
              }}
            >
              <option value="">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="busy">Ocupado</option>
              <option value="available">Disponible</option>
            </select>
          </div>
          <div>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: colors.background.primary,
                borderColor: colors.border.medium,
                color: colors.text.primary
              }}
            >
              <option value={10}>10 por página</option>
              <option value={20}>20 por página</option>
              <option value={50}>50 por página</option>
              <option value={100}>100 por página</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Error Alert */}
      {error && (
        <Card variant="critical">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-3" style={{ color: colors.error[500] }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="font-medium" style={{ color: colors.error[700] }}>
                Error al cargar doctores
              </h3>
              <p className="text-sm" style={{ color: colors.error[600] }}>
                {error}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchDoctors}
            className="mt-3"
          >
            Reintentar
          </Button>
        </Card>
      )}

      {/* Tabla de Doctores */}
      <Card>
        {loading ? (
          <LoadingSpinner size="lg" text="Cargando doctores..." center />
        ) : (
          <>
            <Table
              columns={columns}
              data={doctors}
              loading={loading}
              emptyMessage="No se encontraron doctores con los filtros aplicados"
              hover
            />
            
            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t pt-4" 
                   style={{ borderColor: colors.border.light }}>
                <div className="text-sm" style={{ color: colors.text.secondary }}>
                  Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} doctores
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    Anterior
                  </Button>
                  
                  <span className="text-sm" style={{ color: colors.text.primary }}>
                    Página {currentPage} de {totalPages}
                  </span>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}

export default DoctorsPage