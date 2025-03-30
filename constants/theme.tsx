import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';

export const colors = {
  light: {
    primary: '#00C805',    // Robinhood green
    secondary: '#85E9FF',  // Bright blue accent
    background: '#FFFFFF', // Clean white background like Instagram
    surface: '#F9F9F9',    // Very light gray like Instagram
    text: '#000000',       // Black text like Instagram
    textSecondary: '#65676B', // Instagram secondary text
    textTertiary: '#8E8E93',  // Light gray text
    border: '#EFEFEF',     // Very light border like Instagram
    success: '#00C805',    // Robinhood green for success
    error: '#FF5000',      // Robinhood orange/red for errors
    warning: '#FFBD00',    // Warm yellow for warnings
    info: '#1E88E5',       // Info blue 
    card: '#FFFFFF',       // White cards
    cardShadow: 'rgba(0, 0, 0, 0.05)', // Lighter shadow
    tabBar: '#FFFFFF',     // White tab bar
    tabBarBorder: '#EFEFEF', // Very light border
    tabBarActive: '#00C805', // Robinhood green for active tabs
    tabBarInactive: '#AEAEB2', // Light gray for inactive
    inputBackground: '#FAFAFA', // Instagram input background
    inputBorder: '#EFEFEF',     // Instagram input border
    progressBackground: '#F2F2F7', // Light background for progress
    progressFill: '#00C805',    // Robinhood green for progress
    badgeBackground: '#E8F2FF', // Light blue background
    badgeText: '#1E88E5',       // Blue text
    tagBackground: '#F2F2F7',   // Light background for tags
    tagText: '#00C805',         // Robinhood green for tag text
  },
  dark: {
    primary: '#00C805',    // Keep Robinhood green in dark mode
    secondary: '#004133',  
    background: '#121212', // Darker background, Instagram dark mode inspired
    surface: '#1E1E1E',    // Slightly lighter than background
    text: '#FFFFFF',       // White text
    textSecondary: '#B0B3B8', // Instagram dark mode secondary text
    textTertiary: '#8E8E93',  // Light gray text
    border: '#2C2C2E',     // Dark border
    success: '#00D80A',    // Slightly brighter green for visibility
    error: '#FF5000',      // Robinhood orange/red 
    warning: '#FFBD00',    // Warm yellow
    info: '#1E88E5',       // Info blue
    card: '#1E1E1E',       // Dark cards
    cardShadow: 'rgba(0, 0, 0, 0.3)', // Darker shadow
    tabBar: '#121212',     // Dark tab bar
    tabBarBorder: '#2C2C2E', // Dark border
    tabBarActive: '#00D80A', // Bright green for active tabs
    tabBarInactive: '#8E8E93', // Gray for inactive
    inputBackground: '#1E1E1E', // Dark input background
    inputBorder: '#2C2C2E',     // Dark input border
    progressBackground: '#2C2C2E', // Dark background for progress
    progressFill: '#00D80A',    // Bright green for progress
    badgeBackground: '#1E1E1E', // Dark background
    badgeText: '#00D80A',       // Green text
    tagBackground: '#1E1E1E',   // Dark background
    tagText: '#00D80A',         // Green text
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
  const isDark = false; // Force light theme regardless of system settings

  const theme: ThemeContextType = {
    colors: colors.light, // Always use light theme colors
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