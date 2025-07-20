import React, { useState } from 'react';
import { useTheme } from '../../shared/contexts/ThemeContext';

const SpecialtyList = ({
    specialties,
    loading,
    filters,
    pagination,
    onFilterChange,
    onSearch,
    onPageChange,
    onSelectSpecialty,
    onActivateSpecialty,
    onDeactivateSpecialty,
    onEditSpecialty
}) => {
    const { colors } = useTheme();
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        onSearch(searchTerm);
    };

    const handleFilterToggle = (filterKey, value) => {
        onFilterChange({ [filterKey]: value });
    };

    const getStatusBadge = (isActive) => {
        if (isActive) {
            return (
                <span className="badge-modern badge-success">
                    Activa
                </span>
            );
        } else {
            return (
                <span className="badge-modern badge-danger">
                    Inactiva
                </span>
            );
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No registrada';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="p-8">
            {/* Header with Search and Filters */}
            <div className="mb-8">
                <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                    {/* Search */}
                    <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar especialidades..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-modern w-full pl-12 text-white placeholder-white/50"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.15)',
                                    color: '#ffffff'
                                }}
                            />
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </form>

                    {/* Filters */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleFilterToggle('isActive', true)}
                            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                                filters.isActive === true
                                    ? 'bg-gradient-success text-white neon-blue'
                                    : 'glass text-white/70 hover:text-white'
                            }`}
                        >
                            Activas
                        </button>
                        <button
                            onClick={() => handleFilterToggle('isActive', false)}
                            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                                filters.isActive === false
                                    ? 'bg-gradient-danger text-white neon-purple'
                                    : 'glass text-white/70 hover:text-white'
                            }`}
                        >
                            Inactivas
                        </button>
                        <button
                            onClick={() => handleFilterToggle('isActive', undefined)}
                            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                                filters.isActive === undefined
                                    ? 'bg-gradient-primary text-white neon-blue'
                                    : 'glass text-white/70 hover:text-white'
                            }`}
                        >
                            Todas
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Info */}
            <div className="mb-6">
                <p className="text-white/70 text-sm">
                    Mostrando {specialties.length} de {pagination.total} especialidades
                    {filters.search && ` para "${filters.search}"`}
                </p>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <div className="spinner-modern"></div>
                    <span className="ml-4 text-white/80 text-lg">Cargando especialidades...</span>
                </div>
            )}

            {/* Specialties Table */}
            {!loading && (
                <div className="table-modern overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left">
                                <th className="px-6 py-4 font-semibold text-white/90 uppercase tracking-wider text-sm">
                                    Especialidad
                                </th>
                                <th className="px-6 py-4 font-semibold text-white/90 uppercase tracking-wider text-sm">
                                    Descripción
                                </th>
                                <th className="px-6 py-4 font-semibold text-white/90 uppercase tracking-wider text-sm">
                                    Médicos
                                </th>
                                <th className="px-6 py-4 font-semibold text-white/90 uppercase tracking-wider text-sm">
                                    Estado
                                </th>
                                <th className="px-6 py-4 font-semibold text-white/90 uppercase tracking-wider text-sm">
                                    Fecha Registro
                                </th>
                                <th className="px-6 py-4 font-semibold text-white/90 uppercase tracking-wider text-sm">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {specialties.map((specialty, index) => (
                                <tr 
                                    key={specialty.id} 
                                    className="border-t border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
                                    onClick={() => onSelectSpecialty(specialty)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center mr-4">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m0 0h4M9 7h6m-6 4h6m-2 4h.01" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white">
                                                    {specialty.name}
                                                </p>
                                                <p className="text-sm text-white/60">
                                                    ID: {specialty.id}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-white/80 max-w-xs truncate">
                                            {specialty.description || 'Sin descripción'}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <span className="text-2xl font-bold text-blue-400">
                                                {specialty.doctorCount || 0}
                                            </span>
                                            <span className="text-white/60 ml-2">médicos</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(specialty.isActive)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-white/70 text-sm">
                                            {formatDate(specialty.created_at)}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEditSpecialty(specialty);
                                                }}
                                                className="p-2 rounded-xl glass hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-all duration-300"
                                                title="Editar"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            
                                            {specialty.isActive ? (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDeactivateSpecialty(specialty.id);
                                                    }}
                                                    className="p-2 rounded-xl glass hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-300"
                                                    title="Desactivar"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                                                    </svg>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onActivateSpecialty(specialty.id);
                                                    }}
                                                    className="p-2 rounded-xl glass hover:bg-green-500/20 text-green-400 hover:text-green-300 transition-all duration-300"
                                                    title="Activar"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Empty State */}
                    {specialties.length === 0 && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full mx-auto mb-4 flex items-center justify-center opacity-50">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m0 0h4M9 7h6m-6 4h6m-2 4h.01" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-white/70 mb-2">
                                No se encontraron especialidades
                            </h3>
                            <p className="text-white/50">
                                {filters.search 
                                    ? `No hay especialidades que coincidan con "${filters.search}"` 
                                    : 'Agrega la primera especialidad médica'}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-between">
                    <div className="text-white/70 text-sm">
                        Página {pagination.page} de {pagination.totalPages}
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => onPageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="px-4 py-2 rounded-xl font-medium glass text-white/70 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        >
                            Anterior
                        </button>
                        
                        {/* Page Numbers */}
                        {[...Array(Math.min(5, pagination.totalPages))].map((_, index) => {
                            const pageNumber = Math.max(1, pagination.page - 2) + index;
                            if (pageNumber <= pagination.totalPages) {
                                return (
                                    <button
                                        key={pageNumber}
                                        onClick={() => onPageChange(pageNumber)}
                                        className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                                            pageNumber === pagination.page
                                                ? 'bg-gradient-primary text-white neon-blue'
                                                : 'glass text-white/70 hover:text-white'
                                        }`}
                                    >
                                        {pageNumber}
                                    </button>
                                );
                            }
                            return null;
                        })}
                        
                        <button
                            onClick={() => onPageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                            className="px-4 py-2 rounded-xl font-medium glass text-white/70 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpecialtyList;