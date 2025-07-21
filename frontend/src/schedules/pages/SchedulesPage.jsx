import React, { useState, useEffect } from 'react';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { scheduleService } from '../services/scheduleService';
import { doctorService } from '../../doctors/services/doctorService';
import WeeklyScheduleView from '../components/WeeklyScheduleView';
import ScheduleForm from '../components/ScheduleForm';
import DoctorScheduleCard from '../components/DoctorScheduleCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../shared/components/ui/Card';
import { Button } from '../../shared/components/ui/Button';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';

const SchedulesPage = () => {
    const { colors, isDarkMode } = useTheme();
    const [schedules, setSchedules] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // 'list', 'calendar', 'form'
    const [filters, setFilters] = useState({
        doctorId: '',
        dayOfWeek: '',
        isAvailable: ''
    });

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (filters.doctorId || filters.dayOfWeek !== '' || filters.isAvailable !== '') {
            loadSchedules();
        }
    }, [filters]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [schedulesResponse, doctorsResponse] = await Promise.all([
                scheduleService.getAllSchedules(),
                doctorService.getActiveDoctors()
            ]);

            setSchedules(schedulesResponse.data?.schedules || []);
            setDoctors(doctorsResponse.data?.doctors || []);
        } catch (error) {
            console.error('Error al cargar datos iniciales:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadSchedules = async () => {
        try {
            setLoading(true);
            const response = await scheduleService.getAllSchedules(filters);
            setSchedules(response.data?.schedules || []);
        } catch (error) {
            console.error('Error al cargar horarios:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSchedule = async (scheduleData) => {
        try {
            await scheduleService.createSchedule(scheduleData);
            loadSchedules();
            setView('list');
            setSelectedSchedule(null);
        } catch (error) {
            console.error('Error al crear horario:', error);
            throw error;
        }
    };

    const handleCreateWeeklySchedule = async (doctorId, weeklyData) => {
        try {
            await scheduleService.createWeeklySchedule(doctorId, weeklyData);
            loadSchedules();
            setView('list');
            setSelectedDoctor(null);
        } catch (error) {
            console.error('Error al crear horarios semanales:', error);
            throw error;
        }
    };

    const handleUpdateSchedule = async (scheduleId, updateData) => {
        try {
            await scheduleService.updateSchedule(scheduleId, updateData);
            loadSchedules();
            setSelectedSchedule(null);
        } catch (error) {
            console.error('Error al actualizar horario:', error);
            throw error;
        }
    };

    const handleDeleteSchedule = async (scheduleId) => {
        if (window.confirm('¿Está seguro de que desea eliminar este horario?')) {
            try {
                await scheduleService.deleteSchedule(scheduleId);
                loadSchedules();
            } catch (error) {
                console.error('Error al eliminar horario:', error);
            }
        }
    };

    const handleToggleAvailability = async (scheduleId, isAvailable) => {
        try {
            await scheduleService.toggleAvailability(scheduleId, isAvailable);
            loadSchedules();
        } catch (error) {
            console.error('Error al cambiar disponibilidad:', error);
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    const groupSchedulesByDoctor = () => {
        const grouped = {};
        schedules.forEach(schedule => {
            if (!grouped[schedule.doctorId]) {
                grouped[schedule.doctorId] = {
                    doctor: doctors.find(d => d.id === schedule.doctorId),
                    schedules: []
                };
            }
            grouped[schedule.doctorId].schedules.push(schedule);
        });
        return grouped;
    };

    const groupedSchedules = groupSchedulesByDoctor();

    if (loading) {
        return (
            <Card>
                <LoadingSpinner size="lg" text="Cargando horarios..." center />
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: colors.text.primary }}>
                        📅 Gestión de Horarios
                    </h1>
                    <p className="text-sm" style={{ color: colors.text.secondary }}>
                        Administra los horarios de disponibilidad de los médicos
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button
                        onClick={() => {
                            setView('form');
                            setSelectedSchedule(null);
                            setSelectedDoctor(null);
                        }}
                        variant="primary"
                    >
                        ➕ Crear Horario
                    </Button>
                    <Button
                        onClick={() => {
                            setView('calendar');
                            setSelectedSchedule(null);
                        }}
                        variant="outline"
                    >
                        🗓️ Vista Semanal
                    </Button>
                </div>
            </div>

            {/* View Toggle */}
            <Card>
                <div className="flex gap-2 p-1">
                    <Button
                        size="sm"
                        variant={view === 'list' ? 'primary' : 'ghost'}
                        onClick={() => setView('list')}
                    >
                        📋 Lista de Horarios
                    </Button>
                    <Button
                        size="sm"
                        variant={view === 'calendar' ? 'primary' : 'ghost'}
                        onClick={() => setView('calendar')}
                    >
                        🗓️ Vista Semanal
                    </Button>
                    {view === 'form' && (
                        <Button
                            size="sm"
                            variant="primary"
                            onClick={() => {}}
                        >
                            ✏️ {selectedSchedule ? 'Editar' : 'Crear'} Horario
                        </Button>
                    )}
                </div>
            </Card>

            {/* Filters */}
            {view === 'list' && (
                <Card>
                    <CardHeader>
                        <CardTitle>🔍 Filtros de Búsqueda</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
                                    👨‍⚕️ Médico
                                </label>
                                <select
                                    value={filters.doctorId}
                                    onChange={(e) => handleFilterChange({ doctorId: e.target.value })}
                                    className="input-modern w-full"
                                >
                                    <option value="">Todos los médicos</option>
                                    {(doctors || []).map(doctor => (
                                        <option key={doctor.id} value={doctor.id}>
                                            {doctor.firstName} {doctor.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
                                    📅 Día de la Semana
                                </label>
                                <select
                                    value={filters.dayOfWeek}
                                    onChange={(e) => handleFilterChange({ dayOfWeek: e.target.value })}
                                    className="input-modern w-full"
                                >
                                    <option value="">Todos los días</option>
                                    <option value="1">Lunes</option>
                                    <option value="2">Martes</option>
                                    <option value="3">Miércoles</option>
                                    <option value="4">Jueves</option>
                                    <option value="5">Viernes</option>
                                    <option value="6">Sábado</option>
                                    <option value="0">Domingo</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
                                    ⏰ Disponibilidad
                                </label>
                                <select
                                    value={filters.isAvailable}
                                    onChange={(e) => handleFilterChange({ isAvailable: e.target.value })}
                                    className="input-modern w-full"
                                >
                                    <option value="">Todos</option>
                                    <option value="true">✅ Disponible</option>
                                    <option value="false">❌ No disponible</option>
                                </select>
                            </div>
                        </div>
                        
                        {/* Quick Stats */}
                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="text-center p-3 rounded-lg" style={{ backgroundColor: colors.primary?.[50] || '#eff6ff' }}>
                                <div className="text-lg font-bold" style={{ color: colors.primary?.[600] || '#2563eb' }}>
                                    {schedules.length}
                                </div>
                                <div className="text-sm" style={{ color: colors.text.secondary }}>Total Horarios</div>
                            </div>
                            <div className="text-center p-3 rounded-lg" style={{ backgroundColor: colors.success?.[50] || '#ecfdf5' }}>
                                <div className="text-lg font-bold" style={{ color: colors.success?.[600] || '#059669' }}>
                                    {schedules.filter(s => s.isAvailable).length}
                                </div>
                                <div className="text-sm" style={{ color: colors.text.secondary }}>Disponibles</div>
                            </div>
                            <div className="text-center p-3 rounded-lg" style={{ backgroundColor: colors.warning?.[50] || '#fffbeb' }}>
                                <div className="text-lg font-bold" style={{ color: colors.warning?.[600] || '#d97706' }}>
                                    {Object.keys(groupedSchedules).length}
                                </div>
                                <div className="text-sm" style={{ color: colors.text.secondary }}>Médicos Activos</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Content */}
            {view === 'list' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {Object.entries(groupedSchedules).length === 0 ? (
                        <Card className="col-span-full">
                            <div className="text-center py-12">
                                <div className="text-4xl mb-4">📅</div>
                                <h3 className="text-lg font-medium mb-2" style={{ color: colors.text.primary }}>No hay horarios disponibles</h3>
                                <p className="text-sm mb-4" style={{ color: colors.text.secondary }}>
                                    Comienza creando horarios para los médicos
                                </p>
                                <Button
                                    onClick={() => {
                                        setView('form');
                                        setSelectedSchedule(null);
                                        setSelectedDoctor(null);
                                    }}
                                    variant="primary"
                                >
                                    ➕ Crear Primer Horario
                                </Button>
                            </div>
                        </Card>
                    ) : (
                        Object.entries(groupedSchedules || {}).map(([doctorId, data]) => (
                            <DoctorScheduleCard
                                key={doctorId}
                                doctor={data.doctor}
                                schedules={data.schedules}
                                onEdit={(schedule) => {
                                    setSelectedSchedule(schedule);
                                    setView('form');
                                }}
                                onDelete={handleDeleteSchedule}
                                onToggleAvailability={handleToggleAvailability}
                            />
                        ))
                    )}
                </div>
            )}

            {view === 'calendar' && (
                <Card>
                    <CardHeader>
                        <CardTitle>🗓️ Vista Semanal de Horarios</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <WeeklyScheduleView
                            doctors={doctors}
                            onCreateWeeklySchedule={handleCreateWeeklySchedule}
                            onEditSchedule={(schedule) => {
                                setSelectedSchedule(schedule);
                                setView('form');
                            }}
                        />
                    </CardContent>
                </Card>
            )}

            {view === 'form' && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {selectedSchedule ? '✏️ Editar Horario' : '➕ Crear Nuevo Horario'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScheduleForm
                            schedule={selectedSchedule}
                            doctors={doctors}
                            onSave={selectedSchedule ? 
                                (data) => handleUpdateSchedule(selectedSchedule.id, data) : 
                                handleCreateSchedule
                            }
                            onCancel={() => {
                                setView('list');
                                setSelectedSchedule(null);
                            }}
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default SchedulesPage;