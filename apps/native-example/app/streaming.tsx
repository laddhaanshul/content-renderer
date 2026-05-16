import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StreamingContentRenderer } from '@laddhaanshul/content-renderer';

/**
 * Mock stream generator for Native (simulates ReadableStream)
 */
function createMockStream(content: string, chunkSize: number = 10, delay: number = 200) {
  const parts: string[] = [];
  for (let i = 0; i < content.length; i += chunkSize) {
    parts.push(content.slice(i, i + chunkSize));
  }

  // In a real app, this would be a fetch response.body or similar.
  // For the mock, we implement a simple version of the ReadableStream interface.
  let index = 0;

  return {
    getReader() {
      return {
        async read() {
          if (index >= parts.length) {
            return { done: true, value: undefined };
          }
          await new Promise(r => setTimeout(r, delay));
          const value = parts[index++];
          return { done: false, value };
        },
        releaseLock() {}
      };
    },
    cancel() {
      return Promise.resolve();
    }
  };
}

/**
 * Mock AST stream generator for Native
 */
function createMockASTStream(delay: number = 300) {
  const nodes = [
    { type: 'tag', name: 'h1', children: [{ type: 'text', data: 'Native AST Streaming' }] },
    { type: 'tag', name: 'p', children: [{ type: 'text', data: 'This content arrives as pre-parsed nodes, bypassing HTML parsing.' }] },
    { type: 'tag', name: 'div', attribs: { style: 'background-color: #f0f9ff; padding: 12px; border-radius: 8px; border-left-width: 4px; border-left-color: #0ea5e9;' }, children: [
        { type: 'tag', name: 'strong', children: [{ type: 'text', data: 'Efficiency:' }] },
        { type: 'text', data: ' Direct rendering from AST is faster on mobile.' }
    ]},
    { type: 'tag', name: 'ul', children: [
        { type: 'tag', name: 'li', children: [{ type: 'text', data: 'Smooth incremental updates' }] },
        { type: 'tag', name: 'li', children: [{ type: 'text', data: 'Low memory overhead' }] },
        { type: 'tag', name: 'li', children: [{ type: 'text', data: 'Consistent cross-platform logic' }] },
    ]}
  ];

  let index = 0;
  return {
    getReader() {
      return {
        async read() {
          if (index >= nodes.length) {
            return { done: true, value: undefined };
          }
          await new Promise(r => setTimeout(r, delay));
          return { done: false, value: nodes[index++] };
        },
        releaseLock() {}
      };
    },
    cancel() {
      return Promise.resolve();
    }
  };
}

const SAMPLE_HTML = `
  <div style="padding: 10px;">
    <h1 style="color: #6c63ff;">Streaming Content Demo</h1>
    <p>This content is arriving in small chunks over a mock network stream.</p>
    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
      <h2 style="font-size: 18px;">Real-time Rendering</h2>
      <p style="color: #4b5563;">Notice how the view updates incrementally as new bytes are received. This is perfect for AI responses.</p>
    </div>
    <ul style="margin-left: 20px;">
      <li style="margin-bottom: 5px;">Chunk 1 received...</li>
      <li style="margin-bottom: 5px;">Chunk 2 received...</li>
      <li style="margin-bottom: 5px;">Chunk 3 received...</li>
    </ul>
    <p>The <strong>StreamingContentRenderer</strong> handles the complexity of merging chunks and triggering React updates.</p>
    <div style="height: 150px; background-color: #e5e7eb; border-radius: 8px; justify-content: center; align-items: center; margin-top: 15px;">
       <p style="color: #9ca3af;">[Image Placeholder]</p>
    </div>
  </div>
`;

export default function StreamingScreen() {
  const [stream, setStream] = useState<any>(null);
  const [astStream, setAstStream] = useState<any>(null);
  const [key, setKey] = useState(0);

  const startStream = useCallback(() => {
    setAstStream(null);
    setStream(null);
    
    setTimeout(() => {
      setKey(Date.now());
      setStream(createMockStream(SAMPLE_HTML, 15, 80));
    }, 50);
  }, []);

  const startASTStream = useCallback(() => {
    setStream(null);
    setAstStream(null);
    
    setTimeout(() => {
      setKey(Date.now());
      setAstStream(createMockASTStream(500));
    }, 50);
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Streaming Content</Text>
      <Text style={styles.subtitle}>Incremental rendering for both HTML and AST streams.</Text>

      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.button} onPress={startStream}>
          <Text style={styles.buttonText}>Start HTML Stream</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={startASTStream}>
          <Text style={styles.buttonText}>Start AST Stream</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.renderArea}>
        <StreamingContentRenderer
          key={key}
          stream={stream}
          astStream={astStream}
          fallback={
            <View style={styles.fallback}>
              <Text style={styles.fallbackText}>Tap a button above to start the stream</Text>
            </View>
          }
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6b7280', marginBottom: 24 },
  toolbar: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  button: {
    flex: 1,
    backgroundColor: '#6c63ff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonSecondary: {
    backgroundColor: '#10b981',
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  renderArea: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    minHeight: 300,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  fallbackText: {
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
