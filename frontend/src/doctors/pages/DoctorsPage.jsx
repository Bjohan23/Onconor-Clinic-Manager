import { useState, useEffect, useCallback, useMemo } from 'react'
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
  const [actionLoading, setActionLoading] = useState({})
  const [searchTimeout, setSearchTimeout] = useState(null)
  const [availableSpecialties, setAvailableSpecialties] = useState([])

  // Debounced search para mejorar performance
  const debouncedSearch = useCallback((value) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    const timeout = setTimeout(() => {
      setSearchTerm(value)
      setCurrentPage(1)
    }, 300)
    setSearchTimeout(timeout)
  }, [searchTimeout])

  // Cargar especialidades disponibles
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const response = await doctorService.getSpecialties()
        if (response.success) {
          // Asegura que availableSpecialties sea un array de objetos con los campos correctos
          const specialtiesArr = Array.isArray(response.data?.specialties)
            ? response.data.specialties.map(s => ({
                id: s.id,
                name: s.name,
                description: s.description,
                isActive: s.isActive,
                createdAt: s.createdAt || s.created_at,
                updatedAt: s.updatedAt || s.updated_at
              }))
            : [];
          setAvailableSpecialties(specialtiesArr)
        }
      } catch (err) {
        console.error('Error fetching specialties:', err)
      }
    }
    fetchSpecialties()
  }, [])

  // Cargar doctores al montar componente y cuando cambien filtros
  useEffect(() => {
    fetchDoctors()
  }, [currentPage, itemsPerPage, searchTerm, specialtyFilter, statusFilter])

  const fetchDoctors = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
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
        const doctorsArr = (response.data.doctors || []).map(doc => ({
          ...doc,
          specialties: Array.isArray(doc.specialties)
            ? doc.specialties
            : doc.specialty
              ? [doc.specialty]
              : []
        }));
        setDoctors(doctorsArr)
        setTotalPages(response.data.totalPages || 1)
        setTotalItems(response.data.totalItems || 0)
        
        // Si no hay resultados y estamos en una página > 1, ir a la página 1
        if (response.data.doctors.length === 0 && currentPage > 1) {
          setCurrentPage(1)
        }
      } else {
        setError(response.message || 'Error al cargar doctores')
        setDoctors([])
      }
    } catch (err) {
      console.error('Error fetching doctors:', err)
      const isNetworkError = !err.response
      setError(isNetworkError 
        ? 'Error de conexión. Verifica tu internet e intenta nuevamente.'
        : err.response?.data?.message || 'Error del servidor. Intenta nuevamente.'
      )
      setDoctors([])
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  const handleSearch = (value) => {
    debouncedSearch(value)
  }

  const handleSpecialtyFilter = (value) => {
    setSpecialtyFilter(value)
    setCurrentPage(1)
  }

  const handleStatusFilter = (value) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSpecialtyFilter('')
    setStatusFilter('')
    setCurrentPage(1)
    // Limpiar también el input de búsqueda
    const searchInput = document.querySelector('input[placeholder*="Buscar"]')
    if (searchInput) searchInput.value = ''
  }

  const handleDeactivate = async (doctorId, doctorName) => {
    // Verificar si el doctor tiene citas programadas
    try {
      const hasAppointments = await doctorService.checkActiveAppointments(doctorId)
      if (hasAppointments.data?.hasActive) {
        toast.warning(
          `No se puede desactivar al Dr. ${doctorName} porque tiene citas programadas. Cancela las citas primero.`,
          { duration: 5000 }
        )
        return
      }
    } catch (err) {
      console.error('Error checking appointments:', err)
    }

    const confirmed = await new Promise((resolve) => {
      const handleConfirm = async () => {
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
            ¿Estás seguro de que deseas desactivar al Dr. <strong>{doctorName}</strong>?
          </p>
          <p className="text-xs" style={{ color: colors.text.secondary }}>
            Esta acción se puede revertir posteriormente.
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
      setActionLoading(prev => ({ ...prev, [doctorId]: true }))
      try {
        const response = await doctorService.deactivateDoctor(doctorId)
        if (response.success) {
          toast.success(`Dr. ${doctorName} desactivado exitosamente`)
          // Refrescar datos sin mostrar spinner de carga completa
          fetchDoctors(false)
        } else {
          toast.error(response.message || 'Error al desactivar doctor')
        }
      } catch (err) {
        console.error('Error deactivating doctor:', err)
        toast.error('Error de conexión al desactivar doctor')
      } finally {
        setActionLoading(prev => ({ ...prev, [doctorId]: false }))
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

  // Contador de filtros activos
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (searchTerm.trim()) count++
    if (specialtyFilter) count++
    if (statusFilter) count++
    return count
  }, [searchTerm, specialtyFilter, statusFilter])

  // Configuración de columnas de la tabla
  const columns = [
    {
      key: 'medicalCode',
      title: 'Código Médico',
      render: (code) => (
        <span className="font-mono text-sm font-medium" style={{ color: colors.primary[600] }}>
          {code || (
            <span style={{ color: colors.text.tertiary }}>Sin código</span>
          )}
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
            {doctor.email || 'Sin email registrado'}
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
                className="inline-block px-2 py-1 text-xs rounded-full mr-1"
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
            <div className="text-xs mt-1" style={{ color: colors.text.tertiary }}>
              +{specialties.length - 2} más
            </div>
          )}
        </div>
      )
    },
    {
      key: 'phone',
      title: 'Teléfono',
      render: (phone) => (
        <span className="text-sm font-mono" style={{ 
          color: phone ? colors.text.primary : colors.text.tertiary 
        }}>
          {formatPhone(phone)}
        </span>
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
          {date ? new Date(date).toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }) : '-'}
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
            onClick={() => navigate(`/doctorsimage.png${doctor.id}`)}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
            title="Ver detalles"
          >
            Ver
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/doctors/edit/${doctor.id}`)}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
            title="Editar información"
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
            title="Gestionar horarios"
          >
            Horarios
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeactivate(doctor.id, `${doctor.firstName} ${doctor.lastName}`)}
            loading={actionLoading[doctor.id]}
            disabled={actionLoading[doctor.id] || doctor.status?.toLowerCase() === 'inactive'}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
              </svg>
            }
            title={doctor.status?.toLowerCase() === 'inactive' ? 'Ya está inactivo' : 'Desactivar doctor'}
          >
            {doctor.status?.toLowerCase() === 'inactive' ? 'Inactivo' : 'Desactivar'}
          </Button>
        </TableActions>
      )
    }
  ]

  const hasFilters = searchTerm.trim() || specialtyFilter || statusFilter

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
            {totalItems > 0 && (
              <span className="ml-2 font-medium">
                ({totalItems} doctor{totalItems !== 1 ? 'es' : ''} registrado{totalItems !== 1 ? 's' : ''})
              </span>
            )}
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium" style={{ color: colors.text.primary }}>
              Filtros de búsqueda
              {activeFiltersCount > 0 && (
                <span className="ml-2 px-2 py-1 text-xs rounded-full" style={{
                  backgroundColor: colors.primary[50],
                  color: colors.primary[700]
                }}>
                  {activeFiltersCount} activo{activeFiltersCount !== 1 ? 's' : ''}
                </span>
              )}
            </h3>
            {hasFilters && (
              <Button
                size="sm"
                variant="ghost"
                onClick={clearFilters}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                }
              >
                Limpiar filtros
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Buscar por nombre, código o email..."
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
                {availableSpecialties.length > 0 ? (
                  availableSpecialties.map((specialty) => (
                    <option key={specialty.id || specialty} value={specialty.value || specialty}>
                      {specialty.name || specialty}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="cardiologia">Cardiología</option>
                    <option value="neurologia">Neurología</option>
                    <option value="pediatria">Pediatría</option>
                    <option value="ginecologia">Ginecología</option>
                    <option value="traumatologia">Traumatología</option>
                    <option value="medicina-general">Medicina General</option>
                  </>
                )}
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
        </div>
      </Card>

      {/* Error Alert */}
      {error && (
        <Card variant="critical">
          <div className="flex items-start">
            <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" style={{ color: colors.error[500] }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h3 className="font-medium" style={{ color: colors.error[700] }}>
                Error al cargar doctores
              </h3>
              <p className="text-sm mt-1" style={{ color: colors.error[600] }}>
                {error}
              </p>
              <div className="mt-3 flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fetchDoctors()}
                >
                  Reintentar
                </Button>
                {hasFilters && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearFilters}
                  >
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </div>
          </div>
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
              emptyMessage={
                hasFilters 
                  ? "No se encontraron doctores con los filtros aplicados. Intenta ajustar tus criterios de búsqueda."
                  : "No hay doctores registrados aún. Haz clic en 'Nuevo Doctor' para agregar el primero."
              }
              hover
            />
            
            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4" 
                   style={{ borderColor: colors.border.light }}>
                <div className="text-sm" style={{ color: colors.text.secondary }}>
                  Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} doctores
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(1)}
                    title="Primera página"
                  >
                    ««
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    title="Página anterior"
                  >
                    Anterior
                  </Button>
                  
                  <span className="text-sm px-3" style={{ color: colors.text.primary }}>
                    Página {currentPage} de {totalPages}
                  </span>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    title="Página siguiente"
                  >
                    Siguiente
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                    title="Última página"
                  >
                    »»
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