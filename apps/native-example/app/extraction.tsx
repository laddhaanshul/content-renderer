import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { extractLinks, extractImages, extractMeta, extractHeadings, extractSEO } from '@content-renderer/core';

const sampleHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="description" content="Sample page for content extraction">
  <meta name="keywords" content="react, content-renderer, parsing">
  <meta property="og:title" content="Content Renderer">
  <meta property="og:description" content="Universal content rendering">
  <meta property="og:image" content="https://example.com/og.png">
  <title>Content Renderer Demo</title>
</head>
<body>
  <h1>Main Heading</h1>
  <h2>Sub Heading</h2>
  <p>Some paragraph with a <a href="https://example.com">link</a>.</p>
  <img src="https://example.com/image.png" alt="Example image">
  <img src="https://example.com/photo.jpg" alt="Photo" width="800" height="600">
  <a href="https://github.com/repo" target="_blank">GitHub</a>
  <a href="/about" rel="nofollow">About</a>
  <a href="#section">Jump to section</a>
  <p>Another paragraph with another <a href="https://external.com/page" title="External">external link</a>.</p>
  <h3>Third Level</h3>
  <p>Content continues...</p>
</body>
</html>`;

export default function ExtractionScreen() {
  const links = extractLinks(sampleHTML);
  const images = extractImages(sampleHTML);
  const meta = extractMeta(sampleHTML);
  const headings = extractHeadings(sampleHTML);
  const seo = extractSEO(sampleHTML);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Content Extraction</Text>

      <Text style={styles.sectionTitle}>Extracted Links ({links.length})</Text>
      {links.map((link, i) => (
        <View key={i} style={styles.item}>
          <Text style={styles.itemText}>{link.text}</Text>
          <Text style={styles.itemSub}>{link.href} {link.isExternal ? '(external)' : ''}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Extracted Images ({images.length})</Text>
      {images.map((img, i) => (
        <View key={i} style={styles.item}>
          <Text style={styles.itemText}>{img.alt}</Text>
          <Text style={styles.itemSub}>{img.src}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Extracted Meta Tags ({meta.length})</Text>
      {meta.map((m, i) => (
        <View key={i} style={styles.item}>
          <Text style={styles.itemText}>{m.name || m.property || m.charset || 'http-equiv'}</Text>
          <Text style={styles.itemSub}>{m.content}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Extracted Headings ({headings.length})</Text>
      {headings.map((h, i) => (
        <View key={i} style={styles.item}>
          <Text style={styles.itemText}>H{h.level}: {h.text}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>SEO Data</Text>
      <View style={styles.item}>
        <Text style={styles.itemText}>Title: {seo.title}</Text>
        <Text style={styles.itemText}>Description: {seo.description}</Text>
        <Text style={styles.itemText}>Keywords: {seo.keywords}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', padding: 16, color: '#333' },
  sectionTitle: { fontSize: 18, fontWeight: '600', padding: 16, paddingBottom: 8, color: '#6c63ff' },
  item: { backgroundColor: '#fff', marginHorizontal: 16, marginVertical: 4, padding: 12, borderRadius: 8 },
  itemText: { fontSize: 14, fontWeight: '500', color: '#333' },
  itemSub: { fontSize: 12, color: '#666', marginTop: 2 },
});
