import { StyleSheet } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { Card, Text, List, Divider, Button, useTheme } from 'react-native-paper';

export default function LoansScreen() {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Loans</Text>
      <ThemedView style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge">Total Outstanding</Text>
          <Text variant="displaySmall" style={styles.balance}>$15,000</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>3 Active Loans</Text>
        </Card.Content>
      </Card>

      <List.Section>
        <List.Subheader>Active Loans</List.Subheader>
        <List.Item
          title="Home Mortgage"
          description="Remaining: $10,000"
          left={props => <List.Icon {...props} icon="home" />}
          right={props => <Text {...props}>$500/mo</Text>}
        />
        <Divider />
        <List.Item
          title="Car Loan"
          description="Remaining: $3,000"
          left={props => <List.Icon {...props} icon="car" />}
          right={props => <Text {...props}>$200/mo</Text>}
        />
        <Divider />
        <List.Item
          title="Personal Loan"
          description="Remaining: $2,000"
          left={props => <List.Icon {...props} icon="cash" />}
          right={props => <Text {...props}>$150/mo</Text>}
        />
      </List.Section>

      <Button 
        mode="contained" 
        style={styles.button}
        onPress={() => {}}
      >
        Apply for New Loan
      </Button>
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
  subtitle: {
    color: '#666',
  },
  button: {
    marginTop: 20,
  },
}); 