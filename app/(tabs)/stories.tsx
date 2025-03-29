import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FAB, useTheme, PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import FeedToggle from '../../components/stories/FeedToggle';
import StoryCard from '../../components/stories/StoryCard';
import CreatePostModal from '../../components/stories/CreatePostModal';
import { Story } from '../../types/story';

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
  {
    id: '2',
    imageUrl: 'https://picsum.photos/400/401',
    username: 'user2',
    caption: 'Another amazing post!',
    likes: 456,
    timestamp: new Date().toISOString(),
  },
];

export default function StoriesScreen() {
  const [activeTab, setActiveTab] = useState<'contributions' | 'explore'>('contributions');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const theme = useTheme();

  const renderStory = ({ item }: { item: Story }) => (
    <StoryCard story={item} />
  );

  return (
    <PaperProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <FeedToggle activeTab={activeTab} onTabChange={setActiveTab} />
        <View style={styles.contentContainer}>
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
        </View>
        <CreatePostModal
          visible={isModalVisible}
          onDismiss={() => setIsModalVisible(false)}
        />
      </SafeAreaView>
    </PaperProvider>
  );
}

const MAX_WIDTH = Math.min(600, Dimensions.get('window').width);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  feedContainer: {
    width: MAX_WIDTH,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 16,
    bottom: 16,
  },
}); 