import { StyleSheet } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { Card, Text, List, Divider } from 'react-native-paper';

export default function InvestmentsScreen() {
  return (
    <ThemedView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Investments</Text>
      <ThemedView style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge">Portfolio Summary</Text>
          <Text variant="displaySmall" style={styles.balance}>$25,000</Text>
          <Text variant="bodyMedium" style={styles.change}>+2.5% this month</Text>
        </Card.Content>
      </Card>

      <List.Section>
        <List.Subheader>Your Investments</List.Subheader>
        <List.Item
          title="Stocks"
          description="Tech and Growth"
          left={props => <List.Icon {...props} icon="chart-line" />}
        />
        <Divider />
        <List.Item
          title="Bonds"
          description="Government Bonds"
          left={props => <List.Icon {...props} icon="treasury" />}
        />
      </List.Section>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 20,
  },
  balance: {
    marginTop: 10,
    marginBottom: 5,
  },
  change: {
    color: '#4CAF50',
  },
}); 