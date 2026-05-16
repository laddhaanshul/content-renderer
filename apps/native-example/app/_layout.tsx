import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1a1a2e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '700',
        },
        contentStyle: {
          backgroundColor: '#f5f5f8',
        },
      }}
    >
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="php"
        options={{ title: 'PHP Renderer' }}
      />
      <Stack.Screen
        name="xml"
        options={{ title: 'XML Renderer' }}
      />
      <Stack.Screen
        name="css"
        options={{ title: 'CSS Renderer' }}
      />
      <Stack.Screen
        name="extraction"
        options={{ title: 'Extraction Utils' }}
      />
    </Stack>
  );
}
