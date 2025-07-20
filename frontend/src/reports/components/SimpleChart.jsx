import React from 'react';
import { useTheme } from '../../shared/contexts/ThemeContext';

const SimpleChart = ({ data, title, type = 'bar', height = 200 }) => {
    const { colors, isDarkMode } = useTheme();

    if (!data || data.length === 0) {
        return (
            <div 
                className="rounded-lg border p-6 text-center"
                style={{ 
                    backgroundColor: isDarkMode ? colors.gray800 : colors.white,
                    borderColor: isDarkMode ? colors.gray700 : colors.gray200,
                    height: height + 60
                }}
            >
                <p style={{ color: isDarkMode ? colors.gray400 : colors.gray500 }}>
                    No hay datos para mostrar
                </p>
            </div>
        );
    }

    const maxValue = Math.max(...data.map(item => item.value));

    const BarChart = () => (
        <div className="space-y-3">
            {data.map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                    <div 
                        className="text-sm font-medium truncate w-24"
                        style={{ color: isDarkMode ? colors.gray300 : colors.gray700 }}
                    >
                        {item.label}
                    </div>
                    <div className="flex-1 relative">
                        <div 
                            className="h-6 rounded"
                            style={{ backgroundColor: isDarkMode ? colors.gray700 : colors.gray200 }}
                        >
                            <div 
                                className="h-full rounded transition-all duration-500 bg-blue-500"
                                style={{ 
                                    width: `${(item.value / maxValue) * 100}%`,
                                    backgroundColor: item.color || '#3B82F6'
                                }}
                            />
                        </div>
                    </div>
                    <div 
                        className="text-sm font-semibold w-12 text-right"
                        style={{ color: isDarkMode ? colors.gray300 : colors.gray700 }}
                    >
                        {item.value}
                    </div>
                </div>
            ))}
        </div>
    );

    const PieChart = () => {
        const total = data.reduce((sum, item) => sum + item.value, 0);
        
        return (
            <div className="flex flex-col space-y-4">
                {/* Círculo simple representativo */}
                <div className="flex justify-center">
                    <div className="relative w-32 h-32">
                        <div 
                            className="w-full h-full rounded-full border-8"
                            style={{ borderColor: isDarkMode ? colors.gray700 : colors.gray200 }}
                        >
                            <div 
                                className="w-full h-full rounded-full border-8 border-blue-500"
                                style={{ 
                                    clipPath: `polygon(50% 50%, 50% 0%, ${
                                        data[0] ? 50 + (data[0].value / total) * 50 : 50
                                    }% 0%, 100% 100%, 0% 100%)`
                                }}
                            />
                        </div>
                    </div>
                </div>
                
                {/* Leyenda */}
                <div className="grid grid-cols-2 gap-2">
                    {data.map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: item.color || '#3B82F6' }}
                            />
                            <span 
                                className="text-sm truncate"
                                style={{ color: isDarkMode ? colors.gray300 : colors.gray700 }}
                            >
                                {item.label}: {item.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const LineChart = () => (
        <div className="relative" style={{ height }}>
            <svg width="100%" height="100%" className="overflow-visible">
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map(y => (
                    <line
                        key={y}
                        x1="0"
                        y1={`${y}%`}
                        x2="100%"
                        y2={`${y}%`}
                        stroke={isDarkMode ? colors.gray700 : colors.gray200}
                        strokeWidth="1"
                    />
                ))}
                
                {/* Line path */}
                <polyline
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    points={data.map((item, index) => 
                        `${(index / (data.length - 1)) * 100},${100 - (item.value / maxValue) * 100}`
                    ).join(' ')}
                />
                
                {/* Data points */}
                {data.map((item, index) => (
                    <circle
                        key={index}
                        cx={`${(index / (data.length - 1)) * 100}%`}
                        cy={`${100 - (item.value / maxValue) * 100}%`}
                        r="4"
                        fill="#3B82F6"
                    />
                ))}
            </svg>
            
            {/* Labels */}
            <div className="flex justify-between mt-2">
                {data.map((item, index) => (
                    <span 
                        key={index}
                        className="text-xs"
                        style={{ color: isDarkMode ? colors.gray400 : colors.gray600 }}
                    >
                        {item.label}
                    </span>
                ))}
            </div>
        </div>
    );

    return (
        <div 
            className="rounded-lg border p-6"
            style={{ 
                backgroundColor: isDarkMode ? colors.gray800 : colors.white,
                borderColor: isDarkMode ? colors.gray700 : colors.gray200
            }}
        >
            {title && (
                <h3 
                    className="text-lg font-semibold mb-4"
                    style={{ color: isDarkMode ? colors.white : colors.gray900 }}
                >
                    {title}
                </h3>
            )}
            
            <div style={{ height }}>
                {type === 'bar' && <BarChart />}
                {type === 'pie' && <PieChart />}
                {type === 'line' && <LineChart />}
            </div>
        </div>
    );
};

export default SimpleChart;