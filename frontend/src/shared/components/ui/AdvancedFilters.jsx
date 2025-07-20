import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const AdvancedFilters = ({
    filters = [],
    values = {},
    onChange,
    onReset,
    className = "",
    collapsible = true,
    defaultExpanded = false
}) => {
    const { colors, isDarkMode } = useTheme();
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const [localValues, setLocalValues] = useState(values);

    useEffect(() => {
        setLocalValues(values);
    }, [values]);

    const handleFilterChange = (filterKey, value) => {
        const newValues = { ...localValues, [filterKey]: value };
        setLocalValues(newValues);
        
        if (onChange) {
            onChange(newValues);
        }
    };

    const handleReset = () => {
        const resetValues = {};
        filters.forEach(filter => {
            resetValues[filter.key] = filter.defaultValue || '';
        });
        
        setLocalValues(resetValues);
        
        if (onReset) {
            onReset();
        } else if (onChange) {
            onChange(resetValues);
        }
    };

    const hasActiveFilters = () => {
        return Object.values(localValues).some(value => 
            value !== '' && value !== null && value !== undefined
        );
    };

    const renderFilter = (filter) => {
        const value = localValues[filter.key] || '';

        switch (filter.type) {
            case 'text':
                return (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        placeholder={filter.placeholder}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        style={{
                            backgroundColor: isDarkMode ? colors.gray700 : colors.white,
                            borderColor: isDarkMode ? colors.gray600 : colors.gray300,
                            color: isDarkMode ? colors.white : colors.gray900
                        }}
                    />
                );

            case 'select':
                return (
                    <select
                        value={value}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        style={{
                            backgroundColor: isDarkMode ? colors.gray700 : colors.white,
                            borderColor: isDarkMode ? colors.gray600 : colors.gray300,
                            color: isDarkMode ? colors.white : colors.gray900
                        }}
                    >
                        {filter.options?.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );

            case 'date':
                return (
                    <input
                        type="date"
                        value={value}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        style={{
                            backgroundColor: isDarkMode ? colors.gray700 : colors.white,
                            borderColor: isDarkMode ? colors.gray600 : colors.gray300,
                            color: isDarkMode ? colors.white : colors.gray900
                        }}
                    />
                );

            case 'dateRange':
                return (
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="date"
                            value={value.start || ''}
                            onChange={(e) => handleFilterChange(filter.key, { ...value, start: e.target.value })}
                            placeholder="Desde"
                            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            style={{
                                backgroundColor: isDarkMode ? colors.gray700 : colors.white,
                                borderColor: isDarkMode ? colors.gray600 : colors.gray300,
                                color: isDarkMode ? colors.white : colors.gray900
                            }}
                        />
                        <input
                            type="date"
                            value={value.end || ''}
                            onChange={(e) => handleFilterChange(filter.key, { ...value, end: e.target.value })}
                            placeholder="Hasta"
                            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            style={{
                                backgroundColor: isDarkMode ? colors.gray700 : colors.white,
                                borderColor: isDarkMode ? colors.gray600 : colors.gray300,
                                color: isDarkMode ? colors.white : colors.gray900
                            }}
                        />
                    </div>
                );

            case 'number':
                return (
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        placeholder={filter.placeholder}
                        min={filter.min}
                        max={filter.max}
                        step={filter.step}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        style={{
                            backgroundColor: isDarkMode ? colors.gray700 : colors.white,
                            borderColor: isDarkMode ? colors.gray600 : colors.gray300,
                            color: isDarkMode ? colors.white : colors.gray900
                        }}
                    />
                );

            case 'numberRange':
                return (
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="number"
                            value={value.min || ''}
                            onChange={(e) => handleFilterChange(filter.key, { ...value, min: e.target.value })}
                            placeholder="Mín"
                            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            style={{
                                backgroundColor: isDarkMode ? colors.gray700 : colors.white,
                                borderColor: isDarkMode ? colors.gray600 : colors.gray300,
                                color: isDarkMode ? colors.white : colors.gray900
                            }}
                        />
                        <input
                            type="number"
                            value={value.max || ''}
                            onChange={(e) => handleFilterChange(filter.key, { ...value, max: e.target.value })}
                            placeholder="Máx"
                            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            style={{
                                backgroundColor: isDarkMode ? colors.gray700 : colors.white,
                                borderColor: isDarkMode ? colors.gray600 : colors.gray300,
                                color: isDarkMode ? colors.white : colors.gray900
                            }}
                        />
                    </div>
                );

            case 'checkbox':
                return (
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => handleFilterChange(filter.key, e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span 
                            className="text-sm"
                            style={{ color: isDarkMode ? colors.gray300 : colors.gray700 }}
                        >
                            {filter.label}
                        </span>
                    </div>
                );

            case 'multiSelect':
                return (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                        {filter.options?.map(option => (
                            <div key={option.value} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={value.includes && value.includes(option.value)}
                                    onChange={(e) => {
                                        const currentValues = value || [];
                                        const newValues = e.target.checked
                                            ? [...currentValues, option.value]
                                            : currentValues.filter(v => v !== option.value);
                                        handleFilterChange(filter.key, newValues);
                                    }}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span 
                                    className="text-sm"
                                    style={{ color: isDarkMode ? colors.gray300 : colors.gray700 }}
                                >
                                    {option.label}
                                </span>
                            </div>
                        ))}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div 
            className={`border rounded-lg ${className}`}
            style={{ 
                backgroundColor: isDarkMode ? colors.gray800 : colors.white,
                borderColor: isDarkMode ? colors.gray700 : colors.gray200
            }}
        >
            {/* Header */}
            <div 
                className={`px-4 py-3 border-b flex items-center justify-between ${
                    collapsible ? 'cursor-pointer' : ''
                }`}
                style={{ borderColor: isDarkMode ? colors.gray700 : colors.gray200 }}
                onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
            >
                <div className="flex items-center space-x-2">
                    <h3 
                        className="font-medium"
                        style={{ color: isDarkMode ? colors.white : colors.gray900 }}
                    >
                        Filtros Avanzados
                    </h3>
                    {hasActiveFilters() && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            Activos
                        </span>
                    )}
                </div>
                
                <div className="flex items-center space-x-2">
                    {hasActiveFilters() && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleReset();
                            }}
                            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            Limpiar
                        </button>
                    )}
                    
                    {collapsible && (
                        <svg 
                            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            style={{ color: isDarkMode ? colors.gray400 : colors.gray500 }}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    )}
                </div>
            </div>

            {/* Content */}
            {(!collapsible || isExpanded) && (
                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filters.map(filter => (
                            <div key={filter.key}>
                                {filter.type !== 'checkbox' && (
                                    <label 
                                        className="block text-sm font-medium mb-1"
                                        style={{ color: isDarkMode ? colors.gray300 : colors.gray700 }}
                                    >
                                        {filter.label}
                                        {filter.required && <span className="text-red-500 ml-1">*</span>}
                                    </label>
                                )}
                                {renderFilter(filter)}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedFilters;