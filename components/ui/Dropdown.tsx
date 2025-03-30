import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useTheme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface Option {
  label: string;
  value: string;
}

interface DropdownProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export function Dropdown({
  label,
  value,
  onValueChange,
  options,
  placeholder = 'Select an option',
  disabled = false,
  error,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { colors, typography, spacing, borderRadius, shadows } = useTheme();

  const selectedOption = options.find(option => option.value === value);

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
    selectButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.base,
      backgroundColor: colors.card,
      borderRadius: borderRadius.base,
      borderWidth: 1,
      borderColor: error ? colors.error : colors.border,
      ...shadows.sm,
    },
    selectButtonDisabled: {
      opacity: 0.5,
    },
    selectedText: {
      fontSize: typography.sizes.base,
      color: selectedOption ? colors.text : colors.textSecondary,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.card,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      maxHeight: '70%',
    },
    modalHeader: {
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: typography.sizes.lg,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    optionsList: {
      padding: spacing.base,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.base,
      borderRadius: borderRadius.base,
    },
    optionSelected: {
      backgroundColor: colors.primary + '20',
    },
    optionText: {
      fontSize: typography.sizes.base,
      color: colors.text,
    },
    error: {
      color: colors.error,
      fontSize: typography.sizes.sm,
      marginTop: spacing.xs,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[
          styles.selectButton,
          disabled && styles.selectButtonDisabled,
        ]}
        onPress={() => !disabled && setIsOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.selectedText}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
      {error && <Text style={styles.error}>{error}</Text>}

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
            </View>
            <ScrollView style={styles.optionsList}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.option,
                    option.value === value && styles.optionSelected,
                  ]}
                  onPress={() => {
                    onValueChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  <Text style={styles.optionText}>{option.label}</Text>
                  {option.value === value && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
} 