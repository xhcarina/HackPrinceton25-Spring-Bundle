import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from './Themed';

export default function EditScreenInfo() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Welcome to Bundle
      </Text>
      <Text style={styles.subtitle}>
        Your personal finance companion
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
});
