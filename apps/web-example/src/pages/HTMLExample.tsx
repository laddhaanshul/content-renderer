import React, { useState } from 'react';
import CodeBlock from '../components/CodeBlock';

const samples: Record<string, { label: string; code: string }> = {
  basic: {
    label: 'Basic HTML',
    code: `<h1>Hello World</h1>
<p>This is a paragraph of text rendered from HTML content.</p>
<h2>Sub-heading</h2>
<p>Another paragraph with <strong>bold</strong> and <em>italic</em> text.</p>`,
  },
  inlineStyles: {
    label: 'Inline Styles',
    code: `<div style="padding: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; color: white;">
  <h2 style="margin: 0 0 8px;">Styled Card</h2>
  <p style="margin: 0; opacity: 0.9;">This card uses inline CSS styles and a gradient background.</p>
</div>`,
  },
  links: {
    label: 'Links',
    code: `<p>Here are some useful links:</p>
<ul>
  <li><a href="https://react.dev" target="_blank" rel="noopener">React Documentation</a></li>
  <li><a href="https://github.com" target="_blank" rel="noopener">GitHub</a></li>
  <li><a href="#section-1">Internal anchor link</a></li>
  <li><a href="mailto:hello@example.com">Email link</a></li>
</ul>`,
  },
  images: {
    label: 'Images',
    code: `<figure>
  <img src="https://picsum.photos/seed/demo/600/300" alt="Demo image" width="600" height="300" style="border-radius: 8px;" />
  <figcaption style="text-align: center; color: #888; margin-top: 8px; font-size: 14px;">A sample image with a caption</figcaption>
</figure>`,
  },
  tables: {
    label: 'Tables',
    code: `<table style="width: 100%; border-collapse: collapse; font-size: 14px;">
  <thead>
    <tr style="background: #f0f0f8;">
      <th style="padding: 10px 12px; text-align: left; border-bottom: 2px solid #d0d0d0;">Name</th>
      <th style="padding: 10px 12px; text-align: left; border-bottom: 2px solid #d0d0d0;">Type</th>
      <th style="padding: 10px 12px; text-align: left; border-bottom: 2px solid #d0d0d0;">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">HTMLRenderer</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">Component</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">Renders HTML strings as React elements</td></tr>
    <tr><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">JSONRenderer</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">Component</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">Renders JSON with collapsible tree view</td></tr>
    <tr><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">MarkdownRenderer</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">Component</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">Renders Markdown with full GFM support</td></tr>
    <tr><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">CSSRenderer</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">Component</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">CSS syntax highlighting with scoped styles</td></tr>
  </tbody>
</table>`,
  },
  forms: {
    label: 'Forms',
    code: `<form style="max-width: 400px;">
  <div style="margin-bottom: 12px;">
    <label style="display: block; font-weight: 600; margin-bottom: 4px;">Name</label>
    <input type="text" placeholder="Enter your name" style="width: 100%; padding: 8px 12px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px;" />
  </div>
  <div style="margin-bottom: 12px;">
    <label style="display: block; font-weight: 600; margin-bottom: 4px;">Message</label>
    <textarea placeholder="Write your message" rows="3" style="width: 100%; padding: 8px 12px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px; resize: vertical;"></textarea>
  </div>
  <button type="button" style="padding: 10px 24px; background: #6c63ff; color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer;">Submit</button>
</form>`,
  },
  cssStyled: {
    label: 'CSS Classes',
    code: `<style>
    .card { padding: 16px; border-radius: 12px; background: #f0f4ff; margin: 8px 0; }
    .card h2 { color: #4338ca; font-size: 20px; margin: 0 0 8px; }
    .card p { color: #4b5563; line-height: 1.6; margin: 0; }
    .highlight { background: #fef3c7; padding: 2px 6px; border-radius: 4px; }
    .badge { display: inline-block; background: #6c63ff; color: white; padding: 2px 10px; border-radius: 12px; font-size: 12px; }
    .tag { display: inline-block; background: #e0e7ff; color: #4338ca; padding: 2px 8px; border-radius: 4px; margin: 2px; font-size: 12px; }
    @media (max-width: 400px) { .card { padding: 8px; } }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-top: 12px; }
    .grid-item { background: #f8f8fc; padding: 16px; border-radius: 8px; text-align: center; }
  </style>
  <div class="card">
    <h2>CSS Styled Card</h2>
    <p>This card uses <span class="highlight">class-based CSS</span> for styling.</p>
    <div><span class="tag">react</span><span class="tag">css</span><span class="tag">classes</span></div>
    <span class="badge">Styled</span>
  </div>
  <div class="grid">
    <div class="grid-item">Grid 1</div>
    <div class="grid-item">Grid 2</div>
    <div class="grid-item">Grid 3</div>
  </div>`,
  },
  svg: {
    label: 'SVG Graphics',
    code: `<div style="text-align: center; padding: 16px;">
    <h3>Inline SVG Rendering</h3>
    <svg width="200" height="100" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#6c63ff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#00d4ff;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="10" y="10" width="80" height="80" rx="12" fill="url(#grad1)" />
      <circle cx="150" cy="50" r="40" fill="#6c63ff" opacity="0.8" />
      <circle cx="150" cy="50" r="20" fill="#fff" opacity="0.9" />
    </svg>
  </div>`,
  },
  cssGrid: {
    label: 'CSS Grid Layout',
    code: `<div style="padding: 16px;">
    <h3>CSS Grid Layout</h3>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-top: 12px;">
      <div style="background: #6c63ff; color: white; padding: 20px; border-radius: 8px; text-align: center;">Column 1</div>
      <div style="background: #00d4ff; color: white; padding: 20px; border-radius: 8px; text-align: center;">Column 2</div>
      <div style="background: #ff6b6b; color: white; padding: 20px; border-radius: 8px; text-align: center;">Column 3</div>
    </div>
    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 12px; margin-top: 12px;">
      <div style="background: #f0f4ff; padding: 16px; border-radius: 8px; border: 1px solid #e0e7ff;">Sidebar (1fr)</div>
      <div style="background: #f8f8fc; padding: 16px; border-radius: 8px; border: 1px solid #e0e0e0;">Main Content (2fr)</div>
    </div>
  </div>`,
  },
  stripped: {
    label: 'Strip Scripts',
    code: `<div>
  <h2>Clean Content</h2>
  <p>This content had dangerous scripts that were stripped.</p>
  <script>alert('This should be removed!')</script>
  <p>Only safe HTML remains after sanitization.</p>
</div>`,
  },
  fullDoc: {
    label: 'Full Document',
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sample Page</title>
  <meta name="description" content="A sample HTML document">
</head>
<body>
  <header style="background: #1a1a2e; color: white; padding: 20px;">
    <h1>Full HTML Document</h1>
    <p>This is a complete HTML document with head and body.</p>
  </header>
  <main style="padding: 20px;">
    <section>
      <h2>Section One</h2>
      <p>The renderer extracts the body content from full documents.</p>
    </section>
    <section>
      <h2>Section Two</h2>
      <p>Meta tags from the head can be extracted separately.</p>
    </section>
  </main>
  <footer style="padding: 16px 20px; background: #f5f5f5; text-align: center; color: #888; font-size: 13px;">
    Footer content
  </footer>
</body>
</html>`,
  },
};

export default function HTMLExample() {
  const [activeSample, setActiveSample] = useState('basic');
  const [sanitize, setSanitize] = useState(true);

  const current = samples[activeSample];

  const handleLinkClick = (href: string) => {
    alert(`Link clicked: ${href}`);
  };

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
        <label style={styles.toggleLabel}>
          <input
            type="checkbox"
            checked={sanitize}
            onChange={(e) => setSanitize(e.target.checked)}
          />
          <span>Sanitize HTML</span>
        </label>
      </div>

      {/* Source code */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Source HTML</h3>
        <CodeBlock code={current.code} language="html" title="Input" />
      </div>

      {/* Rendered output */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Rendered Output</h3>
        <div
          style={{
            ...styles.preview,
            padding: sanitize ? 20 : 16,
          }}
        >
          <div
            dangerouslySetInnerHTML={{ __html: sanitize
              ? current.code
                .replace(/<script[\s\S]*?<\/script>/gi, '<!-- script removed -->')
                .replace(/<style[\s\S]*?<\/style>/gi, '<!-- style removed -->')
                .replace(/onclick[^>]*>/gi, '>')
                .replace(/onerror[^>]*>/gi, '>')
                .replace(/onload[^>]*>/gi, '>')
              : current.code
            }}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (target.tagName === 'A') {
                e.preventDefault();
                handleLinkClick(target.getAttribute('href') || '');
              }
              if (target.tagName === 'BUTTON') {
                e.preventDefault();
              }
            }}
          />
        </div>
      </div>

      {/* Usage */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Usage</h3>
        <CodeBlock
          language="tsx"
          title="Component"
          code={`import { HTMLRenderer } from '@laddhaanshul/content-renderer';

function MyComponent() {
  return (
    <HTMLRenderer
      html={htmlString}
      sanitize={${sanitize}}
      enableStyles={true}
      scopeStyles={true}
      customCSS=".my-custom { color: red; }"
    />
  );
}`}
        />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: 12,
    marginBottom: 20,
    padding: 16,
    background: '#fff',
    borderRadius: 8,
    border: '1px solid #e0e0e0',
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
  toggleLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    color: '#555',
    cursor: 'pointer',
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 12,
    color: '#1a1a2e',
  },
  preview: {
    background: '#fff',
    borderRadius: 8,
    border: '1px solid #e0e0e0',
    minHeight: 100,
    lineHeight: 1.7,
    fontSize: 14,
    color: '#333',
    overflow: 'auto',
  },
};
