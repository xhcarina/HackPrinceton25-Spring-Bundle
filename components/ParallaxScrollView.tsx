import React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

interface ParallaxScrollViewProps {
  children: React.ReactNode;
  headerImage: React.ReactNode;
  headerBackgroundColor: { light: string; dark: string };
  headerHeight?: number;
  style?: ViewStyle;
}

export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
  headerHeight = 300,
  style,
}: ParallaxScrollViewProps) {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
    onMomentumEnd: () => {
      // Optional: Add any cleanup or final position adjustments here
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [-headerHeight, 0, headerHeight],
      [-headerHeight / 2, 0, headerHeight * 0.75],
      'clamp'
    );

    const opacity = interpolate(
      scrollY.value,
      [0, headerHeight],
      [1, 0],
      'clamp'
    );

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  return (
    <Animated.ScrollView
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      style={[styles.container, style]}
    >
      <View style={[styles.header, { height: headerHeight }]}>
        <Animated.View style={[styles.headerImage, headerAnimatedStyle]}>
          {headerImage}
        </Animated.View>
      </View>
      <View style={styles.content}>
        {children}
      </View>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'relative',
    overflow: 'hidden',
  },
  headerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
}); 