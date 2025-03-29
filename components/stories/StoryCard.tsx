import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { Card, Text, IconButton, useTheme } from 'react-native-paper';
import { Story } from '../../types/story';

interface StoryCardProps {
  story: Story;
}

export default function StoryCard({ story }: StoryCardProps) {
  const theme = useTheme();

  return (
    <Card style={styles.container}>
      <Card.Title
        title={story.username}
        titleStyle={styles.username}
        left={(props) => (
          <Image
            source={{ uri: 'https://picsum.photos/40/40' }}
            style={styles.avatar}
          />
        )}
      />
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: story.imageUrl }} 
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      <Card.Content style={styles.content}>
        <View style={styles.actions}>
          <IconButton 
            icon="heart-outline" 
            size={24}
            onPress={() => {}} 
          />
          <Text style={styles.likesCount}>{story.likes} likes</Text>
        </View>
        <View style={styles.captionContainer}>
          <Text style={styles.username}>{story.username}</Text>
          <Text style={styles.caption}>{story.caption}</Text>
        </View>
        <Text variant="bodySmall" style={styles.timestamp}>
          {new Date(story.timestamp).toLocaleDateString()}
        </Text>
      </Card.Content>
    </Card>
  );
}

const CARD_WIDTH = Math.min(600, Dimensions.get('window').width);
const IMAGE_ASPECT_RATIO = 1; // Square images like Instagram

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginBottom: 16,
    alignSelf: 'center',
    elevation: 0,
    backgroundColor: '#fff',
    borderRadius: 0,
  },
  imageContainer: {
    width: CARD_WIDTH,
    height: CARD_WIDTH / IMAGE_ASPECT_RATIO,
    backgroundColor: '#fafafa',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  content: {
    padding: 0,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  likesCount: {
    fontWeight: '600',
  },
  username: {
    fontWeight: '600',
    marginRight: 8,
  },
  captionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  caption: {
    flex: 1,
  },
  timestamp: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    color: '#666',
  },
}); 