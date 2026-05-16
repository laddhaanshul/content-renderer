import React, { useState, useCallback } from 'react';
import CodeBlock from '../components/CodeBlock';

/* ---------- useContentParser Demo ---------- */
function useContentParserDemo() {
  const [result, setResult] = useState<{
    content: string;
    parsed: any;
    isLoading: boolean;
    error: string | null;
    metadata: Record<string, any>;
  }>({
    content: '',
    parsed: null,
    isLoading: false,
    error: null,
    metadata: {},
  });

  const parse = useCallback((content: string, type: string) => {
    setResult(prev => ({ ...prev, isLoading: true, error: null, content }));

    // Simulate async parsing
    setTimeout(() => {
      try {
        let parsed: any;
        const metadata: Record<string, any> = {
          type,
          size: content.length,
          lines: content.split('\n').length,
        };

        switch (type) {
          case 'json':
            parsed = JSON.parse(content);
            metadata.keys = Object.keys(parsed);
            metadata.types = Object.fromEntries(
              Object.entries(parsed).map(([k, v]) => [k, typeof v])
            );
            break;
          case 'html':
            parsed = {
              tags: content.match(/<([a-zA-Z][a-zA-Z0-9]*)/g)?.map(t => t.slice(1)) || [],
              text: content.replace(/<[^>]+>/g, '').trim().substring(0, 100) + '...',
            };
            metadata.tagCount = parsed.tags.length;
            break;
          case 'markdown':
            parsed = {
              headings: content.match(/^#{1,6}\s+.+$/gm) || [],
              links: content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [],
              hasCodeBlocks: /\`\`\`/.test(content),
            };
            break;
          default:
            parsed = { raw: content };
        }

        setResult({
          content,
          parsed,
          isLoading: false,
          error: null,
          metadata,
        });
      } catch (err) {
        setResult(prev => ({
          ...prev,
          isLoading: false,
          error: `Parse error: ${(err as Error).message}`,
        }));
      }
    }, 300);
  }, []);

  const reset = useCallback(() => {
    setResult({
      content: '',
      parsed: null,
      isLoading: false,
      error: null,
      metadata: {},
    });
  }, []);

  return { ...result, parse, reset };
}

/* ---------- useExtract Demo ---------- */
function useExtractDemo() {
  const [result, setResult] = useState<{
    extracted: Record<string, any> | null;
    isLoading: boolean;
    error: string | null;
  }>({
    extracted: null,
    isLoading: false,
    error: null,
  });

  const extract = useCallback((content: string) => {
    setResult(prev => ({ ...prev, isLoading: true, error: null }));

    setTimeout(() => {
      try {
        const links = content.match(/<a\s[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi) || [];
        const images = content.match(/<img\s[^>]*src="([^"]*)"[^>]*alt="([^"]*)"/gi) || [];
        const headings = content.match(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi) || [];

        setResult({
          extracted: {
            links: { count: links.length, items: links },
            images: { count: images.length, items: images },
            headings: { count: headings.length, items: headings },
          },
          isLoading: false,
          error: null,
        });
      } catch (err) {
        setResult(prev => ({
          ...prev,
          isLoading: false,
          error: `Extraction error: ${(err as Error).message}`,
        }));
      }
    }, 200);
  }, []);

  const reset = useCallback(() => {
    setResult({ extracted: null, isLoading: false, error: null });
  }, []);

  return { ...result, extract, reset };
}

/* ---------- useTheme Demo ---------- */
function useThemeDemo() {
  const [isDark, setIsDark] = useState(false);

  const theme = isDark
    ? { name: 'Dark', bg: '#1a1a2e', text: '#e0e0f0', primary: '#8b85ff', border: '#2a2a4a' }
    : { name: 'Light', bg: '#ffffff', text: '#1a1a2e', primary: '#6c63ff', border: '#e0e0e0' };

  const toggle = useCallback(() => setIsDark(prev => !prev), []);

  return { theme, isDark, toggle };
}

/* ---------- Main Component ---------- */
export default function HooksExample() {
  const [activeHook, setActiveHook] = useState<'parser' | 'extract' | 'theme'>('parser');

  return (
    <div>
      {/* Tabs */}
      <div style={styles.tabBar}>
        {[
          { key: 'parser' as const, label: 'useContentParser' },
          { key: 'extract' as const, label: 'useExtract' },
          { key: 'theme' as const, label: 'useTheme' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveHook(tab.key)}
            style={{
              ...styles.tab,
              ...(activeHook === tab.key ? styles.tabActive : {}),
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeHook === 'parser' && <ContentParserDemo />}
      {activeHook === 'extract' && <ExtractDemo />}
      {activeHook === 'theme' && <ThemeDemo />}

      {/* Usage */}
      <div style={{ marginTop: 24 }}>
        <h3 style={styles.sectionTitle}>Hook API Reference</h3>
        <CodeBlock
          language="tsx"
          title="Hooks"
          code={`import { useContentParser, useExtract, useTheme } from '@content-renderer/core';

// useContentParser
const { parsed, isLoading, isError, error, parse, reset, metadata } = useContentParser({
  contentType: 'json',
  onSuccess: (data) => console.log('Parsed:', data),
  onError: (err) => console.error(err),
});
parse(jsonString);

// useExtract
const { extracted, isLoading, isError, error, extract, reset } = useExtract({
  extractors: ['links', 'images', 'headings', 'meta'],
  options: { includeAttributes: true },
});
extract(htmlString);

// useTheme
const { theme, isDark, toggleTheme, setTheme } = useTheme();
`}
        />
      </div>
    </div>
  );
}

/* ---------- Content Parser Demo ---------- */
function ContentParserDemo() {
  const { content, parsed, isLoading, error, metadata, parse, reset } = useContentParserDemo();
  const [inputType, setInputType] = useState('json');
  const [inputValue, setInputValue] = useState(
    JSON.stringify({ name: 'Content Renderer', version: '1.0.0', features: ['HTML', 'JSON', 'MD'] }, null, 2)
  );

  return (
    <div>
      <h3 style={styles.sectionTitle}>useContentParser</h3>
      <div style={styles.demoBox}>
        <div style={styles.controls}>
          <select
            value={inputType}
            onChange={(e) => setInputType(e.target.value)}
            style={styles.select}
          >
            <option value="json">JSON</option>
            <option value="html">HTML</option>
            <option value="markdown">Markdown</option>
          </select>
          <button
            onClick={() => parse(inputValue, inputType)}
            style={styles.parseBtn}
            disabled={isLoading}
          >
            {isLoading ? 'Parsing...' : 'Parse'}
          </button>
          <button onClick={reset} style={styles.resetBtn}>Reset</button>
        </div>

        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          style={styles.textarea}
          rows={5}
          placeholder="Enter content to parse..."
        />

        {error && <div style={styles.error}>{error}</div>}

        {isLoading && (
          <div style={styles.loading}>
            <div style={styles.spinner} />
            <span>Parsing content...</span>
          </div>
        )}

        {parsed && !isLoading && (
          <div style={styles.resultArea}>
            <div style={styles.resultHeader}>Parsed Result</div>
            <pre style={styles.pre}>{JSON.stringify(parsed, null, 2)}</pre>

            {Object.keys(metadata).length > 0 && (
              <div style={styles.metadataGrid}>
                {Object.entries(metadata).map(([key, value]) => (
                  <div key={key} style={styles.metaItem}>
                    <span style={styles.metaKey}>{key}</span>
                    <span style={styles.metaValue}>
                      {Array.isArray(value) ? value.join(', ') : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Extract Demo ---------- */
function ExtractDemo() {
  const { extracted, isLoading, error, extract, reset } = useExtractDemo();
  const [inputValue, setInputValue] = useState(`<h1>Article Title</h1>
<p>Some text with <a href="https://example.com">a link</a>.</p>
<img src="https://picsum.photos/seed/demo/600/300" alt="Demo image" />
<h2>Section</h2>
<a href="/internal">Internal link</a>`);

  return (
    <div>
      <h3 style={styles.sectionTitle}>useExtract</h3>
      <div style={styles.demoBox}>
        <div style={styles.controls}>
          <button
            onClick={() => extract(inputValue)}
            style={styles.parseBtn}
            disabled={isLoading}
          >
            {isLoading ? 'Extracting...' : 'Extract'}
          </button>
          <button onClick={reset} style={styles.resetBtn}>Reset</button>
        </div>

        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          style={styles.textarea}
          rows={5}
          placeholder="Enter HTML to extract from..."
        />

        {error && <div style={styles.error}>{error}</div>}

        {isLoading && (
          <div style={styles.loading}>
            <div style={styles.spinner} />
            <span>Extracting data...</span>
          </div>
        )}

        {extracted && !isLoading && (
          <div style={styles.resultArea}>
            {Object.entries(extracted).map(([key, value]: [string, any]) => (
              <div key={key} style={styles.extractCard}>
                <div style={styles.extractTitle}>
                  {key} <span style={styles.extractCount}>{value.count}</span>
                </div>
                <div style={styles.extractItems}>
                  {value.items.slice(0, 5).map((item: string, i: number) => (
                    <div key={i} style={styles.extractItem}>
                      <code style={styles.mono}>{item.length > 80 ? item.slice(0, 80) + '...' : item}</code>
                    </div>
                  ))}
                  {value.count > 5 && (
                    <div style={styles.more}>...and {value.count - 5} more</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Theme Demo ---------- */
function ThemeDemo() {
  const { theme, isDark, toggle } = useThemeDemo();

  return (
    <div>
      <h3 style={styles.sectionTitle}>useTheme</h3>
      <div style={{
        ...styles.demoBox,
        background: theme.bg,
        border: `1px solid ${theme.border}`,
        color: theme.text,
        transition: 'all 0.3s',
      }}>
        <div style={styles.controls}>
          <span style={{ fontSize: 13 }}>Current theme: <strong>{theme.name}</strong></span>
          <button onClick={toggle} style={styles.parseBtn}>
            {isDark ? '☀️ Switch to Light' : '🌙 Switch to Dark'}
          </button>
        </div>

        <div style={{
          padding: 16,
          background: theme.primary + '11',
          borderRadius: 8,
          border: `1px solid ${theme.primary}33`,
          marginBottom: 12,
        }}>
          <h4 style={{ margin: '0 0 4px', color: theme.primary }}>
            Theme Context Values
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8, marginTop: 8 }}>
            {Object.entries(theme).map(([key, value]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {typeof value === 'string' && (key === 'bg' || key === 'primary' || key === 'text' || key === 'border') ? (
                  <div style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    background: value,
                    border: '1px solid #33333333',
                  }} />
                ) : null}
                <span style={{ fontSize: 12 }}>
                  <strong>{key}:</strong> {typeof value === 'string' ? value : JSON.stringify(value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{
            padding: '8px 20px',
            background: theme.primary,
            color: theme.bg,
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
          }}>
            Themed Button
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  tabBar: {
    display: 'flex',
    gap: 4,
    marginBottom: 20,
    padding: 4,
    background: '#fff',
    borderRadius: 8,
    border: '1px solid #e0e0e0',
  },
  tab: {
    padding: '8px 20px',
    background: 'transparent',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    cursor: 'pointer',
    color: '#555',
    fontWeight: 500,
  },
  tabActive: {
    background: '#6c63ff',
    color: '#fff',
    fontWeight: 600,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 12,
    color: '#1a1a2e',
  },
  demoBox: {
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    padding: 16,
  },
  controls: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  select: {
    padding: '6px 12px',
    border: '1px solid #ddd',
    borderRadius: 6,
    fontSize: 13,
    outline: 'none',
    background: '#fff',
  },
  parseBtn: {
    padding: '6px 16px',
    background: '#6c63ff',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  resetBtn: {
    padding: '6px 16px',
    background: '#f5f5f8',
    color: '#666',
    border: '1px solid #ddd',
    borderRadius: 6,
    fontSize: 13,
    cursor: 'pointer',
  },
  textarea: {
    width: '100%',
    padding: 10,
    border: '1px solid #ddd',
    borderRadius: 6,
    fontSize: 13,
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    resize: 'vertical' as const,
    lineHeight: 1.6,
    outline: 'none',
    marginBottom: 12,
  },
  error: {
    padding: '8px 12px',
    background: '#fef2f2',
    color: '#dc2626',
    borderRadius: 6,
    fontSize: 13,
    marginBottom: 12,
    border: '1px solid #fecaca',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 16px',
    background: '#f0f0f8',
    borderRadius: 6,
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  spinner: {
    width: 16,
    height: 16,
    border: '2px solid #e0e0e0',
    borderTopColor: '#6c63ff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  resultArea: {
    marginTop: 12,
  },
  resultHeader: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 8,
    color: '#1a1a2e',
    paddingBottom: 8,
    borderBottom: '1px solid #f0f0f0',
  },
  pre: {
    background: '#f5f5f8',
    padding: 12,
    borderRadius: 6,
    fontFamily: "'SF Mono', monospace",
    fontSize: 12,
    overflow: 'auto',
    marginBottom: 12,
    lineHeight: 1.6,
  },
  metadataGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 8,
  },
  metaItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
    padding: '8px 12px',
    background: '#fafafa',
    borderRadius: 6,
  },
  metaKey: { fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  metaValue: { fontSize: 13, color: '#333' },
  extractCard: {
    background: '#fafafa',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  extractTitle: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 8,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  extractCount: {
    background: '#6c63ff',
    color: '#fff',
    fontSize: 11,
    padding: '1px 8px',
    borderRadius: 10,
    fontWeight: 700,
  },
  extractItems: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
  },
  extractItem: {
    padding: '4px 8px',
    background: '#fff',
    borderRadius: 4,
    border: '1px solid #eee',
  },
  more: { fontSize: 12, color: '#888', fontStyle: 'italic', marginTop: 4 },
  mono: {
    fontFamily: "'SF Mono', monospace",
    fontSize: 12,
    color: '#6c63ff',
  },
};
