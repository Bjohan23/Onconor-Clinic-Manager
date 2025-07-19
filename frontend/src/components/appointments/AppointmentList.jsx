import React, { useState } from 'react';
import appointmentService from '../../services/appointmentService';

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

    // Obtener badge del estado
    const getStatusBadge = (status) => {
        const statusConfig = {
            'scheduled': { color: 'bg-gray-100 text-gray-800', text: 'Programada' },
            'confirmed': { color: 'bg-blue-100 text-blue-800', text: 'Confirmada' },
            'in_progress': { color: 'bg-yellow-100 text-yellow-800', text: 'En Progreso' },
            'completed': { color: 'bg-green-100 text-green-800', text: 'Completada' },
            'cancelled': { color: 'bg-red-100 text-red-800', text: 'Cancelada' },
            'no_show': { color: 'bg-purple-100 text-purple-800', text: 'No Asistió' }
        };

        const config = statusConfig[status] || statusConfig['scheduled'];
        
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                {config.text}
            </span>
        );
    };

    // Obtener badge de prioridad
    const getPriorityBadge = (priority) => {
        const priorityConfig = {
            'low': { color: 'bg-green-100 text-green-800', text: 'Baja' },
            'normal': { color: 'bg-gray-100 text-gray-800', text: 'Normal' },
            'high': { color: 'bg-yellow-100 text-yellow-800', text: 'Alta' },
            'urgent': { color: 'bg-red-100 text-red-800', text: 'Urgente' }
        };

        const config = priorityConfig[priority] || priorityConfig['normal'];
        
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
                {config.text}
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
        <div className="bg-white">
            {/* Filtros y búsqueda */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Búsqueda */}
                    <form onSubmit={handleSearchSubmit} className="flex-1 max-w-lg">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar por paciente, médico o motivo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </form>

                    {/* Filtros */}
                    <div className="flex flex-wrap gap-3">
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="block px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Todos los estados</option>
                            <option value="scheduled">Programada</option>
                            <option value="confirmed">Confirmada</option>
                            <option value="in_progress">En Progreso</option>
                            <option value="completed">Completada</option>
                            <option value="cancelled">Cancelada</option>
                            <option value="no_show">No Asistió</option>
                        </select>

                        <input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                            className="block px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />

                        <input
                            type="date"
                            value={filters.dateTo}
                            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                            className="block px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Cargando citas...</span>
                </div>
            )}

            {/* Lista de citas */}
            {!loading && (
                <>
                    {appointments.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay citas</h3>
                            <p className="mt-1 text-sm text-gray-500">No se encontraron citas con los filtros seleccionados.</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fecha y Hora
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Paciente
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Médico
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Motivo
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Prioridad
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {appointments.map((appointment) => (
                                        <tr 
                                            key={appointment.id} 
                                            className="hover:bg-gray-50 cursor-pointer"
                                            onClick={() => onSelectAppointment(appointment)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatDateTime(appointment.appointmentDate, appointment.appointmentTime)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {appointment.patientName || 'Sin paciente'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {appointment.doctorName || 'Sin médico'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {appointment.specialtyName || 'Sin especialidad'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                                {appointment.reason}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(appointment.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getPriorityBadge(appointment.priority)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    {/* Botón Confirmar */}
                                                    {appointment.status === 'scheduled' && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onConfirmAppointment(appointment.id);
                                                            }}
                                                            className="text-blue-600 hover:text-blue-900 text-xs px-2 py-1 border border-blue-200 rounded hover:bg-blue-50"
                                                        >
                                                            Confirmar
                                                        </button>
                                                    )}

                                                    {/* Botón Completar */}
                                                    {['confirmed', 'in_progress'].includes(appointment.status) && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onCompleteAppointment(appointment.id, '');
                                                            }}
                                                            className="text-green-600 hover:text-green-900 text-xs px-2 py-1 border border-green-200 rounded hover:bg-green-50"
                                                        >
                                                            Completar
                                                        </button>
                                                    )}

                                                    {/* Botón Editar */}
                                                    {!['completed', 'cancelled'].includes(appointment.status) && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onEditAppointment(appointment);
                                                            }}
                                                            className="text-gray-600 hover:text-gray-900 text-xs px-2 py-1 border border-gray-200 rounded hover:bg-gray-50"
                                                        >
                                                            Editar
                                                        </button>
                                                    )}

                                                    {/* Botón Cancelar */}
                                                    {!['completed', 'cancelled'].includes(appointment.status) && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCancelClick(appointment);
                                                            }}
                                                            className="text-red-600 hover:text-red-900 text-xs px-2 py-1 border border-red-200 rounded hover:bg-red-50"
                                                        >
                                                            Cancelar
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

                    {/* Paginación */}
                    {pagination.totalPages > 1 && (
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
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