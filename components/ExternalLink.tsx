import React from 'react';
import { Linking, Pressable, PressableProps, StyleProp, ViewStyle, PressableStateCallbackType } from 'react-native';
import { Text } from './Themed';
import { useTheme } from '../constants/theme';

interface ExternalLinkProps extends PressableProps {
  href: string;
  children: React.ReactNode;
}

export function ExternalLink({ href, children, style, ...props }: ExternalLinkProps) {
  const { colors } = useTheme();

  const handlePress = async () => {
    try {
      await Linking.openURL(href);
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  const pressableStyle = (state: PressableStateCallbackType): StyleProp<ViewStyle> => {
    const baseStyle: ViewStyle = {
      opacity: state.pressed ? 0.7 : 1,
    };
    
    if (typeof style === 'function') {
      return [baseStyle, style(state)];
    }
    
    return [baseStyle, style];
  };

  return (
    <Pressable
      onPress={handlePress}
      style={pressableStyle}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text style={{ color: colors.primary }}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
} 