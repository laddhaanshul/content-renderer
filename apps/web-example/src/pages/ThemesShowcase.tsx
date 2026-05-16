import React, { useState } from 'react';
import { getAllThemeNames, getTheme } from '@laddhaanshul/content-renderer';

export default function ThemesShowcase() {
  const themes = getAllThemeNames();
  const [selected, setSelected] = useState(themes[0]);
  const theme = getTheme(selected);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Syntax Themes</h2>
      <p style={styles.description}>12 built-in syntax highlighting themes. Click a theme to preview.</p>

      <div style={styles.buttonRow}>
        {themes.map(name => (
          <button
            key={name}
            onClick={() => setSelected(name)}
            style={{
              ...styles.themeBtn,
              ...(selected === name ? styles.themeBtnActive : {}),
            }}
          >
            {name}
          </button>
        ))}
      </div>

      <h3 style={styles.subheading}>
        {selected} {theme?.type === 'dark' ? '(Dark)' : '(Light)'}
      </h3>

      {theme && (
        <pre style={{
          background: theme.background,
          color: theme.foreground,
          padding: 20,
          borderRadius: 8,
          fontSize: 14,
          lineHeight: 1.7,
          overflow: 'auto',
          border: `1px solid ${theme.type === 'dark' ? '#555' : '#ddd'}`,
          fontFamily: "'SF Mono', 'Fira Code', monospace",
        }}>
          <code>
            <span style={{ color: theme.keyword }}>function</span>{' '}
            <span style={{ color: theme.function }}>fibonacci</span>(<span style={{ color: theme.variable }}>n</span>) {'{\n'}
            <span style={{ color: theme.keyword }}>  if</span> (<span style={{ color: theme.variable }}>n</span>{' '}
            <span style={{ color: theme.operator }}>&lt;=</span>{' '}
            <span style={{ color: theme.number }}>1</span>) <span style={{ color: theme.keyword }}>return</span>{' '}
            <span style={{ color: theme.variable }}>n</span>;\n{'  '}
            <span style={{ color: theme.keyword }}>return</span>{' '}
            <span style={{ color: theme.function }}>fibonacci</span>(<span style={{ color: theme.variable }}>n</span>{' '}
            <span style={{ color: theme.operator }}>-</span>{' '}
            <span style={{ color: theme.number }}>1</span>) <span style={{ color: theme.operator }}>+</span>{' '}
            <span style={{ color: theme.function }}>fibonacci</span>(<span style={{ color: theme.variable }}>n</span>{' '}
            <span style={{ color: theme.operator }}>-</span>{' '}
            <span style={{ color: theme.number }}>2</span>);\n
            {'}'}\n\n
            <span style={{ color: theme.comment }}>// Calculate first 10 Fibonacci numbers</span>{'\n'}
            <span style={{ color: theme.keyword }}>const</span>{' '}
            <span style={{ color: theme.variable }}>results</span>{' '}
            <span style={{ color: theme.operator }}>=</span>{' '}
            <span style={{ color: theme.builtin }}>Array</span>.<span style={{ color: theme.function }}>from</span>(<span style={{ color: theme.punctuation }}>{'{'}</span>{' '}
            <span style={{ color: theme.property }}>length</span>: <span style={{ color: theme.number }}>10</span>{' '}
            <span style={{ color: theme.punctuation }}>{'}'}</span>,{' '}
            (<span style={{ color: theme.variable }}>_</span>,{' '}
            <span style={{ color: theme.variable }}>i</span>) <span style={{ color: theme.keyword }}>=&gt;</span>{' '}
            {'({'}\n{'    '}
            <span style={{ color: theme.property }}>index</span>: <span style={{ color: theme.variable }}>i</span>,\n{'    '}
            <span style={{ color: theme.property }}>value</span>: <span style={{ color: theme.function }}>fibonacci</span>(<span style={{ color: theme.variable }}>i</span>)\n
            {'})'});\n\n
            <span style={{ color: theme.builtin }}>console</span>.<span style={{ color: theme.function }}>log</span>(<span style={{ color: theme.string }}>&quot;Fibonacci:&quot;</span>,{' '}
            <span style={{ color: theme.variable }}>results</span>);
          </code>
        </pre>
      )}

      {theme && (
        <div style={{ marginTop: 20 }}>
          <h4 style={styles.colorLabel}>Color Palette</h4>
          <div style={styles.colorGrid}>
            {[
              { label: 'keyword', value: theme.keyword },
              { label: 'string', value: theme.string },
              { label: 'number', value: theme.number },
              { label: 'comment', value: theme.comment },
              { label: 'function', value: theme.function },
              { label: 'variable', value: theme.variable },
              { label: 'operator', value: theme.operator },
              { label: 'builtin', value: theme.builtin },
              { label: 'property', value: theme.property },
              { label: 'punctuation', value: theme.punctuation },
              { label: 'className', value: theme.className },
              { label: 'constant', value: theme.constant },
            ].map(({ label, value }) => (
              <div key={label} style={styles.colorItem}>
                <div style={{ ...styles.colorSwatch, background: value }} />
                <span style={styles.colorName}>{label}</span>
                <span style={styles.colorHex}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {},
  heading: {
    fontSize: 20,
    fontWeight: 600,
    color: '#1a1a2e',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 1.6,
    marginBottom: 16,
  },
  subheading: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1a1a2e',
    marginBottom: 12,
  },
  buttonRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap' as const,
    marginBottom: 20,
  },
  themeBtn: {
    padding: '4px 12px',
    background: '#f0f0f8',
    color: '#333',
    border: '1px solid #ddd',
    cursor: 'pointer',
    borderRadius: 6,
    fontSize: 13,
    transition: 'all 0.15s',
  },
  themeBtnActive: {
    background: '#333',
    color: '#fff',
    border: '1px solid #333',
  },
  colorLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1a1a2e',
    marginBottom: 10,
    marginTop: 4,
  },
  colorGrid: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap' as const,
  },
  colorItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 4,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 8,
    border: '1px solid #e0e0e0',
  },
  colorName: {
    fontSize: 11,
    color: '#666',
    fontWeight: 600,
    textTransform: 'capitalize' as const,
  },
  colorHex: {
    fontSize: 10,
    color: '#999',
    fontFamily: "'SF Mono', 'Fira Code', monospace",
  },
};
