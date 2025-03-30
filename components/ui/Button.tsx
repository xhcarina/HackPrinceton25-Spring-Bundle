import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, StyleProp, ViewStyle, TextStyle, View } from 'react-native';
import { useTheme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Color from 'color';

export interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'error';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Button({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
}: ButtonProps) {
  const { colors, typography, spacing, borderRadius, shadows } = useTheme();

  const getDarkerColor = (color: string) => {
    return Color(color).darken(0.1).hex();
  };

  const getGradientColors = (): readonly [string, string] => {
    switch (variant) {
      case 'primary':
        return [colors.primary, getDarkerColor(colors.primary)] as const;
      case 'secondary':
        return [colors.surface, getDarkerColor(colors.surface)] as const;
      case 'error':
        return [colors.error, getDarkerColor(colors.error)] as const;
      default:
        return ['transparent', 'transparent'] as const;
    }
  };

  const styles = StyleSheet.create({
    base: {
      borderRadius: borderRadius.full,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      overflow: 'hidden',
      ...shadows.sm,
    },
    // Sizes
    small: {
      height: 36,
      paddingHorizontal: spacing.base,
    },
    medium: {
      height: 44,
      paddingHorizontal: spacing.lg,
    },
    large: {
      height: 52,
      paddingHorizontal: spacing.xl,
    },
    // States
    disabled: {
      opacity: 0.6,
    },
    fullWidth: {
      width: '100%',
    },
    // Content container
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Text styles
    text: {
      fontSize: typography.sizes.base,
      fontWeight: '600',
      letterSpacing: 0.5,
    },
    textPrimary: {
      color: '#FFFFFF',
    },
    textSecondary: {
      color: colors.textSecondary,
    },
    textOutline: {
      color: colors.primary,
    },
    textError: {
      color: '#FFFFFF',
    },
    // Icon styles
    icon: {
      marginHorizontal: spacing.xs,
    },
    leftIcon: {
      marginRight: spacing.sm,
    },
    rightIcon: {
      marginLeft: spacing.sm,
    },
    // Gradient container
    gradientContainer: {
      ...StyleSheet.absoluteFillObject,
    },
  });

  const buttonStyles = [
    styles.base,
    styles[size],
    variant === 'outline' && {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: 'transparent',
    },
    disabled && styles.disabled,
    fullWidth && styles.fullWidth,
    style,
  ];

  const textStyles = [
    styles.text,
    variant === 'primary' && styles.textPrimary,
    variant === 'secondary' && styles.textSecondary,
    variant === 'outline' && styles.textOutline,
    variant === 'error' && styles.textError,
    textStyle,
  ];

  const iconColor = (() => {
    switch (variant) {
      case 'primary':
        return '#FFFFFF';
      case 'error':
        return '#FFFFFF';
      case 'secondary':
        return colors.textSecondary;
      case 'outline':
        return colors.primary;
      default:
        return colors.text;
    }
  })();

  const renderContent = () => (
    <>
      {leftIcon && (
        <Ionicons
          name={leftIcon}
          size={18}
          color={iconColor}
          style={styles.leftIcon}
        />
      )}
      <Text style={textStyles}>{title}</Text>
      {rightIcon && (
        <Ionicons
          name={rightIcon}
          size={18}
          color={iconColor}
          style={styles.rightIcon}
        />
      )}
    </>
  );

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {variant !== 'outline' && (
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientContainer}
        />
      )}
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={iconColor} size="small" />
        ) : (
          renderContent()
        )}
      </View>
    </TouchableOpacity>
  );
} 