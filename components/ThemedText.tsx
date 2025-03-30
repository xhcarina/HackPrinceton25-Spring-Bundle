import React from 'react';
import { Text, TextProps, StyleSheet, TextStyle } from 'react-native';
import { useTheme } from '../constants/theme';

type TextType = 'title' | 'default' | 'defaultSemiBold' | 'link' | 'caption';

interface ThemedTextProps extends TextProps {
  type?: TextType;
}

export function ThemedText({ type = 'default', style, ...props }: ThemedTextProps) {
  const { colors, typography } = useTheme();

  const getTextStyle = (): TextStyle => {
    switch (type) {
      case 'title':
        return {
          fontSize: typography.sizes['2xl'],
          fontWeight: '700',
          color: colors.text,
        };
      case 'defaultSemiBold':
        return {
          fontSize: typography.sizes.base,
          fontWeight: '600',
          color: colors.text,
        };
      case 'link':
        return {
          fontSize: typography.sizes.base,
          color: colors.primary,
        };
      case 'caption':
        return {
          fontSize: typography.sizes.sm,
          color: colors.textSecondary,
        };
      default:
        return {
          fontSize: typography.sizes.base,
          color: colors.text,
        };
    }
  };

  return (
    <Text
      style={[styles.text, getTextStyle(), style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  text: {
    lineHeight: 24,
  },
}); 