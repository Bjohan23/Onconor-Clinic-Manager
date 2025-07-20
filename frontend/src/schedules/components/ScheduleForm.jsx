import React, { useState, useEffect } from 'react';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { scheduleService } from '../services/scheduleService';

const ScheduleForm = ({ schedule, doctors, onSave, onCancel }) => {
    const { colors, isDarkMode } = useTheme();
    const [formData, setFormData] = useState({
        doctorId: '',
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        breakStart: '',
        breakEnd: '',
        isAvailable: true
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (schedule) {
            setFormData({
                doctorId: schedule.doctorId || '',
                dayOfWeek: schedule.dayOfWeek || 1,
                startTime: scheduleService.formatTime(schedule.startTime) || '09:00',
                endTime: scheduleService.formatTime(schedule.endTime) || '17:00',
                breakStart: scheduleService.formatTime(schedule.breakStart) || '',
                breakEnd: scheduleService.formatTime(schedule.breakEnd) || '',
                isAvailable: schedule.isAvailable !== undefined ? schedule.isAvailable : true
            });
        }
    }, [schedule]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.doctorId) {
            newErrors.doctorId = 'Debe seleccionar un médico';
        }

        if (!formData.startTime) {
            newErrors.startTime = 'Hora de inicio es requerida';
        }

        if (!formData.endTime) {
            newErrors.endTime = 'Hora de fin es requerida';
        }

        if (formData.startTime && formData.endTime) {
            if (scheduleService.compareTime(formData.startTime, formData.endTime) >= 0) {
                newErrors.endTime = 'La hora de fin debe ser posterior a la hora de inicio';
            }
        }

        if (formData.breakStart && formData.breakEnd) {
            if (scheduleService.compareTime(formData.breakStart, formData.breakEnd) >= 0) {
                newErrors.breakEnd = 'La hora de fin del descanso debe ser posterior a la hora de inicio';
            }

            if (formData.startTime && formData.endTime) {
                if (scheduleService.compareTime(formData.breakStart, formData.startTime) < 0 ||
                    scheduleService.compareTime(formData.breakEnd, formData.endTime) > 0) {
                    newErrors.breakStart = 'Los horarios de descanso deben estar dentro del horario laboral';
                }
            }
        }

        if ((formData.breakStart && !formData.breakEnd) || (!formData.breakStart && formData.breakEnd)) {
            newErrors.breakStart = 'Debe especificar tanto inicio como fin del descanso';
            newErrors.breakEnd = 'Debe especificar tanto inicio como fin del descanso';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            
            const submitData = {
                ...formData,
                breakStart: formData.breakStart || null,
                breakEnd: formData.breakEnd || null
            };

            await onSave(submitData);
        } catch (error) {
            setErrors({
                submit: error.response?.data?.message || 'Error al guardar el horario'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Limpiar error del campo cuando cambie
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <div 
            className="rounded-lg border p-6"
            style={{ 
                backgroundColor: isDarkMode ? colors.gray800 : colors.white,
                borderColor: isDarkMode ? colors.gray700 : colors.gray200
            }}
        >
            <div className="flex items-center justify-between mb-6">
                <h2 
                    className="text-xl font-semibold"
                    style={{ color: isDarkMode ? colors.white : colors.gray900 }}
                >
                    {schedule ? 'Editar Horario' : 'Crear Nuevo Horario'}
                </h2>
                <button
                    onClick={onCancel}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error general */}
                {errors.submit && (
                    <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                        {errors.submit}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Médico */}
                    <div>
                        <label 
                            className="block text-sm font-medium mb-2"
                            style={{ color: isDarkMode ? colors.gray300 : colors.gray700 }}
                        >
                            Médico *
                        </label>
                        <select
                            value={formData.doctorId}
                            onChange={(e) => handleChange('doctorId', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                errors.doctorId ? 'border-red-300' : ''
                            }`}
                            style={{
                                backgroundColor: isDarkMode ? colors.gray700 : colors.white,
                                borderColor: errors.doctorId ? '#FCA5A5' : (isDarkMode ? colors.gray600 : colors.gray300),
                                color: isDarkMode ? colors.white : colors.gray900
                            }}
                            disabled={loading}
                        >
                            <option value="">Seleccionar médico</option>
                            {doctors.map(doctor => (
                                <option key={doctor.id} value={doctor.id}>
                                    Dr. {doctor.firstName} {doctor.lastName} - {doctor.Specialty?.name || 'Sin especialidad'}
                                </option>
                            ))}
                        </select>
                        {errors.doctorId && <p className="mt-1 text-sm text-red-600">{errors.doctorId}</p>}
                    </div>

                    {/* Día de la semana */}
                    <div>
                        <label 
                            className="block text-sm font-medium mb-2"
                            style={{ color: isDarkMode ? colors.gray300 : colors.gray700 }}
                        >
                            Día de la Semana *
                        </label>
                        <select
                            value={formData.dayOfWeek}
                            onChange={(e) => handleChange('dayOfWeek', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            style={{
                                backgroundColor: isDarkMode ? colors.gray700 : colors.white,
                                borderColor: isDarkMode ? colors.gray600 : colors.gray300,
                                color: isDarkMode ? colors.white : colors.gray900
                            }}
                            disabled={loading}
                        >
                            <option value={1}>Lunes</option>
                            <option value={2}>Martes</option>
                            <option value={3}>Miércoles</option>
                            <option value={4}>Jueves</option>
                            <option value={5}>Viernes</option>
                            <option value={6}>Sábado</option>
                            <option value={0}>Domingo</option>
                        </select>
                    </div>

                    {/* Hora de inicio */}
                    <div>
                        <label 
                            className="block text-sm font-medium mb-2"
                            style={{ color: isDarkMode ? colors.gray300 : colors.gray700 }}
                        >
                            Hora de Inicio *
                        </label>
                        <input
                            type="time"
                            value={formData.startTime}
                            onChange={(e) => handleChange('startTime', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                errors.startTime ? 'border-red-300' : ''
                            }`}
                            style={{
                                backgroundColor: isDarkMode ? colors.gray700 : colors.white,
                                borderColor: errors.startTime ? '#FCA5A5' : (isDarkMode ? colors.gray600 : colors.gray300),
                                color: isDarkMode ? colors.white : colors.gray900
                            }}
                            disabled={loading}
                        />
                        {errors.startTime && <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>}
                    </div>

                    {/* Hora de fin */}
                    <div>
                        <label 
                            className="block text-sm font-medium mb-2"
                            style={{ color: isDarkMode ? colors.gray300 : colors.gray700 }}
                        >
                            Hora de Fin *
                        </label>
                        <input
                            type="time"
                            value={formData.endTime}
                            onChange={(e) => handleChange('endTime', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                errors.endTime ? 'border-red-300' : ''
                            }`}
                            style={{
                                backgroundColor: isDarkMode ? colors.gray700 : colors.white,
                                borderColor: errors.endTime ? '#FCA5A5' : (isDarkMode ? colors.gray600 : colors.gray300),
                                color: isDarkMode ? colors.white : colors.gray900
                            }}
                            disabled={loading}
                        />
                        {errors.endTime && <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>}
                    </div>

                    {/* Inicio de descanso */}
                    <div>
                        <label 
                            className="block text-sm font-medium mb-2"
                            style={{ color: isDarkMode ? colors.gray300 : colors.gray700 }}
                        >
                            Inicio de Descanso
                        </label>
                        <input
                            type="time"
                            value={formData.breakStart}
                            onChange={(e) => handleChange('breakStart', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                errors.breakStart ? 'border-red-300' : ''
                            }`}
                            style={{
                                backgroundColor: isDarkMode ? colors.gray700 : colors.white,
                                borderColor: errors.breakStart ? '#FCA5A5' : (isDarkMode ? colors.gray600 : colors.gray300),
                                color: isDarkMode ? colors.white : colors.gray900
                            }}
                            disabled={loading}
                        />
                        {errors.breakStart && <p className="mt-1 text-sm text-red-600">{errors.breakStart}</p>}
                    </div>

                    {/* Fin de descanso */}
                    <div>
                        <label 
                            className="block text-sm font-medium mb-2"
                            style={{ color: isDarkMode ? colors.gray300 : colors.gray700 }}
                        >
                            Fin de Descanso
                        </label>
                        <input
                            type="time"
                            value={formData.breakEnd}
                            onChange={(e) => handleChange('breakEnd', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                errors.breakEnd ? 'border-red-300' : ''
                            }`}
                            style={{
                                backgroundColor: isDarkMode ? colors.gray700 : colors.white,
                                borderColor: errors.breakEnd ? '#FCA5A5' : (isDarkMode ? colors.gray600 : colors.gray300),
                                color: isDarkMode ? colors.white : colors.gray900
                            }}
                            disabled={loading}
                        />
                        {errors.breakEnd && <p className="mt-1 text-sm text-red-600">{errors.breakEnd}</p>}
                    </div>
                </div>

                {/* Disponibilidad */}
                <div className="flex items-center space-x-3">
                    <input
                        type="checkbox"
                        id="isAvailable"
                        checked={formData.isAvailable}
                        onChange={(e) => handleChange('isAvailable', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        disabled={loading}
                    />
                    <label 
                        htmlFor="isAvailable" 
                        className="text-sm font-medium"
                        style={{ color: isDarkMode ? colors.gray300 : colors.gray700 }}
                    >
                        Médico disponible en este horario
                    </label>
                </div>

                {/* Botones */}
                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Guardando...' : (schedule ? 'Actualizar' : 'Crear')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ScheduleForm;