import React, { useState, useEffect } from 'react';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { specialtyService } from '../../specialties/services/specialtyService';
import { patientService } from '../../patients/services/patientService';
import { doctorService } from '../../doctors/services/doctorService';
import appointmentService from '../../services/appointmentService';

const ReportsPage = () => {
    const { colors, isDarkMode } = useTheme();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        patients: null,
        doctors: null,
        specialties: null,
        appointments: null
    });
    const [error, setError] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState('month');

    useEffect(() => {
        loadAllStats();
    }, [selectedPeriod]);

    const loadAllStats = async () => {
        try {
            setLoading(true);
            setError(null);

            // Cargar estadísticas de todas las entidades
            const [patientsStats, doctorsStats, specialtiesStats, appointmentsStats] = await Promise.all([
                patientService.getPatientStats().catch(() => ({ data: { stats: null } })),
                doctorService.getDoctorStats().catch(() => ({ data: { stats: null } })),
                specialtyService.getSpecialtyStats().catch(() => ({ data: { stats: null } })),
                appointmentService.getAppointmentStats().catch(() => ({ data: { stats: null } }))
            ]);

            setStats({
                patients: patientsStats.data?.stats,
                doctors: doctorsStats.data?.stats,
                specialties: specialtiesStats.data?.stats,
                appointments: appointmentsStats.data
            });

        } catch (err) {
            console.error('Error loading stats:', err);
            setError('Error al cargar las estadísticas');
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num) => {
        if (!num && num !== 0) return '0';
        return new Intl.NumberFormat('es-ES').format(num);
    };

    const getGrowthIcon = (isPositive) => {
        return isPositive ? (
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7h-10" />
            </svg>
        ) : (
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
            </svg>
        );
    };

    const getPeriodLabel = (period) => {
        const labels = {
            'week': 'Esta semana',
            'month': 'Este mes',
            'quarter': 'Este trimestre',
            'year': 'Este año'
        };
        return labels[period] || 'Este mes';
    };

    return (
        <div className="relative min-h-full">
            {/* Background Gradient Animation */}
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
            
            {/* Floating Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400 to-cyan-600 rounded-full opacity-5 animate-float"></div>
                <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full opacity-5 animate-float" style={{animationDelay: '1s'}}></div>
                <div className="absolute top-1/2 left-3/4 w-32 h-32 bg-gradient-to-r from-green-400 to-blue-600 rounded-full opacity-5 animate-float" style={{animationDelay: '2s'}}></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="glass rounded-3xl p-8 card-hover">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center neon-blue animate-pulse-glow">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-600 bg-clip-text text-transparent neon-text">
                                            Reportes y Estadísticas
                                        </h1>
                                        <p className="text-lg opacity-80 mt-2" style={{ color: colors.text.secondary }}>
                                            Panel de métricas y análisis del sistema clínico
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Period Selector */}
                                <div className="flex gap-2">
                                    {['week', 'month', 'quarter', 'year'].map((period) => (
                                        <button
                                            key={period}
                                            onClick={() => setSelectedPeriod(period)}
                                            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                                                selectedPeriod === period
                                                    ? 'bg-gradient-primary text-white neon-blue'
                                                    : 'glass text-white/70 hover:text-white'
                                            }`}
                                        >
                                            {getPeriodLabel(period)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex justify-center items-center py-12">
                            <div className="spinner-modern"></div>
                            <span className="ml-4 text-white/80 text-lg">Cargando estadísticas...</span>
                        </div>
                    )}

                    {/* Error State */}
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

                    {/* Stats Grid */}
                    {!loading && (
                        <>
                            {/* Main KPIs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                {/* Pacientes */}
                                <div className="stats-card card-hover">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium opacity-70 uppercase tracking-wider">Pacientes</p>
                                            <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                                {formatNumber(stats.patients?.total || 0)}
                                            </p>
                                            <div className="flex items-center mt-1">
                                                {getGrowthIcon(true)}
                                                <span className="text-green-400 text-sm ml-1">
                                                    {stats.patients?.active || 0} activos
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Doctores */}
                                <div className="stats-card card-hover">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium opacity-70 uppercase tracking-wider">Doctores</p>
                                            <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                                                {formatNumber(stats.doctors?.total || 0)}
                                            </p>
                                            <div className="flex items-center mt-1">
                                                {getGrowthIcon(true)}
                                                <span className="text-green-400 text-sm ml-1">
                                                    {stats.doctors?.active || 0} activos
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Especialidades */}
                                <div className="stats-card card-hover">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium opacity-70 uppercase tracking-wider">Especialidades</p>
                                            <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                                {formatNumber(stats.specialties?.total || 0)}
                                            </p>
                                            <div className="flex items-center mt-1">
                                                {getGrowthIcon(true)}
                                                <span className="text-green-400 text-sm ml-1">
                                                    {stats.specialties?.active || 0} activas
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-12 h-12 bg-gradient-warning rounded-xl flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m0 0h4M9 7h6m-6 4h6m-2 4h.01" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Citas */}
                                <div className="stats-card card-hover">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium opacity-70 uppercase tracking-wider">Citas</p>
                                            <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                                                {formatNumber(stats.appointments?.total || 0)}
                                            </p>
                                            <div className="flex items-center mt-1">
                                                {getGrowthIcon(true)}
                                                <span className="text-green-400 text-sm ml-1">
                                                    {stats.appointments?.today || 0} hoy
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-12 h-12 bg-gradient-danger rounded-xl flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v16a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Charts Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                {/* Citas por Estado */}
                                <div className="glass rounded-3xl p-8 card-hover">
                                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        Estado de las Citas
                                    </h3>
                                    
                                    {stats.appointments?.statusDistribution && stats.appointments.statusDistribution.length > 0 ? (
                                        <div className="space-y-4">
                                            {stats.appointments.statusDistribution.map((status, index) => (
                                                <div key={index} className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <div className={`w-3 h-3 rounded-full mr-3 ${
                                                            status.status === 'completed' ? 'bg-green-400' :
                                                            status.status === 'confirmed' ? 'bg-blue-400' :
                                                            status.status === 'scheduled' ? 'bg-yellow-400' :
                                                            status.status === 'cancelled' ? 'bg-red-400' :
                                                            'bg-gray-400'
                                                        }`}></div>
                                                        <span className="text-white/80">{status.display}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-white font-semibold">{status.count}</span>
                                                        <span className="text-white/60 text-sm ml-2">({status.percentage}%)</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-white/60">No hay datos de citas disponibles</p>
                                        </div>
                                    )}
                                </div>

                                {/* Métricas de Rendimiento */}
                                <div className="glass rounded-3xl p-8 card-hover">
                                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                        Métricas de Rendimiento
                                    </h3>
                                    
                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-white/80">Tasa de Finalización</span>
                                                <span className="text-green-400 font-semibold">
                                                    {stats.appointments?.completionRate || 0}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-white/10 rounded-full h-2">
                                                <div 
                                                    className="bg-gradient-success h-2 rounded-full transition-all duration-1000"
                                                    style={{ width: `${stats.appointments?.completionRate || 0}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-white/80">Tasa de Cancelación</span>
                                                <span className="text-red-400 font-semibold">
                                                    {stats.appointments?.cancellationRate || 0}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-white/10 rounded-full h-2">
                                                <div 
                                                    className="bg-gradient-danger h-2 rounded-full transition-all duration-1000"
                                                    style={{ width: `${stats.appointments?.cancellationRate || 0}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-white/80">Ocupación de Especialidades</span>
                                                <span className="text-blue-400 font-semibold">
                                                    {stats.specialties?.withDoctors || 0}/{stats.specialties?.total || 0}
                                                </span>
                                            </div>
                                            <div className="w-full bg-white/10 rounded-full h-2">
                                                <div 
                                                    className="bg-gradient-primary h-2 rounded-full transition-all duration-1000"
                                                    style={{ 
                                                        width: `${stats.specialties?.total > 0 
                                                            ? ((stats.specialties?.withDoctors || 0) / stats.specialties.total * 100) 
                                                            : 0}%` 
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="glass rounded-3xl p-8 card-hover">
                                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Acciones Rápidas
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <button className="btn-modern flex items-center justify-center gap-2 p-4">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Exportar PDF
                                    </button>
                                    
                                    <button className="btn-modern flex items-center justify-center gap-2 p-4">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        Reporte Detallado
                                    </button>
                                    
                                    <button 
                                        onClick={loadAllStats}
                                        disabled={loading}
                                        className="btn-modern flex items-center justify-center gap-2 p-4 disabled:opacity-50"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Actualizar
                                    </button>
                                    
                                    <button className="btn-modern flex items-center justify-center gap-2 p-4">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                        </svg>
                                        Compartir
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* CSS Animation Keyframes */}
            <style jsx>{`
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>
        </div>
    );
};

export default ReportsPage;