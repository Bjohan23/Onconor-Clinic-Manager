import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { paymentService } from '../services/paymentService';
import { Card } from '../../shared/components/ui/Card';
import { Table } from '../../shared/components/ui/Table';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../shared/components/ui/Toast';
import { Button } from '../../shared/components/ui/Button';
import { Input } from '../../shared/components/ui/Input';

const PaymentsPage = () => {
  const { colors } = useTheme();
  const [payments, setPayments] = useState([]);
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
    fetchPayments();
  }, [currentPage, searchTerm, itemsPerPage]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {};
      if (searchTerm.trim()) filters.search = searchTerm.trim();
      const response = await paymentService.getPaymentsWithPagination(
        currentPage,
        itemsPerPage,
        filters
      );
      setPayments(response.data?.payments || []);
      setTotalPages(response.data?.pagination?.totalPages || 1);
      setTotalItems(response.data?.pagination?.total || 0);
    } catch (err) {
      setError('Error al cargar los pagos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este pago?')) return;
    setLoading(true);
    try {
      const response = await paymentService.remove(id);
      if (response.success) {
        toast.success('Pago eliminado');
        fetchPayments();
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
    { key: 'id', title: 'ID' },
    { key: 'invoiceId', title: 'Factura' },
    { key: 'amount', title: 'Monto' },
    { key: 'method', title: 'Método' },
    { key: 'status', title: 'Estado' },
    { key: 'created_at', title: 'Fecha Pago' },
    {
      key: 'actions',
      title: 'Acciones',
      render: (_, payment) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => navigate(`/payments/edit/${payment.id}`)}>
            Editar
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(payment.id)}>
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
            Gestión de Pagos
          </h1>
          <p className="text-sm" style={{ color: colors.text.secondary }}>
            Administra los pagos de los pacientes
            {totalItems > 0 && (
              <span className="ml-2 font-medium">
                ({totalItems} pago{totalItems !== 1 ? 's' : ''} registrado{totalItems !== 1 ? 's' : ''})
              </span>
            )}
          </p>
        </div>
        <Button
          onClick={() => navigate('/payments/create')}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          }
        >
          Nuevo Pago
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
              placeholder="Buscar por factura, método o estado..."
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
                Error al cargar pagos
              </h3>
              <p className="text-sm mt-1" style={{ color: colors.error[600] }}>
                {error}
              </p>
              <div className="mt-3 flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fetchPayments()}
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

      {/* Tabla de Pagos */}
      <Card>
        {loading ? (
          <LoadingSpinner size="lg" text="Cargando pagos..." center />
        ) : (
          <>
            <Table
              columns={columns}
              data={payments}
              loading={loading}
              emptyMessage={
                hasFilters
                  ? "No se encontraron pagos con los filtros aplicados. Intenta ajustar tus criterios de búsqueda."
                  : "No hay pagos registrados aún. Haz clic en 'Nuevo Pago' para agregar el primero."
              }
              hover
            />
            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4"
                   style={{ borderColor: colors.border.light }}>
                <div className="text-sm" style={{ color: colors.text.secondary }}>
                  Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} pagos
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

export default PaymentsPage; 