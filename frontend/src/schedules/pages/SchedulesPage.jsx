import React, { useState, useEffect } from 'react';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { scheduleService } from '../services/scheduleService';
import { doctorService } from '../../doctors/services/doctorService';
import WeeklyScheduleView from '../components/WeeklyScheduleView';
import ScheduleForm from '../components/ScheduleForm';
import DoctorScheduleCard from '../components/DoctorScheduleCard';

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
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 
                        className="text-3xl font-bold"
                        style={{ color: isDarkMode ? colors.white : colors.gray900 }}
                    >
                        Gestión de Horarios
                    </h1>
                    <p 
                        className="mt-2"
                        style={{ color: isDarkMode ? colors.gray300 : colors.gray600 }}
                    >
                        Administra los horarios de disponibilidad de los médicos
                    </p>
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={() => {
                            setView('form');
                            setSelectedSchedule(null);
                            setSelectedDoctor(null);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Crear Horario
                    </button>
                    <button
                        onClick={() => {
                            setView('calendar');
                            setSelectedSchedule(null);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Horarios Semanales
                    </button>
                </div>
            </div>

            {/* View Toggle */}
            <div className="flex space-x-4 border-b" style={{ borderColor: isDarkMode ? colors.gray700 : colors.gray200 }}>
                <button
                    onClick={() => setView('list')}
                    className={`pb-2 px-1 font-medium text-sm border-b-2 transition-colors ${
                        view === 'list'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent hover:text-blue-600'
                    }`}
                    style={{ 
                        color: view !== 'list' ? (isDarkMode ? colors.gray400 : colors.gray500) : undefined 
                    }}
                >
                    Lista de Horarios
                </button>
                <button
                    onClick={() => setView('calendar')}
                    className={`pb-2 px-1 font-medium text-sm border-b-2 transition-colors ${
                        view === 'calendar'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent hover:text-blue-600'
                    }`}
                    style={{ 
                        color: view !== 'calendar' ? (isDarkMode ? colors.gray400 : colors.gray500) : undefined 
                    }}
                >
                    Vista Semanal
                </button>
            </div>

            {/* Filters */}
            {view === 'list' && (
                <div 
                    className="p-4 rounded-lg border"
                    style={{ 
                        backgroundColor: isDarkMode ? colors.gray800 : colors.white,
                        borderColor: isDarkMode ? colors.gray700 : colors.gray200
                    }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: isDarkMode ? colors.gray300 : colors.gray700 }}>
                                Médico
                            </label>
                            <select
                                value={filters.doctorId}
                                onChange={(e) => handleFilterChange({ doctorId: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                style={{
                                    backgroundColor: isDarkMode ? colors.gray700 : colors.white,
                                    borderColor: isDarkMode ? colors.gray600 : colors.gray300,
                                    color: isDarkMode ? colors.white : colors.gray900
                                }}
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
                            <label className="block text-sm font-medium mb-1" style={{ color: isDarkMode ? colors.gray300 : colors.gray700 }}>
                                Día de la Semana
                            </label>
                            <select
                                value={filters.dayOfWeek}
                                onChange={(e) => handleFilterChange({ dayOfWeek: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                style={{
                                    backgroundColor: isDarkMode ? colors.gray700 : colors.white,
                                    borderColor: isDarkMode ? colors.gray600 : colors.gray300,
                                    color: isDarkMode ? colors.white : colors.gray900
                                }}
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
                            <label className="block text-sm font-medium mb-1" style={{ color: isDarkMode ? colors.gray300 : colors.gray700 }}>
                                Disponibilidad
                            </label>
                            <select
                                value={filters.isAvailable}
                                onChange={(e) => handleFilterChange({ isAvailable: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                style={{
                                    backgroundColor: isDarkMode ? colors.gray700 : colors.white,
                                    borderColor: isDarkMode ? colors.gray600 : colors.gray300,
                                    color: isDarkMode ? colors.white : colors.gray900
                                }}
                            >
                                <option value="">Todos</option>
                                <option value="true">Disponible</option>
                                <option value="false">No disponible</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            {view === 'list' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {Object.entries(groupedSchedules).length === 0 ? (
                        <div 
                            className="col-span-full text-center py-12 rounded-lg border"
                            style={{ 
                                backgroundColor: isDarkMode ? colors.gray800 : colors.white,
                                borderColor: isDarkMode ? colors.gray700 : colors.gray200
                            }}
                        >
                            <p style={{ color: isDarkMode ? colors.gray400 : colors.gray500 }}>
                                No se encontraron horarios
                            </p>
                        </div>
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
                <WeeklyScheduleView
                    doctors={doctors}
                    onCreateWeeklySchedule={handleCreateWeeklySchedule}
                    onEditSchedule={(schedule) => {
                        setSelectedSchedule(schedule);
                        setView('form');
                    }}
                />
            )}

            {view === 'form' && (
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
            )}
        </div>
    );
};

export default SchedulesPage;