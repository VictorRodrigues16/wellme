import { Tabs } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { TabBar } from '../../src/components/TabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Trilha' }} />
      <Tabs.Screen name="conquistas" options={{ title: 'Conquistas' }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
