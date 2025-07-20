import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Pagination = ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
    showItemsPerPage = true,
    showInfo = true,
    showFirstLast = true,
    maxVisiblePages = 5,
    className = ""
}) => {
    const { colors, isDarkMode } = useTheme();

    const itemsPerPageOptions = [10, 25, 50, 100];

    // Calcular rango de páginas visibles
    const getVisiblePages = () => {
        const half = Math.floor(maxVisiblePages / 2);
        let start = Math.max(1, currentPage - half);
        let end = Math.min(totalPages, start + maxVisiblePages - 1);
        
        // Ajustar inicio si no hay suficientes páginas al final
        if (end - start + 1 < maxVisiblePages) {
            start = Math.max(1, end - maxVisiblePages + 1);
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    const visiblePages = getVisiblePages();

    // Calcular información de elementos
    const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const handlePageClick = (page) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            onPageChange(page);
        }
    };

    const handleItemsPerPageChange = (newItemsPerPage) => {
        if (onItemsPerPageChange) {
            onItemsPerPageChange(newItemsPerPage);
        }
    };

    if (totalPages <= 1) {
        return null;
    }

    const buttonBaseClasses = "px-3 py-2 text-sm font-medium border transition-colors";
    const buttonActiveClasses = "bg-blue-600 text-white border-blue-600";
    const buttonInactiveClasses = `border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700`;
    const buttonDisabledClasses = "opacity-50 cursor-not-allowed";

    return (
        <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 ${className}`}>
            {/* Información de elementos */}
            {showInfo && (
                <div className="flex items-center space-x-4">
                    <span 
                        className="text-sm"
                        style={{ color: isDarkMode ? colors.gray300 : colors.gray700 }}
                    >
                        Mostrando {startItem} - {endItem} de {totalItems} elementos
                    </span>
                    
                    {/* Selector de elementos por página */}
                    {showItemsPerPage && (
                        <div className="flex items-center space-x-2">
                            <span 
                                className="text-sm"
                                style={{ color: isDarkMode ? colors.gray400 : colors.gray600 }}
                            >
                                Mostrar:
                            </span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                                className="px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500"
                                style={{
                                    backgroundColor: isDarkMode ? colors.gray700 : colors.white,
                                    borderColor: isDarkMode ? colors.gray600 : colors.gray300,
                                    color: isDarkMode ? colors.white : colors.gray900
                                }}
                            >
                                {itemsPerPageOptions.map(option => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            )}

            {/* Controles de paginación */}
            <div className="flex items-center space-x-1">
                {/* Primera página */}
                {showFirstLast && currentPage > 2 && (
                    <>
                        <button
                            onClick={() => handlePageClick(1)}
                            className={`${buttonBaseClasses} ${buttonInactiveClasses} rounded-l-md`}
                            style={{
                                backgroundColor: isDarkMode ? colors.gray800 : colors.white,
                                borderColor: isDarkMode ? colors.gray600 : colors.gray300,
                                color: isDarkMode ? colors.gray300 : colors.gray700
                            }}
                        >
                            1
                        </button>
                        {currentPage > 3 && (
                            <span 
                                className="px-3 py-2 text-sm"
                                style={{ color: isDarkMode ? colors.gray400 : colors.gray500 }}
                            >
                                ...
                            </span>
                        )}
                    </>
                )}

                {/* Página anterior */}
                <button
                    onClick={() => handlePageClick(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`${buttonBaseClasses} ${
                        currentPage === 1 ? buttonDisabledClasses : buttonInactiveClasses
                    } ${!showFirstLast || currentPage <= 2 ? 'rounded-l-md' : ''}`}
                    style={{
                        backgroundColor: isDarkMode ? colors.gray800 : colors.white,
                        borderColor: isDarkMode ? colors.gray600 : colors.gray300,
                        color: isDarkMode ? colors.gray300 : colors.gray700
                    }}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Páginas visibles */}
                {visiblePages.map(page => (
                    <button
                        key={page}
                        onClick={() => handlePageClick(page)}
                        className={`${buttonBaseClasses} ${
                            page === currentPage ? buttonActiveClasses : buttonInactiveClasses
                        }`}
                        style={{
                            backgroundColor: page === currentPage 
                                ? '#3B82F6' 
                                : (isDarkMode ? colors.gray800 : colors.white),
                            borderColor: page === currentPage 
                                ? '#3B82F6' 
                                : (isDarkMode ? colors.gray600 : colors.gray300),
                            color: page === currentPage 
                                ? 'white' 
                                : (isDarkMode ? colors.gray300 : colors.gray700)
                        }}
                    >
                        {page}
                    </button>
                ))}

                {/* Página siguiente */}
                <button
                    onClick={() => handlePageClick(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`${buttonBaseClasses} ${
                        currentPage === totalPages ? buttonDisabledClasses : buttonInactiveClasses
                    }`}
                    style={{
                        backgroundColor: isDarkMode ? colors.gray800 : colors.white,
                        borderColor: isDarkMode ? colors.gray600 : colors.gray300,
                        color: isDarkMode ? colors.gray300 : colors.gray700
                    }}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {/* Última página */}
                {showFirstLast && currentPage < totalPages - 1 && (
                    <>
                        {currentPage < totalPages - 2 && (
                            <span 
                                className="px-3 py-2 text-sm"
                                style={{ color: isDarkMode ? colors.gray400 : colors.gray500 }}
                            >
                                ...
                            </span>
                        )}
                        <button
                            onClick={() => handlePageClick(totalPages)}
                            className={`${buttonBaseClasses} ${buttonInactiveClasses} rounded-r-md`}
                            style={{
                                backgroundColor: isDarkMode ? colors.gray800 : colors.white,
                                borderColor: isDarkMode ? colors.gray600 : colors.gray300,
                                color: isDarkMode ? colors.gray300 : colors.gray700
                            }}
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                {/* Última página cuando no hay separación */}
                {(!showFirstLast || currentPage >= totalPages - 1) && (
                    <button
                        onClick={() => handlePageClick(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`${buttonBaseClasses} ${
                            currentPage === totalPages ? buttonDisabledClasses : buttonInactiveClasses
                        } rounded-r-md`}
                        style={{
                            backgroundColor: isDarkMode ? colors.gray800 : colors.white,
                            borderColor: isDarkMode ? colors.gray600 : colors.gray300,
                            color: isDarkMode ? colors.gray300 : colors.gray700
                        }}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
};

export default Pagination;