import React, { useState, useEffect } from 'react';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { specialtyService } from '../../specialties/services/specialtyService';
import { patientService } from '../../patients/services/patientService';
import { doctorService } from '../../doctors/services/doctorService';
import appointmentService from '../../services/appointmentService';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Card } from '../../shared/components/ui/Card';
import { Button } from '../../shared/components/ui/Button';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

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
    const [showCharts, setShowCharts] = useState(false);

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

    // Acciones rápidas
    const handleExportPDF = async () => {
        try {
            const res = await appointmentService.generateAppointmentReport({}, 'pdf');
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'reporte_citas.pdf';
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Error al exportar PDF');
        }
    };
    const handleExportExcel = async () => {
        try {
            const res = await appointmentService.generateAppointmentReport({}, 'excel');
            const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'reporte_citas.xlsx';
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Error al exportar Excel');
        }
    };
    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('¡Enlace copiado al portapapeles!');
    };
    const handleShowCharts = () => setShowCharts(true);
    const handleCloseCharts = () => setShowCharts(false);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: colors.text.primary }}>
                        📊 Reportes y Estadísticas
                    </h1>
                    <p className="text-sm" style={{ color: colors.text.secondary }}>
                        Panel de métricas y análisis del sistema clínico
                    </p>
                </div>
                <div className="flex gap-2">
                    {['week', 'month', 'quarter', 'year'].map((period) => (
                        <Button
                            key={period}
                            size="sm"
                            variant={selectedPeriod === period ? 'primary' : 'outline'}
                            onClick={() => setSelectedPeriod(period)}
                        >
                            {getPeriodLabel(period)}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <Card>
                    <LoadingSpinner size="lg" text="Cargando estadísticas..." center />
                </Card>
            )}

            {/* Error State */}
            {error && (
                <Card variant="critical">
                    <div className="flex items-start">
                        <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" style={{ color: colors.error?.[500] || '#ef4444' }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                            <h3 className="font-medium" style={{ color: colors.error?.[700] || '#b91c1c' }}>
                                Error al cargar estadísticas
                            </h3>
                            <p className="text-sm mt-1" style={{ color: colors.error?.[600] || '#dc2626' }}>
                                {error}
                            </p>
                            <div className="mt-3 flex space-x-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => loadAllStats()}
                                >
                                    Reintentar
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setError(null)}
                                >
                                    Cerrar
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Stats Grid */}
            {!loading && (
                <>
                    {/* Main KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Pacientes */}
                        <Card>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium" style={{ color: colors.text.secondary }}>👤 Pacientes</p>
                                    <p className="text-2xl font-bold mt-2" style={{ color: colors.text.primary }}>
                                        {formatNumber(stats.patients?.total || 0)}
                                    </p>
                                    <div className="flex items-center mt-1">
                                        {getGrowthIcon(true)}
                                        <span className="text-sm ml-1" style={{ color: colors.success?.[600] || '#059669' }}>
                                            {stats.patients?.active || 0} activos
                                        </span>
                                    </div>
                                </div>
                                <div 
                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: colors.primary?.[100] || '#dbeafe' }}
                                >
                                    <svg className="w-6 h-6" style={{ color: colors.primary?.[600] || '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                    </svg>
                                </div>
                            </div>
                        </Card>

                        {/* Doctores */}
                        <Card>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium" style={{ color: colors.text.secondary }}>👨‍⚕️ Doctores</p>
                                    <p className="text-2xl font-bold mt-2" style={{ color: colors.text.primary }}>
                                        {formatNumber(stats.doctors?.total || 0)}
                                    </p>
                                    <div className="flex items-center mt-1">
                                        {getGrowthIcon(true)}
                                        <span className="text-sm ml-1" style={{ color: colors.success?.[600] || '#059669' }}>
                                            {stats.doctors?.active || 0} activos
                                        </span>
                                    </div>
                                </div>
                                <div 
                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: colors.success?.[100] || '#dcfce7' }}
                                >
                                    <svg className="w-6 h-6" style={{ color: colors.success?.[600] || '#059669' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            </div>
                        </Card>

                        {/* Especialidades */}
                        <Card>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium" style={{ color: colors.text.secondary }}>🏥 Especialidades</p>
                                    <p className="text-2xl font-bold mt-2" style={{ color: colors.text.primary }}>
                                        {formatNumber(stats.specialties?.total || 0)}
                                    </p>
                                    <div className="flex items-center mt-1">
                                        {getGrowthIcon(true)}
                                        <span className="text-sm ml-1" style={{ color: colors.success?.[600] || '#059669' }}>
                                            {stats.specialties?.active || 0} activas
                                        </span>
                                    </div>
                                </div>
                                <div 
                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: colors.warning?.[100] || '#fef3c7' }}
                                >
                                    <svg className="w-6 h-6" style={{ color: colors.warning?.[600] || '#d97706' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m0 0h4M9 7h6m-6 4h6m-2 4h.01" />
                                    </svg>
                                </div>
                            </div>
                        </Card>

                        {/* Citas */}
                        <Card>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium" style={{ color: colors.text.secondary }}>📅 Citas</p>
                                    <p className="text-2xl font-bold mt-2" style={{ color: colors.text.primary }}>
                                        {formatNumber(stats.appointments?.total || 0)}
                                    </p>
                                    <div className="flex items-center mt-1">
                                        {getGrowthIcon(true)}
                                        <span className="text-sm ml-1" style={{ color: colors.success?.[600] || '#059669' }}>
                                            {stats.appointments?.today || 0} hoy
                                        </span>
                                    </div>
                                </div>
                                <div 
                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: colors.error?.[100] || '#fee2e2' }}
                                >
                                    <svg className="w-6 h-6" style={{ color: colors.error?.[600] || '#dc2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v16a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Detailed Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Citas por Estado */}
                        <Card>
                            <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: colors.text.primary }}>
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                📈 Estado de las Citas
                            </h3>
                                    
                            {stats.appointments?.statusDistribution && stats.appointments.statusDistribution.length > 0 ? (
                                <div className="space-y-4">
                                    {stats.appointments.statusDistribution.map((status, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className={`w-3 h-3 rounded-full mr-3`} style={{
                                                    backgroundColor: 
                                                        status.status === 'completed' ? colors.success?.[500] || '#10b981' :
                                                        status.status === 'confirmed' ? colors.primary?.[500] || '#3b82f6' :
                                                        status.status === 'scheduled' ? colors.warning?.[500] || '#f59e0b' :
                                                        status.status === 'cancelled' ? colors.error?.[500] || '#ef4444' :
                                                        colors.gray?.[400] || '#9ca3af'
                                                }}></div>
                                                <span style={{ color: colors.text.primary }}>{status.display}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-semibold" style={{ color: colors.text.primary }}>{status.count}</span>
                                                <span className="text-sm ml-2" style={{ color: colors.text.secondary }}>({status.percentage}%)</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p style={{ color: colors.text.secondary }}>No hay datos de citas disponibles</p>
                                </div>
                            )}
                        </Card>

                        {/* Métricas de Rendimiento */}
                        <Card>
                            <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: colors.text.primary }}>
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                                📈 Métricas de Rendimiento
                            </h3>
                                    
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Tasa de Finalización */}
                                <div className="p-4 rounded-lg" style={{ backgroundColor: colors.success?.[50] || '#ecfdf5', border: `1px solid ${colors.success?.[200] || '#bbf7d0'}` }}>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-medium" style={{ color: colors.success?.[800] || '#065f46' }}>✅ Finalización</span>
                                        <span className="text-xl font-bold" style={{ color: colors.success?.[600] || '#059669' }}>
                                            {stats.appointments?.completionRate || 0}%
                                        </span>
                                    </div>
                                    <div className="w-full rounded-full h-2" style={{ backgroundColor: colors.success?.[100] || '#dcfce7' }}>
                                        <div 
                                            className="h-2 rounded-full transition-all duration-1000"
                                            style={{ 
                                                width: `${stats.appointments?.completionRate || 0}%`,
                                                backgroundColor: colors.success?.[500] || '#10b981'
                                            }}
                                        ></div>
                                    </div>
                                    <p className="text-xs mt-2" style={{ color: colors.success?.[700] || '#047857' }}>Citas completadas exitosamente</p>
                                </div>

                                {/* Tasa de Cancelación */}
                                <div className="p-4 rounded-lg" style={{ backgroundColor: colors.error?.[50] || '#fef2f2', border: `1px solid ${colors.error?.[200] || '#fecaca'}` }}>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-medium" style={{ color: colors.error?.[800] || '#991b1b' }}>❌ Cancelación</span>
                                        <span className="text-xl font-bold" style={{ color: colors.error?.[600] || '#dc2626' }}>
                                            {stats.appointments?.cancellationRate || 0}%
                                        </span>
                                    </div>
                                    <div className="w-full rounded-full h-2" style={{ backgroundColor: colors.error?.[100] || '#fee2e2' }}>
                                        <div 
                                            className="h-2 rounded-full transition-all duration-1000"
                                            style={{ 
                                                width: `${stats.appointments?.cancellationRate || 0}%`,
                                                backgroundColor: colors.error?.[500] || '#ef4444'
                                            }}
                                        ></div>
                                    </div>
                                    <p className="text-xs mt-2" style={{ color: colors.error?.[700] || '#b91c1c' }}>Citas canceladas por pacientes</p>
                                </div>

                                {/* Ocupación de Especialidades */}
                                <div className="p-4 rounded-lg" style={{ backgroundColor: colors.primary?.[50] || '#eff6ff', border: `1px solid ${colors.primary?.[200] || '#bfdbfe'}` }}>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-medium" style={{ color: colors.primary?.[800] || '#1e40af' }}>🏥 Ocupación</span>
                                        <span className="text-xl font-bold" style={{ color: colors.primary?.[600] || '#2563eb' }}>
                                            {Array.isArray(stats.specialties?.withDoctors)
                                                ? `${stats.specialties.withDoctors.length}/${stats.specialties?.total || 0}`
                                                : `0/${stats.specialties?.total || 0}`}
                                        </span>
                                    </div>
                                    <div className="w-full rounded-full h-2" style={{ backgroundColor: colors.primary?.[100] || '#dbeafe' }}>
                                        <div 
                                            className="h-2 rounded-full transition-all duration-1000"
                                            style={{ 
                                                width: `${stats.specialties?.total > 0 
                                                    ? (Array.isArray(stats.specialties?.withDoctors)
                                                        ? (stats.specialties.withDoctors.length / stats.specialties.total * 100)
                                                        : 0)
                                                    : 0}%`,
                                                backgroundColor: colors.primary?.[500] || '#3b82f6'
                                            }}
                                        ></div>
                                    </div>
                                    <p className="text-xs mt-2" style={{ color: colors.primary?.[700] || '#1d4ed8' }}>Especialidades con médicos</p>
                                </div>
                            </div>

                            {/* Lista detallada de especialidades */}
                            {Array.isArray(stats.specialties?.withDoctors) && stats.specialties.withDoctors.length > 0 && (
                                <div className="mt-6">
                                    <h4 className="text-md font-medium mb-3 flex items-center" style={{ color: colors.text.primary }}>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m0 0h4M9 7h6m-6 4h6m-2 4h.01" />
                                        </svg>
                                        Distribución por Especialidad
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {stats.specialties.withDoctors.map((s) => (
                                            <div key={s.id} className="flex items-center justify-between p-3 rounded-lg" 
                                                 style={{ backgroundColor: colors.gray?.[50] || '#f9fafb', border: `1px solid ${colors.gray?.[200] || '#e5e7eb'}` }}>
                                                <div>
                                                    <span className="font-medium text-sm" style={{ color: colors.text.primary }}>
                                                        {s.name}
                                                    </span>
                                                    <div className="flex items-center mt-1">
                                                        <svg className="w-3 h-3 mr-1" style={{ color: colors.primary?.[500] }} fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="text-xs" style={{ color: colors.primary?.[600] || '#2563eb' }}>
                                                            {s.doctorCount} {s.doctorCount === 1 ? 'médico' : 'médicos'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <Card>
                        <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: colors.text.primary }}>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            ⚡ Acciones Rápidas
                        </h3>
                        
                        <div className="flex flex-wrap justify-evenly gap-4 md:gap-6">
                            <div className="flex flex-col items-center space-y-3 p-4 rounded-lg transition-all duration-200 hover:shadow-md" 
                                 style={{ backgroundColor: colors.primary?.[50] || '#eff6ff', minWidth: '140px' }}>
                                <div className="w-12 h-12 rounded-full flex items-center justify-center" 
                                     style={{ backgroundColor: colors.primary?.[100] || '#dbeafe' }}>
                                    <svg className="w-6 h-6" style={{ color: colors.primary?.[600] }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <Button onClick={handleExportPDF} variant="primary" size="sm" className="w-full">
                                    📄 Exportar PDF
                                </Button>
                                <p className="text-xs text-center" style={{ color: colors.text.secondary }}>
                                    Descargar reporte en PDF
                                </p>
                            </div>

                            <div className="flex flex-col items-center space-y-3 p-4 rounded-lg transition-all duration-200 hover:shadow-md" 
                                 style={{ backgroundColor: colors.success?.[50] || '#ecfdf5', minWidth: '140px' }}>
                                <div className="w-12 h-12 rounded-full flex items-center justify-center" 
                                     style={{ backgroundColor: colors.success?.[100] || '#dcfce7' }}>
                                    <svg className="w-6 h-6" style={{ color: colors.success?.[600] }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <Button onClick={handleShowCharts} variant="primary" size="sm" className="w-full">
                                    📊 Ver Gráficos
                                </Button>
                                <p className="text-xs text-center" style={{ color: colors.text.secondary }}>
                                    Visualizar datos en gráficos
                                </p>
                            </div>

                            <div className="flex flex-col items-center space-y-3 p-4 rounded-lg transition-all duration-200 hover:shadow-md" 
                                 style={{ backgroundColor: colors.warning?.[50] || '#fffbeb', minWidth: '140px' }}>
                                <div className="w-12 h-12 rounded-full flex items-center justify-center" 
                                     style={{ backgroundColor: colors.warning?.[100] || '#fef3c7' }}>
                                    <svg className="w-6 h-6" style={{ color: colors.warning?.[600] }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </div>
                                <Button onClick={loadAllStats} disabled={loading} variant="primary" size="sm" className="w-full">
                                    🔄 Actualizar
                                </Button>
                                <p className="text-xs text-center" style={{ color: colors.text.secondary }}>
                                    Recargar estadísticas
                                </p>
                            </div>

                            <div className="flex flex-col items-center space-y-3 p-4 rounded-lg transition-all duration-200 hover:shadow-md" 
                                 style={{ backgroundColor: colors.purple?.[50] || '#faf5ff', minWidth: '140px' }}>
                                <div className="w-12 h-12 rounded-full flex items-center justify-center" 
                                     style={{ backgroundColor: colors.purple?.[100] || '#e9d5ff' }}>
                                    <svg className="w-6 h-6" style={{ color: colors.purple?.[600] || '#9333ea' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                </div>
                                <Button onClick={handleShare} variant="primary" size="sm" className="w-full">
                                    🔗 Compartir
                                </Button>
                                <p className="text-xs text-center" style={{ color: colors.text.secondary }}>
                                    Compartir enlace del reporte
                                </p>
                            </div>
                        </div>
                    </Card>
                </>
            )}

            {/* Modal de gráficos */}
            {showCharts && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
                    onClick={handleCloseCharts}
                >
                    <Card className="max-w-3xl w-full m-4 relative" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold" style={{ color: colors.text.primary }}>📊 Reporte Detallado</h2>
                            <Button
                                onClick={handleCloseCharts}
                                variant="ghost"
                                size="sm"
                                icon={
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                }
                            >
                                Cerrar
                            </Button>
                        </div>
                        <div className="space-y-8">
                        {/* Gráfico de barras: Citas por estado */}
                        {stats.appointments?.statusDistribution && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text.primary }}>Citas por Estado</h3>
                                <Bar
                                    data={{
                                        labels: stats.appointments.statusDistribution.map(s => s.display),
                                        datasets: [{
                                            label: 'Cantidad',
                                            data: stats.appointments.statusDistribution.map(s => s.count),
                                            backgroundColor: [colors.primary?.[500] || '#2563eb', colors.success?.[500] || '#059669', colors.warning?.[500] || '#f59e0b', colors.success?.[400] || '#10b981', colors.error?.[500] || '#ef4444', colors.gray?.[500] || '#6b7280'],
                                        }]
                                    }}
                                    options={{
                                        responsive: true,
                                        plugins: { legend: { display: false } }
                                    }}
                                />
                            </div>
                        )}
                        {/* Gráfico de pastel: Ocupación de especialidades */}
                        {Array.isArray(stats.specialties?.withDoctors) && stats.specialties.withDoctors.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text.primary }}>Ocupación de Especialidades</h3>
                                <Pie
                                    data={{
                                        labels: stats.specialties.withDoctors.map(s => s.name),
                                        datasets: [{
                                            data: stats.specialties.withDoctors.map(s => s.doctorCount),
                                            backgroundColor: [colors.primary?.[500] || '#6366f1', colors.warning?.[500] || '#f59e0b', colors.success?.[500] || '#10b981', colors.error?.[500] || '#ef4444', colors.purple?.[500] || '#a21caf', colors.primary?.[600] || '#2563eb', colors.warning?.[400] || '#fbbf24'],
                                        }]
                                    }}
                                    options={{
                                        responsive: true,
                                        plugins: { legend: { position: 'bottom' } }
                                    }}
                                />
                            </div>
                        )}
                        {/* Gráfico de líneas: Pacientes por mes (si hay datos) */}
                        {stats.patients?.byMonth && stats.patients.byMonth.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text.primary }}>Pacientes Registrados por Mes</h3>
                                <Line
                                    data={{
                                        labels: stats.patients.byMonth.map(m => m.month),
                                        datasets: [{
                                            label: 'Pacientes',
                                            data: stats.patients.byMonth.map(m => m.count),
                                            borderColor: colors.primary?.[500] || '#6366f1',
                                            backgroundColor: colors.primary?.[100] || 'rgba(99,102,241,0.2)',
                                            tension: 0.4
                                        }]
                                    }}
                                    options={{
                                        responsive: true,
                                        plugins: { legend: { display: false } }
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    </Card>
                </div>
            )}

        </div>
    );
};

export default ReportsPage;