// Configuración de tema para clínica - Modo claro y oscuro
export const themes = {
  light: {
    // Colores primarios - Azul médico profesional
    primary: {
      50: '#eff6ff',
      100: '#dbeafe', 
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // Color principal
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    
    // Colores secundarios - Verde salud
    secondary: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981', // Color secundario
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
    },
    
    // Grises profesionales
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    
    // Estados clínicos
    success: {
      50: '#ecfdf5',
      200: '#a7f3d0',
      500: '#10b981',
      600: '#059669',
      800: '#065f46',
    },
    warning: {
      50: '#fffbeb',
      200: '#fde68a',
      500: '#f59e0b',
      600: '#d97706',
      800: '#92400e',
    },
    error: {
      50: '#fef2f2',
      200: '#fecaca',
      500: '#ef4444',
      600: '#dc2626',
      800: '#991b1b',
    },
    info: {
      50: '#eff6ff',
      200: '#bfdbfe',
      500: '#3b82f6',
      600: '#2563eb',
      800: '#1e40af',
    },
    
    // Backgrounds y superficies
    background: {
      primary: '#ffffff',
      secondary: '#f9fafb',
      tertiary: '#f3f4f6',
    },
    
    // Texto
    text: {
      primary: '#111827',
      secondary: '#374151',
      tertiary: '#6b7280',
      inverse: '#ffffff',
    },
    
    // Bordes
    border: {
      light: '#e5e7eb',
      medium: '#d1d5db',
      dark: '#9ca3af',
    }
  },
  
  dark: {
    // Colores primarios - Azul médico profesional adaptado para dark
    primary: {
      50: '#1e3a8a',
      100: '#1e40af',
      200: '#1d4ed8',
      300: '#2563eb',
      400: '#3b82f6',
      500: '#60a5fa', // Color principal dark
      600: '#93c5fd',
      700: '#bfdbfe',
      800: '#dbeafe',
      900: '#eff6ff',
    },
    
    // Colores secundarios - Verde salud adaptado
    secondary: {
      50: '#064e3b',
      100: '#065f46',
      200: '#047857',
      300: '#059669',
      400: '#10b981',
      500: '#34d399', // Color secundario dark
      600: '#6ee7b7',
      700: '#a7f3d0',
      800: '#d1fae5',
      900: '#ecfdf5',
    },
    
    // Grises para dark mode
    gray: {
      50: '#111827',
      100: '#1f2937',
      200: '#374151',
      300: '#4b5563',
      400: '#6b7280',
      500: '#9ca3af',
      600: '#d1d5db',
      700: '#e5e7eb',
      800: '#f3f4f6',
      900: '#f9fafb',
    },
    
    // Estados clínicos para dark
    success: {
      50: '#064e3b',
      200: '#047857',
      500: '#34d399',
      600: '#6ee7b7',
      800: '#d1fae5',
    },
    warning: {
      50: '#451a03',
      200: '#b45309',
      500: '#fbbf24',
      600: '#fcd34d',
      800: '#fef3c7',
    },
    error: {
      50: '#450a0a',
      200: '#b91c1c',
      500: '#f87171',
      600: '#fca5a5',
      800: '#fecaca',
    },
    info: {
      50: '#1e3a8a',
      200: '#1d4ed8',
      500: '#60a5fa',
      600: '#93c5fd',
      800: '#dbeafe',
    },
    
    // Backgrounds y superficies para dark
    background: {
      primary: '#111827',
      secondary: '#1f2937',
      tertiary: '#374151',
    },
    
    // Texto para dark
    text: {
      primary: '#f9fafb',
      secondary: '#e5e7eb',
      tertiary: '#9ca3af',
      inverse: '#111827',
    },
    
    // Bordes para dark
    border: {
      light: '#374151',
      medium: '#4b5563',
      dark: '#6b7280',
    }
  }
}

// Configuración de sombras
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
}

// Configuración de espaciado
export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
}

// Configuración de border radius
export const borderRadius = {
  sm: '0.25rem',   // 4px
  md: '0.375rem',  // 6px
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px
  full: '9999px',
}

export const getTheme = (mode = 'light') => themes[mode]

