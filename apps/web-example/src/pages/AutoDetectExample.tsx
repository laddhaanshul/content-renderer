import React, { useState, useMemo } from 'react';
import CodeBlock from '../components/CodeBlock';

const exampleSnippets: Record<string, { label: string; type: string; content: string }> = {
  html: {
    label: 'HTML',
    type: 'html',
    content: `<h2>Welcome</h2>\n<p>This is <strong>HTML content</strong> auto-detected from the input.</p>\n<ul>\n  <li>Item one</li>\n  <li>Item two</li>\n</ul>`,
  },
  json: {
    label: 'JSON',
    type: 'json',
    content: `{\n  "name": "Content Renderer",\n  "version": "1.0.0",\n  "features": ["HTML", "JSON", "Markdown"],\n  "active": true\n}`,
  },
  markdown: {
    label: 'Markdown',
    type: 'markdown',
    content: `# Auto-Detected Markdown\n\nThis is **bold** and *italic* text.\n\n- List item 1\n- List item 2\n\n> A blockquote\n\n\`\`\`js\nconsole.log("Hello!");\n\`\`\``,
  },
  xml: {
    label: 'XML',
    type: 'xml',
    content: `<?xml version="1.0"?>\n<message>\n  <to>User</to>\n  <from>System</from>\n  <body>Content auto-detected!</body>\n</message>`,
  },
  php: {
    label: 'PHP',
    type: 'php',
    content: `<?php\necho "Hello from PHP!";\n$name = "World";\necho "Hello, " . $name . "!";\n?>`,
  },
  css: {
    label: 'CSS',
    type: 'css',
    content: `.container {\n  max-width: 960px;\n  margin: 0 auto;\n  padding: 2rem;\n}\n\n.btn {\n  background: #6c63ff;\n  color: white;\n  border-radius: 8px;\n}`,
  },
};

function detectType(content: string): { type: string; confidence: number } {
  const trimmed = content.trim();

  // PHP
  if (trimmed.includes('<?php') || trimmed.includes('?>')) {
    return { type: 'php', confidence: 0.95 };
  }

  // XML
  if (trimmed.startsWith('<?xml') || /^<[a-zA-Z][a-zA-Z0-9]*(\s[^>]*)?>\s*\n/.test(trimmed)) {
    if (trimmed.includes('</') && !trimmed.includes('<html') && !trimmed.includes('<div')) {
      return { type: 'xml', confidence: 0.9 };
    }
  }

  // HTML
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html') || /^<[a-zA-Z][a-zA-Z0-9]*(\s[^>]*)?>/.test(trimmed)) {
    return { type: 'html', confidence: 0.85 };
  }

  // JSON
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      JSON.parse(trimmed);
      return { type: 'json', confidence: 0.95 };
    } catch {
      return { type: 'json', confidence: 0.6 };
    }
  }

  // CSS
  if (/^[.#@a-zA-Z][\w-]*\s*\{[^}]*\}/m.test(trimmed)) {
    return { type: 'css', confidence: 0.8 };
  }

  // Markdown
  if (/^#{1,6}\s/m.test(trimmed) || /\*\*[^*]+\*\*/m.test(trimmed) || /^[-*]\s/m.test(trimmed)) {
    return { type: 'markdown', confidence: 0.8 };
  }

  return { type: 'text', confidence: 0.5 };
}

export default function AutoDetectExample() {
  const [content, setContent] = useState(exampleSnippets.html.content);
  const [customContent, setCustomContent] = useState('');

  const activeContent = customContent || content;
  const detected = useMemo(() => detectType(activeContent), [activeContent]);

  const typeColors: Record<string, string> = {
    html: '#e44d26',
    json: '#f59e0b',
    markdown: '#2563eb',
    xml: '#6c63ff',
    php: '#7b61ff',
    css: '#2563eb',
    text: '#888',
  };

  return (
    <div>
      {/* Info */}
      <div style={styles.info}>
        <div style={styles.infoIcon}>🔍</div>
        <div>
          <div style={styles.infoTitle}>Auto-Detection</div>
          <div style={styles.infoText}>
            Paste any content below and the renderer will automatically detect the type and render it with the appropriate parser.
          </div>
        </div>
      </div>

      {/* Presets */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Quick Presets</h3>
        <div style={styles.presetButtons}>
          {Object.entries(exampleSnippets).map(([key, { label }]) => (
            <button
              key={key}
              onClick={() => {
                setContent(exampleSnippets[key].content);
                setCustomContent('');
              }}
              style={{
                ...styles.presetBtn,
                borderLeft: `3px solid ${typeColors[key]}`,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Input</h3>
        <textarea
          value={customContent || content}
          onChange={(e) => {
            if (e.target.value) {
              setCustomContent(e.target.value);
            } else {
              setCustomContent('');
            }
          }}
          style={styles.textarea}
          placeholder="Paste your content here..."
          rows={8}
        />
      </div>

      {/* Detected type */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Detection Result</h3>
        <div style={styles.result}>
          <div style={styles.resultRow}>
            <span style={styles.resultLabel}>Detected Type:</span>
            <span
              style={{
                ...styles.resultBadge,
                background: typeColors[detected.type] + '18',
                color: typeColors[detected.type],
              }}
            >
              {detected.type.toUpperCase()}
            </span>
          </div>
          <div style={styles.resultRow}>
            <span style={styles.resultLabel}>Confidence:</span>
            <div style={styles.confidenceBar}>
              <div
                style={{
                  ...styles.confidenceFill,
                  width: `${detected.confidence * 100}%`,
                  background: detected.confidence > 0.8 ? '#10b981' : detected.confidence > 0.6 ? '#f59e0b' : '#ef4444',
                }}
              />
            </div>
            <span style={styles.confidenceText}>{(detected.confidence * 100).toFixed(0)}%</span>
          </div>
          <div style={styles.resultRow}>
            <span style={styles.resultLabel}>Content Length:</span>
            <span>{activeContent.length} chars</span>
          </div>
          <div style={styles.resultRow}>
            <span style={styles.resultLabel}>Lines:</span>
            <span>{activeContent.split('\n').length} lines</span>
          </div>
        </div>
      </div>

      {/* Rendered */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Rendered Output</h3>
        <div style={styles.preview}>
          <div style={{ ...styles.typeBanner, background: typeColors[detected.type] }}>
            {detected.type.toUpperCase()}
          </div>
          {detected.type === 'html' && (
            <div
              style={{ padding: 16 }}
              dangerouslySetInnerHTML={{ __html: activeContent }}
            />
          )}
          {detected.type === 'json' && (
            <pre style={{ padding: 16, margin: 0, fontFamily: "'SF Mono', monospace", fontSize: 13 }}>
              {activeContent}
            </pre>
          )}
          {detected.type === 'markdown' && (
            <pre style={{ padding: 16, margin: 0, fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {activeContent}
            </pre>
          )}
          {detected.type === 'xml' && (
            <pre style={{ padding: 16, margin: 0, fontFamily: "'SF Mono', monospace", fontSize: 13 }}>
              {activeContent}
            </pre>
          )}
          {detected.type === 'php' && (
            <pre style={{ padding: 16, margin: 0, fontFamily: "'SF Mono', monospace", fontSize: 13, background: '#1e1e2e', color: '#cdd6f4' }}>
              {activeContent}
            </pre>
          )}
          {detected.type === 'css' && (
            <pre style={{ padding: 16, margin: 0, fontFamily: "'SF Mono', monospace", fontSize: 13 }}>
              {activeContent}
            </pre>
          )}
          {detected.type === 'text' && (
            <pre style={{ padding: 16, margin: 0, fontSize: 14 }}>{activeContent}</pre>
          )}
        </div>
      </div>

      {/* Usage */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Usage</h3>
        <CodeBlock
          language="tsx"
          title="Component"
          code={`import { detectContentType, HTMLRenderer, JSONRenderer, MarkdownRenderer } from '@laddhaanshul/content-renderer-core';

function AutoRender({ content }: { content: string }) {
  const type = detectContentType(content);

  switch (type) {
    case 'html':
      return <HTMLRenderer content={content} />;
    case 'json':
      return <JSONRenderer content={content} />;
    case 'markdown':
      return <MarkdownRenderer content={content} />;
    default:
      return <pre>{content}</pre>;
  }
}`}
        />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  info: {
    display: 'flex',
    gap: 12,
    padding: 16,
    background: '#eef2ff',
    borderRadius: 8,
    border: '1px solid #c7d2fe',
    marginBottom: 20,
  },
  infoIcon: { fontSize: 24 },
  infoTitle: { fontSize: 15, fontWeight: 600, color: '#1a1a2e', marginBottom: 2 },
  infoText: { fontSize: 13, color: '#555', lineHeight: 1.5 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#1a1a2e' },
  presetButtons: { display: 'flex', gap: 8, flexWrap: 'wrap' as const },
  presetBtn: {
    padding: '8px 16px',
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '0 6px 6px 0',
    fontSize: 13,
    cursor: 'pointer',
    color: '#555',
  },
  textarea: {
    width: '100%',
    padding: 12,
    border: '1px solid #ddd',
    borderRadius: 8,
    fontSize: 13,
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    resize: 'vertical' as const,
    lineHeight: 1.6,
    outline: 'none',
  },
  result: {
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    padding: 16,
  },
  resultRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
    fontSize: 14,
  },
  resultLabel: { fontWeight: 600, color: '#666', minWidth: 140 },
  resultBadge: {
    padding: '2px 12px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.5,
  },
  confidenceBar: {
    flex: 1,
    maxWidth: 200,
    height: 8,
    background: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
    transition: 'width 0.3s',
  },
  confidenceText: { fontSize: 13, fontWeight: 600, color: '#555', minWidth: 40 },
  preview: {
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  typeBanner: {
    color: '#fff',
    padding: '6px 14px',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
};
