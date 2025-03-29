import { StyleSheet } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { Button, Card, Text, useTheme } from 'react-native-paper';

export default function HomeScreen() {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Welcome Home</Text>
      <ThemedView style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge">Quick Actions</Text>
          <Text variant="bodyMedium">Manage your finances with ease</Text>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained" onPress={() => {}}>View Balance</Button>
          <Button mode="outlined" onPress={() => {}}>Transfer</Button>
        </Card.Actions>
      </Card>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  title: {
    marginTop: 20,
    marginBottom: 10,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '100%',
  },
  card: {
    width: '100%',
    marginTop: 20,
  },
}); 