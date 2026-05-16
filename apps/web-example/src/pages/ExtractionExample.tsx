import React, { useState, useMemo } from 'react';
import CodeBlock from '../components/CodeBlock';

const sampleHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sample Article - Content Renderer</title>
  <meta name="description" content="A comprehensive guide to content rendering in React applications">
  <meta name="author" content="Alice Johnson">
  <meta name="keywords" content="react, content, rendering, html, markdown">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://example.com/article">
  <link rel="icon" href="/favicon.ico">

  <!-- Open Graph -->
  <meta property="og:title" content="Content Rendering Guide">
  <meta property="og:description" content="Learn how to render any content type in React">
  <meta property="og:image" content="https://example.com/og-image.jpg">
  <meta property="og:url" content="https://example.com/article">
  <meta property="og:type" content="article">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Content Rendering Guide">
  <meta name="twitter:description" content="Learn how to render any content type in React">
  <meta name="twitter:image" content="https://example.com/twitter-image.jpg">

  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Content Rendering Guide",
    "author": { "@type": "Person", "name": "Alice Johnson" },
    "datePublished": "2024-01-15",
    "publisher": {
      "@type": "Organization",
      "name": "Content Renderer"
    }
  }
  </script>
</head>
<body>
  <header>
    <nav>
      <a href="/">Home</a>
      <a href="/docs">Documentation</a>
      <a href="/examples">Examples</a>
      <a href="https://github.com/example/repo" target="_blank" rel="noopener">GitHub</a>
    </nav>
  </header>

  <main>
    <article>
      <h1>Content Rendering in React</h1>
      <h2>Introduction</h2>
      <p>Rendering dynamic content is a common requirement in modern web applications.</p>

      <h2>Features</h2>
      <p>Our library supports <strong>multiple content types</strong>:</p>
      <ul>
        <li>HTML with sanitization</li>
        <li>JSON with tree visualization</li>
        <li>Markdown with GFM extensions</li>
      </ul>

      <h3>Code Example</h3>
      <pre><code>import { HTMLRenderer } from '@laddhaanshul/content-renderer';</code></pre>

      <img src="https://picsum.photos/seed/article/800/400" alt="Article hero image" width="800" height="400" />
      <img src="https://picsum.photos/seed/thumb1/200/150" alt="Thumbnail 1" width="200" height="150" />
      <img src="https://picsum.photos/seed/thumb2/200/150" alt="Thumbnail 2" width="200" height="150" />

      <h2>Getting Started</h2>
      <p>Install the package and start rendering content immediately.</p>
      <a href="https://example.com/install">Installation Guide</a>
    </article>
  </main>

  <footer>
    <p>&copy; 2024 Content Renderer. All rights reserved.</p>
  </footer>
