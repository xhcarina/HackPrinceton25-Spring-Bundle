import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { useTheme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends React.ComponentProps<typeof TextInput> {
  label: string;
  error?: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export function Input({
  label,
  error,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  secureTextEntry,
  ...props
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { colors, typography, spacing, borderRadius } = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginBottom: spacing.lg,
    },
    label: {
      fontSize: typography.sizes.sm,
      fontWeight: '500',
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: isFocused 
        ? colors.primary 
        : error 
          ? colors.error 
          : colors.inputBorder,
      paddingHorizontal: spacing.base,
    },
    input: {
      flex: 1,
      height: 44,
      color: colors.text,
      fontSize: typography.sizes.base,
      ...(Platform.OS === 'web' ? { outline: 'none' } : {}),
    },
    rightIconContainer: {
      marginLeft: spacing.sm,
    },
    error: {
      color: colors.error,
      fontSize: typography.sizes.sm,
      marginTop: spacing.xs,
    },
    activeLabel: {
      color: colors.primary,
    }
  });

  const togglePasswordVisibility = () => {
    setIsFocused(true);
    setIsPasswordVisible(!isPasswordVisible);
  };

  const actualSecureTextEntry = secureTextEntry && !isPasswordVisible;

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.label, isFocused && styles.activeLabel]}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          {...props}
          style={[styles.input, inputStyle]}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={actualSecureTextEntry}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {(rightIcon || secureTextEntry) && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={secureTextEntry ? togglePasswordVisibility : onRightIconPress}
          >
            <Ionicons
              name={secureTextEntry ? (isPasswordVisible ? 'eye-off' : 'eye') : rightIcon!}
              size={18}
              color={isFocused ? colors.primary : colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
} 