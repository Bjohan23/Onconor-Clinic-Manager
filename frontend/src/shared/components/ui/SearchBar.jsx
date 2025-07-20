import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const SearchBar = ({ 
    placeholder = "Buscar...", 
    onSearch, 
    onClear,
    initialValue = "",
    suggestions = [],
    showSuggestions = false,
    loading = false,
    delay = 500,
    className = ""
}) => {
    const { colors, isDarkMode } = useTheme();
    const [searchValue, setSearchValue] = useState(initialValue);
    const [showSuggestionsList, setShowSuggestionsList] = useState(false);
    const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
    const timeoutRef = useRef(null);
    const inputRef = useRef(null);
    const suggestionRefs = useRef([]);

    useEffect(() => {
        setSearchValue(initialValue);
    }, [initialValue]);

    useEffect(() => {
        // Limpieza del timeout al desmontar
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchValue(value);

        // Limpiar timeout anterior
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Configurar nuevo timeout para búsqueda
        timeoutRef.current = setTimeout(() => {
            if (onSearch) {
                onSearch(value.trim());
            }
        }, delay);

        // Mostrar sugerencias si hay valor y están habilitadas
        if (showSuggestions && value.trim() && suggestions.length > 0) {
            setShowSuggestionsList(true);
            setSelectedSuggestion(-1);
        } else {
            setShowSuggestionsList(false);
        }
    };

    const handleClear = () => {
        setSearchValue('');
        setShowSuggestionsList(false);
        setSelectedSuggestion(-1);
        
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (onClear) {
            onClear();
        } else if (onSearch) {
            onSearch('');
        }
    };

    const handleKeyDown = (e) => {
        if (!showSuggestionsList || suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedSuggestion(prev => 
                    prev < suggestions.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedSuggestion(prev => 
                    prev > 0 ? prev - 1 : suggestions.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedSuggestion >= 0) {
                    handleSuggestionClick(suggestions[selectedSuggestion]);
                }
                break;
            case 'Escape':
                setShowSuggestionsList(false);
                setSelectedSuggestion(-1);
                inputRef.current?.blur();
                break;
        }
    };

    const handleSuggestionClick = (suggestion) => {
        const searchText = typeof suggestion === 'string' ? suggestion : suggestion.text || suggestion.label;
        setSearchValue(searchText);
        setShowSuggestionsList(false);
        setSelectedSuggestion(-1);
        
        if (onSearch) {
            onSearch(searchText);
        }
    };

    const filteredSuggestions = suggestions.filter(suggestion => {
        const text = typeof suggestion === 'string' ? suggestion : suggestion.text || suggestion.label;
        return text.toLowerCase().includes(searchValue.toLowerCase());
    });

    return (
        <div className={`relative ${className}`}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                    ) : (
                        <svg 
                            className="h-4 w-4"
                            style={{ color: isDarkMode ? colors.gray400 : colors.gray500 }}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    )}
                </div>
                
                <input
                    ref={inputRef}
                    type="text"
                    value={searchValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (showSuggestions && searchValue.trim() && filteredSuggestions.length > 0) {
                            setShowSuggestionsList(true);
                        }
                    }}
                    placeholder={placeholder}
                    className="block w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    style={{
                        backgroundColor: isDarkMode ? colors.gray700 : colors.white,
                        borderColor: isDarkMode ? colors.gray600 : colors.gray300,
                        color: isDarkMode ? colors.white : colors.gray900
                    }}
                />

                {searchValue && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                            onClick={handleClear}
                            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            type="button"
                        >
                            <svg 
                                className="h-4 w-4"
                                style={{ color: isDarkMode ? colors.gray400 : colors.gray500 }}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Sugerencias */}
            {showSuggestionsList && filteredSuggestions.length > 0 && (
                <div 
                    className="absolute z-50 w-full mt-1 rounded-md border shadow-lg max-h-60 overflow-auto"
                    style={{
                        backgroundColor: isDarkMode ? colors.gray800 : colors.white,
                        borderColor: isDarkMode ? colors.gray600 : colors.gray300
                    }}
                >
                    {filteredSuggestions.map((suggestion, index) => {
                        const text = typeof suggestion === 'string' ? suggestion : suggestion.text || suggestion.label;
                        const subtitle = typeof suggestion === 'object' ? suggestion.subtitle : null;
                        
                        return (
                            <div
                                key={index}
                                ref={el => suggestionRefs.current[index] = el}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className={`px-4 py-2 cursor-pointer transition-colors ${
                                    selectedSuggestion === index 
                                        ? 'bg-blue-100 dark:bg-blue-900/30' 
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                                style={{
                                    backgroundColor: selectedSuggestion === index 
                                        ? (isDarkMode ? colors.blue900 + '4D' : colors.blue100)
                                        : undefined
                                }}
                            >
                                <div 
                                    className="font-medium"
                                    style={{ color: isDarkMode ? colors.white : colors.gray900 }}
                                >
                                    {text}
                                </div>
                                {subtitle && (
                                    <div 
                                        className="text-sm"
                                        style={{ color: isDarkMode ? colors.gray400 : colors.gray600 }}
                                    >
                                        {subtitle}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SearchBar;