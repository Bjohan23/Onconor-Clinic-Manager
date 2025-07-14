import React, { useState } from 'react';
import appointmentService from '../../services/appointmentService';

const AppointmentDetail = ({
    appointment,
    onClose,
    onEdit,
    onConfirm,
    onCancel,
    onComplete,
    loading
}) => {
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [completeNotes, setCompleteNotes] = useState('');

    // Formatear fecha y hora
    const formatDateTime = (date, time) => {
        const appointmentDate = new Date(date);
        const formattedDate = appointmentDate.toLocaleDateString('es-PE', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        return { date: formattedDate, time };
    };

    // Obtener color del estado
    const getStatusColor = (status) => {
        return appointmentService.getStatusColor(status);
    };

    // Obtener texto del estado
    const getStatusText = (status) => {
        return appointmentService.getStatusText(status);
    };

    // Obtener color de prioridad
    const getPriorityColor = (priority) => {
        return appointmentService.getPriorityColor(priority);
    };

    // Obtener texto de prioridad
    const getPriorityText = (priority) => {
        return appointmentService.getPriorityText(priority);
    };

    // Calcular tiempo hasta la cita
    const getTimeUntilAppointment = () => {
        return appointmentService.calculateTimeUntilAppointment(
            appointment.appointmentDate,
            appointment.appointmentTime
        );
    };

    // Manejar confirmación de cancelación
    const handleConfirmCancel = () => {
        onCancel(cancelReason);
        setShowCancelModal(false);
        setCancelReason('');
    };

    // Manejar confirmación de completar
    const handleConfirmComplete = () => {
        onComplete(completeNotes);
        setShowCompleteModal(false);
        setCompleteNotes('');
    };

    // Verificar si se puede editar la cita
    const canEdit = () => {
        return !['completed', 'cancelled'].includes(appointment.status);
    };

    // Verificar si se puede confirmar
    const canConfirm = () => {
        return appointment.status === 'scheduled';
    };

    // Verificar si se puede cancelar
    const canCancel = () => {
        return !['completed', 'cancelled'].includes(appointment.status);
    };

    // Verificar si se puede completar
    const canComplete = () => {
        return ['confirmed', 'in_progress'].includes(appointment.status);
    };

    const timeInfo = getTimeUntilAppointment();
    const { date, time } = formatDateTime(appointment.appointmentDate, appointment.appointmentTime);

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-4">
                        <h3 className="text-xl font-semibold text-gray-900">
                            Detalle de Cita
                        </h3>
                        <div 
                            className="px-3 py-1 rounded-full text-sm font-medium text-white"
                            style={{ backgroundColor: getStatusColor(appointment.status) }}
                        >
                            {getStatusText(appointment.status)}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Información principal */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Fecha y hora */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="text-lg font-medium text-blue-900 mb-2">
                                📅 Fecha y Hora
                            </h4>
                            <div className="space-y-1">
                                <p className="text-blue-800 font-medium">
                                    {date}
                                </p>
                                <p className="text-blue-700">
                                    Hora: {time} ({appointment.estimatedDuration} minutos)
                                </p>
                                {!timeInfo.isPast && (
                                    <p className="text-blue-600 text-sm">
                                        {timeInfo.text}
                                    </p>
                                )}
                                {timeInfo.isPast && (
                                    <p className="text-red-600 text-sm font-medium">
                                        Cita pasada
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Información del paciente */}
                        <div className="bg-white border border-gray-200 p-4 rounded-lg">
                            <h4 className="text-lg font-medium text-gray-900 mb-3">
                                👤 Información del Paciente
                            </h4>
                            {appointment.patient ? (
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Nombre:</span>
                                        <span className="font-medium">{appointment.patient.fullName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">DNI:</span>
                                        <span className="font-medium">{appointment.patient.dni}</span>
                                    </div>
                                    {appointment.patient.phone && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Teléfono:</span>
                                            <span className="font-medium">{appointment.patient.phone}</span>
                                        </div>
                                    )}
                                    {appointment.patient.email && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Email:</span>
                                            <span className="font-medium">{appointment.patient.email}</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-500">Información del paciente no disponible</p>
                            )}
                        </div>

                        {/* Información del médico */}
                        <div className="bg-white border border-gray-200 p-4 rounded-lg">
                            <h4 className="text-lg font-medium text-gray-900 mb-3">
                                👨‍⚕️ Información del Médico
                            </h4>
                            {appointment.doctor ? (
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Nombre:</span>
                                        <span className="font-medium">{appointment.doctor.fullName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Especialidad:</span>
                                        <span className="font-medium">{appointment.doctor.specialtyName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Licencia:</span>
                                        <span className="font-medium">{appointment.doctor.medicalLicense}</span>
                                    </div>
                                    {appointment.doctor.phone && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Teléfono:</span>
                                            <span className="font-medium">{appointment.doctor.phone}</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-500">Información del médico no disponible</p>
                            )}
                        </div>

                        {/* Motivo de la cita */}
                        <div className="bg-white border border-gray-200 p-4 rounded-lg">
                            <h4 className="text-lg font-medium text-gray-900 mb-3">
                                📝 Motivo de la Consulta
                            </h4>
                            <p className="text-gray-700 leading-relaxed">
                                {appointment.reason}
                            </p>
                        </div>

                        {/* Notas adicionales */}
                        {appointment.notes && (
                            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                                <h4 className="text-lg font-medium text-yellow-900 mb-3">
                                    💬 Notas Adicionales
                                </h4>
                                <p className="text-yellow-800">
                                    {appointment.notes}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Panel lateral */}
                    <div className="space-y-6">
                        {/* Información de la cita */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">
                                ℹ️ Información de la Cita
                            </h4>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-gray-600 text-sm block">Estado</span>
                                    <div 
                                        className="inline-block px-2 py-1 rounded text-sm font-medium text-white mt-1"
                                        style={{ backgroundColor: getStatusColor(appointment.status) }}
                                    >
                                        {getStatusText(appointment.status)}
                                    </div>
                                </div>
                                
                                <div>
                                    <span className="text-gray-600 text-sm block">Prioridad</span>
                                    <div 
                                        className="inline-block px-2 py-1 rounded text-sm font-medium text-white mt-1"
                                        style={{ backgroundColor: getPriorityColor(appointment.priority) }}
                                    >
                                        {getPriorityText(appointment.priority)}
                                    </div>
                                </div>

                                <div>
                                    <span className="text-gray-600 text-sm block">Duración</span>
                                    <span className="font-medium">{appointment.estimatedDuration} minutos</span>
                                </div>

                                <div>
                                    <span className="text-gray-600 text-sm block">Creada</span>
                                    <span className="font-medium">
                                        {new Date(appointment.createdAt).toLocaleDateString('es-PE')}
                                    </span>
                                </div>

                                {appointment.updatedAt !== appointment.createdAt && (
                                    <div>
                                        <span className="text-gray-600 text-sm block">Última actualización</span>
                                        <span className="font-medium">
                                            {new Date(appointment.updatedAt).toLocaleDateString('es-PE')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Acciones */}
                        <div className="bg-white border border-gray-200 p-4 rounded-lg">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">
                                ⚡ Acciones
                            </h4>
                            <div className="space-y-3">
                                {/* Botón Confirmar */}
                                {canConfirm() && (
                                    <button
                                        onClick={onConfirm}
                                        disabled={loading}
                                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Confirmar Cita
                                    </button>
                                )}

                                {/* Botón Completar */}
                                {canComplete() && (
                                    <button
                                        onClick={() => setShowCompleteModal(true)}
                                        disabled={loading}
                                        className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Completar Cita
                                    </button>
                                )}

                                {/* Botón Editar */}
                                {canEdit() && (
                                    <button
                                        onClick={onEdit}
                                        disabled={loading}
                                        className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Editar Cita
                                    </button>
                                )}

                                {/* Botón Cancelar */}
                                {canCancel() && (
                                    <button
                                        onClick={() => setShowCancelModal(true)}
                                        disabled={loading}
                                        className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Cancelar Cita
                                    </button>
                                )}

                                {/* Botón Cerrar */}
                                <button
                                    onClick={onClose}
                                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>

                        {/* Información de sistema */}
                        <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
                            <h5 className="font-medium text-gray-900 mb-2">📊 Información del Sistema</h5>
                            <div className="space-y-1">
                                <div>ID: #{appointment.id}</div>
                                <div>Paciente ID: {appointment.patientId}</div>
                                <div>Médico ID: {appointment.doctorId}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal de cancelación */}
                {showCancelModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-60">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <div className="flex items-center">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                        <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="mt-2 text-center">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        Cancelar Cita
                                    </h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            ¿Estás seguro de que quieres cancelar esta cita? Esta acción no se puede deshacer.
                                        </p>
                                    </div>
                                    <div className="mt-4">
                                        <textarea
                                            placeholder="Motivo de cancelación (opcional)"
                                            value={cancelReason}
                                            onChange={(e) => setCancelReason(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                                <div className="items-center px-4 py-3">
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={handleConfirmCancel}
                                            disabled={loading}
                                            className="flex-1 px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                                        >
                                            {loading ? 'Cancelando...' : 'Cancelar Cita'}
                                        </button>
                                        <button
                                            onClick={() => setShowCancelModal(false)}
                                            className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                        >
                                            Cerrar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de completar */}
                {showCompleteModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-60">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <div className="flex items-center">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                                        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="mt-2 text-center">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        Completar Cita
                                    </h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            Marca esta cita como completada. Puedes agregar notas sobre la consulta.
                                        </p>
                                    </div>
                                    <div className="mt-4">
                                        <textarea
                                            placeholder="Notas de la consulta (opcional)"
                                            value={completeNotes}
                                            onChange={(e) => setCompleteNotes(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                                <div className="items-center px-4 py-3">
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={handleConfirmComplete}
                                            disabled={loading}
                                            className="flex-1 px-4 py-2 bg-green-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                                        >
                                            {loading ? 'Completando...' : 'Completar Cita'}
                                        </button>
                                        <button
                                            onClick={() => setShowCompleteModal(false)}
                                            className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                        >
                                            Cerrar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default AppointmentDetail;