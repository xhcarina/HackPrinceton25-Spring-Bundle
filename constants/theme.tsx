import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';

export const colors = {
  light: {
    primary: '#00775E',
    secondary: '#33FFD3',
    background: '#E5FFF9',
    surface: '#F2FFFC',
    text: '#001E18',
    textSecondary: '#666666',
    textTertiary: '#999999',
    border: '#E1E1E1',
    success: '#34C759',
    error: '#FF3B30',
    warning: '#FF9500',
    info: '#5856D6',
    card: '#FFFFFF',
    cardShadow: 'rgba(0, 0, 0, 0.1)',
    tabBar: '#FFFFFF',
    tabBarBorder: '#F0F0F0',
    tabBarActive: '#007AFF',
    tabBarInactive: '#666666',
    inputBackground: '#FAFAFA',
    inputBorder: '#E1E1E1',
    progressBackground: '#F0F0F0',
    progressFill: '#34C759',
    badgeBackground: '#E8F2FF',
    badgeText: '#007AFF',
    tagBackground: '#E8F2FF',
    tagText: '#007AFF',
  },
  dark: {
    primary: '#33FFD3',
    secondary: '#004133',
    background: '#001E18',
    surface: '#001813',
    text: '#E5FFF9',
    textSecondary: '#EBEBF5',
    textTertiary: '#8E8E93',
    border: '#38383A',
    success: '#32D74B',
    error: '#FF453A',
    warning: '#FFD60A',
    info: '#5E5CE6',
    card: '#1C1C1E',
    cardShadow: 'rgba(0, 0, 0, 0.3)',
    tabBar: '#1C1C1E',
    tabBarBorder: '#38383A',
    tabBarActive: '#0A84FF',
    tabBarInactive: '#8E8E93',
    inputBackground: '#2C2C2E',
    inputBorder: '#38383A',
    progressBackground: '#2C2C2E',
    progressFill: '#32D74B',
    badgeBackground: '#2C2C2E',
    badgeText: '#0A84FF',
    tagBackground: '#2C2C2E',
    tagText: '#0A84FF',
  },
};

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  base: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
};

export const borderRadius = {
  sm: 4,
  base: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
};

interface ThemeContextType {
  colors: typeof colors.light;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null) as React.Context<ThemeContextType>;

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme: ThemeContextType = {
    colors: isDark ? colors.dark : colors.light,
    typography,
    spacing,
    borderRadius,
    shadows,
    isDark,
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export type Theme = ThemeContextType; 