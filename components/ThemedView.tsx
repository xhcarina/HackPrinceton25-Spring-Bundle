import React from 'react';
import { View, ViewProps, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../constants/theme';

interface ThemedViewProps extends ViewProps {
  variant?: 'primary' | 'secondary' | 'card' | 'surface' | 'background';
}

export function ThemedView({ variant = 'background', style, ...props }: ThemedViewProps) {
  const { colors } = useTheme();

  const getViewStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary,
        };
      case 'secondary':
        return {
          backgroundColor: colors.secondary,
        };
      case 'card':
        return {
          backgroundColor: colors.card,
        };
      case 'surface':
        return {
          backgroundColor: colors.surface,
        };
      default:
        return {
          backgroundColor: colors.background,
        };
    }
  };

  return (
    <View
      style={[styles.view, getViewStyle(), style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
  },
}); 