import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Bundle',
  slug: 'bundle',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.bundle.app'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.bundle.app'
  },
  web: {
    favicon: './assets/favicon.png'
  },
  scheme: 'bundle',
  plugins: [
    'expo-router'
  ],
  extra: {
    paypalClientId: 'AdqPLeYaL9BbKBe4dg7JdW54VyGIpAvnJ7nFIMBvjFa517ZEQ1ZykPMwOkwbvZz4rxE3iwAGkdRlCSOx',
    paypalClientSecret: 'EFf8mcSIUYBgiYERnzmBp83JHnygAujvQxNT1rfhbbOTUaX5YtjbRAbI4YcfM5wE7FZdDMj3D_YnFLJ6'
  },
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true
  },
  owner: 'bundle',
  sdkVersion: '52.0.0',
  platforms: ['ios', 'android', 'web'],
}); 