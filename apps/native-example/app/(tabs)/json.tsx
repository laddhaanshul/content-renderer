import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { JSONRenderer } from '@laddhaanshul/content-renderer';

const basicJSON = {
  name: 'Content Renderer',
  version: '1.0.0',
  description: 'Universal content rendering for React Native',
  features: ['HTML', 'JSON', 'Markdown', 'XML', 'PHP', 'CSS'],
  license: 'MIT',
};

const nestedJSON = {
  user: {
    id: 1,
    name: 'Alice Johnson',
    email: 'alice@example.com',
    profile: {
      avatar: 'https://example.com/avatar.jpg',
      bio: 'Full-stack developer',
      settings: {
        theme: 'dark',
        language: 'en',
        notifications: { email: true, push: false },
      },
    },
  },
};

const arrayJSON = [
  { id: 1, name: 'HTML Renderer', status: 'stable', downloads: 15000 },
  { id: 2, name: 'JSON Renderer', status: 'stable', downloads: 12000 },
  { id: 3, name: 'Markdown Renderer', status: 'beta', downloads: 8000 },
  { id: 4, name: 'XML Renderer', status: 'alpha', downloads: 3000 },
];

type Sample = { label: string; data: unknown };
const samples: Record<string, Sample> = {
  basic: { label: 'Object', data: basicJSON },
  nested: { label: 'Nested', data: nestedJSON },
  array: { label: 'Array', data: arrayJSON },
};

export default function JSONScreen() {
  const [activeSample, setActiveSample] = useState('basic');
  const [sortKeys, setSortKeys] = useState(false);
  const [dark, setDark] = useState(false);
  const [readonly, setReadonly] = useState(false);

  const sample = samples[activeSample];

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
      {/* Samples */}
      <View style={styles.sampleBar}>
        {Object.entries(samples).map(([key, { label }]) => (
          <TouchableOpacity
            key={key}
            onPress={() => setActiveSample(key)}
            style={[styles.sampleBtn, activeSample === key && styles.sampleBtnActive]}
          >
            <Text style={[styles.sampleBtnText, activeSample === key && styles.sampleBtnTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Sort</Text>
          <Switch value={sortKeys} onValueChange={setSortKeys} trackColor={{ false: '#ddd', true: '#6c63ff' }} />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Dark</Text>
          <Switch value={dark} onValueChange={setDark} trackColor={{ false: '#ddd', true: '#6c63ff' }} />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Edit</Text>
          <Switch value={!readonly} onValueChange={(val) => setReadonly(!val)} trackColor={{ false: '#ddd', true: '#6c63ff' }} />
        </View>
      </View>

      {/* JSON Tree - uses actual library component */}
      <View style={styles.treeBox}>
        <JSONRenderer
          json={sample.data}
          rootName="root"
          initialExpandDepth={2}
          sortKeys={sortKeys}
          dark={dark}
          readonly={readonly}
          onEdit={(path, next, prev) => console.log('Edit:', path, next)}
          showCopyButton={true}
          showTypes={true}
        />
      </View>

      {/* Usage */}
      <View style={styles.usageBox}>
        <Text style={styles.usageTitle}>Usage</Text>
        <Text style={styles.usageCode}>{`import { JSONRenderer } from '@laddhaanshul/content-renderer';

<JSONRenderer
  json={jsonObject}
  readonly={false}
  onEdit={(path, value) => {}}
  sortKeys={${sortKeys}}
  dark={${dark}}
/>`}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1, backgroundColor: '#f5f5f8' },
  content: { padding: 16, paddingBottom: 80 },
  sampleBar: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  sampleBtn: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0e0',
  },
  sampleBtnActive: { backgroundColor: '#6c63ff', borderColor: '#6c63ff' },
  sampleBtnText: { fontSize: 13, color: '#666', fontWeight: '600' },
  sampleBtnTextActive: { color: '#fff' },
  controls: { flexDirection: 'row', gap: 20, marginBottom: 12 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  switchLabel: { fontSize: 14, color: '#555' },
  treeBox: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#e0e0e0', marginBottom: 16,
  },
  usageBox: {
    backgroundColor: '#f8f8fc', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#e0e0e0',
  },
  usageTitle: { fontSize: 12, fontWeight: '700', color: '#888', marginBottom: 8, textTransform: 'uppercase' },
  usageCode: { fontFamily: 'Menlo', fontSize: 12, color: '#333', lineHeight: 18 },
});
