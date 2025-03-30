import { ColorSchemeName } from 'react-native';

/**
 * Override the system color scheme to always return 'light'
 */
export function useColorScheme(): NonNullable<ColorSchemeName> {
  return 'light';
}
