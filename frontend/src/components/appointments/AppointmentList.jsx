import React, { useState } from 'react';
import appointmentService from '../../services/appointmentService';
import { useTheme } from '../../shared/contexts/ThemeContext';

const AppointmentList = ({
    appointments,
    loading,
    filters,
    pagination,
    onFilterChange,
    onSearch,
    onPageChange,
    onSelectAppointment,
    onConfirmAppointment,
    onCancelAppointment,
    onCompleteAppointment,
    onEditAppointment
}) => {
    const { colors, isDarkMode } = useTheme();
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [appointmentToCancel, setAppointmentToCancel] = useState(null);
    const [cancelReason, setCancelReason] = useState('');

    // Manejar búsqueda
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        onSearch(searchTerm);
    };

    // Manejar cambio de filtro
    const handleFilterChange = (field, value) => {
        onFilterChange({ [field]: value });
    };

    // Obtener badge del estado con tema
    const getStatusBadge = (status) => {
        const statusConfig = {
            'scheduled': { 
                bg: isDarkMode ? colors.gray[200] : colors.gray[100], 
                text: isDarkMode ? colors.text.primary : colors.gray[700], 
                label: 'Programada',
                icon: '📅'
            },
            'confirmed': { 
                bg: isDarkMode ? colors.primary[200] : colors.primary[100], 
                text: isDarkMode ? colors.text.primary : colors.primary[700], 
                label: 'Confirmada',
                icon: '✅'
            },
            'in_progress': { 
                bg: isDarkMode ? colors.warning[200] : colors.warning[50], 
                text: isDarkMode ? colors.text.primary : colors.warning[600], 
                label: 'En Progreso',
                icon: '⏳'
            },
            'completed': { 
                bg: isDarkMode ? colors.success[200] : colors.success[50], 
                text: isDarkMode ? colors.text.primary : colors.success[600], 
                label: 'Completada',
                icon: '✅'
            },
            'cancelled': { 
                bg: isDarkMode ? colors.error[200] : colors.error[50], 
                text: isDarkMode ? colors.text.primary : colors.error[600], 
                label: 'Cancelada',
                icon: '❌'
            },
            'no_show': { 
                bg: isDarkMode ? colors.gray[300] : colors.gray[100], 
                text: isDarkMode ? colors.text.primary : colors.gray[600], 
                label: 'No Asistió',
                icon: '👻'
            }
        };

        const config = statusConfig[status] || statusConfig['scheduled'];
        
        return (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm" 
                  style={{
                      backgroundColor: config.bg,
                      color: config.text
                  }}>
                <span>{config.icon}</span>
                {config.label}
            </span>
        );
    };

    // Obtener badge de prioridad con tema
    const getPriorityBadge = (priority) => {
        const priorityConfig = {
            'low': { 
                bg: isDarkMode ? colors.success[200] : colors.success[50], 
                text: isDarkMode ? colors.text.primary : colors.success[600], 
                label: 'Baja',
                icon: '🟢'
            },
            'normal': { 
                bg: isDarkMode ? colors.gray[200] : colors.gray[100], 
                text: isDarkMode ? colors.text.primary : colors.gray[600], 
                label: 'Normal',
                icon: '🔵'
            },
            'high': { 
                bg: isDarkMode ? colors.warning[200] : colors.warning[50], 
                text: isDarkMode ? colors.text.primary : colors.warning[600], 
                label: 'Alta',
                icon: '🟡'
            },
            'urgent': { 
                bg: isDarkMode ? colors.error[200] : colors.error[50], 
                text: isDarkMode ? colors.text.primary : colors.error[600], 
                label: 'Urgente',
                icon: '🔴'
            }
        };

        const config = priorityConfig[priority] || priorityConfig['normal'];
        
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium" 
                  style={{
                      backgroundColor: config.bg,
                      color: config.text
                  }}>
                <span>{config.icon}</span>
                {config.label}
            </span>
        );
    };

    // Formatear fecha y hora
    const formatDateTime = (date, time) => {
        const appointmentDate = new Date(date);
        const formattedDate = appointmentDate.toLocaleDateString('es-PE', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        return `${formattedDate} ${time}`;
    };

    // Mostrar modal de cancelación
    const handleCancelClick = (appointment) => {
        setAppointmentToCancel(appointment);
        setShowCancelModal(true);
        setCancelReason('');
    };

    // Confirmar cancelación
    const handleConfirmCancel = () => {
        if (appointmentToCancel) {
            onCancelAppointment(appointmentToCancel.id, cancelReason);
            setShowCancelModal(false);
            setAppointmentToCancel(null);
            setCancelReason('');
        }
    };

    // Generar páginas para paginación
    const generatePageNumbers = () => {
        const pages = [];
        const { page, totalPages } = pagination;
        
        for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) {
            pages.push(i);
        }
        
        return pages;
    };

    return (
        <div style={{ backgroundColor: colors.background.primary }}>
            {/* Modern Filters and Search */}
            <div className="p-6 border-b" style={{ borderColor: colors.border.light }}>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Modern Search */}
                    <form onSubmit={handleSearchSubmit} className="flex-1 max-w-lg">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="h-6 w-6" style={{ color: colors.text.tertiary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="🔍 Buscar por paciente, médico o motivo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-12 pr-4 py-3 border rounded-2xl leading-5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                                style={{
                                    backgroundColor: colors.background.secondary,
                                    borderColor: colors.border.light,
                                    color: colors.text.primary,
                                    focusRingColor: colors.primary[500]
                                }}
                            />
                        </div>
                    </form>

                    {/* Modern Filters */}
                    <div className="flex flex-wrap gap-3">
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="block px-4 py-3 border rounded-2xl text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 min-w-[150px]"
                            style={{
                                backgroundColor: colors.background.secondary,
                                borderColor: colors.border.light,
                                color: colors.text.primary,
                                focusRingColor: colors.primary[500]
                            }}
                        >
                            <option value="">📋 Todos los estados</option>
                            <option value="scheduled">📅 Programada</option>
                            <option value="confirmed">✅ Confirmada</option>
                            <option value="in_progress">⏳ En Progreso</option>
                            <option value="completed">✅ Completada</option>
                            <option value="cancelled">❌ Cancelada</option>
                            <option value="no_show">👻 No Asistió</option>
                        </select>

                        <input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                            className="block px-4 py-3 border rounded-2xl text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                            style={{
                                backgroundColor: colors.background.secondary,
                                borderColor: colors.border.light,
                                color: colors.text.primary,
                                focusRingColor: colors.primary[500]
                            }}
                        />

                        <input
                            type="date"
                            value={filters.dateTo}
                            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                            className="block px-4 py-3 border rounded-2xl text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                            style={{
                                backgroundColor: colors.background.secondary,
                                borderColor: colors.border.light,
                                color: colors.text.primary,
                                focusRingColor: colors.primary[500]
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Modern Loading */}
            {loading && (
                <div className="flex flex-col justify-center items-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-t-4 mb-4" 
                         style={{ borderColor: `${colors.primary[500]} transparent ${colors.primary[500]} transparent` }}>
                    </div>
                    <span className="text-lg font-semibold" style={{ color: colors.text.secondary }}>🏥 Cargando citas médicas...</span>
                    <span className="text-sm mt-2" style={{ color: colors.text.tertiary }}>Por favor espere un momento</span>
                </div>
            )}

            {/* Lista de citas */}
            {!loading && (
                <>
                    {appointments.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" 
                                 style={{ backgroundColor: colors.gray[100] }}>
                                <span className="text-5xl">📅</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3" style={{ color: colors.text.primary }}>No hay citas disponibles</h3>
                            <p className="text-base mb-6" style={{ color: colors.text.secondary }}>No se encontraron citas médicas con los filtros seleccionados.</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 rounded-2xl font-semibold transition-all duration-200 hover:transform hover:scale-105"
                                style={{
                                    backgroundColor: colors.primary[500],
                                    color: 'white'
                                }}
                            >
                                🔄 Actualizar lista
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto divide-y" style={{ backgroundColor: colors.background.primary, borderColor: colors.border.light }}>
                                <thead style={{ backgroundColor: colors.background.secondary }}>
                                    <tr>
                                        <th className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider min-w-[140px]" style={{ color: colors.text.secondary }}>
                                            📅 Fecha y Hora
                                        </th>
                                        <th className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider min-w-[120px]" style={{ color: colors.text.secondary }}>
                                            👤 Paciente
                                        </th>
                                        <th className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider min-w-[140px]" style={{ color: colors.text.secondary }}>
                                            👨‍⚕️ Médico
                                        </th>
                                        <th className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: colors.text.secondary }}>
                                            📝 Motivo
                                        </th>
                                        <th className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider min-w-[120px]" style={{ color: colors.text.secondary }}>
                                            📊 Estado
                                        </th>
                                        <th className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider min-w-[100px]" style={{ color: colors.text.secondary }}>
                                            ⚡ Prioridad
                                        </th>
                                        <th className="px-3 py-4 text-right text-xs font-bold uppercase tracking-wider min-w-[200px]" style={{ color: colors.text.secondary }}>
                                            🔧 Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y" style={{ backgroundColor: colors.background.primary, borderColor: colors.border.light }}>
                                    {appointments.map((appointment, index) => (
                                        <tr 
                                            key={appointment.id} 
                                            className="cursor-pointer" 
                                            style={{
                                                backgroundColor: index % 2 === 0 
                                                    ? colors.background.primary 
                                                    : colors.background.secondary
                                            }}
                                            onClick={() => onSelectAppointment(appointment)}
                                        >
                                            <td className="px-3 py-4 text-sm">
                                                <div className="font-semibold" style={{ color: colors.text.primary }}>
                                                    {formatDateTime(appointment.appointmentDate, appointment.appointmentTime)}
                                                </div>
                                            </td>
                                            <td className="px-3 py-4">
                                                <div className="text-sm font-semibold" style={{ color: colors.text.primary }}>
                                                    {appointment.patientName || 'Sin paciente'}
                                                </div>
                                            </td>
                                            <td className="px-3 py-4">
                                                <div className="text-sm font-semibold" style={{ color: colors.text.primary }}>
                                                    {appointment.doctorName || 'Sin médico'}
                                                </div>
                                                <div className="text-xs" style={{ color: colors.text.secondary }}>
                                                    {appointment.specialtyName || 'Sin especialidad'}
                                                </div>
                                            </td>
                                            <td className="px-3 py-4">
                                                <div className="text-sm" style={{ color: colors.text.primary }}>
                                                    {appointment.reason || 'Sin motivo especificado'}
                                                </div>
                                            </td>
                                            <td className="px-3 py-4">
                                                {getStatusBadge(appointment.status)}
                                            </td>
                                            <td className="px-3 py-4">
                                                {getPriorityBadge(appointment.priority)}
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    {/* Modern Action Buttons */}
                                                    {appointment.status === 'scheduled' && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onConfirmAppointment(appointment.id);
                                                            }}
                                                            className="text-xs px-3 py-2 rounded-xl font-semibold transition-all duration-200 hover:transform hover:scale-105 shadow-sm"
                                                            style={{
                                                                backgroundColor: colors.primary[500],
                                                                color: 'white'
                                                            }}
                                                        >
                                                            ✅ Confirmar
                                                        </button>
                                                    )}

                                                    {['confirmed', 'in_progress'].includes(appointment.status) && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onCompleteAppointment(appointment.id, '');
                                                            }}
                                                            className="text-xs px-3 py-2 rounded-xl font-semibold transition-all duration-200 hover:transform hover:scale-105 shadow-sm"
                                                            style={{
                                                                backgroundColor: colors.success[500],
                                                                color: 'white'
                                                            }}
                                                        >
                                                            ✅ Completar
                                                        </button>
                                                    )}

                                                    {!['completed', 'cancelled'].includes(appointment.status) && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onEditAppointment(appointment);
                                                            }}
                                                            className="text-xs px-3 py-2 rounded-xl font-semibold transition-all duration-200 hover:transform hover:scale-105 shadow-sm"
                                                            style={{
                                                                backgroundColor: colors.warning[500],
                                                                color: 'white'
                                                            }}
                                                        >
                                                            ✏️ Editar
                                                        </button>
                                                    )}

                                                    {!['completed', 'cancelled'].includes(appointment.status) && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCancelClick(appointment);
                                                            }}
                                                            className="text-xs px-3 py-2 rounded-xl font-semibold transition-all duration-200 hover:transform hover:scale-105 shadow-sm"
                                                            style={{
                                                                backgroundColor: colors.error[500],
                                                                color: 'white'
                                                            }}
                                                        >
                                                            ❌ Cancelar
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Modern Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="px-6 py-4 flex items-center justify-between border-t" 
                             style={{
                                 backgroundColor: colors.background.primary,
                                 borderColor: colors.border.light
                             }}>
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => onPageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Anterior
                                </button>
                                <button
                                    onClick={() => onPageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.totalPages}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Siguiente
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Mostrando <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> a{' '}
                                        <span className="font-medium">
                                            {Math.min(pagination.page * pagination.limit, pagination.total)}
                                        </span> de{' '}
                                        <span className="font-medium">{pagination.total}</span> resultados
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                        <button
                                            onClick={() => onPageChange(pagination.page - 1)}
                                            disabled={pagination.page === 1}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="sr-only">Anterior</span>
                                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        
                                        {generatePageNumbers().map((pageNum) => (
                                            <button
                                                key={pageNum}
                                                onClick={() => onPageChange(pageNum)}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                    pageNum === pagination.page
                                                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        ))}
                                        
                                        <button
                                            onClick={() => onPageChange(pagination.page + 1)}
                                            disabled={pagination.page === pagination.totalPages}
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="sr-only">Siguiente</span>
                                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Modal de cancelación */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex items-center">
                                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                    <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-2 text-center">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    Cancelar Cita
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        ¿Estás seguro de que quieres cancelar esta cita? Esta acción no se puede deshacer.
                                    </p>
                                </div>
                                <div className="mt-4">
                                    <textarea
                                        placeholder="Motivo de cancelación (opcional)"
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <div className="items-center px-4 py-3">
                                <div className="flex space-x-3">
                                    <button
                                        onClick={handleConfirmCancel}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        Cancelar Cita
                                    </button>
                                    <button
                                        onClick={() => setShowCancelModal(false)}
                                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppointmentList;