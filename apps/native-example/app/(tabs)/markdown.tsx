import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { MarkdownRenderer } from '@laddhaanshul/content-renderer';

const samples: Record<string, { label: string; code: string }> = {
  basic: {
    label: 'Basic',
    code: `# Content Renderer for React Native

Render **any content type** directly in your native app.

## Features

- HTML rendering with sanitization
- JSON tree visualization
- Markdown with GFM support
- XML collapsible tree
- PHP syntax highlighting
- CSS parsing

> Built with TypeScript for type safety.

---

Get started by installing the package:

\`\`\`bash
npm install @laddhaanshul/content-renderer
\`\`\`

Then use the components:

\`\`\`tsx
import { HTMLRenderer } from '@laddhaanshul/content-renderer';

function App() {
  return (
    <HTMLRenderer html={htmlString} />
  );
}
\`\`\``,
  },
  gfm: {
    label: 'GFM',
    code: `## Project Roadmap

| Feature | Status | Priority |
|---------|--------|----------|
| HTML Parser | Done | High |
| JSON Renderer | Done | High |
| Markdown | Done | High |
| CSS Engine | Done | High |
| SVG Renderer | Done | Medium |
| XML Parser | WIP | Medium |

## Tasks

- [x] Initial setup
- [x] Core parsers
- [x] React components
- [x] CSS class-based styling
- [x] SVG rendering
- [x] Virtualized HTML rendering
- [x] Rowspan/colspan tables
- [x] Media element placeholders
- [x] CSS variables & calc()
- [ ] Full CSS Grid support (Native)`,
  },
  lists: {
    label: 'Lists',
    code: `## Nested Lists

1. First level
   - Sub-item A
   - Sub-item B
     1. Numbered sub
     2. Another
2. Second level
   - More items

## Blockquotes

> This is a quote
>
> > Nested quote
>
> With **formatting**`,
  },
  advancedMd: {
    label: 'Advanced',
    code: `# Advanced Markdown

## Reference Links

This uses a [reference link][ref] for cleaner source text.

Also works as [shortcut][] if defined.

[ref]: https://example.com "Example Site"
[shortcut]: https://example.org

## Footnotes

React Native content rendering is powerful[^1].
It supports cross-platform rendering[^2] out of the box.

[^1]: Especially with the @laddhaanshul/content-renderer package.
[^2]: Works on iOS, Android, and Web from a single codebase.

## Definition Lists

Term 1
:   First definition of Term 1

Term 2
:   Second definition of Term 2
:   Additional detail about Term 2

## Math

Inline: E = mc^2 and display:

a^2 + b^2 = c^2

## Subscript & Superscript

Water: H~2~O and squared: X^2^

==Highlighted text==

Hello :wave: Check out :rocket: and :fire:

Auto-link: <https://example.com>

## Emoji Shortcodes

:smile: :heart: :thumbsup: :rocket: :star: :zap: :fire: :tada: :check: :x: :muscle:`,
  },
};

export default function MarkdownScreen() {
  const [activeSample, setActiveSample] = useState('basic');

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

      {/* Rendered */}
      <View style={styles.previewBox}>
        <MarkdownRenderer
          markdown={samples[activeSample].code}
          onLinkPress={(url) => {
            if (url.startsWith('/')) return;
            Linking.openURL(url).catch(() => {});
          }}
        />
      </View>

      {/* Usage */}
      <View style={styles.usageBox}>
        <Text style={styles.usageTitle}>Usage</Text>
        <Text style={styles.usageCode}>{`import { MarkdownRenderer } from '@laddhaanshul/content-renderer';

<MarkdownRenderer
  markdown={markdownString}
  onLinkPress={(url) => Linking.openURL(url)}
/>

// Supports full GFM: tables, task lists, strikethrough
// Extended: reference links, footnotes, definition lists,
//   math blocks, emoji shortcodes, highlights,
//   subscript/superscript, abbreviations
// HTML blocks pass through as-is
/>`}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1, backgroundColor: '#f5f5f8' },
  content: { padding: 16, paddingBottom: 80 },
  sampleBar: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  sampleBtn: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0e0',
  },
  sampleBtnActive: { backgroundColor: '#6c63ff', borderColor: '#6c63ff' },
  sampleBtnText: { fontSize: 13, color: '#666', fontWeight: '600' },
  sampleBtnTextActive: { color: '#fff' },
  previewBox: {
    backgroundColor: '#fff', borderRadius: 12, padding: 20,
    borderWidth: 1, borderColor: '#e0e0e0', marginBottom: 16,
  },
  usageBox: {
    backgroundColor: '#f8f8fc', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#e0e0e0',
  },
  usageTitle: { fontSize: 12, fontWeight: '700', color: '#888', marginBottom: 8, textTransform: 'uppercase' },
  usageCode: { fontFamily: 'Menlo', fontSize: 12, color: '#333', lineHeight: 18 },
});
