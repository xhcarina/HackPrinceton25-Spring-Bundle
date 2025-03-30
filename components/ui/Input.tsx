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
  const { colors, typography, spacing, borderRadius, shadows } = useTheme();

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
      backgroundColor: colors.card,
      borderRadius: borderRadius.base,
      borderWidth: 1,
      borderColor: error ? colors.error : colors.border,
      paddingHorizontal: spacing.base,
      ...shadows.sm,
    },
    input: {
      flex: 1,
      height: 48,
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
  });

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const actualSecureTextEntry = secureTextEntry && !isPasswordVisible;

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          {...props}
          style={[styles.input, inputStyle]}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={actualSecureTextEntry}
        />
        {(rightIcon || secureTextEntry) && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={secureTextEntry ? togglePasswordVisibility : onRightIconPress}
          >
            <Ionicons
              name={secureTextEntry ? (isPasswordVisible ? 'eye-off' : 'eye') : rightIcon!}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
} 