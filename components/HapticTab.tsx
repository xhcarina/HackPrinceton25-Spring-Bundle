import React from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';

export function HapticTab(props: BottomTabBarButtonProps) {
  const handlePress = async () => {
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    props.onPress?.();
  };

  return (
    <props.Component
      {...props}
      onPress={handlePress}
    />
  );
} 