import React from 'react';

const SpecialtyDetail = ({ 
    specialty, 
    onClose, 
    onEdit, 
    onActivate, 
    onDeactivate, 
    loading 
}) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'No registrada';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (isActive) => {
        if (isActive) {
            return (
                <span className="badge-modern badge-success">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Activa
                </span>
            );
        } else {
            return (
                <span className="badge-modern badge-danger">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Inactiva
                </span>
            );
        }
    };

    return (
        <div className="w-full max-w-4xl max-h-[90vh] overflow-auto p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center neon-purple animate-pulse-glow">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m0 0h4M9 7h6m-6 4h6m-2 4h.01" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent neon-text">
                            {specialty.name}
                        </h2>
                        <div className="flex items-center gap-3 mt-2">
                            {getStatusBadge(specialty.isActive)}
                            <span className="text-white/60 text-sm">
                                ID: {specialty.id}
                            </span>
                        </div>
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

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Información General */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Información General
                    </h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-white/70 uppercase tracking-wider">
                                Nombre
                            </label>
                            <p className="text-white text-lg font-semibold mt-1">
                                {specialty.name}
                            </p>
                        </div>
                        
                        <div>
                            <label className="text-sm font-medium text-white/70 uppercase tracking-wider">
                                Descripción
                            </label>
                            <p className="text-white/80 mt-1 leading-relaxed">
                                {specialty.description || 'Sin descripción disponible'}
                            </p>
                        </div>
                        
                        <div>
                            <label className="text-sm font-medium text-white/70 uppercase tracking-wider">
                                Estado
                            </label>
                            <div className="mt-2">
                                {getStatusBadge(specialty.isActive)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Estadísticas
                    </h3>
                    
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-primary rounded-2xl mx-auto flex items-center justify-center mb-3">
                                <span className="text-2xl font-bold text-white">
                                    {specialty.doctors?.length || 0}
                                </span>
                            </div>
                            <p className="text-white/70">Médicos Asignados</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-400">
                                    {specialty.doctors?.filter(d => d.isActive).length || 0}
                                </p>
                                <p className="text-white/60 text-sm">Activos</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-red-400">
                                    {specialty.doctors?.filter(d => !d.isActive).length || 0}
                                </p>
                                <p className="text-white/60 text-sm">Inactivos</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fechas */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v16a2 2 0 002 2z" />
                        </svg>
                        Información de Auditoría
                    </h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-white/70 uppercase tracking-wider">
                                Fecha de Creación
                            </label>
                            <p className="text-white/80 mt-1">
                                {formatDate(specialty.created_at)}
                            </p>
                        </div>
                        
                        <div>
                            <label className="text-sm font-medium text-white/70 uppercase tracking-wider">
                                Última Actualización
                            </label>
                            <p className="text-white/80 mt-1">
                                {formatDate(specialty.updated_at)}
                            </p>
                        </div>
                        
                        {specialty.user_created && (
                            <div>
                                <label className="text-sm font-medium text-white/70 uppercase tracking-wider">
                                    Creado por
                                </label>
                                <p className="text-white/80 mt-1">
                                    Usuario ID: {specialty.user_created}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Médicos Asignados */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Médicos Asignados
                    </h3>
                    
                    {specialty.doctors && specialty.doctors.length > 0 ? (
                        <div className="space-y-3">
                            {specialty.doctors.map((doctor, index) => (
                                <div key={doctor.id || index} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-gradient-secondary rounded-full flex items-center justify-center mr-3">
                                            <span className="text-white font-semibold text-sm">
                                                {doctor.firstName?.[0]}{doctor.lastName?.[0]}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">
                                                Dr. {doctor.firstName} {doctor.lastName}
                                            </p>
                                            <p className="text-white/60 text-sm">
                                                {doctor.medicalCode || 'Sin código'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`badge-modern ${doctor.isActive ? 'badge-success' : 'badge-danger'}`}>
                                        {doctor.isActive ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full mx-auto mb-4 flex items-center justify-center opacity-50">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <p className="text-white/70">Sin médicos asignados</p>
                            <p className="text-white/50 text-sm mt-1">
                                Asigna médicos a esta especialidad desde la gestión de doctores
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-8 pt-8 border-t border-white/20">
                <button
                    onClick={onEdit}
                    className="px-6 py-3 rounded-2xl font-medium glass text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 transition-all duration-300 hover:transform hover:scale-105"
                >
                    <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                </button>
                
                {specialty.isActive ? (
                    <button
                        onClick={onDeactivate}
                        disabled={loading}
                        className="px-6 py-3 rounded-2xl font-medium glass text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all duration-300 hover:transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                        </svg>
                        Desactivar
                    </button>
                ) : (
                    <button
                        onClick={onActivate}
                        disabled={loading}
                        className="px-6 py-3 rounded-2xl font-medium glass text-green-400 hover:text-green-300 hover:bg-green-500/20 transition-all duration-300 hover:transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Activar
                    </button>
                )}
            </div>
        </div>
    );
};

export default SpecialtyDetail;