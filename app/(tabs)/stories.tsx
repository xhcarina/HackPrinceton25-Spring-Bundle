import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FAB, useTheme, Text, Card, IconButton, Avatar, Divider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import FeedToggle from '../../components/stories/FeedToggle';
import CreatePostModal from '../../components/stories/CreatePostModal';
import { Story } from '../../types/story';

// Temporary mock data with more realistic images
const MOCK_STORIES: Story[] = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba',
    username: 'TravelLover',
    caption: 'Exploring the beautiful mountains today! 🏔️',
    likes: 123,
    timestamp: new Date().toISOString(),
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1682687221038-404670f09ef1',
    username: 'FoodieAdventures',
    caption: 'Delicious local cuisine! 🍜',
    likes: 456,
    timestamp: new Date().toISOString(),
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1682687220067-dced0a5863c5',
    username: 'NaturePhotography',
    caption: 'Sunset at the beach 🌅',
    likes: 789,
    timestamp: new Date().toISOString(),
  },
];

export default function StoriesScreen() {
  const [activeTab, setActiveTab] = useState<'contributions' | 'explore'>('contributions');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const theme = useTheme();

  const renderStory = ({ item }: { item: Story }) => (
    <Card style={styles.storyCard}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.storyHeader}>
          <Avatar.Image size={40} source={{ uri: item.imageUrl }} />
          <View style={styles.storyHeaderText}>
            <Text variant="titleMedium">{item.username}</Text>
            <Text variant="bodySmall" style={{ color: '#666' }}>
              {new Date(item.timestamp).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <Image 
          source={{ uri: item.imageUrl }} 
          style={styles.storyImage}
          resizeMode="cover"
        />
        <Text variant="bodyMedium" style={styles.caption}>{item.caption}</Text>
        <View style={styles.storyActions}>
          <IconButton icon="heart-outline" size={20} onPress={() => {}} />
          <Text variant="bodySmall">{item.likes} likes</Text>
          <IconButton icon="comment-outline" size={20} onPress={() => {}} />
          <IconButton icon="share-outline" size={20} onPress={() => {}} />
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerTitle}>Stories</Text>
      </View>
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
  );
}

const MAX_WIDTH = Math.min(600, Dimensions.get('window').width);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  feedContainer: {
    width: MAX_WIDTH,
    alignItems: 'center',
    padding: 16,
  },
  storyCard: {
    width: '100%',
    marginBottom: 16,
    elevation: 2,
  },
  cardContent: {
    padding: 0,
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  storyHeaderText: {
    marginLeft: 12,
  },
  storyImage: {
    width: '100%',
    height: 400,
    backgroundColor: '#f0f0f0',
  },
  caption: {
    padding: 12,
    marginBottom: 8,
  },
  storyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 16,
    bottom: 16,
  },
}); 