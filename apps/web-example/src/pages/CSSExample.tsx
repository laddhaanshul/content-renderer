import React, { useState } from 'react';
import CodeBlock from '../components/CodeBlock';

const samples: Record<string, { label: string; code: string }> = {
  basic: {
    label: 'Basic CSS',
    code: `/* Base Reset */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #1a1a2e;
  background: #ffffff;
}

/* Typography */
h1 {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: #0f0f23;
}

h2 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 0.75rem;
}

p {
  font-size: 1rem;
  line-height: 1.7;
  color: #444;
  margin-bottom: 1rem;
}

a {
  color: #6c63ff;
  text-decoration: none;
  transition: color 0.2s;
}

a:hover {
  color: #5a52e0;
  text-decoration: underline;
}

/* Layout */
.container {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}`,
  },
  advanced: {
    label: 'Advanced (Custom Props & Keyframes)',
    code: `/* Custom Properties */
:root {
  --color-primary: #6c63ff;
  --color-primary-hover: #5a52e0;
  --color-bg: #ffffff;
  --color-surface: #f8f8fc;
  --color-text: #1a1a2e;
  --color-text-muted: #888;
  --color-border: #e0e0ee;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --radius: 8px;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  --transition: 0.2s ease;
}

/* Dark theme overrides */
[data-theme="dark"] {
  --color-bg: #0f0f1a;
  --color-surface: #1a1a2e;
  --color-text: #e0e0f0;
  --color-text-muted: #8888aa;
  --color-border: #2a2a4a;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Component styles */
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1.5rem;
  animation: fadeIn 0.3s ease;
  transition: transform var(--transition), box-shadow var(--transition);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
}`,
  },
  media: {
    label: 'Media Queries',
    code: `/* Responsive breakpoints */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Mobile first */
.sidebar {
  display: none;
}

/* Tablet */
@media (min-width: 768px) {
  .layout {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 1.5rem;
  }

  .sidebar {
    display: block;
    position: sticky;
    top: 1rem;
    height: fit-content;
  }

  .container {
    padding: 0 2rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    max-width: 1200px;
    padding: 0 2.5rem;
  }

  .hero-title {
    font-size: 3.5rem;
  }

  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Large desktop */
@media (min-width: 1440px) {
  .container {
    max-width: 1400px;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Print styles */
@media print {
  .sidebar,
  .nav,
  .footer {
    display: none;
  }

  body {
    font-size: 12pt;
    color: #000;
  }
}`,
  },
};

function highlightCSS(css: string): React.ReactNode {
  const lines = css.split('\n');
  return lines.map((line, i) => {
    // Comments
    if (line.trimStart().startsWith('/*') || line.trimStart().startsWith('*')) {
      return <div key={i} style={{ color: '#6a737d' }}>{line}</div>;
    }

    let result: React.ReactNode[] = [];
    let rest = line;
    let key = 0;

    // @rules
    const atMatch = rest.match(/^(\s*)(@[a-z-]+)/);
    if (atMatch) {
      result.push(<span key={key++}>{atMatch[1]}</span>);
      result.push(<span key={key++} style={{ color: '#d73a49' }}>{atMatch[2]}</span>);
      rest = rest.slice(atMatch[0].length);
    }

    // Selectors (before {)
    const braceIdx = rest.indexOf('{');
    if (braceIdx >= 0) {
      const selector = rest.slice(0, braceIdx);
      result.push(<span key={key++} style={{ color: '#6c63ff' }}>{selector}</span>);
      result.push(<span key={key++} style={{ color: '#888' }}>{'{'}</span>);
      rest = rest.slice(braceIdx + 1);
    }

    // Closing brace
    const closeIdx = rest.indexOf('}');
    if (closeIdx >= 0) {
      const content = rest.slice(0, closeIdx);
      // Highlight properties and values
      const colonIdx = content.indexOf(':');
      if (colonIdx >= 0) {
        result.push(<span key={key++} style={{ color: '#2563eb' }}>{content.slice(0, colonIdx)}</span>);
        result.push(<span key={key++} style={{ color: '#888' }}>:</span>);
        const val = content.slice(colonIdx + 1);
        // Highlight CSS functions
        const funcMatch = val.match(/(var\([^)]+\)|calc\([^)]+\)|url\([^)]+\)|rgba?\([^)]+\)|hsla?\([^)]+\))/g);
        if (funcMatch) {
          let valRest = val;
          funcMatch.forEach(fn => {
            const idx = valRest.indexOf(fn);
            if (idx > 0) {
              result.push(<span key={key++} style={{ color: '#0a8f4f' }}>{valRest.slice(0, idx)}</span>);
            }
            result.push(<span key={key++} style={{ color: '#d73a49' }}>{fn}</span>);
            valRest = valRest.slice(idx + fn.length);
          });
          if (valRest) {
            result.push(<span key={key++} style={{ color: '#0a8f4f' }}>{valRest}</span>);
          }
        } else {
          result.push(<span key={key++} style={{ color: '#0a8f4f' }}>{val}</span>);
        }
      } else if (content.trim()) {
        result.push(<span key={key++}>{content}</span>);
      }
      result.push(<span key={key++} style={{ color: '#888' }}>{'}'}</span>);
    } else if (rest.trim()) {
      result.push(<span key={key++}>{rest}</span>);
    }

    return <div key={i}>{result}</div>;
  });
}

export default function CSSExample() {
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

      {/* Rendered */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Syntax Highlighted CSS</h3>
        <div style={styles.codeHeader}>
          <span style={styles.langLabel}>CSS</span>
        </div>
        <div style={styles.codeContainer}>
          <pre
            style={{
              margin: 0,
              padding: 16,
              overflow: 'auto',
              fontFamily: "'SF Mono', 'Fira Code', monospace",
              fontSize: 13,
              lineHeight: 1.7,
              color: '#333',
              whiteSpace: 'pre',
            }}
          >
            {highlightCSS(sample.code)}
          </pre>
        </div>
      </div>

      {/* Raw */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Raw CSS</h3>
        <CodeBlock code={sample.code} language="css" />
      </div>

      {/* Usage */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Usage</h3>
        <CodeBlock
          language="tsx"
          title="Parser"
          code={`import { CSSParser } from '@laddhaanshul/content-renderer-core';

const parser = new CSSParser();
const result = parser.parse(cssString);

console.log(result.rules);       // Array of CSS rules
console.log(result.variables);   // CSS custom properties
console.log(result.mediaQueries); // Media query blocks
console.log(result.keyframes);   // @keyframes definitions`}
        />
      </div>
    </div>
  );
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
  codeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 14px',
    background: '#f7f7fa',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottom: '1px solid #e0e0e0',
  },
  langLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#666',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  codeContainer: {
    background: '#fafafa',
    border: '1px solid #e0e0e0',
    borderTop: 'none',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    overflow: 'hidden',
    maxHeight: 500,
  },
};
