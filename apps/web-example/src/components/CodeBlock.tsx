import React from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export default function CodeBlock({ code, language, title }: CodeBlockProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div style={styles.wrapper}>
      {(title || language) && (
        <div style={styles.header}>
          <span style={styles.title}>
            {title || language?.toUpperCase() || 'CODE'}
          </span>
          <button onClick={handleCopy} style={styles.copyBtn} title="Copy">
            Copy
          </button>
        </div>
      )}
      <pre style={styles.pre}>
        <code style={styles.code}>{code}</code>
      </pre>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    borderRadius: 8,
    overflow: 'hidden',
    border: '1px solid #e0e0e0',
    marginBottom: 16,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 14px',
    background: '#f7f7fa',
    borderBottom: '1px solid #e0e0e0',
  },
  title: {
    fontSize: 12,
    fontWeight: 600,
    color: '#666',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  copyBtn: {
    background: 'transparent',
    border: '1px solid #d0d0d0',
    borderRadius: 4,
    padding: '2px 10px',
    fontSize: 11,
    color: '#666',
    cursor: 'pointer',
  },
  pre: {
    margin: 0,
    padding: 14,
    background: '#fafafa',
    overflowX: 'auto' as const,
    fontSize: 13,
    lineHeight: 1.6,
  },
  code: {
    fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
    color: '#333',
  },
};
