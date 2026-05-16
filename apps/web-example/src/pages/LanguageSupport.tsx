import React, { useState } from 'react';
import { getAllLanguageNames, getLanguageExtensions, getLanguageDefinition } from '@laddhaanshul/content-renderer';

export default function LanguageSupport() {
  const languages = getAllLanguageNames();
  const [selected, setSelected] = useState(languages[0]);
  const def = getLanguageDefinition(selected);
  const extensions = getLanguageExtensions();

  // Group extensions by language for display
  const extMap: Record<string, string[]> = {};
  for (const [ext, lang] of Object.entries(extensions)) {
    if (!extMap[lang]) extMap[lang] = [];
    extMap[lang].push(ext);
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Language Support</h2>
      <p style={styles.description}>
        {languages.length} programming languages with syntax definitions. Click a language to see its details.
      </p>

      <div style={styles.langGrid}>
        {languages.map(name => (
          <button
            key={name}
            onClick={() => setSelected(name)}
            style={{
              ...styles.langBtn,
              ...(selected === name ? styles.langBtnActive : {}),
            }}
          >
            {name}
          </button>
        ))}
      </div>

      {def && (
        <div style={styles.details}>
          <h3 style={styles.detailTitle}>{def.name}</h3>

          <div style={styles.detailRow}>
            <strong style={styles.detailLabel}>Keywords ({def.keywords.length}):</strong>
            <p style={styles.detailValue}>
              {def.keywords.slice(0, 20).join(', ')}{def.keywords.length > 20 ? ' ...' : ''}
            </p>
          </div>

          <div style={styles.detailRow}>
            <strong style={styles.detailLabel}>Built-ins ({def.builtins.length}):</strong>
            <p style={styles.detailValue}>
              {def.builtins.slice(0, 15).join(', ')}{def.builtins.length > 15 ? ' ...' : ''}
            </p>
          </div>

          <div style={styles.detailRow}>
            <strong style={styles.detailLabel}>Comments:</strong>
            <p style={styles.detailValue}>
              Single: {def.commentSingle || 'none'} / Multi: {def.commentMulti ? `${def.commentMulti[0]} ... ${def.commentMulti[1]}` : 'none'}
            </p>
          </div>

          <div style={styles.detailRow}>
            <strong style={styles.detailLabel}>Strings:</strong>
            <p style={styles.detailValue}>{def.stringChars.join(', ')}</p>
          </div>

          <div style={styles.detailRow}>
            <strong style={styles.detailLabel}>Extensions:</strong>
            <p style={styles.detailValue}>{extMap[def.name]?.join(', ') || 'N/A'}</p>
          </div>

          {def.caseInsensitive && (
            <div style={styles.detailRow}>
              <strong style={styles.detailLabel}>Case Insensitive:</strong>
              <p style={styles.detailValue}>Yes</p>
            </div>
          )}
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
  langGrid: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap' as const,
    marginBottom: 20,
    maxHeight: 200,
    overflowY: 'auto' as const,
    padding: 4,
  },
  langBtn: {
    padding: '2px 8px',
    background: '#f0f0f8',
    color: '#333',
    border: '1px solid #ddd',
    cursor: 'pointer',
    borderRadius: 4,
    fontSize: 12,
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    transition: 'all 0.15s',
  },
  langBtnActive: {
    background: '#333',
    color: '#fff',
    border: '1px solid #333',
  },
  details: {
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    padding: 20,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#1a1a2e',
    marginBottom: 16,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    display: 'block',
    fontSize: 13,
    color: '#6c63ff',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#444',
    margin: 0,
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    lineHeight: 1.6,
    wordBreak: 'break-word' as const,
  },
};
