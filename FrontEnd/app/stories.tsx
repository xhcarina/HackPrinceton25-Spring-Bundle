import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FAB, useTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import FeedToggle from '../components/stories/FeedToggle';
import StoryCard from '../components/stories/StoryCard';
import CreatePostModal from '../components/stories/CreatePostModal';
import { Story } from '../types/story';

// Temporary mock data
const MOCK_STORIES: Story[] = [
  {
    id: '1',
    imageUrl: 'https://picsum.photos/400/400',
    username: 'user1',
    caption: 'This is a beautiful day!',
    likes: 123,
    timestamp: new Date().toISOString(),
  },
  // Add more mock stories as needed
];

export default function StoriesScreen() {
  const [activeTab, setActiveTab] = useState<'contributions' | 'explore'>('contributions');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const theme = useTheme();

  const renderStory = ({ item }: { item: Story }) => (
    <StoryCard story={item} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <FeedToggle activeTab={activeTab} onTabChange={setActiveTab} />
      <FlatList
        data={MOCK_STORIES}
        renderItem={renderStory}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContainer}
      />
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setIsModalVisible(true)}
      />
      <CreatePostModal
        visible={isModalVisible}
        onDismiss={() => setIsModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  feedContainer: {
    padding: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
}); 