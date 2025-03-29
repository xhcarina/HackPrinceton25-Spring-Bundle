import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';

interface FeedToggleProps {
  activeTab: 'contributions' | 'explore';
  onTabChange: (tab: 'contributions' | 'explore') => void;
}

export default function FeedToggle({ activeTab, onTabChange }: FeedToggleProps) {
  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={(value) => onTabChange(value as 'contributions' | 'explore')}
          buttons={[
            { value: 'contributions', label: 'Your Contributions' },
            { value: 'explore', label: 'Explore' },
          ]}
        />
      </View>
    </View>
  );
}

const MAX_WIDTH = Math.min(600, Dimensions.get('window').width);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#fff',
  },
  toggleContainer: {
    width: MAX_WIDTH,
    padding: 16,
  },
}); 