import React, { useState } from 'react';
import { queryPath } from '@laddhaanshul/content-renderer';

const sampleData = {
  store: {
    book: [
      { category: "reference", author: "Nigel Rees", title: "Sayings of the Century", price: 8.95 },
      { category: "fiction", author: "Evelyn Waugh", title: "Sword of Honour", price: 12.99 },
      { category: "fiction", author: "Herman Melville", title: "Moby Dick", price: 8.99 },
      { category: "fiction", author: "J. R. R. Tolkien", title: "The Lord of the Rings", price: 22.99 }
    ],
    bicycle: { color: "red", price: 19.95 }
  }
};

export default function JSONPathQuery() {
  const [path, setPath] = useState('$.store.book[*].author');
  const results = queryPath(sampleData, path);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>JSONPath Query</h2>
      <p style={styles.description}>Query JSON data using JSONPath expressions.</p>
      <div style={{ marginBottom: 16 }}>
        <input
          value={path}
          onChange={e => setPath(e.target.value)}
          placeholder="$.store.book[*].author"
          style={styles.input}
        />
      </div>
      <h3 style={styles.subheading}>Results ({results.length} match{results.length !== 1 ? 'es' : ''})</h3>
      <pre style={styles.pre}>{JSON.stringify(results, null, 2)}</pre>
      <h3 style={styles.subheading}>Sample Paths to Try</h3>
      <ul style={styles.list}>
        <li><code style={styles.code}>$.store.book[*].author</code></li>
        <li><code style={styles.code}>$.store..price</code></li>
        <li><code style={styles.code}>$.store.book[?(@.price &lt; 10)]</code></li>
        <li><code style={styles.code}>$.store.book[0:2]</code></li>
        <li><code style={styles.code}>$..bicycle.color</code></li>
      </ul>
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
    marginBottom: 8,
  },
  input: {
    width: '100%',
    maxWidth: 500,
    padding: '8px 12px',
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    fontSize: 14,
    borderRadius: 8,
    border: '1px solid #e0e0e0',
    background: '#f8f8fc',
  },
  pre: {
    background: '#f5f5f8',
    padding: 16,
    borderRadius: 8,
    fontSize: 13,
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    overflow: 'auto' as const,
    border: '1px solid #e0e0e0',
    marginBottom: 24,
  },
  list: {
    fontSize: 14,
    lineHeight: 2,
    color: '#444',
  },
  code: {
    background: '#f0f0f8',
    padding: '2px 6px',
    borderRadius: 4,
    fontSize: 13,
    color: '#6c63ff',
    fontFamily: "'SF Mono', 'Fira Code', monospace",
  },
};
