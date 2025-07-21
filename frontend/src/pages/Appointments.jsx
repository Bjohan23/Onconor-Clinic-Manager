import React, { useState, useEffect } from 'react';
import AppointmentList from '../components/appointments/AppointmentList';
import AppointmentForm from '../components/appointments/AppointmentForm';
import AppointmentDetail from '../components/appointments/AppointmentDetail';
import appointmentService from '../services/appointmentService';
import { useTheme } from '../shared/contexts/ThemeContext';

const Appointments = () => {
    const { colors, isDarkMode } = useTheme();
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
            
            setAppointments(result.data?.appointments || []);
            setPagination(prev => ({
                ...prev,
                total: result.data?.pagination?.total || 0,
                totalPages: result.data?.pagination?.totalPages || 0
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
            setStats(statsData.data?.stats || null);
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
        <div className="min-h-screen p-6" 
             style={{ backgroundColor: colors.background.secondary }}>
            <div className="max-w-7xl mx-auto">
                {/* Modern Medical Header */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 mb-8">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl">
                                <span className="text-3xl">🏥</span>
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold mb-2" 
                                    style={{ color: colors.text.primary }}>
                                    Gestión de Citas
                                </h1>
                                <p className="text-lg" 
                                   style={{ color: colors.text.secondary }}>
                                    Panel integral para administrar citas médicas
                                </p>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => setShowForm(true)}
                                className="flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 hover:transform hover:scale-105 shadow-lg hover:shadow-xl"
                                style={{
                                    backgroundColor: colors.primary[500],
                                    color: 'white',
                                    border: `2px solid ${colors.primary[600]}`
                                }}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Nueva Cita
                            </button>
                            
                            <button
                                onClick={() => window.location.reload()}
                                className="flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 hover:transform hover:scale-105 shadow-lg hover:shadow-xl"
                                style={{
                                    backgroundColor: colors.success[500],
                                    color: 'white',
                                    border: `2px solid ${colors.success[600]}`
                                }}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Actualizar
                            </button>
                            
                            <button
                                className="flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 hover:transform hover:scale-105 shadow-lg hover:shadow-xl"
                                style={{
                                    backgroundColor: isDarkMode ? colors.warning[600] : colors.warning[500],
                                    color: 'white',
                                    border: `2px solid ${colors.warning[700]}`
                                }}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Emergencia
                            </button>
                        </div>
                    </div>

                    {/* Modern Medical Stats Dashboard */}
                    {stats && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="p-6 rounded-2xl shadow-xl border"
                                 style={{
                                     backgroundColor: colors.background.primary,
                                     borderColor: colors.border.light
                                 }}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold uppercase tracking-wider mb-2" 
                                           style={{ color: colors.text.secondary }}>
                                            Total Citas
                                        </p>
                                        <p className="text-3xl font-bold" 
                                           style={{ color: colors.text.primary }}>
                                            {stats.total?.toLocaleString() || '0'}
                                        </p>
                                    </div>
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                                         style={{ backgroundColor: isDarkMode ? colors.primary[200] : colors.primary[100] }}>
                                        <svg className="w-8 h-8" style={{ color: colors.primary[600] }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-6 rounded-2xl shadow-xl border"
                                 style={{
                                     backgroundColor: colors.background.primary,
                                     borderColor: colors.border.light
                                 }}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold uppercase tracking-wider mb-2" 
                                           style={{ color: colors.text.secondary }}>
                                            Citas Hoy
                                        </p>
                                        <p className="text-3xl font-bold" 
                                           style={{ color: colors.text.primary }}>
                                            {stats.today || '0'}
                                        </p>
                                    </div>
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                                         style={{ backgroundColor: isDarkMode ? colors.success[200] : colors.success[50] }}>
                                        <svg className="w-8 h-8" style={{ color: colors.success[600] }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl shadow-xl border"
                                 style={{
                                     backgroundColor: colors.background.primary,
                                     borderColor: colors.border.light
                                 }}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold uppercase tracking-wider mb-2" 
                                           style={{ color: colors.text.secondary }}>
                                            Tasa Éxito
                                        </p>
                                        <p className="text-3xl font-bold" 
                                           style={{ color: colors.text.primary }}>
                                            {stats.completionRate || '0'}%
                                        </p>
                                    </div>
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                                         style={{ backgroundColor: isDarkMode ? colors.warning[200] : colors.warning[50] }}>
                                        <svg className="w-8 h-8" style={{ color: colors.warning[600] }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl shadow-xl border"
                                 style={{
                                     backgroundColor: colors.background.primary,
                                     borderColor: colors.border.light
                                 }}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold uppercase tracking-wider mb-2" 
                                           style={{ color: colors.text.secondary }}>
                                            Cancelaciones
                                        </p>
                                        <p className="text-3xl font-bold" 
                                           style={{ color: colors.text.primary }}>
                                            {stats.cancellationRate || '0'}%
                                        </p>
                                    </div>
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                                         style={{ backgroundColor: isDarkMode ? colors.error[200] : colors.error[50] }}>
                                        <svg className="w-8 h-8" style={{ color: colors.error[600] }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modern Error Message */}
                {error && (
                    <div className="mb-6 p-6 rounded-2xl shadow-xl border-l-4 transition-all duration-300" 
                         style={{
                             backgroundColor: isDarkMode ? colors.error[900] : colors.error[50],
                             borderColor: colors.error[500]
                         }}>
                        <div className="flex items-start">
                            <div className="flex-shrink-0 mr-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" 
                                     style={{ backgroundColor: colors.error[100] }}>
                                    <svg className="w-6 h-6" style={{ color: colors.error[600] }} viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold mb-2" style={{ color: colors.error[700] }}>
                                    Error en la operación
                                </h3>
                                <p className="text-sm" style={{ color: colors.error[600] }}>
                                    {error}
                                </p>
                            </div>
                            <button
                                onClick={() => setError(null)}
                                className="ml-4 p-2 rounded-xl transition-all duration-200 hover:transform hover:scale-110"
                                style={{
                                    backgroundColor: colors.error[100],
                                    color: colors.error[600]
                                }}
                            >
                                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Modern Appointment List - Full Width */}
                <div className="rounded-2xl shadow-xl border overflow-hidden" 
                     style={{
                         backgroundColor: colors.background.primary,
                         borderColor: colors.border.light
                     }}>
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