import React, { useState, useEffect } from 'react';
import appointmentService from '../../services/appointmentService';

const AppointmentForm = ({ appointment, onSave, onClose, loading }) => {
    const [formData, setFormData] = useState({
        patientId: '',
        doctorId: '',
        appointmentDate: '',
        appointmentTime: '',
        reason: '',
        estimatedDuration: 30,
        priority: 'normal',
        notes: ''
    });
    const [errors, setErrors] = useState({});
    const [availabilityChecking, setAvailabilityChecking] = useState(false);
    const [availabilityResult, setAvailabilityResult] = useState(null);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    // Cargar datos iniciales
    useEffect(() => {
        loadInitialData();
        if (appointment) {
            setFormData({
                patientId: appointment.patientId || '',
                doctorId: appointment.doctorId || '',
                appointmentDate: appointmentService.formatDateForInput(appointment.appointmentDate) || '',
                appointmentTime: appointmentService.formatTimeForInput(appointment.appointmentTime) || '',
                reason: appointment.reason || '',
                estimatedDuration: appointment.estimatedDuration || 30,
                priority: appointment.priority || 'normal',
                notes: appointment.notes || ''
            });
        }
    }, [appointment]);

    // Cargar pacientes y médicos
    const loadInitialData = async () => {
        try {
            setLoadingData(true);
            // Aquí cargarías los datos desde tus servicios
            // Por ahora simulo datos básicos
            setPatients([
                { id: 1, name: 'Juan Pérez', dni: '12345678' },
                { id: 2, name: 'María García', dni: '87654321' }
            ]);
            setDoctors([
                { id: 1, name: 'Dr. Carlos Rodríguez', specialty: 'Cardiología' },
                { id: 2, name: 'Dr. Ana López', specialty: 'Neurología' }
            ]);
        } catch (error) {
            console.error('Error loading initial data:', error);
        } finally {
            setLoadingData(false);
        }
    };

    // Manejar cambios en el formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Limpiar error del campo al escribir
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // Verificar disponibilidad cuando cambian fecha, hora o médico
        if (['appointmentDate', 'appointmentTime', 'doctorId'].includes(name)) {
            setAvailabilityResult(null);
        }
    };

    // Validar formulario
    const validateForm = () => {
        const newErrors = {};

        if (!formData.patientId) {
            newErrors.patientId = 'El paciente es obligatorio';
        }

        if (!formData.doctorId) {
            newErrors.doctorId = 'El médico es obligatorio';
        }

        if (!formData.appointmentDate) {
            newErrors.appointmentDate = 'La fecha es obligatoria';
        } else {
            const appointmentDate = new Date(formData.appointmentDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (appointmentDate < today) {
                newErrors.appointmentDate = 'La fecha no puede ser en el pasado';
            }
        }

        if (!formData.appointmentTime) {
            newErrors.appointmentTime = 'La hora es obligatoria';
        }

        if (!formData.reason || formData.reason.trim().length < 10) {
            newErrors.reason = 'El motivo debe tener al menos 10 caracteres';
        }

        if (formData.estimatedDuration < 15 || formData.estimatedDuration > 240) {
            newErrors.estimatedDuration = 'La duración debe estar entre 15 y 240 minutos';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Verificar disponibilidad
    const checkAvailability = async () => {
        if (!formData.doctorId || !formData.appointmentDate || !formData.appointmentTime) {
            return;
        }

        try {
            setAvailabilityChecking(true);
            const result = await appointmentService.checkAvailability(
                formData.doctorId,
                formData.appointmentDate,
                formData.appointmentTime,
                formData.estimatedDuration
            );
            setAvailabilityResult(result);
        } catch (error) {
            console.error('Error checking availability:', error);
            setAvailabilityResult({
                available: false,
                reason: 'Error al verificar disponibilidad'
            });
        } finally {
            setAvailabilityChecking(false);
        }
    };

    // Manejar envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            if (appointment) {
                // Actualizar cita existente
                await onSave(appointment.id, formData);
            } else {
                // Crear nueva cita
                await onSave(formData);
            }
        } catch (error) {
            console.error('Error saving appointment:', error);
            setErrors({ submit: error.message || 'Error al guardar la cita' });
        }
    };

    // Generar horarios disponibles (cada 30 minutos de 8:00 a 18:00)
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 8; hour < 18; hour++) {
            slots.push(`${hour.toString().padStart(2, '0')}:00`);
            slots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
        return slots;
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900">
                        {appointment ? 'Editar Cita' : 'Nueva Cita'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {loadingData ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">Cargando datos...</span>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Paciente */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Paciente *
                                </label>
                                <select
                                    name="patientId"
                                    value={formData.patientId}
                                    onChange={handleChange}
                                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
                                        errors.patientId 
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                    }`}
                                >
                                    <option value="">Seleccionar paciente</option>
                                    {patients.map((patient) => (
                                        <option key={patient.id} value={patient.id}>
                                            {patient.name} - DNI: {patient.dni}
                                        </option>
                                    ))}
                                </select>
                                {errors.patientId && (
                                    <p className="mt-1 text-sm text-red-600">{errors.patientId}</p>
                                )}
                            </div>

                            {/* Médico */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Médico *
                                </label>
                                <select
                                    name="doctorId"
                                    value={formData.doctorId}
                                    onChange={handleChange}
                                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
                                        errors.doctorId 
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                    }`}
                                >
                                    <option value="">Seleccionar médico</option>
                                    {doctors.map((doctor) => (
                                        <option key={doctor.id} value={doctor.id}>
                                            {doctor.name} - {doctor.specialty}
                                        </option>
                                    ))}
                                </select>
                                {errors.doctorId && (
                                    <p className="mt-1 text-sm text-red-600">{errors.doctorId}</p>
                                )}
                            </div>

                            {/* Fecha */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha *
                                </label>
                                <input
                                    type="date"
                                    name="appointmentDate"
                                    value={formData.appointmentDate}
                                    onChange={handleChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
                                        errors.appointmentDate 
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                    }`}
                                />
                                {errors.appointmentDate && (
                                    <p className="mt-1 text-sm text-red-600">{errors.appointmentDate}</p>
                                )}
                            </div>

                            {/* Hora */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Hora *
                                </label>
                                <select
                                    name="appointmentTime"
                                    value={formData.appointmentTime}
                                    onChange={handleChange}
                                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
                                        errors.appointmentTime 
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                    }`}
                                >
                                    <option value="">Seleccionar hora</option>
                                    {generateTimeSlots().map((time) => (
                                        <option key={time} value={time}>
                                            {time}
                                        </option>
                                    ))}
                                </select>
                                {errors.appointmentTime && (
                                    <p className="mt-1 text-sm text-red-600">{errors.appointmentTime}</p>
                                )}
                            </div>

                            {/* Duración estimada */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Duración estimada (minutos) *
                                </label>
                                <select
                                    name="estimatedDuration"
                                    value={formData.estimatedDuration}
                                    onChange={handleChange}
                                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
                                        errors.estimatedDuration 
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                    }`}
                                >
                                    <option value={15}>15 minutos</option>
                                    <option value={30}>30 minutos</option>
                                    <option value={45}>45 minutos</option>
                                    <option value={60}>1 hora</option>
                                    <option value={90}>1.5 horas</option>
                                    <option value={120}>2 horas</option>
                                </select>
                                {errors.estimatedDuration && (
                                    <p className="mt-1 text-sm text-red-600">{errors.estimatedDuration}</p>
                                )}
                            </div>

                            {/* Prioridad */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Prioridad
                                </label>
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="low">Baja</option>
                                    <option value="normal">Normal</option>
                                    <option value="high">Alta</option>
                                    <option value="urgent">Urgente</option>
                                </select>
                            </div>
                        </div>

                        {/* Verificar disponibilidad */}
                        {formData.doctorId && formData.appointmentDate && formData.appointmentTime && (
                            <div className="bg-gray-50 p-4 rounded-md">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">
                                        Verificar disponibilidad del médico
                                    </span>
                                    <button
                                        type="button"
                                        onClick={checkAvailability}
                                        disabled={availabilityChecking}
                                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {availabilityChecking ? 'Verificando...' : 'Verificar'}
                                    </button>
                                </div>
                                
                                {availabilityResult && (
                                    <div className={`mt-2 p-2 rounded text-sm ${
                                        availabilityResult.available 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        <div className="flex items-center">
                                            {availabilityResult.available ? (
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                            {availabilityResult.reason}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Motivo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Motivo de la cita *
                            </label>
                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Describe el motivo de la consulta..."
                                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
                                    errors.reason 
                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                }`}
                            />
                            {errors.reason && (
                                <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
                            )}
                        </div>

                        {/* Notas adicionales */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notas adicionales
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows={2}
                                placeholder="Notas adicionales (opcional)..."
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Error de envío */}
                        {errors.submit && (
                            <div className="bg-red-50 border-l-4 border-red-400 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700">{errors.submit}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Botones de acción */}
                        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading || (availabilityResult && !availabilityResult.available)}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Guardando...
                                    </>
                                ) : (
                                    appointment ? 'Actualizar Cita' : 'Crear Cita'
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AppointmentForm;