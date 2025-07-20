import React, { useState, useEffect } from 'react';
import appointmentService from '../../services/appointmentService';
import { patientService } from '../../patients/services/patientService';
import { doctorService } from '../../doctors/services/doctorService';

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
            
            // Cargar pacientes activos usando el servicio
            const patientsResponse = await patientService.getActivePatients();
            const patientsData = patientsResponse.data?.patients || patientsResponse.data || [];
            setPatients(patientsData.map(patient => ({
                id: patient.id,
                name: `${patient.firstName} ${patient.lastName}`,
                dni: patient.dni || patient.documentNumber || 'Sin DNI',
                email: patient.user?.email || patient.email || 'Sin email'
            })));
            
            // Cargar doctores activos usando el servicio
            const doctorsResponse = await doctorService.getActiveDoctors();
            const doctorsData = doctorsResponse.data?.doctors || doctorsResponse.data || [];
            setDoctors(doctorsData.map(doctor => ({
                id: doctor.id,
                name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
                specialty: doctor.specialty?.name || 'Sin especialidad',
                code: doctor.medicalCode || doctor.code || 'Sin código'
            })));
            
        } catch (error) {
            console.error('Error loading initial data:', error);
            // Fallback a datos mínimos si hay error
            setPatients([
                { id: null, name: 'Error al cargar pacientes', dni: 'Error' }
            ]);
            setDoctors([
                { id: null, name: 'Error al cargar doctores', specialty: 'Error' }
            ]);
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
            const response = await appointmentService.checkAvailability(
                formData.doctorId,
                formData.appointmentDate,
                formData.appointmentTime,
                formData.estimatedDuration
            );
            
            // Manejar la respuesta del backend que viene en formato { data: { availability: {...} } }
            const availability = response.data?.availability || response.availability || response;
            setAvailabilityResult(availability);
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
        <div className="w-full max-w-4xl max-h-[90vh] overflow-auto p-8">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center neon-blue animate-pulse-glow">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v16a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent neon-text">
                            {appointment ? 'Editar Cita' : 'Nueva Cita'}
                        </h3>
                        <p className="text-sm opacity-70 mt-1">
                            {appointment ? 'Modifica los datos de la cita médica' : 'Programa una nueva cita médica'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-3 rounded-2xl transition-all duration-300 hover:transform hover:scale-110 glass text-white hover:text-red-400"
                    style={{ 
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.15)'
                    }}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

                {loadingData ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="spinner-modern"></div>
                        <span className="ml-4 text-white/80 text-lg">Cargando datos...</span>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Paciente */}
                            <div>
                                <label className="block text-sm font-medium text-white/90 mb-3 uppercase tracking-wider">
                                    Paciente *
                                </label>
                                <select
                                    name="patientId"
                                    value={formData.patientId}
                                    onChange={handleChange}
                                    className={`input-modern w-full text-white placeholder-white/50 ${
                                        errors.patientId 
                                            ? 'border-red-400 focus:border-red-400 focus:ring-red-400' 
                                            : 'focus:border-blue-400 focus:ring-blue-400'
                                    }`}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.15)',
                                        color: '#ffffff'
                                    }}
                                >
                                    <option value="" style={{ background: '#1e1e3f', color: '#ffffff' }}>
                                        Seleccionar paciente
                                    </option>
                                    {patients.map((patient) => (
                                        <option 
                                            key={patient.id} 
                                            value={patient.id}
                                            style={{ background: '#1e1e3f', color: '#ffffff' }}
                                        >
                                            {patient.name} - DNI: {patient.dni}
                                        </option>
                                    ))}
                                </select>
                                {errors.patientId && (
                                    <p className="mt-2 text-sm text-red-400 font-medium">{errors.patientId}</p>
                                )}
                            </div>

                            {/* Médico */}
                            <div>
                                <label className="block text-sm font-medium text-white/90 mb-3 uppercase tracking-wider">
                                    Médico *
                                </label>
                                <select
                                    name="doctorId"
                                    value={formData.doctorId}
                                    onChange={handleChange}
                                    className={`input-modern w-full text-white placeholder-white/50 ${
                                        errors.doctorId 
                                            ? 'border-red-400 focus:border-red-400 focus:ring-red-400' 
                                            : 'focus:border-blue-400 focus:ring-blue-400'
                                    }`}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.15)',
                                        color: '#ffffff'
                                    }}
                                >
                                    <option value="" style={{ background: '#1e1e3f', color: '#ffffff' }}>
                                        Seleccionar médico
                                    </option>
                                    {doctors.map((doctor) => (
                                        <option 
                                            key={doctor.id} 
                                            value={doctor.id}
                                            style={{ background: '#1e1e3f', color: '#ffffff' }}
                                        >
                                            {doctor.name} - {doctor.specialty} ({doctor.code || 'Sin código'})
                                        </option>
                                    ))}
                                </select>
                                {errors.doctorId && (
                                    <p className="mt-2 text-sm text-red-400 font-medium">{errors.doctorId}</p>
                                )}
                            </div>

                            {/* Fecha */}
                            <div>
                                <label className="block text-sm font-medium text-white/90 mb-3 uppercase tracking-wider">
                                    Fecha *
                                </label>
                                <input
                                    type="date"
                                    name="appointmentDate"
                                    value={formData.appointmentDate}
                                    onChange={handleChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    className={`input-modern w-full text-white placeholder-white/50 ${
                                        errors.appointmentDate 
                                            ? 'border-red-400 focus:border-red-400 focus:ring-red-400' 
                                            : 'focus:border-blue-400 focus:ring-blue-400'
                                    }`}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.15)',
                                        color: '#ffffff',
                                        colorScheme: 'dark'
                                    }}
                                />
                                {errors.appointmentDate && (
                                    <p className="mt-2 text-sm text-red-400 font-medium">{errors.appointmentDate}</p>
                                )}
                            </div>

                            {/* Hora */}
                            <div>
                                <label className="block text-sm font-medium text-white/90 mb-3 uppercase tracking-wider">
                                    Hora *
                                </label>
                                <select
                                    name="appointmentTime"
                                    value={formData.appointmentTime}
                                    onChange={handleChange}
                                    className={`input-modern w-full text-white placeholder-white/50 ${
                                        errors.appointmentTime 
                                            ? 'border-red-400 focus:border-red-400 focus:ring-red-400' 
                                            : 'focus:border-blue-400 focus:ring-blue-400'
                                    }`}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.15)',
                                        color: '#ffffff'
                                    }}
                                >
                                    <option value="" style={{ background: '#1e1e3f', color: '#ffffff' }}>
                                        Seleccionar hora
                                    </option>
                                    {generateTimeSlots().map((time) => (
                                        <option 
                                            key={time} 
                                            value={time}
                                            style={{ background: '#1e1e3f', color: '#ffffff' }}
                                        >
                                            {time}
                                        </option>
                                    ))}
                                </select>
                                {errors.appointmentTime && (
                                    <p className="mt-2 text-sm text-red-400 font-medium">{errors.appointmentTime}</p>
                                )}
                            </div>

                            {/* Duración estimada */}
                            <div>
                                <label className="block text-sm font-medium text-white/90 mb-3 uppercase tracking-wider">
                                    Duración estimada (minutos) *
                                </label>
                                <select
                                    name="estimatedDuration"
                                    value={formData.estimatedDuration}
                                    onChange={handleChange}
                                    className={`input-modern w-full text-white placeholder-white/50 ${
                                        errors.estimatedDuration 
                                            ? 'border-red-400 focus:border-red-400 focus:ring-red-400' 
                                            : 'focus:border-blue-400 focus:ring-blue-400'
                                    }`}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.15)',
                                        color: '#ffffff'
                                    }}
                                >
                                    <option value={15} style={{ background: '#1e1e3f', color: '#ffffff' }}>15 minutos</option>
                                    <option value={30} style={{ background: '#1e1e3f', color: '#ffffff' }}>30 minutos</option>
                                    <option value={45} style={{ background: '#1e1e3f', color: '#ffffff' }}>45 minutos</option>
                                    <option value={60} style={{ background: '#1e1e3f', color: '#ffffff' }}>1 hora</option>
                                    <option value={90} style={{ background: '#1e1e3f', color: '#ffffff' }}>1.5 horas</option>
                                    <option value={120} style={{ background: '#1e1e3f', color: '#ffffff' }}>2 horas</option>
                                </select>
                                {errors.estimatedDuration && (
                                    <p className="mt-2 text-sm text-red-400 font-medium">{errors.estimatedDuration}</p>
                                )}
                            </div>

                            {/* Prioridad */}
                            <div>
                                <label className="block text-sm font-medium text-white/90 mb-3 uppercase tracking-wider">
                                    Prioridad
                                </label>
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    className="input-modern w-full text-white placeholder-white/50 focus:border-blue-400 focus:ring-blue-400"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.15)',
                                        color: '#ffffff'
                                    }}
                                >
                                    <option value="low" style={{ background: '#1e1e3f', color: '#ffffff' }}>Baja</option>
                                    <option value="normal" style={{ background: '#1e1e3f', color: '#ffffff' }}>Normal</option>
                                    <option value="high" style={{ background: '#1e1e3f', color: '#ffffff' }}>Alta</option>
                                    <option value="urgent" style={{ background: '#1e1e3f', color: '#ffffff' }}>Urgente</option>
                                </select>
                            </div>
                        </div>

                        {/* Verificar disponibilidad */}
                        {formData.doctorId && formData.appointmentDate && formData.appointmentTime && (
                            <div className="glass rounded-2xl p-6 border border-white/20">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-white/90 uppercase tracking-wider">
                                        Verificar disponibilidad del médico
                                    </span>
                                    <button
                                        type="button"
                                        onClick={checkAvailability}
                                        disabled={availabilityChecking}
                                        className="btn-modern text-sm px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {availabilityChecking ? 'Verificando...' : 'Verificar'}
                                    </button>
                                </div>
                                
                                {availabilityResult && (
                                    <div className={`mt-4 p-4 rounded-xl text-sm font-medium border ${
                                        availabilityResult.available 
                                            ? 'bg-green-500/20 text-green-300 border-green-400/30' 
                                            : 'bg-red-500/20 text-red-300 border-red-400/30'
                                    }`}>
                                        <div className="flex items-center">
                                            {availabilityResult.available ? (
                                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
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
                            <label className="block text-sm font-medium text-white/90 mb-3 uppercase tracking-wider">
                                Motivo de la cita *
                            </label>
                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Describe el motivo de la consulta médica..."
                                className={`input-modern w-full text-white placeholder-white/50 resize-none ${
                                    errors.reason 
                                        ? 'border-red-400 focus:border-red-400 focus:ring-red-400' 
                                        : 'focus:border-blue-400 focus:ring-blue-400'
                                }`}
                            />
                            {errors.reason && (
                                <p className="mt-2 text-sm text-red-400 font-medium">{errors.reason}</p>
                            )}
                        </div>

                        {/* Notas adicionales */}
                        <div>
                            <label className="block text-sm font-medium text-white/90 mb-3 uppercase tracking-wider">
                                Notas adicionales
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Información adicional sobre la cita (opcional)..."
                                className="input-modern w-full text-white placeholder-white/50 resize-none focus:border-blue-400 focus:ring-blue-400"
                            />
                        </div>

                        {/* Error de envío */}
                        {errors.submit && (
                            <div className="notification-modern p-6 rounded-2xl border-l-4 border-red-500">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-gradient-danger rounded-full flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <p className="text-sm font-medium text-red-300">{errors.submit}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Botones de acción */}
                        <div className="flex justify-end space-x-4 pt-8 border-t border-white/20">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-8 py-3 rounded-2xl font-medium text-white/80 hover:text-white transition-all duration-300 hover:transform hover:scale-105 glass"
                                style={{ 
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading || (availabilityResult && !availabilityResult.available)}
                                className="btn-modern px-8 py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loading ? (
                                    <>
                                        <div className="spinner-modern w-5 h-5 inline-block mr-3"></div>
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
    );
};

export default AppointmentForm;