import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { CodeRenderer } from '@content-renderer/react-and-native';

const samples: Record<string, { label: string; code: string; language: string }> = {
  js: {
    label: 'JavaScript',
    language: 'javascript',
    code: `// Content Renderer Core
import { HTMLParser, JSONParser } from '@content-renderer/core';

class Renderer {
  #parsers = new Map();

  constructor() {
    this.#parsers.set('html', new HTMLParser());
    this.#parsers.set('json', new JSONParser());
  }

  async render(content, type) {
    const parser = this.#parsers.get(type);
    if (!parser) throw new Error(\`Unknown: \${type}\`);
    return parser.parse(content);
  }
}

export default new Renderer();`,
  },
  python: {
    label: 'Python',
    language: 'python',
    code: `"""Content Renderer SDK"""
from dataclasses import dataclass
from enum import Enum

class ContentType(Enum):
    HTML = "html"
    JSON = "json"
    MARKDOWN = "markdown"

@dataclass
class ParsedContent:
    type: ContentType
    content: str
    metadata: dict = None

    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

class HTMLParser:
    def parse(self, content: str) -> ParsedContent:
        tags = self._extract_tags(content)
        return ParsedContent(
            type=ContentType.HTML,
            content=content,
            metadata={"tags": tags}
        )

    def _extract_tags(self, html: str) -> list:
        import re
        return re.findall(r"<([a-z][a-z0-9]*)", html)`,
  },
  typescript: {
    label: 'TypeScript',
    language: 'typescript',
    code: `// Type definitions
interface ParsedContent<T = unknown> {
  type: ContentType;
  content: string;
  parsed: T;
  metadata: ContentMetadata;
  errors: ParseError[];
}

type ContentType = 'html' | 'json' | 'xml' | 'markdown';

interface ContentMetadata {
  title?: string;
  language?: string;
  size?: number;
  lineCount?: number;
}

async function parseContent<T>(
  content: string,
  type: ContentType,
  options?: ParseOptions
): Promise<ParsedContent<T>> {
  const parser = getParser(type);
  const result = await parser.parse(content, options);
  return {
    type,
    content,
    parsed: result.data,
    metadata: result.metadata,
    errors: result.errors ?? [],
  };
}`,
  },
};

export default function CodeScreen() {
  const [activeSample, setActiveSample] = useState('js');
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [dark, setDark] = useState(false);

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
          <Text style={styles.switchLabel}>Lines</Text>
          <Switch value={showLineNumbers} onValueChange={setShowLineNumbers} trackColor={{ false: '#ddd', true: '#6c63ff' }} />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Dark</Text>
          <Switch value={dark} onValueChange={setDark} trackColor={{ false: '#ddd', true: '#6c63ff' }} />
        </View>
      </View>

      {/* Code block - uses actual library component */}
      <CodeRenderer
        code={sample.code}
        language={sample.language}
        showLineNumbers={showLineNumbers}
        dark={dark}
        fileName={`${sample.label.toLowerCase()}-example.${sample.language === 'typescript' ? 'ts' : sample.language === 'python' ? 'py' : 'js'}`}
      />

      {/* Usage */}
      <View style={styles.usageBox}>
        <Text style={styles.usageTitle}>Usage</Text>
        <Text style={styles.usageCode}>{`import { CodeRenderer } from '@content-renderer/react-and-native';

<CodeRenderer
  code={codeString}
  language="${sample.language}"
  showLineNumbers={${showLineNumbers}}
  dark={${dark}}
  fileName="example.js"
/>`}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1, backgroundColor: '#f5f5f8' },
  content: { padding: 16, paddingBottom: 80 },
  sampleBar: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center' },
  sampleBtn: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0e0',
  },
  sampleBtnActive: { backgroundColor: '#6c63ff', borderColor: '#6c63ff' },
  sampleBtnText: { fontSize: 13, color: '#666', fontWeight: '600' },
  sampleBtnTextActive: { color: '#fff' },
  controls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  switchLabel: { fontSize: 13, color: '#555' },
  usageBox: {
    backgroundColor: '#f8f8fc', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#e0e0e0', marginTop: 16,
  },
  usageTitle: { fontSize: 12, fontWeight: '700', color: '#888', marginBottom: 8, textTransform: 'uppercase' },
  usageCode: { fontFamily: 'Menlo', fontSize: 12, color: '#333', lineHeight: 18 },
});
