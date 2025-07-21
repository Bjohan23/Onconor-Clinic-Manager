import React, { useState, useEffect } from 'react';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { scheduleService } from '../services/scheduleService';
import { Button } from '../../shared/components/ui/Button';
import { Input } from '../../shared/components/ui/Input';

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
            console.error('Error completo:', error);
            console.error('Respuesta del servidor:', error.response?.data);
            
            // Intentar obtener el mensaje de error del backend en diferentes formatos
            let errorMessage = 'Error al guardar el horario';
            
            if (error.response?.data) {
                const data = error.response.data;
                
                // Formato 1: { message: "..." }
                if (data.message) {
                    errorMessage = data.message;
                }
                // Formato 2: { error: "..." }
                else if (data.error) {
                    errorMessage = data.error;
                }
                // Formato 3: { data: { message: "..." } }
                else if (data.data?.message) {
                    errorMessage = data.data.message;
                }
                // Formato 4: string directo
                else if (typeof data === 'string') {
                    errorMessage = data;
                }
            }
            
            setErrors({
                submit: errorMessage
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
        <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
                <div className="text-4xl mb-4">
                    {schedule ? '✏️' : '📅'}
                </div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: colors.text.primary }}>
                    {schedule ? 'Editar Horario' : 'Crear Nuevo Horario'}
                </h1>
                <p className="text-lg" style={{ color: colors.text.secondary }}>
                    {schedule ? 'Modifica la información del horario médico' : 'Configura un nuevo horario de disponibilidad médica'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error general */}
                {errors.submit && (
                    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 rounded-r-lg">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3 flex-1">
                                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                                    ⚠️ Error al guardar el horario
                                </h3>
                                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                                    {errors.submit}
                                </div>
                            </div>
                            <div className="ml-auto pl-3">
                                <button
                                    type="button"
                                    className="inline-flex text-red-400 hover:text-red-600 transition-colors"
                                    onClick={() => setErrors(prev => ({ ...prev, submit: '' }))}
                                >
                                    <span className="sr-only">Cerrar</span>
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Médico */}
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-semibold mb-3" style={{ color: colors.text.primary }}>
                                👨‍⚕️ Seleccionar Médico *
                            </label>
                            <select
                                value={formData.doctorId}
                                onChange={(e) => handleChange('doctorId', e.target.value)}
                                className={`input-modern w-full ${
                                    errors.doctorId ? 'border-red-400 focus:border-red-500' : ''
                                }`}
                                disabled={loading}
                            >
                                <option value="">-- Seleccionar un médico --</option>
                                {doctors.map(doctor => (
                                    <option key={doctor.id} value={doctor.id}>
                                        Dr. {doctor.firstName} {doctor.lastName} {doctor.Specialty?.name ? `- ${doctor.Specialty.name}` : ''}
                                    </option>
                                ))}
                            </select>
                            {errors.doctorId && <p className="mt-2 text-sm text-red-500 flex items-center"><span className="mr-1">⚠️</span>{errors.doctorId}</p>}
                        </div>

                        {/* Día de la semana */}
                        <div>
                            <label className="block text-sm font-semibold mb-3" style={{ color: colors.text.primary }}>
                                📅 Día de la Semana *
                            </label>
                            <select
                                value={formData.dayOfWeek}
                                onChange={(e) => handleChange('dayOfWeek', parseInt(e.target.value))}
                                className="input-modern w-full"
                                disabled={loading}
                            >
                                <option value={1}>🔵 Lunes</option>
                                <option value={2}>🔴 Martes</option>
                                <option value={3}>🟢 Miércoles</option>
                                <option value={4}>🟡 Jueves</option>
                                <option value={5}>🟣 Viernes</option>
                                <option value={6}>🟠 Sábado</option>
                                <option value={0}>⚪ Domingo</option>
                            </select>
                        </div>

                        {/* Hora de inicio */}
                        <div>
                            <label className="block text-sm font-semibold mb-3" style={{ color: colors.text.primary }}>
                                🕐 Hora de Inicio *
                            </label>
                            <Input
                                type="time"
                                value={formData.startTime}
                                onChange={(e) => handleChange('startTime', e.target.value)}
                                className={errors.startTime ? 'border-red-400 focus:border-red-500' : ''}
                                disabled={loading}
                                placeholder="09:00"
                            />
                            {errors.startTime && <p className="mt-2 text-sm text-red-500 flex items-center"><span className="mr-1">⚠️</span>{errors.startTime}</p>}
                        </div>

                        {/* Hora de fin */}
                        <div>
                            <label className="block text-sm font-semibold mb-3" style={{ color: colors.text.primary }}>
                                🕕 Hora de Fin *
                            </label>
                            <Input
                                type="time"
                                value={formData.endTime}
                                onChange={(e) => handleChange('endTime', e.target.value)}
                                className={errors.endTime ? 'border-red-400 focus:border-red-500' : ''}
                                disabled={loading}
                                placeholder="17:00"
                            />
                            {errors.endTime && <p className="mt-2 text-sm text-red-500 flex items-center"><span className="mr-1">⚠️</span>{errors.endTime}</p>}
                        </div>

                        {/* Inicio de descanso */}
                        <div>
                            <label className="block text-sm font-semibold mb-3" style={{ color: colors.text.primary }}>
                                ☕ Inicio de Descanso (Opcional)
                            </label>
                            <Input
                                type="time"
                                value={formData.breakStart}
                                onChange={(e) => handleChange('breakStart', e.target.value)}
                                className={errors.breakStart ? 'border-red-400 focus:border-red-500' : ''}
                                disabled={loading}
                                placeholder="12:00"
                            />
                            {errors.breakStart && <p className="mt-2 text-sm text-red-500 flex items-center"><span className="mr-1">⚠️</span>{errors.breakStart}</p>}
                        </div>

                        {/* Fin de descanso */}
                        <div>
                            <label className="block text-sm font-semibold mb-3" style={{ color: colors.text.primary }}>
                                ⏰ Fin de Descanso (Opcional)
                            </label>
                            <Input
                                type="time"
                                value={formData.breakEnd}
                                onChange={(e) => handleChange('breakEnd', e.target.value)}
                                className={errors.breakEnd ? 'border-red-400 focus:border-red-500' : ''}
                                disabled={loading}
                                placeholder="13:00"
                            />
                            {errors.breakEnd && <p className="mt-2 text-sm text-red-500 flex items-center"><span className="mr-1">⚠️</span>{errors.breakEnd}</p>}
                        </div>
                    </div>

                    {/* Disponibilidad */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isAvailable"
                                    checked={formData.isAvailable}
                                    onChange={(e) => handleChange('isAvailable', e.target.checked)}
                                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                    disabled={loading}
                                />
                                <label 
                                    htmlFor="isAvailable" 
                                    className="ml-3 text-base font-semibold cursor-pointer"
                                    style={{ color: colors.text.primary }}
                                >
                                    ✅ Médico disponible para citas en este horario
                                </label>
                            </div>
                        </div>
                        <p className="mt-2 text-sm" style={{ color: colors.text.secondary }}>
                            Si desmarcas esta opción, el horario se creará pero el médico no estará disponible para nuevas citas.
                        </p>
                    </div>

                    {/* Botones */}
                    <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 pt-8 border-t border-gray-200 dark:border-gray-600">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onCancel}
                            disabled={loading}
                            className="w-full sm:w-auto"
                        >
                            ← Cancelar
                        </Button>
                        
                        <div className="flex items-center gap-4">
                            <div className="text-xs" style={{ color: colors.text.secondary }}>
                                Los campos marcados con * son obligatorios
                            </div>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={loading}
                                className="w-full sm:w-auto min-w-32"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                        Guardando...
                                    </span>
                                ) : (
                                    <span>✅ {schedule ? 'Actualizar Horario' : 'Crear Horario'}</span>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ScheduleForm;