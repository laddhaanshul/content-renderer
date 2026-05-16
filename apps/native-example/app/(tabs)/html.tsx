import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { HTMLRenderer, VirtualizedHTMLRenderer } from '@content-renderer/react-and-native';

const samples: Record<string, { label: string; code: string }> = {
  basic: {
    label: 'Basic',
    code: `<h1>Hello World</h1>
<p>This is <strong>HTML content</strong> rendered natively.</p>
<h2>Features</h2>
<ul>
  <li>HTML Parsing</li>
  <li>Sanitization</li>
  <li>Custom Renderers</li>
</ul>`,
  },
  styled: {
    label: 'Styled',
    code: `<div style="padding: 16px; background: #6c63ff; border-radius: 12px;">
  <h2 style="color: white; margin: 0 0 8px;">Styled Card</h2>
  <p style="color: rgba(255,255,255,0.9); margin: 0;">This card uses inline styles rendered as native styles.</p>
</div>`,
  },
  table: {
    label: 'Table',
    code: `<h2>Component List</h2>
<table>
  <tr><th>Name</th><th>Type</th><th>Status</th></tr>
  <tr><td colspan="2">HTMLRenderer + MarkdownRenderer</td><td>Stable</td></tr>
  <tr><td>JSONRenderer</td><td>Component</td><td>Stable</td></tr>
  <tr><td>CodeRenderer</td><td>Component</td><td>Beta</td></tr>
</table>`,
  },
  details: {
    label: 'Details',
    code: `<details open>
  <summary>What is content-renderer?</summary>
  <p>content-renderer is a universal content rendering library for React and React Native.</p>
  <details>
    <summary>Key Features</summary>
    <ul>
      <li>HTML, Markdown, JSON, Code, XML, PHP rendering</li>
      <li>CSS engine with @media support</li>
      <li>Alterers API for DOM transforms</li>
    </ul>
  </details>
</details>`,
  },
  rtl: {
    label: 'RTL',
    code: `<div dir="rtl">
  <h2>Arabic / Hebrew Content</h2>
  <p style="text-align: right;">This is right-to-left text. The dir="rtl" attribute flips the text direction.</p>
  <p style="text-align: right;">مرحبا بالعالم — Hello World in Arabic</p>
</div>`,
  },
  media: {
    label: 'Media',
    code: `<h2>Media Elements</h2>
<video src="https://example.com/video.mp4" controls poster="https://picsum.photos/400/225" width="400" height="225"></video>
<audio src="https://example.com/audio.mp3" controls></audio>
<canvas width="300" height="150"></canvas>`,
  },
  svg: {
    label: 'SVG',
    code: `<div style="text-align: center; padding: 16px;">
    <h3>SVG with Text</h3>
    <svg width="200" height="100" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="100" fill="#6c63ff" rx="12" />
      <text x="100" y="55" font-size="18" fill="white" text-anchor="middle">Hello SVG</text>
    </svg>
    <p>SVG text rendered natively</p>
</div>`,
  },
  dialog: {
    label: 'Dialog',
    code: `<h2>Dialog / Modal</h2>
<p>The dialog element renders as a native modal overlay.</p>
<dialog open>
  <h3>Modal Title</h3>
  <p>This is a dialog element rendered as a native modal.</p>
</dialog>`,
  },
};

export default function HTMLScreen() {
  const [activeSample, setActiveSample] = useState('basic');
  const [showSource, setShowSource] = useState(false);

  const sample = samples[activeSample];

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
      <View style={styles.sampleBar}>
        {Object.entries(samples).map(([key, { label }]) => (
          <TouchableOpacity
            key={key}
            onPress={() => setActiveSample(key)}
            style={[styles.sampleBtn, activeSample === key && styles.sampleBtnActive]}
          >
            <Text style={[styles.sampleBtnText, activeSample === key && styles.sampleBtnTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.controls}>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Source</Text>
          <Switch value={showSource} onValueChange={setShowSource} trackColor={{ false: '#ddd', true: '#6c63ff' }} />
        </View>
      </View>

      {showSource && (
        <View style={styles.sourceBox}>
          <Text style={styles.sourceTitle}>HTML Source</Text>
          <Text style={styles.sourceCode}>{sample.code}</Text>
        </View>
      )}

      <View style={styles.previewBox}>
        <Text style={styles.previewTitle}>Rendered Output</Text>
        <HTMLRenderer
          html={sample.code}
          onLinkPress={(url) => { if (!url.startsWith('/')) Linking.openURL(url).catch(() => {}); }}
          onFormChange={(name, value) => { console.log('Form change:', name, value); }}
          idsStyles={{
            'special-card': { backgroundColor: '#fef3c7', borderRadius: 12, padding: 16 },
          }}
        />
      </View>

      <View style={styles.usageBox}>
        <Text style={styles.usageTitle}>Usage</Text>
        <Text style={styles.usageCode}>{`<HTMLRenderer
  html={htmlString}
  onLinkPress={(url) => Linking.openURL(url)}
  alterers={[
    (node) => {
      // Pre-process nodes before rendering
      if (node.name === 'center') {
        return { ...node, attribs: { ...node.attribs, style: 'text-align:center' } };
      }
      return node;
    },
  ]}
  idsStyles={{ 'my-id': { color: 'red' } }}
  onFormChange={(name, value) => console.log(name, value)}
/>`}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1, backgroundColor: '#f5f5f8' },
  content: { padding: 16, paddingBottom: 80 },
  sampleBar: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  sampleBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0e0' },
  sampleBtnActive: { backgroundColor: '#6c63ff', borderColor: '#6c63ff' },
  sampleBtnText: { fontSize: 13, color: '#666', fontWeight: '600' },
  sampleBtnTextActive: { color: '#fff' },
  controls: { flexDirection: 'row', gap: 20, marginBottom: 16 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  switchLabel: { fontSize: 14, color: '#555' },
  sourceBox: { backgroundColor: '#1a1a2e', borderRadius: 12, padding: 16, marginBottom: 16 },
  sourceTitle: { fontSize: 12, fontWeight: '700', color: '#6c63ff', marginBottom: 8, textTransform: 'uppercase' },
  sourceCode: { fontFamily: 'Menlo', fontSize: 12, color: '#cdd6f4', lineHeight: 18 },
  previewBox: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e0e0e0', marginBottom: 16 },
  previewTitle: { fontSize: 12, fontWeight: '700', color: '#888', marginBottom: 12, textTransform: 'uppercase' },
  usageBox: { backgroundColor: '#f8f8fc', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e0e0e0' },
  usageTitle: { fontSize: 12, fontWeight: '700', color: '#888', marginBottom: 8, textTransform: 'uppercase' },
  usageCode: { fontFamily: 'Menlo', fontSize: 12, color: '#333', lineHeight: 18 },
});
