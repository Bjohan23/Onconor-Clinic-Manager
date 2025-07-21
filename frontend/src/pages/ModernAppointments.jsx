import React, { useState, useEffect } from 'react';
import { useTheme } from '../shared/contexts/ThemeContext';
import AppointmentList from '../components/appointments/AppointmentList';
import AppointmentForm from '../components/appointments/AppointmentForm';
import AppointmentDetail from '../components/appointments/AppointmentDetail';
import appointmentService from '../services/appointmentService';

const ModernAppointments = () => {
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

    // Todos los métodos existentes permanecen igual...
    useEffect(() => {
        loadAppointments();
        loadStats();
    }, [filters, pagination.page]);

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

    const loadStats = async () => {
        try {
            const statsData = await appointmentService.getAppointmentStats();
            setStats(statsData.data?.stats || null);
        } catch (err) {
            console.error('Error loading stats:', err);
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleSearch = (searchTerm) => {
        setFilters(prev => ({ ...prev, search: searchTerm }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const handleCreateAppointment = async (appointmentData) => {
        try {
            setLoading(true);
            await appointmentService.createAppointment(appointmentData);
            setShowForm(false);
            await loadAppointments();
            await loadStats();
        } catch (err) {
            console.error('Error creating appointment:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateAppointment = async (id, updateData) => {
        try {
            setLoading(true);
            await appointmentService.updateAppointment(id, updateData);
            await loadAppointments();
            await loadStats();
            
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

    const handleCloseForm = () => {
        setShowForm(false);
        setSelectedAppointment(null);
    };

    const handleCloseDetail = () => {
        setShowDetail(false);
        setSelectedAppointment(null);
    };

    return (
        <div className="relative min-h-full">
            {/* Background Gradient Animation - ADAPTADO PARA DASHBOARD */}
            <div 
                className="absolute inset-0 -z-10 transition-all duration-1000"
                style={{
                    background: isDarkMode 
                        ? 'linear-gradient(135deg, rgba(15, 15, 30, 0.3) 0%, rgba(26, 26, 46, 0.3) 25%, rgba(22, 33, 62, 0.3) 50%, rgba(15, 15, 30, 0.3) 75%)'
                        : 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 25%, rgba(240, 147, 251, 0.1) 50%, rgba(245, 87, 108, 0.1) 75%)',
                    backgroundSize: '400% 400%',
                    animation: 'gradient 15s ease infinite'
                }}
            />
            
            {/* Floating Elements - ADAPTADO */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full opacity-5 animate-float"></div>
                <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-gradient-to-r from-pink-400 to-red-600 rounded-full opacity-5 animate-float" style={{animationDelay: '1s'}}></div>
                <div className="absolute top-1/2 left-3/4 w-32 h-32 bg-gradient-to-r from-green-400 to-blue-600 rounded-full opacity-5 animate-float" style={{animationDelay: '2s'}}></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Modern Header */}
                    <div className="mb-8">
                        <div className="glass rounded-3xl p-8 card-hover">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center neon-blue animate-pulse-glow">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v16a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent neon-text">
                                            Gestión de Citas
                                        </h1>
                                        <p className="text-lg opacity-80 mt-2" style={{ color: colors.text.secondary }}>
                                            Sistema avanzado de administración médica
                                        </p>
                                    </div>
                                </div>
                                
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="btn-modern flex items-center gap-3 px-8 py-4 text-lg"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Nueva Cita
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Modern Stats Cards */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="stats-card card-hover">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium opacity-70 uppercase tracking-wider">Total Citas</p>
                                        <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                            {stats.total}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v16a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="stats-card card-hover">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium opacity-70 uppercase tracking-wider">Hoy</p>
                                        <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                                            {stats.today}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-warning rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="stats-card card-hover">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium opacity-70 uppercase tracking-wider">Completadas</p>
                                        <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                                            {stats.completionRate}%
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="stats-card card-hover">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium opacity-70 uppercase tracking-wider">Cancelaciones</p>
                                        <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                                            {stats.cancellationRate}%
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-danger rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Notification */}
                    {error && (
                        <div className="mb-6">
                            <div className="notification-modern p-4 rounded-2xl border-l-4 border-red-500">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-gradient-danger rounded-full flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <p className="text-sm font-medium text-red-300">{error}</p>
                                    </div>
                                    <button
                                        onClick={() => setError(null)}
                                        className="ml-4 text-red-400 hover:text-red-300 transition-colors"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Modern Appointments List */}
                    <div className="glass rounded-3xl overflow-hidden card-hover">
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
            </div>

            {/* Modern Modal Overlays - RENDERIZADOS FUERA DEL COMPONENTE */}
            {showForm && (
                <div 
                    className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
                    style={{
                        background: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(12px)'
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            handleCloseForm();
                        }
                    }}
                >
                    <div 
                        className="glass rounded-3xl w-full max-w-5xl"
                        style={{
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)'
                        }}
                    >
                        <AppointmentForm
                            appointment={selectedAppointment}
                            onSave={selectedAppointment ? handleUpdateAppointment : handleCreateAppointment}
                            onClose={handleCloseForm}
                            loading={loading}
                        />
                    </div>
                </div>
            )}

            {showDetail && selectedAppointment && (
                <div className="fixed inset-0 z-[9999] modal-overlay flex items-center justify-center p-4">
                    <div className="glass rounded-3xl max-w-4xl max-h-[90vh] overflow-auto">
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
                    </div>
                </div>
            )}

            {/* CSS Animation Keyframes */}
            <style>{`
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>
        </div>
    );
};

export default ModernAppointments;