</body>
</html>`;

type ExtractionTab = 'links' | 'images' | 'meta' | 'headings' | 'seo' | 'opengraph' | 'structured' | 'all';

interface ExtractionResult {
  links: { href: string; text: string; external: boolean }[];
  images: { src: string; alt: string; width?: number; height?: number }[];
  meta: { name?: string; property?: string; content: string }[];
  headings: { level: number; text: string }[];
  seo: Record<string, string>;
  og: Record<string, string>;
  structured: any;
}

function extractFromHTML(html: string): ExtractionResult {
  // Links
  const linkRegex = /<a\s[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi;
  const links: ExtractionResult['links'] = [];
  let m;
  while ((m = linkRegex.exec(html)) !== null) {
    const href = m[1];
    const text = m[2].replace(/<[^>]+>/g, '').trim();
    links.push({
      href,
      text,
      external: href.startsWith('http'),
    });
  }

  // Images
  const imgRegex = /<img\s[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*(?:width="(\d*)")?[^>]*(?:height="(\d*)")?/gi;
  const images: ExtractionResult['images'] = [];
  while ((m = imgRegex.exec(html)) !== null) {
    images.push({
      src: m[1],
      alt: m[2],
      width: m[3] ? parseInt(m[3]) : undefined,
      height: m[4] ? parseInt(m[4]) : undefined,
    });
  }

  // Meta
  const metaRegex = /<meta\s+([^>]+)>/gi;
  const metas: ExtractionResult['meta'] = [];
  while ((m = metaRegex.exec(html)) !== null) {
    const tag = m[1];
    const nameMatch = tag.match(/name="([^"]*)"/);
    const propMatch = tag.match(/property="([^"]*)"/);
    const contentMatch = tag.match(/content="([^"]*)"/);
    if (contentMatch) {
      metas.push({
        name: nameMatch?.[1],
        property: propMatch?.[1],
        content: contentMatch[1],
      });
    }
  }

  // Headings
  const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi;
  const headings: ExtractionResult['headings'] = [];
  while ((m = headingRegex.exec(html)) !== null) {
    headings.push({
      level: parseInt(m[1]),
      text: m[2].replace(/<[^>]+>/g, '').trim(),
    });
  }

  // SEO
  const seo: Record<string, string> = {};
  const seoFields: Record<string, RegExp> = {
    title: /<title>([^<]*)<\/title>/,
    description: /<meta\s+name="description"\s+content="([^"]*)"/,
    author: /<meta\s+name="author"\s+content="([^"]*)"/,
    robots: /<meta\s+name="robots"\s+content="([^"]*)"/,
    canonical: /<link\s+rel="canonical"\s+href="([^"]*)"/,
    viewport: /<meta\s+name="viewport"\s+content="([^"]*)"/,
    charset: /<meta\s+charset="([^"]*)"/,
  };
  Object.entries(seoFields).forEach(([key, regex]) => {
    const match = html.match(regex);
    if (match) seo[key] = match[1];
  });

  // Open Graph
  const og: Record<string, string> = {};
  const ogRegex = /<meta\s+property="og:([^"]*)"\s+content="([^"]*)"/gi;
  while ((m = ogRegex.exec(html)) !== null) {
    og[m[1]] = m[2];
  }

  // Structured Data
  const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
  let structured = null;
  if (jsonLdMatch) {
    try {
      structured = JSON.parse(jsonLdMatch[1].trim());
    } catch { /* ignore */ }
  }

  return { links, images, meta: metas, headings, seo, og, structured };
}

const tabs: { key: ExtractionTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'links', label: 'Links' },
  { key: 'images', label: 'Images' },
  { key: 'meta', label: 'Meta Tags' },
  { key: 'headings', label: 'Headings' },
  { key: 'seo', label: 'SEO' },
  { key: 'opengraph', label: 'Open Graph' },
  { key: 'structured', label: 'Structured Data' },
];

export default function ExtractionExample() {
  const [activeTab, setActiveTab] = useState<ExtractionTab>('all');

  const extracted = useMemo(() => extractFromHTML(sampleHTML), []);

  return (
    <div>
      {/* Tabs */}
      <div style={styles.tabBar}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              ...styles.tab,
              ...(activeTab === tab.key ? styles.tabActive : {}),
            }}
          >
            {tab.label}
            {tab.key !== 'all' && (
              <span style={styles.badge}>
                {tab.key === 'links' ? extracted.links.length
                  : tab.key === 'images' ? extracted.images.length
                  : tab.key === 'meta' ? extracted.meta.length
                  : tab.key === 'headings' ? extracted.headings.length
                  : tab.key === 'seo' ? Object.keys(extracted.seo).length
                  : tab.key === 'opengraph' ? Object.keys(extracted.og).length
                  : extracted.structured ? 1 : 0}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Links */}
      {(activeTab === 'all' || activeTab === 'links') && (
        <Section title={`Links (${extracted.links.length})`}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Text</th>
                <th style={styles.th}>Href</th>
                <th style={styles.th}>Type</th>
              </tr>
            </thead>
            <tbody>
              {extracted.links.map((link, i) => (
                <tr key={i}>
                  <td style={styles.td}>{link.text}</td>
                  <td style={styles.td}><code style={styles.mono}>{link.href}</code></td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.typeBadge,
                      background: link.external ? '#fef3c7' : '#d1fae5',
                      color: link.external ? '#92400e' : '#065f46',
                    }}>
                      {link.external ? 'external' : 'internal'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      {/* Images */}
      {(activeTab === 'all' || activeTab === 'images') && (
        <Section title={`Images (${extracted.images.length})`}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Preview</th>
                <th style={styles.th}>Alt</th>
                <th style={styles.th}>Dimensions</th>
                <th style={styles.th}>Src</th>
              </tr>
            </thead>
            <tbody>
              {extracted.images.map((img, i) => (
                <tr key={i}>
                  <td style={styles.td}>
                    <img src={img.src} alt={img.alt} style={styles.imgThumb} />
                  </td>
                  <td style={styles.td}>{img.alt}</td>
                  <td style={styles.td}>
                    {img.width && img.height ? `${img.width}×${img.height}` : '—'}
                  </td>
                  <td style={styles.td}><code style={styles.mono}>{img.src}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      {/* Meta Tags */}
      {(activeTab === 'all' || activeTab === 'meta') && (
        <Section title={`Meta Tags (${extracted.meta.length})`}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name/Property</th>
                <th style={styles.th}>Content</th>
              </tr>
            </thead>
            <tbody>
              {extracted.meta.map((m, i) => (
                <tr key={i}>
                  <td style={styles.td}>
                    <code style={styles.mono}>{m.property ? `og:${m.property}` : m.name}</code>
                  </td>
                  <td style={styles.td}>{m.content}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      {/* Headings */}
      {(activeTab === 'all' || activeTab === 'headings') && (
        <Section title={`Headings (${extracted.headings.length})`}>
          {extracted.headings.map((h, i) => (
            <div key={i} style={styles.headingRow}>
              <span style={{ ...styles.headingBadge, background: h.level <= 2 ? '#eef2ff' : '#f0f0f8' }}>
                H{h.level}
              </span>
              <span style={{ fontSize: 16 - h.level }}>{h.text}</span>
            </div>
          ))}
        </Section>
      )}

      {/* SEO */}
      {(activeTab === 'all' || activeTab === 'seo') && (
        <Section title="SEO Data">
          <div style={styles.dataGrid}>
            {Object.entries(extracted.seo).map(([key, value]) => (
              <div key={key} style={styles.dataItem}>
                <span style={styles.dataKey}>{key}</span>
                <span style={styles.dataValue}>{value}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Open Graph */}
      {(activeTab === 'all' || activeTab === 'opengraph') && (
        <Section title="Open Graph Data">
          <div style={styles.dataGrid}>
            {Object.entries(extracted.og).map(([key, value]) => (
              <div key={key} style={styles.dataItem}>
                <span style={styles.dataKey}>og:{key}</span>
                <span style={styles.dataValue}>{value}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Structured Data */}
      {(activeTab === 'all' || activeTab === 'structured') && (
        <Section title="Structured Data (JSON-LD)">
          {extracted.structured ? (
            <pre style={styles.jsonPre}>{JSON.stringify(extracted.structured, null, 2)}</pre>
          ) : (
            <p style={{ color: '#888' }}>No structured data found.</p>
          )}
        </Section>
      )}

      {/* Usage */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Usage</h3>
        <CodeBlock
          language="tsx"
          title="Extraction API"
          code={`import {
  extractLinks, extractImages, extractMeta,
  extractHeadings, extractSEO, extractOpenGraph,
  extractStructuredData, extractAll
} from '@laddhaanshul/content-renderer-core';

