import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { treatmentService } from '../services/treatmentService';
import { Card } from '../../shared/components/ui/Card';
import { Table } from '../../shared/components/ui/Table';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../shared/components/ui/Toast';
import { Button } from '../../shared/components/ui/Button';
import { Input } from '../../shared/components/ui/Input';

const TreatmentsPage = () => {
  const { colors } = useTheme();
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchTreatments();
  }, [currentPage, searchTerm, itemsPerPage]);

  const fetchTreatments = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {};
      if (searchTerm.trim()) filters.search = searchTerm.trim();
      const response = await treatmentService.getTreatmentsWithPagination(
        currentPage,
        itemsPerPage,
        filters
      );
      // El API devuelve directamente un array, no un objeto con paginación
      const treatments = Array.isArray(response) ? response : [];
      setTreatments(treatments);
      // Como no hay paginación real del API, calculamos valores por defecto
      setTotalPages(1);
      setTotalItems(treatments.length);
    } catch (err) {
      setError('Error al cargar los tratamientos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este tratamiento?')) return;
    setLoading(true);
    try {
      const response = await treatmentService.remove(id);
      if (response.success) {
        toast.success('Tratamiento eliminado');
        fetchTreatments();
      } else {
        toast.error(response.message || 'Error al eliminar');
      }
    } catch (err) {
      toast.error('Error de conexión al eliminar');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { 
      key: 'id', 
      title: 'ID',
      render: (value) => `#${value}`
    },
    { 
      key: 'patient', 
      title: '👤 Paciente',
      render: (value, treatment) => (
        <div>
          <div className="font-semibold" style={{ color: colors.text.primary }}>
            {treatment.patient?.fullName || `Historial #${treatment.medicalRecordId}`}
          </div>
          {treatment.patient?.dni && (
            <div className="text-xs" style={{ color: colors.text.secondary }}>
              DNI: {treatment.patient.dni}
            </div>
          )}
        </div>
      )
    },
    { 
      key: 'doctor', 
      title: '👨‍⚕️ Médico',
      render: (value, treatment) => (
        <div>
          <div className="font-semibold" style={{ color: colors.text.primary }}>
            {treatment.doctor?.fullName || 'No asignado'}
          </div>
          {treatment.doctor?.specialty?.name && (
            <div className="text-xs" style={{ color: colors.text.secondary }}>
              {treatment.doctor.specialty.name}
            </div>
          )}
        </div>
      )
    },
    { 
      key: 'description', 
      title: '🏥 Descripción',
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    { 
      key: 'medications', 
      title: '💊 Medicamentos',
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value || 'No especificado'}
        </div>
      )
    },
    { 
      key: 'startDate', 
      title: '📅 Fecha Inicio',
      render: (value) => {
        if (!value) return 'No especificada';
        const date = new Date(value);
        return date.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
    },
    { 
      key: 'endDate', 
      title: '📅 Fecha Fin',
      render: (value) => {
        if (!value) return 'No especificada';
        const date = new Date(value);
        return date.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
    },
    {
      key: 'actions',
      title: '🔧 Acciones',
      render: (_, treatment) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => navigate(`/treatments/edit/${treatment.id}`)}>
            Editar
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(treatment.id)}>
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  const hasFilters = searchTerm.trim();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text.primary }}>
            Gestión de Tratamientos
          </h1>
          <p className="text-sm" style={{ color: colors.text.secondary }}>
            Administra los tratamientos de los pacientes
            {totalItems > 0 && (
              <span className="ml-2 font-medium">
                ({totalItems} tratamiento{totalItems !== 1 ? 's' : ''} registrado{totalItems !== 1 ? 's' : ''})
              </span>
            )}
          </p>
        </div>
        <Button
          onClick={() => navigate('/treatments/create')}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          }
        >
          Nuevo Tratamiento
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium" style={{ color: colors.text.primary }}>
              Filtros de búsqueda
              {hasFilters && (
                <span className="ml-2 px-2 py-1 text-xs rounded-full" style={{
                  backgroundColor: colors.primary[50],
                  color: colors.primary[700]
                }}>
                  1 activo
                </span>
              )}
            </h3>
            {hasFilters && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSearchTerm('')}
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
              placeholder="Buscar por paciente, médico o tipo..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
            <div></div><div></div><div></div>
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
                Error al cargar tratamientos
              </h3>
              <p className="text-sm mt-1" style={{ color: colors.error[600] }}>
                {error}
              </p>
              <div className="mt-3 flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fetchTreatments()}
                >
                  Reintentar
                </Button>
                {hasFilters && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSearchTerm('')}
                  >
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tabla de Tratamientos */}
      <Card>
        {loading ? (
          <LoadingSpinner size="lg" text="Cargando tratamientos..." center />
        ) : (
          <>
            <Table
              columns={columns}
              data={treatments}
              loading={loading}
              emptyMessage={
                hasFilters
                  ? "No se encontraron tratamientos con los filtros aplicados. Intenta ajustar tus criterios de búsqueda."
                  : "No hay tratamientos registrados aún. Haz clic en 'Nuevo Tratamiento' para agregar el primero."
              }
              hover
            />
            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4"
                   style={{ borderColor: colors.border.light }}>
                <div className="text-sm" style={{ color: colors.text.secondary }}>
                  Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} tratamientos
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
  );
};

export default TreatmentsPage; 