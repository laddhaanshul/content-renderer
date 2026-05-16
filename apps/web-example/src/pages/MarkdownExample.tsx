import React, { useState, useMemo } from 'react';
import CodeBlock from '../components/CodeBlock';

const samples: Record<string, { label: string; code: string }> = {
  basic: {
    label: 'Basic',
    code: `# Content Renderer

A universal content rendering library for **React** and *React Native*.

## Features

- Render HTML, JSON, Markdown, XML, PHP, and CSS
- Theme support with light and dark modes
- Content extraction utilities
- Auto-detection of content types

> Built with TypeScript for full type safety.

---

For more information, visit [the documentation](https://example.com/docs).`,
  },
  gfm: {
    label: 'GFM Tables & Tasks',
    code: `## Project Status

| Feature | Status | Priority |
|---------|--------|----------|
| HTML Parser | Done | High |
| JSON Renderer | Done | High |
| Markdown | Done | High |
| CSS Engine | Done | High |
| SVG Renderer | Done | Medium |
| XML Parser | In Progress | Medium |

## Todo List

- [x] Set up monorepo structure
- [x] Implement core parsers
- [x] Add React components
- [x] CSS class-based styling
- [x] SVG rendering
- [x] Virtualized HTML rendering
- [x] Rowspan/colspan tables
- [ ] Full CSS Grid support (Native)
- [ ] Animation/transition support`,
  },
  codeBlocks: {
    label: 'Code Blocks',
    code: `## Installation

Install the packages:

\`\`\`bash
npm install @content-renderer/react-and-native @content-renderer/core
\`\`\`

Then import and use:

\`\`\`tsx
import { HTMLRenderer, JSONRenderer } from '@content-renderer/react-and-native';

function App() {
  return (
    <div>
      <HTMLRenderer html={htmlString} />
      <JSONRenderer json={jsonString} />
    </div>
  );
}
\`\`\`

Inline code works too: \`const x = 42;\``,
  },
  advanced: {
    label: 'Advanced',
    code: `---
title: Blog Post
author: Alice
date: 2024-01-15
tags: [react, typescript, rendering]
---

# Advanced Markdown Features

## Nested Lists

1. First item
   - Sub-item A
   - Sub-item B
     1. Numbered sub-item
     2. Another numbered item
2. Second item
   - Another sub-item

## Blockquotes

> Level 1 quote
>
> > Level 2 nested quote
> >
> > > Level 3 deeply nested quote

## Links and Images

Visit [GitHub](https://github.com) or see the logo:

![React Logo](https://picsum.photos/seed/react/200/100)

## Horizontal Rule

---

## Mixed Content

A paragraph with **bold**, *italic*, ~~strikethrough~~, and \`inline code\`.

And an [auto-link](https://example.com).

### Code with Language

\`\`\`python
def hello():
    print("Hello, World!")
\`\`\``,
  },
  gfmExtended: {
    label: 'GFM Extended',
    code: `# Extended GFM Features

## Reference Links

This uses a [reference link][ref] for cleaner source text.

Also works as [shortcut][] if defined.

[ref]: https://example.com "Example Site"
[shortcut]: https://example.org

## Footnotes

React Native content rendering is powerful[^1].

It supports cross-platform rendering[^2] out of the box.

[^1]: Especially with the @content-renderer/react-and-native package.
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

## Highlight

==This text is highlighted==

## Emoji Shortcodes

Hello :wave: Check out :rocket: and :fire: :star: :zap: :tada: :clap: :muscle: :eyes: :brain:`,
  },
};

export default function MarkdownExample() {
  const [activeSample, setActiveSample] = useState('basic');

  const sample = samples[activeSample];

  return (
    <div>
      {/* Controls */}
      <div style={styles.toolbar}>
        <div style={styles.sampleButtons}>
          {Object.entries(samples).map(([key, { label }]) => (
            <button
              key={key}
              onClick={() => setActiveSample(key)}
              style={{
                ...styles.sampleBtn,
                ...(activeSample === key ? styles.sampleBtnActive : {}),
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Rendered output */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Rendered Markdown</h3>
        <div style={styles.preview}>
          <MarkdownPreview content={sample.code} />
        </div>
      </div>

      {/* Source */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Source Markdown</h3>
        <CodeBlock code={sample.code} language="markdown" />
      </div>

      {/* Usage */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Usage</h3>
        <CodeBlock
          language="tsx"
          title="Component"
          code={`import { MarkdownRenderer } from '@content-renderer/react-and-native';

function MyComponent() {
  return (
    <MarkdownRenderer
      markdown={markdownString}
      onLinkPress={(url) => window.open(url, '_blank')}
    />
  );
}`}
        />
      </div>
    </div>
  );
}

/* ---------- Simple Markdown Preview ---------- */
function MarkdownPreview({ content }: { content: string }) {
  const html = useMemo(() => {
    let md = content;

    // Frontmatter
    md = md.replace(/^---[\s\S]*?---\n/, '');

    // Code blocks
    md = md.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) => {
      return `<pre style="background:#1e1e2e;color:#cdd6f4;padding:14px;border-radius:8px;overflow-x:auto;font-size:13px;margin:12px 0;"><code class="lang-${lang}">${code.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</code></pre>`;
    });

    // Inline code
    md = md.replace(/`([^`]+)`/g, '<code style="background:#f0f0f8;padding:2px 6px;border-radius:4px;font-size:13px;color:#6c63ff;">$1</code>');

    // Headings
    md = md.replace(/^### (.+)$/gm, '<h3 style="font-size:18px;font-weight:600;margin:20px 0 8px;">$1</h3>');
    md = md.replace(/^## (.+)$/gm, '<h2 style="font-size:20px;font-weight:700;margin:24px 0 8px;">$1</h2>');
    md = md.replace(/^# (.+)$/gm, '<h1 style="font-size:26px;font-weight:700;margin:0 0 12px;">$1</h1>');

    // Bold, italic, strikethrough
    md = md.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    md = md.replace(/\*(.+?)\*/g, '<em>$1</em>');
    md = md.replace(/~~(.+?)~~/g, '<del>$1</del>');

    // Blockquotes
    md = md.replace(/^> (.+)$/gm, '<blockquote style="border-left:3px solid #6c63ff;padding:4px 12px;color:#555;margin:8px 0;">$1</blockquote>');

    // Horizontal rules
    md = md.replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #e0e0e0;margin:16px 0;" />');

    // Links
    md = md.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#6c63ff;text-decoration:none;">$1</a>');

    // Images
    md = md.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px;margin:8px 0;" />');

    // Tables
    md = md.replace(/\n(\|.+\|)\n(\|[-| :]+\|)\n((?:\|.+\|\n?)+)/g, (_match: string, header: string, _sep: string, body: string) => {
      const headers = header.split('|').filter((c: string) => c.trim());
      const rows = body.trim().split('\n').map((r: string) => r.split('|').filter((c: string) => c.trim()));
      let table = '<table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:14px;">';
      table += '<thead><tr style="background:#f0f0f8;">';
      headers.forEach((h: string) => { table += `<th style="padding:8px 12px;text-align:left;border-bottom:2px solid #d0d0d0;">${h.trim()}</th>`; });
      table += '</tr></thead><tbody>';
      rows.forEach((r: string[]) => {
        table += '<tr>';
        r.forEach((c: string) => { table += `<td style="padding:8px 12px;border-bottom:1px solid #eee;">${c.trim()}</td>`; });
        table += '</tr>';
      });
      table += '</tbody></table>';
      return '\n' + table + '\n';
    });

    // Task lists
    md = md.replace(/- \[x\] (.+)/g, '<div style="margin:4px 0;"><input type="checkbox" checked disabled style="margin-right:8px;" /><span style="text-decoration:line-through;color:#888;">$1</span></div>');
    md = md.replace(/- \[ \] (.+)/g, '<div style="margin:4px 0;"><input type="checkbox" disabled style="margin-right:8px;" /><span>$1</span></div>');

    // Unordered lists
    md = md.replace(/^- (.+)$/gm, '<li style="margin-left:20px;">$1</li>');

    // Ordered lists
    md = md.replace(/^\d+\. (.+)$/gm, '<li style="margin-left:20px;list-style:decimal;">$1</li>');

    // Paragraphs (double newline)
    md = md.replace(/\n\n/g, '</p><p style="margin:8px 0;">');

    return `<p style="margin:8px 0;">${md}</p>`;
  }, [content]);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

const styles: Record<string, React.CSSProperties> = {
  toolbar: {
    display: 'flex',
    gap: 6,
    marginBottom: 20,
    padding: 16,
    background: '#fff',
    borderRadius: 8,
    border: '1px solid #e0e0e0',
    flexWrap: 'wrap' as const,
  },
  sampleButtons: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap' as const,
  },
  sampleBtn: {
    padding: '6px 14px',
    background: '#f5f5f8',
    border: '1px solid #e0e0e0',
    borderRadius: 6,
    fontSize: 13,
    cursor: 'pointer',
    color: '#555',
  },
  sampleBtnActive: {
    background: '#6c63ff',
    color: '#fff',
    borderColor: '#6c63ff',
    fontWeight: 600,
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 12,
    color: '#1a1a2e',
  },
  preview: {
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    padding: 24,
    lineHeight: 1.7,
    fontSize: 14,
    color: '#333',
    overflow: 'auto',
  },
};
