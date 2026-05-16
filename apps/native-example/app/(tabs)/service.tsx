import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { ContentServiceRenderer } from '@content-renderer/react-and-native';

interface SampleScenario {
  label: string;
  description: string;
  mockResponse: string;
  /** Strategy the mock fetcher should use to extract content from the JSON */
  extractStrategy: 'direct' | 'json-html' | 'aem' | 'headless-cms' | 'json-markdown';
}

const samples: Record<string, SampleScenario> = {
  directHtml: {
    label: 'Direct HTML',
    description: 'API returns raw HTML content directly from a CMS endpoint.',
    mockResponse: `<h1>Welcome</h1>
<p>Build amazing experiences with our content service.</p>
<ul>
  <li>Fast rendering</li>
  <li>Sanitized output</li>
  <li>Cross-platform</li>
</ul>`,
    extractStrategy: 'direct',
  },
  jsonHtml: {
    label: 'JSON + HTML',
    description: 'JSON response with a dedicated HTML content field.',
    mockResponse: JSON.stringify({
      id: 'about',
      title: 'About Us',
      content: '<h2>Our Mission</h2><p>We build tools that make content rendering effortless.</p><blockquote><p>"Great content deserves great rendering."</p></blockquote>',
    }),
    extractStrategy: 'json-html',
  },
  aem: {
    label: 'AEM-style',
    description: 'Adobe Experience Manager nested content structure.',
    mockResponse: JSON.stringify({
      ':type': 'cq/Page',
      'jcr:title': 'WKND Adventures',
      html: '<h2>Featured Trips</h2><p>Explore Yosemite Valley and Big Sur coastline.</p><p>Book your adventure today!</p>',
    }),
    extractStrategy: 'aem',
  },
  headlessCms: {
    label: 'Headless CMS',
    description: 'Contentful / Strapi / Sanity style with rich text HTML.',
    mockResponse: JSON.stringify({
      sys: { id: 'abc123' },
      fields: {
        title: 'Building Modern UIs',
        body: '<h2>Approach Comparison</h2><ul><li>dangerouslySetInnerHTML - Low safety</li><li>HTMLRenderer - High safety</li><li>ContentServiceRenderer - High safety, max flexibility</li></ul><p>Auto-detects format and renders securely.</p>',
      },
    }),
    extractStrategy: 'headless-cms',
  },
  markdown: {
    label: 'Markdown API',
    description: 'API returns Markdown that is converted to HTML for rendering.',
    mockResponse: JSON.stringify({
      id: 'getting-started',
      format: 'markdown',
      markdown: '# Getting Started\n\n1. Install the package\n2. Import the renderer\n3. Pass your API response\n4. Let it handle the rest\n\nContent is automatically sanitized.',
    }),
    extractStrategy: 'json-markdown',
  },
};

/**
 * Create a mock fetcher that returns the given response body.
 * This simulates an API endpoint so ContentServiceRenderer works offline.
 */
function createMockFetcher(responseBody: string) {
  return async (_url: string, _options?: RequestInit): Promise<Response> => {
    return new Response(responseBody, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };
}

export default function ServiceScreen() {
  const [activeSample, setActiveSample] = useState('directHtml');
  const [showSource, setShowSource] = useState(false);

  const sample = samples[activeSample];

  // Build a mock fetcher + config for the active scenario
  const mockFetcher = useMemo(
    () => createMockFetcher(sample.mockResponse),
    [sample.mockResponse],
  );

  const config = useMemo(
    () => ({
      fetcher: mockFetcher,
      extractStrategy: sample.extractStrategy,
    }),
    [mockFetcher, sample.extractStrategy],
  );

  // Generate a pretty-printed JSON string of the mock response for the source viewer
  const prettyResponse = useMemo(() => {
    try {
      return JSON.stringify(JSON.parse(sample.mockResponse), null, 2);
    } catch {
      // If it's not JSON (e.g. direct HTML), show it as-is
      return sample.mockResponse;
    }
  }, [sample.mockResponse]);

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
      {/* Sample selector */}
      <View style={styles.sampleBar}>
        {Object.entries(samples).map(([key, { label }]) => (
          <TouchableOpacity
            key={key}
            onPress={() => setActiveSample(key)}
            style={[
              styles.sampleBtn,
              activeSample === key && styles.sampleBtnActive,
            ]}
          >
            <Text
              style={[
                styles.sampleBtnText,
                activeSample === key && styles.sampleBtnTextActive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Scenario info */}
      <View style={styles.scenarioInfo}>
        <View style={styles.scenarioBadge}>
          <Text style={styles.scenarioBadgeText}>{sample.label}</Text>
        </View>
        <Text style={styles.scenarioDesc}>{sample.description}</Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Show Source</Text>
          <TouchableOpacity
            style={[styles.toggleBtn, showSource && styles.toggleBtnActive]}
            onPress={() => setShowSource(!showSource)}
          >
            <Text style={[styles.toggleBtnText, showSource && styles.toggleBtnTextActive]}>
              {showSource ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Mock API Response */}
      {showSource && (
        <View style={styles.sourceBox}>
          <Text style={styles.sourceTitle}>Mock API Response</Text>
          <Text style={styles.sourceCode}>{prettyResponse}</Text>
        </View>
      )}

      {/* Live ContentServiceRenderer demo */}
      <View style={styles.previewBox}>
        <Text style={styles.previewTitle}>
          Live Rendered Output
        </Text>
        <ContentServiceRenderer
          url="https://mock-api.example.com/content"
          config={config}
          fetchKey={activeSample}
          sanitize={true}
        />
      </View>

      {/* Usage */}
      <View style={styles.usageBox}>
        <Text style={styles.usageTitle}>Usage</Text>
        <Text style={styles.usageCode}>{`import { ContentServiceRenderer } from '@content-renderer/react-and-native';

// Fetch from a real URL
<ContentServiceRenderer
  url="https://api.example.com/page"
  extractStrategy="auto"
/>

// Use a custom fetcher (for auth, mocking, etc.)
<ContentServiceRenderer
  url="https://api.example.com/page"
  config={{
    fetcher: myCustomFetcher,
    extractStrategy: 'headless-cms',
  }}
  sanitize={true}
/>`}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1, backgroundColor: '#f5f5f8' },
  content: { padding: 16, paddingBottom: 80 },
  sampleBar: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  sampleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sampleBtnActive: { backgroundColor: '#6c63ff', borderColor: '#6c63ff' },
  sampleBtnText: { fontSize: 13, color: '#666', fontWeight: '600' },
  sampleBtnTextActive: { color: '#fff' },
  scenarioInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f8fc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  scenarioBadge: {
    backgroundColor: '#6c63ff',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  scenarioBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  scenarioDesc: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
    flex: 1,
  },
  controls: { flexDirection: 'row', gap: 20, marginBottom: 16 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  switchLabel: { fontSize: 14, color: '#555' },
  toggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  toggleBtnActive: { backgroundColor: '#6c63ff', borderColor: '#6c63ff' },
  toggleBtnText: { fontSize: 12, fontWeight: '700', color: '#888' },
  toggleBtnTextActive: { color: '#fff' },
  sourceBox: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sourceTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6c63ff',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  sourceCode: {
    fontFamily: 'Menlo',
    fontSize: 12,
    color: '#cdd6f4',
    lineHeight: 18,
  },
  previewBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  usageBox: {
    backgroundColor: '#f8f8fc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  usageTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  usageCode: {
    fontFamily: 'Menlo',
    fontSize: 12,
    color: '#333',
    lineHeight: 18,
  },
});
