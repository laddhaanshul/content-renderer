import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6c63ff',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: insets.bottom > 0 ? insets.bottom : 4,
          height: 56 + (insets.bottom > 0 ? insets.bottom - 4 : 0),
        },
        tabBarLabelStyle: styles.tabLabel,
        headerStyle: {
          backgroundColor: '#1a1a2e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="html"
        options={{
          title: 'HTML',
        }}
      />
      <Tabs.Screen
        name="json"
        options={{
          title: 'JSON',
        }}
      />
      <Tabs.Screen
        name="code"
        options={{
          title: 'Code',
        }}
      />
      <Tabs.Screen
        name="markdown"
        options={{
          title: 'MD',
        }}
      />
      <Tabs.Screen
        name="service"
        options={{
          title: 'Service',
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