// Helper functions para LoadingSpinner
export const getSpinnerConfig = (size = 'md', variant = 'primary', theme = 'light', context = null) => {
  const themeData = getTheme(theme);
  
  // Configuración médica por contexto
  const medicalContexts = {
    patient: { size: 'md', variant: 'primary', message: 'Cargando información del paciente...' },
    appointment: { size: 'sm', variant: 'secondary', message: 'Cargando citas...' },
    treatment: { size: 'lg', variant: 'success', message: 'Procesando tratamiento...' },
    critical: { size: 'xl', variant: 'error', message: 'Procesando caso crítico...' },
    report: { size: 'md', variant: 'warning', message: 'Generando reporte...' },
    lab: { size: 'md', variant: 'info', message: 'Procesando resultados de laboratorio...' },
    prescription: { size: 'sm', variant: 'success', message: 'Generando prescripción...' },
    billing: { size: 'md', variant: 'warning', message: 'Procesando facturación...' }
  };
  
  // Si se especifica un contexto médico, usar esa configuración
  if (context && medicalContexts[context]) {
    const medicalConfig = medicalContexts[context];
    size = medicalConfig.size;
    variant = medicalConfig.variant;
  }
  
  // Configuración de tamaños
  const sizes = {
    xs: { className: 'w-3 h-3 border', width: '12px', height: '12px', borderWidth: '1px' },
    sm: { className: 'w-4 h-4 border-2', width: '16px', height: '16px', borderWidth: '2px' },
    md: { className: 'w-6 h-6 border-2', width: '24px', height: '24px', borderWidth: '2px' },
    lg: { className: 'w-8 h-8 border-[3px]', width: '32px', height: '32px', borderWidth: '3px' },
    xl: { className: 'w-12 h-12 border-4', width: '48px', height: '48px', borderWidth: '4px' },
    '2xl': { className: 'w-16 h-16 border-[5px]', width: '64px', height: '64px', borderWidth: '5px' }
  };
  
  // Configuración de variantes
  const variants = {
    primary: {
      light: { style: 'border-blue-500 border-t-transparent' },
      dark: { style: 'border-blue-400 border-t-transparent' }
    },
    secondary: {
      light: { style: 'border-green-500 border-t-transparent' },
      dark: { style: 'border-green-400 border-t-transparent' }
    },
    success: {
      light: { style: 'border-green-500 border-t-transparent' },
      dark: { style: 'border-green-400 border-t-transparent' }
    },
    warning: {
      light: { style: 'border-yellow-500 border-t-transparent' },
      dark: { style: 'border-yellow-400 border-t-transparent' }
    },
    error: {
      light: { style: 'border-red-500 border-t-transparent' },
      dark: { style: 'border-red-400 border-t-transparent' }
    },
    info: {
      light: { style: 'border-blue-500 border-t-transparent' },
      dark: { style: 'border-blue-400 border-t-transparent' }
    },
    white: {
      light: { style: 'border-white border-t-transparent' },
      dark: { style: 'border-gray-100 border-t-transparent' }
    },
    gray: {
      light: { style: 'border-gray-500 border-t-transparent' },
      dark: { style: 'border-gray-400 border-t-transparent' }
    }
  };
  
  const sizeConfig = sizes[size] || sizes.md;
  const variantConfig = variants[variant]?.[theme] || variants.primary[theme];
  
  return {
    size: sizeConfig,
    variant: variantConfig,
    className: `${sizeConfig.className} ${variantConfig.style} animate-spin rounded-full`,
    style: {
      width: sizeConfig.width,
      height: sizeConfig.height,
      borderWidth: sizeConfig.borderWidth,
      borderRadius: '50%',
      animationDuration: '1s',
      animationTimingFunction: 'linear',
      animationIterationCount: 'infinite',
    },
    message: context && medicalContexts[context] ? medicalContexts[context].message : ''
  };
};

// Utilidades para spinner
export const spinnerUtils = {
  // Obtener configuración rápida para diferentes tamaños
  getSizeClass: (size) => {
    const sizes = {
      xs: 'w-3 h-3 border',
      sm: 'w-4 h-4 border-2',
      md: 'w-6 h-6 border-2',
      lg: 'w-8 h-8 border-[3px]',
      xl: 'w-12 h-12 border-4',
      '2xl': 'w-16 h-16 border-[5px]'
    };
    return sizes[size] || sizes.md;
  },
  
  // Obtener clase de color para diferentes variantes
  getVariantClass: (variant, isDark = false) => {
    const variants = {
      primary: isDark ? 'border-blue-400 border-t-transparent' : 'border-blue-500 border-t-transparent',
      secondary: isDark ? 'border-green-400 border-t-transparent' : 'border-green-500 border-t-transparent',
      success: isDark ? 'border-green-400 border-t-transparent' : 'border-green-500 border-t-transparent',
      warning: isDark ? 'border-yellow-400 border-t-transparent' : 'border-yellow-500 border-t-transparent',
      error: isDark ? 'border-red-400 border-t-transparent' : 'border-red-500 border-t-transparent',
      white: isDark ? 'border-gray-100 border-t-transparent' : 'border-white border-t-transparent',
      gray: isDark ? 'border-gray-400 border-t-transparent' : 'border-gray-500 border-t-transparent'
    };
    return variants[variant] || variants.primary;
  },
  
  // Generar clase completa
  getFullClass: (size = 'md', variant = 'primary', isDark = false, additionalClasses = '') => {
    return `${spinnerUtils.getSizeClass(size)} ${spinnerUtils.getVariantClass(variant, isDark)} animate-spin rounded-full ${additionalClasses}`.trim();
  },
  
  // Contextos médicos predefinidos
  medical: {
    patient: { size: 'md', variant: 'primary', message: 'Cargando información del paciente...' },
    appointment: { size: 'sm', variant: 'secondary', message: 'Cargando citas...' },
    treatment: { size: 'lg', variant: 'success', message: 'Procesando tratamiento...' },
    critical: { size: 'xl', variant: 'error', message: 'Procesando caso crítico...' },
    report: { size: 'md', variant: 'warning', message: 'Generando reporte...' },
    lab: { size: 'md', variant: 'info', message: 'Procesando resultados de laboratorio...' },
    prescription: { size: 'sm', variant: 'success', message: 'Generando prescripción...' },
    billing: { size: 'md', variant: 'warning', message: 'Procesando facturación...' }
  }
};