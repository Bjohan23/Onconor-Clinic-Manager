import React from 'react';
import { useTheme } from '../../shared/contexts/ThemeContext';

const StatsCard = ({ 
    title, 
    value, 
    icon, 
    trend, 
    trendLabel, 
    color = 'blue',
    isLoading = false 
}) => {
    const { colors, isDarkMode } = useTheme();

    const colorClasses = {
        blue: {
            bg: isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50',
            icon: 'text-blue-600',
            text: 'text-blue-600'
        },
        green: {
            bg: isDarkMode ? 'bg-green-900/20' : 'bg-green-50',
            icon: 'text-green-600',
            text: 'text-green-600'
        },
        yellow: {
            bg: isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50',
            icon: 'text-yellow-600',
            text: 'text-yellow-600'
        },
        red: {
            bg: isDarkMode ? 'bg-red-900/20' : 'bg-red-50',
            icon: 'text-red-600',
            text: 'text-red-600'
        },
        purple: {
            bg: isDarkMode ? 'bg-purple-900/20' : 'bg-purple-50',
            icon: 'text-purple-600',
            text: 'text-purple-600'
        }
    };

    const cardColor = colorClasses[color] || colorClasses.blue;

    if (isLoading) {
        return (
            <div 
                className={`p-6 rounded-lg shadow-sm border animate-pulse ${cardColor.bg}`}
                style={{ 
                    backgroundColor: isDarkMode ? colors.gray800 : colors.white,
                    borderColor: isDarkMode ? colors.gray700 : colors.gray200
                }}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                        <div className="h-8 bg-gray-300 rounded w-16"></div>
                    </div>
                    <div className="h-12 w-12 bg-gray-300 rounded-lg"></div>
                </div>
            </div>
        );
    }

    return (
        <div 
            className={`p-6 rounded-lg shadow-sm border transition-all duration-200 hover:shadow-md ${cardColor.bg}`}
            style={{ 
                backgroundColor: isDarkMode ? colors.gray800 : colors.white,
                borderColor: isDarkMode ? colors.gray700 : colors.gray200
            }}
        >
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p 
                        className="text-sm font-medium mb-1"
                        style={{ color: isDarkMode ? colors.gray300 : colors.gray600 }}
                    >
                        {title}
                    </p>
                    <div className="flex items-baseline space-x-2">
                        <p 
                            className="text-2xl font-bold"
                            style={{ color: isDarkMode ? colors.white : colors.gray900 }}
                        >
                            {value}
                        </p>
                        {trend !== undefined && (
                            <div className="flex items-center">
                                <span className={`text-sm font-medium ${
                                    trend >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {trend >= 0 ? '↗' : '↘'} {Math.abs(trend)}%
                                </span>
                                {trendLabel && (
                                    <span 
                                        className="text-xs ml-1"
                                        style={{ color: isDarkMode ? colors.gray400 : colors.gray500 }}
                                    >
                                        {trendLabel}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div 
                    className={`p-3 rounded-lg ${cardColor.icon}`}
                    style={{ backgroundColor: isDarkMode ? colors.gray700 : cardColor.bg }}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
};

export default StatsCard;