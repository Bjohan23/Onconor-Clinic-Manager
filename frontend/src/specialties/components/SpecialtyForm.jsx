import React, { useState, useEffect } from 'react';
import { specialtyService } from '../services/specialtyService';

const SpecialtyForm = ({ specialty, onSave, onClose, loading }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isActive: true
    });
    const [errors, setErrors] = useState({});
    const [nameChecking, setNameChecking] = useState(false);
    const [nameAvailable, setNameAvailable] = useState(null);

    useEffect(() => {
        if (specialty) {
            setFormData({
                name: specialty.name || '',
                description: specialty.description || '',
                isActive: specialty.isActive !== false
            });
        }
    }, [specialty]);

    // Validar formulario
    const validateForm = () => {
        const newErrors = {};

        if (!formData.name || formData.name.trim().length < 2) {
            newErrors.name = 'El nombre de la especialidad debe tener al menos 2 caracteres';
        } else if (formData.name.trim().length > 100) {
            newErrors.name = 'El nombre no puede exceder 100 caracteres';
        }

        if (formData.description && formData.description.length > 500) {
            newErrors.description = 'La descripción no puede exceder 500 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Verificar disponibilidad del nombre
    const checkNameAvailability = async (name) => {
        if (!name || name.length < 2) {
            setNameAvailable(null);
            return;
        }

        try {
            setNameChecking(true);
            const response = await specialtyService.checkNameAvailability(
                name.trim(),
                specialty?.id
            );
            setNameAvailable(response.data?.available);
        } catch (error) {
            console.error('Error checking name availability:', error);
            setNameAvailable(null);
        } finally {
            setNameChecking(false);
        }
    };

    // Manejar cambios en el formulario
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        
        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));

        // Limpiar error del campo
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // Verificar disponibilidad del nombre si cambia
        if (name === 'name') {
            const trimmedValue = value.trim();
            if (trimmedValue !== (specialty?.name || '')) {
                checkNameAvailability(trimmedValue);
            } else {
                setNameAvailable(null);
            }
        }
    };

    // Manejar envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        // Verificar disponibilidad final del nombre
        if (nameAvailable === false) {
            setErrors({ name: 'Este nombre ya está en uso' });
            return;
        }

        try {
            const dataToSubmit = {
                ...formData,
                name: formData.name.trim(),
                description: formData.description.trim() || null
            };

            if (specialty) {
                await onSave(specialty.id, dataToSubmit);
            } else {
                await onSave(dataToSubmit);
            }
        } catch (error) {
            console.error('Error saving specialty:', error);
            setErrors({ submit: error.message || 'Error al guardar la especialidad' });
        }
    };

    const getNameValidationIcon = () => {
        if (nameChecking) {
            return (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
            );
        }

        if (nameAvailable === true) {
            return (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                </div>
            );
        }

        if (nameAvailable === false) {
            return (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="w-full max-w-4xl max-h-[90vh] overflow-auto p-8">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center neon-purple animate-pulse-glow">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m0 0h4M9 7h6m-6 4h6m-2 4h.01" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent neon-text">
                            {specialty ? 'Editar Especialidad' : 'Nueva Especialidad'}
                        </h3>
                        <p className="text-sm opacity-70 mt-1">
                            {specialty ? 'Modifica los datos de la especialidad médica' : 'Agrega una nueva especialidad médica'}
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

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Nombre de la especialidad */}
                <div>
                    <label className="block text-sm font-medium text-white/90 mb-3 uppercase tracking-wider">
                        Nombre de la Especialidad *
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Ej: Cardiología, Neurología, Pediatría..."
                            className={`input-modern w-full text-white placeholder-white/50 pr-12 ${
                                errors.name || nameAvailable === false
                                    ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                                    : nameAvailable === true
                                        ? 'border-green-400 focus:border-green-400 focus:ring-green-400'
                                        : 'focus:border-purple-400 focus:ring-purple-400'
                            }`}
                            style={{
                                background: 'rgba(255, 255, 255, 0.15)',
                                color: '#ffffff'
                            }}
                            maxLength="100"
                            required
                        />
                        {getNameValidationIcon()}
                    </div>
                    {errors.name && (
                        <p className="mt-2 text-sm text-red-400 font-medium">{String(errors.name)}</p>
                    )}
                    {nameAvailable === false && !errors.name && (
                        <p className="mt-2 text-sm text-red-400 font-medium">Este nombre ya está en uso</p>
                    )}
                    {nameAvailable === true && (
                        <p className="mt-2 text-sm text-green-400 font-medium">Nombre disponible</p>
                    )}
                    <p className="mt-2 text-xs text-white/50">
                        {formData.name.length}/100 caracteres
                    </p>
                </div>

                {/* Descripción */}
                <div>
                    <label className="block text-sm font-medium text-white/90 mb-3 uppercase tracking-wider">
                        Descripción
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Describe el área médica, procedimientos o enfoques de esta especialidad..."
                        className={`input-modern w-full text-white placeholder-white/50 resize-none ${
                            errors.description
                                ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                                : 'focus:border-purple-400 focus:ring-purple-400'
                        }`}
                        style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            color: '#ffffff'
                        }}
                        maxLength="500"
                    />
                    {errors.description && (
                        <p className="mt-2 text-sm text-red-400 font-medium">{String(errors.description)}</p>
                    )}
                    <p className="mt-2 text-xs text-white/50">
                        {formData.description.length}/500 caracteres
                    </p>
                </div>

                {/* Estado */}
                <div>
                    <label className="block text-sm font-medium text-white/90 mb-3 uppercase tracking-wider">
                        Estado de la Especialidad
                    </label>
                    <div className="flex items-center space-x-3">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                className="sr-only"
                            />
                            <div className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                                formData.isActive ? 'bg-gradient-success' : 'bg-gray-600'
                            }`}>
                                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                                    formData.isActive ? 'transform translate-x-6' : ''
                                }`}></div>
                            </div>
                            <span className={`ml-3 font-medium ${
                                formData.isActive ? 'text-green-400' : 'text-gray-400'
                            }`}>
                                {formData.isActive ? 'Especialidad Activa' : 'Especialidad Inactiva'}
                            </span>
                        </label>
                    </div>
                    <p className="mt-2 text-xs text-white/60">
                        Las especialidades activas aparecerán disponibles para asignar a médicos
                    </p>
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
                                <p className="text-sm font-medium text-red-300">{String(errors.submit)}</p>
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
                        disabled={loading || nameAvailable === false || nameChecking}
                        className="btn-modern px-8 py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {loading ? (
                            <>
                                <div className="spinner-modern w-5 h-5 inline-block mr-3"></div>
                                Guardando...
                            </>
                        ) : (
                            specialty ? 'Actualizar Especialidad' : 'Crear Especialidad'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SpecialtyForm;