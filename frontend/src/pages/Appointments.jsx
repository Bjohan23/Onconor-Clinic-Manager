import React, { useState, useEffect } from 'react';
import AppointmentList from '../components/appointments/AppointmentList';
import AppointmentForm from '../components/appointments/AppointmentForm';
import AppointmentDetail from '../components/appointments/AppointmentDetail';
import appointmentService from '../services/appointmentService';

const Appointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        doctorId: '',
        patientId: '',
        dateFrom: '',
        dateTo: '',
        search: ''
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
    const [stats, setStats] = useState(null);

    // Cargar citas al montar el componente
    useEffect(() => {
        loadAppointments();
        loadStats();
    }, [filters, pagination.page]);

    // Cargar lista de citas
    const loadAppointments = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const result = await appointmentService.getAppointments(
                filters,
                pagination.page,
                pagination.limit
            );
            
            setAppointments(result.appointments || []);
            setPagination(prev => ({
                ...prev,
                total: result.pagination?.total || 0,
                totalPages: result.pagination?.totalPages || 0
            }));
        } catch (err) {
            console.error('Error loading appointments:', err);
            setError(err.message || 'Error al cargar las citas');
        } finally {
            setLoading(false);
        }
    };

    // Cargar estadísticas
    const loadStats = async () => {
        try {
            const statsData = await appointmentService.getAppointmentStats();
            setStats(statsData);
        } catch (err) {
            console.error('Error loading stats:', err);
        }
    };

    // Manejar cambios en filtros
    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setPagination(prev => ({ ...prev, page: 1 })); // Reset a página 1
    };

    // Manejar búsqueda
    const handleSearch = (searchTerm) => {
        setFilters(prev => ({ ...prev, search: searchTerm }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    // Manejar cambio de página
    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    // Crear nueva cita
    const handleCreateAppointment = async (appointmentData) => {
        try {
            setLoading(true);
            await appointmentService.createAppointment(appointmentData);
            setShowForm(false);
            await loadAppointments();
            await loadStats();
        } catch (err) {
            console.error('Error creating appointment:', err);
            throw err; // Re-throw para que el formulario maneje el error
        } finally {
            setLoading(false);
        }
    };

    // Actualizar cita
    const handleUpdateAppointment = async (id, updateData) => {
        try {
            setLoading(true);
            await appointmentService.updateAppointment(id, updateData);
            await loadAppointments();
            await loadStats();
            
            // Actualizar el detalle si está mostrándose
            if (selectedAppointment && selectedAppointment.id === id) {
                const updatedAppointment = await appointmentService.getAppointmentById(id);
                setSelectedAppointment(updatedAppointment);
            }
        } catch (err) {
            console.error('Error updating appointment:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Confirmar cita
    const handleConfirmAppointment = async (id) => {
        try {
            setLoading(true);
            await appointmentService.confirmAppointment(id);
            await loadAppointments();
            await loadStats();
        } catch (err) {
            console.error('Error confirming appointment:', err);
            setError(err.message || 'Error al confirmar la cita');
        } finally {
            setLoading(false);
        }
    };

    // Cancelar cita
    const handleCancelAppointment = async (id, reason) => {
        try {
            setLoading(true);
            await appointmentService.cancelAppointment(id, reason);
            await loadAppointments();
            await loadStats();
        } catch (err) {
            console.error('Error canceling appointment:', err);
            setError(err.message || 'Error al cancelar la cita');
        } finally {
            setLoading(false);
        }
    };

    // Completar cita
    const handleCompleteAppointment = async (id, notes) => {
        try {
            setLoading(true);
            await appointmentService.completeAppointment(id, notes);
            await loadAppointments();
            await loadStats();
        } catch (err) {
            console.error('Error completing appointment:', err);
            setError(err.message || 'Error al completar la cita');
        } finally {
            setLoading(false);
        }
    };

    // Seleccionar cita para ver detalle
    const handleSelectAppointment = async (appointment) => {
        try {
            setLoading(true);
            const fullAppointment = await appointmentService.getAppointmentById(appointment.id);
            setSelectedAppointment(fullAppointment);
            setShowDetail(true);
        } catch (err) {
            console.error('Error loading appointment detail:', err);
            setError(err.message || 'Error al cargar el detalle de la cita');
        } finally {
            setLoading(false);
        }
    };

    // Cerrar formulario
    const handleCloseForm = () => {
        setShowForm(false);
        setSelectedAppointment(null);
    };

    // Cerrar detalle
    const handleCloseDetail = () => {
        setShowDetail(false);
        setSelectedAppointment(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Gestión de Citas
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Administra las citas médicas del sistema
                            </p>
                        </div>
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nueva Cita
                        </button>
                    </div>

                    {/* Estadísticas */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white p-4 rounded-lg shadow">
                                <div className="flex items-center">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Total Citas</p>
                                        <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white p-4 rounded-lg shadow">
                                <div className="flex items-center">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Hoy</p>
                                        <p className="text-2xl font-semibold text-gray-900">{stats.today}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg shadow">
                                <div className="flex items-center">
                                    <div className="p-2 bg-yellow-100 rounded-lg">
                                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Tasa Completadas</p>
                                        <p className="text-2xl font-semibold text-gray-900">{stats.completionRate}%</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg shadow">
                                <div className="flex items-center">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Tasa Cancelaciones</p>
                                        <p className="text-2xl font-semibold text-gray-900">{stats.cancellationRate}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mensaje de error */}
                {error && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                            <div className="ml-auto pl-3">
                                <button
                                    onClick={() => setError(null)}
                                    className="inline-flex text-red-400 hover:text-red-600"
                                >
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lista de citas */}
                <div className="bg-white rounded-lg shadow">
                    <AppointmentList
                        appointments={appointments}
                        loading={loading}
                        filters={filters}
                        pagination={pagination}
                        onFilterChange={handleFilterChange}
                        onSearch={handleSearch}
                        onPageChange={handlePageChange}
                        onSelectAppointment={handleSelectAppointment}
                        onConfirmAppointment={handleConfirmAppointment}
                        onCancelAppointment={handleCancelAppointment}
                        onCompleteAppointment={handleCompleteAppointment}
                        onEditAppointment={(appointment) => {
                            setSelectedAppointment(appointment);
                            setShowForm(true);
                        }}
                    />
                </div>
            </div>

            {/* Modal de formulario */}
            {showForm && (
                <AppointmentForm
                    appointment={selectedAppointment}
                    onSave={selectedAppointment ? handleUpdateAppointment : handleCreateAppointment}
                    onClose={handleCloseForm}
                    loading={loading}
                />
            )}

            {/* Modal de detalle */}
            {showDetail && selectedAppointment && (
                <AppointmentDetail
                    appointment={selectedAppointment}
                    onClose={handleCloseDetail}
                    onEdit={() => {
                        setShowDetail(false);
                        setShowForm(true);
                    }}
                    onConfirm={() => handleConfirmAppointment(selectedAppointment.id)}
                    onCancel={(reason) => handleCancelAppointment(selectedAppointment.id, reason)}
                    onComplete={(notes) => handleCompleteAppointment(selectedAppointment.id, notes)}
                    loading={loading}
                />
            )}
        </div>
    );
};

export default Appointments;