import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Text } from './Themed';
import { useTheme } from '../constants/theme';

export function HelloWave() {
  const { colors } = useTheme();

  const waveStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: withRepeat(
            withSequence(
              withDelay(500, withTiming('20deg', { duration: 500, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })),
              withTiming('-20deg', { duration: 500, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
              withTiming('0deg', { duration: 500, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
            ),
            -1,
            true
          ),
        },
      ],
    };
  });

  return (
    <Text style={styles.container}>
      Hello
      <Animated.Text style={[styles.wave, waveStyle, { color: colors.primary }]}>
        👋
      </Animated.Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  container: {
    fontSize: 24,
    fontWeight: 'bold',
    flexDirection: 'row',
    alignItems: 'center',
  },
  wave: {
    fontSize: 24,
    marginLeft: 8,
  },
}); 