// Extract individual types
const links = extractLinks(htmlContent);
const images = extractImages(htmlContent);
const headings = extractHeadings(htmlContent);
const seo = extractSEO(htmlContent);
const og = extractOpenGraph(htmlContent);
const jsonLd = extractStructuredData(htmlContent);

// Extract everything at once
const all = extractAll(htmlContent);
console.log(all.links, all.images, all.meta);`}
        />
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={styles.section}>
      <h3 style={styles.sectionTitle}>{title}</h3>
      {children}
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
    overflowX: 'auto' as const,
  },
  tab: {
    padding: '8px 16px',
    background: 'transparent',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    cursor: 'pointer',
    color: '#555',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    whiteSpace: 'nowrap' as const,
  },
  tabActive: {
    background: '#6c63ff',
    color: '#fff',
    fontWeight: 600,
  },
  badge: {
    background: '#ffffff33',
    padding: '1px 6px',
    borderRadius: 10,
    fontSize: 11,
  },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#1a1a2e' },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: 13,
    background: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    border: '1px solid #e0e0e0',
  },
  th: {
    padding: '10px 12px',
    textAlign: 'left' as const,
    background: '#f7f7fa',
    borderBottom: '2px solid #e0e0e0',
    fontWeight: 600,
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  td: {
    padding: '8px 12px',
    borderBottom: '1px solid #f0f0f0',
    color: '#333',
  },
  mono: {
    fontFamily: "'SF Mono', monospace",
    fontSize: 12,
    color: '#6c63ff',
    background: '#f5f5f8',
    padding: '1px 4px',
    borderRadius: 3,
  },
  typeBadge: {
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
  },
  imgThumb: {
    width: 48,
    height: 36,
    objectFit: 'cover' as const,
    borderRadius: 4,
  },
  headingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '6px 0',
    borderBottom: '1px solid #f0f0f0',
  },
  headingBadge: {
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 700,
    color: '#6c63ff',
    minWidth: 32,
    textAlign: 'center' as const,
  },
  dataGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 8,
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    padding: 12,
  },
  dataItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
    padding: '8px 12px',
    background: '#fafafa',
    borderRadius: 6,
  },
  dataKey: { fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  dataValue: { fontSize: 14, color: '#333', wordBreak: 'break-all' as const },
  jsonPre: {
    background: '#1e1e2e',
    color: '#cdd6f4',
    padding: 16,
    borderRadius: 8,
    fontFamily: "'SF Mono', monospace",
    fontSize: 13,
    overflow: 'auto',
    lineHeight: 1.6,
  },
};
