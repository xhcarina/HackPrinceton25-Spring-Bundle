import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Text } from './Themed';
import { useTheme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
  initiallyExpanded?: boolean;
  style?: any;
}

export function Collapsible({
  title,
  children,
  initiallyExpanded = false,
  style,
}: CollapsibleProps) {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  const { colors, spacing, typography } = useTheme();
  const rotateAnimation = new Animated.Value(isExpanded ? 1 : 0);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    Animated.timing(rotateAnimation, {
      toValue: isExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const rotate = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.header,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
        onPress={toggleExpand}
      >
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Ionicons
            name="chevron-down"
            size={24}
            color={colors.textSecondary}
          />
        </Animated.View>
      </TouchableOpacity>
      {isExpanded && (
        <View
          style={[
            styles.content,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 16,
    borderTopWidth: 1,
  },
}); 