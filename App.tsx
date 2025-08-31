import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native';
import { AppProviders } from './src/app/providers';
import TodosScreen from './src/screens/TodosScreen';

export default function App() {
  return (
    <AppProviders>
      <SafeAreaView style={{ flex: 1 }}>
        <TodosScreen />
        <StatusBar style="auto" />
      </SafeAreaView>
    </AppProviders>
  );
}