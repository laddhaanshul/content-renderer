import React from 'react';
import { MarkdownRenderer, HTMLRenderer } from '@laddhaanshul/content-renderer';
import { createMermaidPlugin, createKaTeXPlugin } from '@laddhaanshul/content-renderer-core';

const mermaidContent = `
# Mermaid Diagrams
Render complex diagrams directly in your markdown.

\`\`\`mermaid
graph TD
    A[Client] -->|Request| B(Load Balancer)
    B --> C{Strategy}
    C -->|Round Robin| D[Server 1]
    C -->|Least Conn| E[Server 2]
\`\`\`
`;

const mathContent = `
# Math Rendering (KaTeX)
Support for complex mathematical expressions.

Inline math: $E = mc^2$ and $\\sqrt{a^2 + b^2} = c$.

Block math:
$$\\int_{a}^{b} f(x) dx = F(b) - F(a)$$

Even complex matrices:
$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$$
`;

export default function PluginExample() {
  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={styles.section}>
        <h2>Advanced Plugins</h2>
        <p>Showcasing the new built-in ecosystem plugins for technical content.</p>
      </div>

      <div style={styles.row}>
        <div style={styles.card}>
          <h3>Mermaid.js Diagrams</h3>
          <MarkdownRenderer 
            content={mermaidContent} 
            plugins={[createMermaidPlugin()]} 
          />
          <div style={styles.note}>
            Note: On the web, make sure to include <code>mermaid.js</code> in your page or use a renderer that handles the <code>.mermaid</code> class.
          </div>
        </div>

        <div style={styles.card}>
          <h3>KaTeX Mathematics</h3>
          <MarkdownRenderer 
            content={mathContent} 
            plugins={[createKaTeXPlugin()]} 
          />
          <div style={styles.note}>
            Note: Include the KaTeX CSS for proper styling of math elements.
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <h3>Registering Plugins</h3>
        <pre style={styles.pre}>{`import { MarkdownRenderer } from '@laddhaanshul/content-renderer';
import { createMermaidPlugin, createKaTeXPlugin } from '@laddhaanshul/content-renderer-core';

<MarkdownRenderer
  content={content}
  plugins={[
    createMermaidPlugin(),
    createKaTeXPlugin()
  ]}
/>`}</pre>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  section: { marginBottom: 24 },
  row: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
    gap: 24,
    marginBottom: 32 
  },
  card: {
    padding: 24,
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: 12,
  },
  note: {
    marginTop: 16,
    padding: 12,
    background: '#f8f9fa',
    borderRadius: 6,
    fontSize: 12,
    color: '#666',
    borderLeft: '4px solid #6c63ff'
  },
  pre: {
    padding: 16,
    background: '#1a1a2e',
    color: '#efefef',
    borderRadius: 8,
    fontSize: 13,
    overflow: 'auto'
  }
};

