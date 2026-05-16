import React, { useState } from 'react';
import {
  sanitizeHTML,
  sanitizeHTMLWithOptions,
  stripTags,
  stripAttributes,
  stripScripts,
  escapeHTML,
  DEFAULT_ALLOWED_TAGS,
  DEFAULT_ALLOWED_ATTRIBUTES,
} from '@laddhaanshul/content-renderer';

const styles = {
  container: { padding: 24 } as React.CSSProperties,
  subheading: { fontSize: 18, fontWeight: 600, marginTop: 20, marginBottom: 10 } as React.CSSProperties,
  code: { background: '#f3f4f6', padding: 16, borderRadius: 6, fontSize: 13, overflow: 'auto' as const, maxHeight: 300 },
  button: { padding: '8px 16px', marginRight: 8, border: 'none', borderRadius: 4, cursor: 'pointer' as const },
};

const tagList = Array.from(DEFAULT_ALLOWED_TAGS).sort();

export default function SanitizeDemo() {
  const [input, setInput] = useState('<p>Hello <script>alert("xss")</script> World</p><img src="x" onerror="alert(1)">');
  const [result, setResult] = useState('');

  const handleSanitize = () => {
    setResult(sanitizeHTML(input));
  };

  const handleWithOptions = () => {
    setResult(sanitizeHTMLWithOptions(input, {
      allowedTags: ['p', 'b', 'i', 'a', 'br'],
      disallowedAttributes: ['style'],
    }));
  };

  return (
    <div style={styles.container}>
      <h2>Sanitize Demo</h2>
      <p>HTML sanitization with configurable allowed tags, attributes, and security rules. Strip dangerous elements while preserving safe content.</p>

      <h3 style={styles.subheading}>Input HTML</h3>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={4}
        style={{ width: '100%', padding: 8, fontSize: 13, fontFamily: 'monospace' }}
      />
      <div style={{ marginTop: 8 }}>
        <button onClick={handleSanitize} style={{ ...styles.button, background: '#2563eb', color: '#fff' }}>Sanitize (Default)</button>
        <button onClick={handleWithOptions} style={{ ...styles.button, background: '#059669', color: '#fff' }}>Sanitize (Custom)</button>
      </div>

      {result && (
        <>
          <h3 style={styles.subheading}>Result</h3>
          <pre style={styles.code}>{escapeHTML(result)}</pre>
        </>
      )}

      <h3 style={styles.subheading}>Default Allowed Tags ({tagList.length})</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {tagList.slice(0, 60).map((tag: string) => (
          <code key={tag} style={{ background: '#e5e7eb', padding: '2px 6px', borderRadius: 3, fontSize: 12 }}>{tag}</code>
        ))}
        {tagList.length > 60 && <span>... and {tagList.length - 60} more</span>}
      </div>

      <h3 style={styles.subheading}>Available Functions</h3>
      <pre style={styles.code}>{`sanitizeHTML(content, options?)       // Full sanitization
sanitizeHTMLWithOptions(content, opts)  // Alias with custom options
sanitizeSVG(svgContent)               // SVG-specific cleanup
sanitizeMathML(content)               // MathML-specific cleanup
stripTags(content, tags?)             // Remove specific tags
stripAttributes(content, attrs?)      // Remove specific attributes
stripScripts(content)                 // Remove all script elements
stripEventHandlers(content)            // Remove on* attributes
stripDataAttributes(content)           // Remove data-* attributes
isSafeHTML(content)                   // Safety check
escapeHTML(content)                   // HTML entity encoding`}</pre>
    </div>
  );
}
