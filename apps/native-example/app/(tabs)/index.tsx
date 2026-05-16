import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';

const features = [
  { title: 'HTML Renderer', description: 'Render HTML with <style> CSS, class selectors, media queries, SVG, media placeholders', route: '/html' },
  { title: 'JSON Renderer', description: 'Collapsible JSON tree with search, copy, and type display', route: '/json' },
  { title: 'Code Renderer', description: 'Syntax highlighting for 20+ languages with dark/light themes', route: '/code' },
  { title: 'Markdown Renderer', description: 'Full GFM: tables, tasks, footnotes, ref links, math, emoji, highlights, definition lists', route: '/markdown' },
  { title: 'PHP Renderer', description: 'PHP syntax highlighting with OOP, closures, and line numbers', route: '/php' },
  { title: 'XML Renderer', description: 'Collapsible tree view for XML, SOAP, and config files', route: '/xml' },
  { title: 'CSS Renderer', description: 'CSS syntax highlighting with media queries, variables, and keyframes', route: '/css' },
  { title: 'Content Service', description: 'Auto-detect and render API responses (AEM, CMS, Markdown)', route: '/service' },
  { title: 'Extraction Utils', description: 'Extract links, images, meta, headings, SEO, OG, tables', route: '/extraction' },
  { title: 'CSS Engine', description: 'Full CSS cascade: <style> tags, class selectors, @media, var(), calc(), specificity', route: '/html' },
  { title: 'SVG Rendering', description: 'Inline SVG shapes, gradients, text rendered as native components', route: '/html' },
  { title: 'Virtualized HTML', description: 'FlatList-based virtualized rendering for large documents', route: '/html' },
  { title: 'Rowspan Tables', description: 'Full table support with rowspan/colspan and column width calculation', route: '/html' },
  { title: 'Media Placeholders', description: 'Graceful video/audio/canvas/iframe placeholders with accessibility labels', route: '/html' },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroIcon}>◆</Text>
        <Text style={styles.heroTitle}>Content Renderer</Text>
        <Text style={styles.heroSubtitle}>
          Universal content rendering for React Native &amp; Web
        </Text>
        <View style={styles.versionRow}>
          <Text style={styles.heroVersion}>v3.0.0</Text>
          <Text style={styles.heroBadge}>CSS Engine</Text>
          <Text style={styles.heroBadge}>Full GFM</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>100+</Text>
          <Text style={styles.statLabel}>HTML Tags</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>7</Text>
          <Text style={styles.statLabel}>Renderers</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>~0</Text>
          <Text style={styles.statLabel}>Extra Deps</Text>
        </View>
      </View>

      {/* Features Grid */}
      <Text style={styles.sectionTitle}>Examples</Text>
      <View style={styles.grid}>
        {features.map((feature) => (
          <TouchableOpacity
            key={feature.title}
            style={styles.card}
            onPress={() => router.push(feature.route as any)}
            activeOpacity={0.7}
          >
            <View style={styles.cardContent}>
              <View>
                <Text style={styles.cardTitle}>{feature.title}</Text>
                <Text style={styles.cardDescription}>{feature.description}</Text>
              </View>
              <View style={styles.cardArrow}>
                <Text style={styles.cardArrowText}>→</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Built with @content-renderer/react-and-native &amp; @content-renderer/core
        </Text>
        <Text style={styles.footerSubtext}>
          MIT License • Open Source • Zero-dependency core
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1, backgroundColor: '#f5f5f8' },
  content: { padding: 20, paddingBottom: 80 },
  hero: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 20,
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
  },
  heroIcon: { fontSize: 36, color: '#6c63ff', marginBottom: 8 },
  heroTitle: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 15, color: '#8888aa', marginTop: 6, textAlign: 'center' },
  versionRow: { flexDirection: 'row', gap: 8, marginTop: 10, alignItems: 'center' },
  heroVersion: { fontSize: 12, color: '#6c63ff', backgroundColor: '#6c63ff22', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, overflow: 'hidden' },
  heroBadge: { fontSize: 10, color: '#00d4ff', backgroundColor: '#00d4ff18', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: 'hidden' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statBox: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e0e0e0' },
  statNumber: { fontSize: 22, fontWeight: '800', color: '#6c63ff' },
  statLabel: { fontSize: 11, color: '#888', marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a2e', marginBottom: 12 },
  grid: { gap: 10 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#e0e0e0',
  },
  cardContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a2e', marginBottom: 2 },
  cardDescription: { fontSize: 12.5, color: '#666', lineHeight: 17, flex: 1 },
  cardArrow: { marginLeft: 10, width: 28, height: 28, borderRadius: 8, backgroundColor: '#6c63ff18', justifyContent: 'center', alignItems: 'center' },
  cardArrowText: { color: '#6c63ff', fontSize: 16, fontWeight: '700' },
  footer: { alignItems: 'center', marginTop: 28, paddingVertical: 20 },
  footerText: { fontSize: 13, color: '#888', fontWeight: '600' },
  footerSubtext: { fontSize: 11, color: '#aaa', marginTop: 4 },
});
