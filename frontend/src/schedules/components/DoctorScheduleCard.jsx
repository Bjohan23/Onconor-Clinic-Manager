import React from 'react';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { scheduleService } from '../services/scheduleService';

const DoctorScheduleCard = ({ 
    doctor, 
    schedules, 
    onEdit, 
    onDelete, 
    onToggleAvailability 
}) => {
    const { colors, isDarkMode } = useTheme();

    if (!doctor) {
        return null;
    }

    const sortedSchedules = schedules.sort((a, b) => a.dayOfWeek - b.dayOfWeek);

    return (
        <div 
            className="rounded-lg border shadow-sm overflow-hidden"
            style={{ 
                backgroundColor: isDarkMode ? colors.gray800 : colors.white,
                borderColor: isDarkMode ? colors.gray700 : colors.gray200
            }}
        >
            {/* Header */}
            <div 
                className="px-6 py-4 border-b"
                style={{ 
                    backgroundColor: isDarkMode ? colors.gray700 : colors.gray50,
                    borderColor: isDarkMode ? colors.gray600 : colors.gray200
                }}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h3 
                            className="text-lg font-semibold"
                            style={{ color: isDarkMode ? colors.white : colors.gray900 }}
                        >
                            Dr. {doctor.firstName} {doctor.lastName}
                        </h3>
                        <p 
                            className="text-sm"
                            style={{ color: isDarkMode ? colors.gray400 : colors.gray600 }}
                        >
                            {doctor.Specialty?.name || 'Sin especialidad'} • {schedules.length} horario(s)
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span 
                            className={`px-2 py-1 text-xs rounded-full ${
                                doctor.isActive 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                            }`}
                        >
                            {doctor.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Schedules List */}
            <div className="p-6">
                {sortedSchedules.length === 0 ? (
                    <p 
                        className="text-center py-4"
                        style={{ color: isDarkMode ? colors.gray400 : colors.gray500 }}
                    >
                        No hay horarios configurados
                    </p>
                ) : (
                    <div className="space-y-3">
                        {sortedSchedules.map((schedule) => (
                            <div 
                                key={schedule.id}
                                className="flex items-center justify-between p-3 rounded-lg border"
                                style={{ 
                                    backgroundColor: isDarkMode ? colors.gray700 : colors.gray50,
                                    borderColor: isDarkMode ? colors.gray600 : colors.gray200
                                }}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <span 
                                                className="font-medium"
                                                style={{ color: isDarkMode ? colors.white : colors.gray900 }}
                                            >
                                                {scheduleService.getDayName(schedule.dayOfWeek)}
                                            </span>
                                            <span 
                                                className={`px-2 py-1 text-xs rounded-full ${
                                                    schedule.isAvailable 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}
                                            >
                                                {schedule.isAvailable ? 'Disponible' : 'No disponible'}
                                            </span>
                                        </div>
                                        
                                        <div 
                                            className="text-sm"
                                            style={{ color: isDarkMode ? colors.gray300 : colors.gray600 }}
                                        >
                                            {scheduleService.formatTime(schedule.startTime)} - {scheduleService.formatTime(schedule.endTime)}
                                            {schedule.breakStart && schedule.breakEnd && (
                                                <span className="ml-2">
                                                    (Descanso: {scheduleService.formatTime(schedule.breakStart)} - {scheduleService.formatTime(schedule.breakEnd)})
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => onToggleAvailability(schedule.id, !schedule.isAvailable)}
                                        className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                            schedule.isAvailable
                                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                                        }`}
                                        title={schedule.isAvailable ? 'Marcar como no disponible' : 'Marcar como disponible'}
                                    >
                                        {schedule.isAvailable ? 'Deshabilitar' : 'Habilitar'}
                                    </button>
                                    
                                    <button
                                        onClick={() => onEdit(schedule)}
                                        className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                        title="Editar horario"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    
                                    <button
                                        onClick={() => onDelete(schedule.id)}
                                        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                        title="Eliminar horario"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div 
                className="px-6 py-3 border-t flex justify-between items-center"
                style={{ 
                    backgroundColor: isDarkMode ? colors.gray750 : colors.gray25,
                    borderColor: isDarkMode ? colors.gray600 : colors.gray200
                }}
            >
                <div 
                    className="text-sm"
                    style={{ color: isDarkMode ? colors.gray400 : colors.gray600 }}
                >
                    {doctor.email} • {doctor.phone}
                </div>
                
                <div className="flex space-x-2">
                    <button
                        onClick={() => onEdit({ doctorId: doctor.id })}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        Agregar Horario
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DoctorScheduleCard;