import React, { useState, useEffect } from 'react';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { specialtyService } from '../services/specialtyService';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';
import SpecialtyList from '../components/SpecialtyList';
import SpecialtyForm from '../components/SpecialtyForm';
import SpecialtyDetail from '../components/SpecialtyDetail';

// Medical specialty icons mapping
const getSpecialtyIcon = (name) => {
    const iconMap = {
        'Cardiología': '💓',
        'Neurología': '🧠',
        'Pediatría': '👶',
        'Dermatología': '🧴',
        'Traumatología': '🦴',
        'Ginecología': '👩‍⚕️',
        'Oftalmología': '👁️',
        'Psiquiatría': '🧘‍♂️',
        'Endocrinología': '🔬',
        'Gastroenterología': '🫁',
        'default': '⚕️'
    };
    return iconMap[name] || iconMap.default;
};

const SpecialtiesPage = () => {
    const { colors, isDarkMode } = useTheme();
    const [specialties, setSpecialties] = useState([]);
    const [selectedSpecialty, setSelectedSpecialty] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        isActive: true
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
    const [stats, setStats] = useState(null);

    useEffect(() => {
        loadSpecialties();
        loadStats();
    }, [filters, pagination.page]);

    const loadSpecialties = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const result = await specialtyService.getSpecialtiesWithPagination(
                pagination.page,
                pagination.limit,
                filters
            );
            
            // Validación robusta de los datos recibidos
            const specialtiesData = result?.data?.specialties || result?.specialties || [];
            
            // Asegurar que tenemos un array válido
            if (Array.isArray(specialtiesData)) {
                setSpecialties(specialtiesData);
            } else {
                console.warn('Specialties data is not an array:', specialtiesData);
                setSpecialties([]);
            }
            
            setPagination(prev => ({
                ...prev,
                total: result?.data?.pagination?.total || result?.pagination?.total || 0,
                totalPages: result?.data?.pagination?.totalPages || result?.pagination?.totalPages || 0
            }));
        } catch (err) {
            console.error('Error loading specialties:', err);
            setError(err.message || 'Error al cargar las especialidades');
            setSpecialties([]); // Asegurar que siempre sea un array
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const statsData = await specialtyService.getSpecialtyStats();
            setStats(statsData?.data?.stats || statsData?.stats || null);
        } catch (err) {
            console.error('Error loading stats:', err);
            // No mostrar error para stats, no es crítico
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleSearch = (searchTerm) => {
        setFilters(prev => ({ ...prev, search: searchTerm }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const handleCreateSpecialty = async (specialtyData) => {
        try {
            setLoading(true);
            await specialtyService.createSpecialty(specialtyData);
            setShowForm(false);
            await loadSpecialties();
            await loadStats();
        } catch (err) {
            console.error('Error creating specialty:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSpecialty = async (id, updateData) => {
        try {
            setLoading(true);
            await specialtyService.updateSpecialty(id, updateData);
            await loadSpecialties();
            await loadStats();
            
            if (selectedSpecialty && selectedSpecialty.id === id) {
                const updatedSpecialty = await specialtyService.getSpecialtyById(id);
                setSelectedSpecialty(updatedSpecialty?.data?.specialty || null);
            }
        } catch (err) {
            console.error('Error updating specialty:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleActivateSpecialty = async (id) => {
        try {
            setLoading(true);
            await specialtyService.activateSpecialty(id);
            await loadSpecialties();
            await loadStats();
        } catch (err) {
            console.error('Error activating specialty:', err);
            setError(err.message || 'Error al activar la especialidad');
        } finally {
            setLoading(false);
        }
    };

    const handleDeactivateSpecialty = async (id) => {
        try {
            setLoading(true);
            await specialtyService.deactivateSpecialty(id);
            await loadSpecialties();
            await loadStats();
        } catch (err) {
            console.error('Error deactivating specialty:', err);
            setError(err.message || 'Error al desactivar la especialidad');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSpecialty = async (specialty) => {
        try {
            setLoading(true);
            const fullSpecialty = await specialtyService.getSpecialtyWithDoctors(specialty.id);
            setSelectedSpecialty(fullSpecialty?.data?.specialty || specialty);
            setShowDetail(true);
        } catch (err) {
            console.error('Error loading specialty detail:', err);
            // Si falla la carga completa, usar los datos básicos
            setSelectedSpecialty(specialty);
            setShowDetail(true);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setSelectedSpecialty(null);
    };

    const handleCloseDetail = () => {
        setShowDetail(false);
        setSelectedSpecialty(null);
    };

    // Función para normalizar los datos de especialidades
    const normalizeSpecialtyData = (specialtyArray) => {
        if (!Array.isArray(specialtyArray)) {
            return [];
        }
        
        return specialtyArray.map(s => ({
            id: s?.id || s?._id || null,
            name: s?.name || '',
            description: s?.description || '',
            isActive: s?.isActive !== false, // Convierte a boolean, defaultea a true
            doctorCount: s?.doctorCount || s?.doctor_count || 0,
            createdAt: s?.createdAt || s?.created_at || new Date().toISOString(),
            updatedAt: s?.updatedAt || s?.updated_at || new Date().toISOString(),
            flg_deleted: s?.flg_deleted || false,
            deleted_at: s?.deleted_at || null,
            user_created: s?.user_created || null,
            user_updated: s?.user_updated || null,
            user_deleted: s?.user_deleted || null
        }));
    };

    return (
        <div className="space-y-6 sm:space-y-8 lg:space-y-10">
            {/* Modern Medical Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold flex items-center gap-3" 
                        style={{ color: colors.text.primary }}>
                        <span className="text-2xl sm:text-3xl lg:text-4xl">⚕️</span>
                        Especialidades Médicas
                    </h1>
                    <p className="mt-2 text-sm sm:text-base" style={{ color: colors.text.secondary }}>
                        Gestión completa de especialidades y áreas médicas
                    </p>
                </div>
                
                {/* Quick Action Buttons */}
                <div className="flex flex-wrap gap-2 sm:gap-3">
                    <button 
                        onClick={() => setShowForm(true)}
                        className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base font-medium rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
                        style={{ 
                            backgroundColor: colors.primary[500], 
                            color: colors.text.inverse,
                        }}>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Nueva Especialidad
                    </button>
                    
                    <button 
                        onClick={() => handleFilterChange({ isActive: true })}
                        className={`inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base font-medium rounded-lg transition-all duration-200 hover:scale-105 ${
                            filters.isActive === true 
                                ? 'shadow-lg' 
                                : 'hover:shadow-lg border'
                        }`}
                        style={{ 
                            backgroundColor: filters.isActive === true ? colors.success[500] : 'transparent',
                            color: filters.isActive === true ? colors.text.inverse : colors.success[600],
                            borderColor: filters.isActive !== true ? colors.success[500] : 'transparent'
                        }}>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Solo Activas
                    </button>
                </div>
            </div>

            {/* Modern Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 gap-4 sm:gap-6 lg:gap-8">
                    {/* Total Specialties Card */}
                    <div className="group relative p-4 sm:p-6 rounded-lg sm:rounded-xl border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer"
                         style={{ 
                             backgroundColor: colors.background.primary,
                             borderColor: colors.border.light,
                             boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                         }}>
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="flex items-center mb-3">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                                         style={{ backgroundColor: colors.primary[100] }}>
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300" 
                                             style={{ color: colors.primary[600] }} 
                                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m0 0h4M9 7h6m-6 4h6m-2 4h.01" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-xs sm:text-sm font-medium mb-1" style={{ color: colors.text.secondary }}>
                                    Total Especialidades
                                </p>
                                <p className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ color: colors.text.primary }}>
                                    {stats.total || 0}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full"
                                      style={{ 
                                          backgroundColor: colors.primary[100], 
                                          color: colors.primary[800] 
                                      }}>
                                    Registradas
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Active Specialties Card */}
                    <div className="group relative p-4 sm:p-6 rounded-lg sm:rounded-xl border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer"
                         style={{ 
                             backgroundColor: colors.background.primary,
                             borderColor: colors.border.light,
                             boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                         }}>
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="flex items-center mb-3">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                                         style={{ backgroundColor: colors.success[100] }}>
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300" 
                                             style={{ color: colors.success[600] }} 
                                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-xs sm:text-sm font-medium mb-1" style={{ color: colors.text.secondary }}>
                                    Especialidades Activas
                                </p>
                                <p className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ color: colors.text.primary }}>
                                    {stats.active || 0}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full"
                                      style={{ 
                                          backgroundColor: colors.success[100], 
                                          color: colors.success[800] 
                                      }}>
                                    Disponibles
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Inactive Specialties Card */}
                    <div className="group relative p-4 sm:p-6 rounded-lg sm:rounded-xl border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer"
                         style={{ 
                             backgroundColor: colors.background.primary,
                             borderColor: colors.border.light,
                             boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                         }}>
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="flex items-center mb-3">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                                         style={{ backgroundColor: colors.warning[100] }}>
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300" 
                                             style={{ color: colors.warning[600] }} 
                                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-xs sm:text-sm font-medium mb-1" style={{ color: colors.text.secondary }}>
                                    Inactivas
                                </p>
                                <p className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ color: colors.text.primary }}>
                                    {stats.inactive || 0}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full"
                                      style={{ 
                                          backgroundColor: colors.warning[100], 
                                          color: colors.warning[800] 
                                      }}>
                                    Suspendidas
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* With Doctors Card */}
                    <div className="group relative p-4 sm:p-6 rounded-lg sm:rounded-xl border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer"
                         style={{ 
                             backgroundColor: colors.background.primary,
                             borderColor: colors.border.light,
                             boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                         }}>
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="flex items-center mb-3">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                                         style={{ backgroundColor: colors.info[100] }}>
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300" 
                                             style={{ color: colors.info[600] }} 
                                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-xs sm:text-sm font-medium mb-1" style={{ color: colors.text.secondary }}>
                                    Con Médicos
                                </p>
                                <p className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ color: colors.text.primary }}>
                                    {Array.isArray(stats.withDoctors) ? stats.withDoctors.filter(s => s.doctorCount > 0).length : 0}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full"
                                      style={{ 
                                          backgroundColor: colors.info[100], 
                                          color: colors.info[800] 
                                      }}>
                                    Operativas
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Notification */}
            {error && (
                <div className="mb-6">
                    <div className="inline-flex items-center px-4 py-3 rounded-lg border"
                         style={{ 
                             backgroundColor: colors.error[50], 
                             color: colors.error[700],
                             borderColor: colors.error[200]
                         }}>
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">
                            {typeof error === 'string' ? error : (error?.message || 'Error desconocido')}
                        </span>
                        <button
                            onClick={() => setError(null)}
                            className="ml-4 transition-colors hover:opacity-70"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-6">
                <div className="relative flex-1 max-w-md">
                    <input
                        type="text"
                        placeholder="Buscar especialidades..."
                        value={filters.search || ''}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full px-4 py-3 pl-12 text-base rounded-xl border-2 focus:outline-none focus:ring-2 transition-all duration-200"
                        style={{
                            backgroundColor: colors.background.primary,
                            borderColor: colors.border.light,
                            color: colors.text.primary,
                            focusRingColor: colors.primary[500]
                        }}
                    />
                    <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" 
                         style={{ color: colors.text.tertiary }}
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                        {specialties.length} de {pagination.total} especialidades
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center py-16">
                    <LoadingSpinner size="lg" context="patient" />
                </div>
            )}

            {/* Specialties Cards Grid */}
            {!loading && Array.isArray(specialties) && specialties.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4 sm:gap-6">
                    {normalizeSpecialtyData(specialties).map((specialty, index) => {
                        const doctorCountFromStats = stats?.withDoctors?.find(s => s.id === specialty.id)?.doctorCount || 0;
                        
                        return (
                            <div key={specialty.id || index}
                                 className="group relative p-4 rounded-xl border transition-all duration-300 hover:shadow-lg hover:scale-[1.01] cursor-pointer"
                                 style={{ 
                                     backgroundColor: colors.background.primary,
                                     borderColor: colors.border.light,
                                     boxShadow: isDarkMode ? '0 2px 4px rgba(0, 0, 0, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
                                 }}
                                 onClick={() => handleSelectSpecialty(specialty)}>
                                
                                {/* Header with Icon and Name */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center flex-1">
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl mr-3"
                                             style={{ 
                                                 backgroundColor: specialty.isActive 
                                                     ? (isDarkMode ? colors.primary[200] : colors.primary[100])
                                                     : (isDarkMode ? colors.gray[200] : colors.gray[100])
                                             }}>
                                            {getSpecialtyIcon(specialty.name)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-semibold truncate" style={{ color: colors.text.primary }}>
                                                {specialty.name || 'Sin nombre'}
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Status Badge */}
                                <div className="mb-3">
                                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full"
                                          style={{
                                              backgroundColor: specialty.isActive 
                                                  ? (isDarkMode ? colors.success[200] : colors.success[100])
                                                  : (isDarkMode ? colors.warning[200] : colors.warning[100]),
                                              color: specialty.isActive 
                                                  ? (isDarkMode ? colors.success[900] : colors.success[700])
                                                  : (isDarkMode ? colors.warning[900] : colors.warning[700])
                                          }}>
                                        {specialty.isActive ? '● Activa' : '● Inactiva'}
                                    </span>
                                </div>
                                
                                {/* Description */}
                                <p className="text-sm mb-3 line-clamp-2" style={{ color: colors.text.secondary }}>
                                    {specialty.description || 'Sin descripción disponible'}
                                </p>
                                
                                {/* Doctor Count */}
                                <div className="flex items-center justify-between mb-3 text-xs" 
                                     style={{ color: colors.text.tertiary }}>
                                    <span className="flex items-center">
                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        {doctorCountFromStats} médicos
                                    </span>
                                    <span>#{specialty.id}</span>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex gap-2 pt-3 border-t" style={{ borderColor: colors.border.light }}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedSpecialty(specialty);
                                            setShowForm(true);
                                        }}
                                        className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 hover:scale-105"
                                        style={{
                                            backgroundColor: isDarkMode ? colors.primary[200] : colors.primary[100],
                                            color: isDarkMode ? colors.primary[900] : colors.primary[700]
                                        }}>
                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Editar
                                    </button>
                                    
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            specialty.isActive 
                                                ? handleDeactivateSpecialty(specialty.id)
                                                : handleActivateSpecialty(specialty.id);
                                        }}
                                        className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 hover:scale-105"
                                        style={{
                                            backgroundColor: specialty.isActive 
                                                ? (isDarkMode ? colors.error[200] : colors.error[100])
                                                : (isDarkMode ? colors.success[200] : colors.success[100]),
                                            color: specialty.isActive 
                                                ? (isDarkMode ? colors.error[900] : colors.error[700])
                                                : (isDarkMode ? colors.success[900] : colors.success[700])
                                        }}>
                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            {specialty.isActive ? (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                                            ) : (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            )}
                                        </svg>
                                        {specialty.isActive ? 'Desactivar' : 'Activar'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Empty State */}
            {!loading && (!Array.isArray(specialties) || specialties.length === 0) && (
                <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-lg mx-auto mb-4 flex items-center justify-center"
                         style={{ backgroundColor: colors.primary[100] }}>
                        <svg className="w-8 h-8" style={{ color: colors.primary[600] }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m0 0h4M9 7h6m-6 4h6m-2 4h.01" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: colors.text.primary }}>
                        No hay especialidades disponibles
                    </h3>
                    <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: colors.text.secondary }}>
                        {filters.search 
                            ? `No se encontraron especialidades con "${filters.search}"`
                            : 'Agrega la primera especialidad médica al sistema'}
                    </p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105"
                        style={{
                            backgroundColor: colors.primary[500],
                            color: colors.text.inverse
                        }}>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Agregar Especialidad
                    </button>
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-8 mt-8 border-t" style={{ borderColor: colors.border.light }}>
                    <div className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                        Página {pagination.page} de {pagination.totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border"
                            style={{
                                backgroundColor: colors.background.primary,
                                color: colors.text.primary,
                                borderColor: colors.border.light
                            }}>
                            ← Anterior
                        </button>
                        <span className="px-4 py-2 text-sm font-bold rounded-lg"
                              style={{
                                  backgroundColor: colors.primary[500],
                                  color: colors.text.inverse
                              }}>
                            {pagination.page}
                        </span>
                        <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                            className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border"
                            style={{
                                backgroundColor: colors.background.primary,
                                color: colors.text.primary,
                                borderColor: colors.border.light
                            }}>
                            Siguiente →
                        </button>
                    </div>
                </div>
            )}

            {/* Modern Modal Overlays */}
            {showForm && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(8px)'
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            handleCloseForm();
                        }
                    }}
                >
                    <div 
                        className="w-full max-w-4xl max-h-[90vh] overflow-auto rounded-xl border"
                        style={{
                            backgroundColor: colors.background.primary,
                            borderColor: colors.border.light,
                            boxShadow: isDarkMode ? '0 25px 50px rgba(0, 0, 0, 0.5)' : '0 25px 50px rgba(0, 0, 0, 0.15)'
                        }}
                    >
                        <SpecialtyForm
                            specialty={selectedSpecialty}
                            onSave={selectedSpecialty ? 
                                (data) => handleUpdateSpecialty(selectedSpecialty.id, data) : 
                                handleCreateSpecialty
                            }
                            onClose={handleCloseForm}
                            loading={loading}
                        />
                    </div>
                </div>
            )}

            {showDetail && selectedSpecialty && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(8px)'
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            handleCloseDetail();
                        }
                    }}
                >
                    <div 
                        className="w-full max-w-4xl max-h-[90vh] overflow-auto rounded-xl border"
                        style={{
                            backgroundColor: colors.background.primary,
                            borderColor: colors.border.light,
                            boxShadow: isDarkMode ? '0 25px 50px rgba(0, 0, 0, 0.5)' : '0 25px 50px rgba(0, 0, 0, 0.15)'
                        }}
                    >
                        <SpecialtyDetail
                            specialty={selectedSpecialty}
                            onClose={handleCloseDetail}
                            onEdit={() => {
                                setShowDetail(false);
                                setShowForm(true);
                            }}
                            onActivate={() => handleActivateSpecialty(selectedSpecialty.id)}
                            onDeactivate={() => handleDeactivateSpecialty(selectedSpecialty.id)}
                            loading={loading}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpecialtiesPage;