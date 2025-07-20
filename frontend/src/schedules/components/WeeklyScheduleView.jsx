import React, { useState, useEffect } from 'react';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { scheduleService } from '../services/scheduleService';

const WeeklyScheduleView = ({ doctors, onCreateWeeklySchedule, onEditSchedule }) => {
    const { colors, isDarkMode } = useTheme();
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [weeklySchedule, setWeeklySchedule] = useState(scheduleService.createEmptyWeeklySchedule());
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('view'); // 'view', 'create', 'edit'

    useEffect(() => {
        if (selectedDoctor && mode === 'view') {
            loadDoctorSchedule();
        }
    }, [selectedDoctor, mode]);

    const loadDoctorSchedule = async () => {
        try {
            setLoading(true);
            const response = await scheduleService.getSchedulesByDoctor(selectedDoctor);
            
            if (response.data && response.data.length > 0) {
                // Agrupar horarios por día de la semana
                const schedulesByDay = {};
                response.data.forEach(schedule => {
                    schedulesByDay[schedule.dayOfWeek] = schedule;
                });

                // Llenar plantilla con datos existentes
                const updatedSchedule = scheduleService.createEmptyWeeklySchedule().map(dayTemplate => {
                    const existingSchedule = schedulesByDay[dayTemplate.dayOfWeek];
                    return existingSchedule ? {
                        ...existingSchedule,
                        dayOfWeek: dayTemplate.dayOfWeek
                    } : dayTemplate;
                });

                setWeeklySchedule(updatedSchedule);
            } else {
                setWeeklySchedule(scheduleService.createEmptyWeeklySchedule());
            }
        } catch (error) {
            console.error('Error al cargar horario del médico:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleScheduleChange = (dayOfWeek, field, value) => {
        setWeeklySchedule(prev => 
            prev.map(day => 
                day.dayOfWeek === dayOfWeek 
                    ? { ...day, [field]: value }
                    : day
            )
        );
    };

    const handleSaveWeeklySchedule = async () => {
        if (!selectedDoctor) {
            alert('Seleccione un médico');
            return;
        }

        try {
            // Filtrar solo los días disponibles
            const activeSchedules = weeklySchedule.filter(day => day.isAvailable);
            
            if (activeSchedules.length === 0) {
                alert('Debe configurar al menos un día como disponible');
                return;
            }

            // Validar horarios
            for (const schedule of activeSchedules) {
                if (!scheduleService.isValidTimeFormat(schedule.startTime) || 
                    !scheduleService.isValidTimeFormat(schedule.endTime)) {
                    alert('Formato de tiempo inválido. Use HH:MM');
                    return;
                }

                if (scheduleService.compareTime(schedule.startTime, schedule.endTime) >= 0) {
                    alert(`El horario del ${scheduleService.getDayName(schedule.dayOfWeek)} tiene hora de fin anterior o igual a la hora de inicio`);
                    return;
                }

                if (schedule.breakStart && schedule.breakEnd) {
                    if (scheduleService.compareTime(schedule.breakStart, schedule.breakEnd) >= 0) {
                        alert(`El descanso del ${scheduleService.getDayName(schedule.dayOfWeek)} tiene hora de fin anterior o igual a la hora de inicio`);
                        return;
                    }
                }
            }

            await onCreateWeeklySchedule(selectedDoctor, activeSchedules);
            setMode('view');
            loadDoctorSchedule();
        } catch (error) {
            console.error('Error al guardar horarios:', error);
            alert('Error al guardar horarios');
        }
    };

    const TimeInput = ({ value, onChange, placeholder = "HH:MM" }) => (
        <input
            type="time"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500"
            style={{
                backgroundColor: isDarkMode ? colors.gray700 : colors.white,
                borderColor: isDarkMode ? colors.gray600 : colors.gray300,
                color: isDarkMode ? colors.white : colors.gray900
            }}
        />
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 
                        className="text-xl font-semibold"
                        style={{ color: isDarkMode ? colors.white : colors.gray900 }}
                    >
                        Vista Semanal de Horarios
                    </h2>
                </div>
                
                <div className="flex space-x-3">
                    <select
                        value={selectedDoctor}
                        onChange={(e) => setSelectedDoctor(e.target.value)}
                        className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        style={{
                            backgroundColor: isDarkMode ? colors.gray700 : colors.white,
                            borderColor: isDarkMode ? colors.gray600 : colors.gray300,
                            color: isDarkMode ? colors.white : colors.gray900
                        }}
                    >
                        <option value="">Seleccionar médico</option>
                        {doctors.map(doctor => (
                            <option key={doctor.id} value={doctor.id}>
                                {doctor.firstName} {doctor.lastName}
                            </option>
                        ))}
                    </select>

                    {selectedDoctor && (
                        <>
                            {mode === 'view' && (
                                <button
                                    onClick={() => setMode('create')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Editar Horarios
                                </button>
                            )}
                            
                            {mode === 'create' && (
                                <>
                                    <button
                                        onClick={handleSaveWeeklySchedule}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Guardar
                                    </button>
                                    <button
                                        onClick={() => {
                                            setMode('view');
                                            loadDoctorSchedule();
                                        }}
                                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Weekly Calendar */}
            {selectedDoctor && (
                <div 
                    className="rounded-lg border overflow-hidden"
                    style={{ 
                        backgroundColor: isDarkMode ? colors.gray800 : colors.white,
                        borderColor: isDarkMode ? colors.gray700 : colors.gray200
                    }}
                >
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr style={{ backgroundColor: isDarkMode ? colors.gray700 : colors.gray50 }}>
                                        <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: isDarkMode ? colors.gray300 : colors.gray700 }}>
                                            Día
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: isDarkMode ? colors.gray300 : colors.gray700 }}>
                                            Disponible
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: isDarkMode ? colors.gray300 : colors.gray700 }}>
                                            Hora Inicio
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: isDarkMode ? colors.gray300 : colors.gray700 }}>
                                            Hora Fin
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: isDarkMode ? colors.gray300 : colors.gray700 }}>
                                            Descanso Inicio
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: isDarkMode ? colors.gray300 : colors.gray700 }}>
                                            Descanso Fin
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {weeklySchedule.map((daySchedule, index) => (
                                        <tr 
                                            key={daySchedule.dayOfWeek}
                                            className={index % 2 === 0 ? '' : (isDarkMode ? 'bg-gray-750' : 'bg-gray-25')}
                                            style={{ 
                                                backgroundColor: index % 2 !== 0 ? (isDarkMode ? colors.gray750 : colors.gray25) : 'transparent'
                                            }}
                                        >
                                            <td className="px-4 py-3 font-medium" style={{ color: isDarkMode ? colors.white : colors.gray900 }}>
                                                {scheduleService.getDayName(daySchedule.dayOfWeek)}
                                            </td>
                                            <td className="px-4 py-3">
                                                {mode === 'create' ? (
                                                    <input
                                                        type="checkbox"
                                                        checked={daySchedule.isAvailable}
                                                        onChange={(e) => handleScheduleChange(daySchedule.dayOfWeek, 'isAvailable', e.target.checked)}
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                    />
                                                ) : (
                                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                                        daySchedule.isAvailable 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {daySchedule.isAvailable ? 'Sí' : 'No'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {mode === 'create' && daySchedule.isAvailable ? (
                                                    <TimeInput
                                                        value={daySchedule.startTime}
                                                        onChange={(value) => handleScheduleChange(daySchedule.dayOfWeek, 'startTime', value)}
                                                    />
                                                ) : (
                                                    <span style={{ color: isDarkMode ? colors.gray300 : colors.gray600 }}>
                                                        {daySchedule.isAvailable ? scheduleService.formatTime(daySchedule.startTime) : '-'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {mode === 'create' && daySchedule.isAvailable ? (
                                                    <TimeInput
                                                        value={daySchedule.endTime}
                                                        onChange={(value) => handleScheduleChange(daySchedule.dayOfWeek, 'endTime', value)}
                                                    />
                                                ) : (
                                                    <span style={{ color: isDarkMode ? colors.gray300 : colors.gray600 }}>
                                                        {daySchedule.isAvailable ? scheduleService.formatTime(daySchedule.endTime) : '-'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {mode === 'create' && daySchedule.isAvailable ? (
                                                    <TimeInput
                                                        value={daySchedule.breakStart}
                                                        onChange={(value) => handleScheduleChange(daySchedule.dayOfWeek, 'breakStart', value)}
                                                    />
                                                ) : (
                                                    <span style={{ color: isDarkMode ? colors.gray300 : colors.gray600 }}>
                                                        {daySchedule.isAvailable && daySchedule.breakStart ? scheduleService.formatTime(daySchedule.breakStart) : '-'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {mode === 'create' && daySchedule.isAvailable ? (
                                                    <TimeInput
                                                        value={daySchedule.breakEnd}
                                                        onChange={(value) => handleScheduleChange(daySchedule.dayOfWeek, 'breakEnd', value)}
                                                    />
                                                ) : (
                                                    <span style={{ color: isDarkMode ? colors.gray300 : colors.gray600 }}>
                                                        {daySchedule.isAvailable && daySchedule.breakEnd ? scheduleService.formatTime(daySchedule.breakEnd) : '-'}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {!selectedDoctor && (
                <div 
                    className="text-center py-12 rounded-lg border"
                    style={{ 
                        backgroundColor: isDarkMode ? colors.gray800 : colors.white,
                        borderColor: isDarkMode ? colors.gray700 : colors.gray200
                    }}
                >
                    <p style={{ color: isDarkMode ? colors.gray400 : colors.gray500 }}>
                        Seleccione un médico para ver o editar sus horarios
                    </p>
                </div>
            )}
        </div>
    );
};

export default WeeklyScheduleView;