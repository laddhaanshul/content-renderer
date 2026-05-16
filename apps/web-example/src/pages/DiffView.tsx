import React, { useState } from 'react';
import { DiffRenderer } from '@laddhaanshul/content-renderer';

export default function DiffView() {
  const [oldCode, setOldCode] = useState(`function hello() {
  console.log("Hello World");
  return true;
}`);
  const [newCode, setNewCode] = useState(`function hello(name: string) {
  console.log(\`Hello \${name}!\`);
  return { success: true, timestamp: Date.now() };
}

function goodbye(name: string) {
  console.log(\`Goodbye \${name}!\`);
  return false;
}`);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Diff View</h2>
      <p style={styles.description}>Compare two versions of code with syntax-aware diff rendering.</p>
      <div style={styles.editorGrid}>
        <div>
          <h3 style={styles.subheading}>Old Version</h3>
          <textarea
            value={oldCode}
            onChange={e => setOldCode(e.target.value)}
            rows={10}
            style={styles.textarea}
          />
        </div>
        <div>
          <h3 style={styles.subheading}>New Version</h3>
          <textarea
            value={newCode}
            onChange={e => setNewCode(e.target.value)}
            rows={10}
            style={styles.textarea}
          />
        </div>
      </div>
      <h3 style={styles.subheading}>Diff Result</h3>
      <DiffRenderer oldText={oldCode} newText={newCode} language="typescript" showLineNumbers />
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
  editorGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
    marginBottom: 24,
  },
  textarea: {
    width: '100%',
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    fontSize: 13,
    padding: 12,
    borderRadius: 8,
    border: '1px solid #e0e0e0',
    background: '#f8f8fc',
    resize: 'vertical' as const,
  },
};
