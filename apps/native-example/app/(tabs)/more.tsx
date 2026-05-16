import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const examples = [
  { title: 'PHP Rendering', description: 'Render PHP code with syntax highlighting', route: '/php' },
  { title: 'XML Rendering', description: 'View XML as collapsible tree', route: '/xml' },
  { title: 'CSS Rendering', description: 'Render CSS with syntax highlighting', route: '/css' },
  { title: 'Content Extraction', description: 'Extract links, images, meta from HTML', route: '/extraction' },
];

export default function MoreScreen() {
  const router = useRouter();
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
      <Text style={styles.title}>More Examples</Text>
      {examples.map((item) => (
        <TouchableOpacity
          key={item.route}
          style={styles.card}
          onPress={() => router.push(item.route as any)}
          activeOpacity={0.7}
        >
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDesc}>{item.description}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  title: { fontSize: 28, fontWeight: 'bold', padding: 20, color: '#333' },
  card: {
    backgroundColor: '#fff', marginHorizontal: 16, marginVertical: 8,
    padding: 16, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.1,
    shadowRadius: 4, elevation: 2,
  },
  bottomSpacer: { height: 60 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 4 },
  cardDesc: { fontSize: 14, color: '#666' },
});
