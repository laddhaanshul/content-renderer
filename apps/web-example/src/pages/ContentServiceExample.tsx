import React, { useState } from 'react';
import CodeBlock from '../components/CodeBlock';

interface SampleScenario {
  label: string;
  description: string;
  mockResponse: string;
  renderedHTML: string;
}

const samples: Record<string, SampleScenario> = {
  directHtml: {
    label: 'Direct HTML',
    description: 'API returns raw HTML content directly (e.g., a CMS endpoint or server-rendered snippet).',
    mockResponse: `// GET /api/content/homepage
{
  "status": 200,
  "contentType": "text/html",
  "body": "<h1>Welcome to Our Platform</h1>\\n<p>Build amazing experiences with our content service.</p>\\n<ul>\\n  <li>Fast rendering</li>\\n  <li>Sanitized output</li>\\n  <li>Cross-platform support</li>\\n</ul>"
}`,
    renderedHTML: `<h1>Welcome to Our Platform</h1>
<p>Build amazing experiences with our content service.</p>
<ul>
  <li>Fast rendering</li>
  <li>Sanitized output</li>
  <li>Cross-platform support</li>
</ul>`,
  },
  jsonHtml: {
    label: 'JSON + HTML',
    description: 'API returns JSON with an HTML field — common with REST APIs that embed rich text.',
    mockResponse: `// GET /api/pages/about
{
  "id": "about",
  "title": "About Us",
  "author": "Content Team",
  "publishedAt": "2024-12-01T10:30:00Z",
  "content": "<h2>Our Mission</h2>\\n<p>We build tools that make content rendering effortless.</p>\\n<blockquote style=\\"border-left: 4px solid #6c63ff; padding: 12px 16px; margin: 16px 0; background: #f5f5f8; border-radius: 0 8px 8px 0;\\">\\n  <p>\\u201cGreat content deserves great rendering.\\u201d</p>\\n</blockquote>\\n<p>Learn more at <a href=\\"https://example.com\\">example.com</a></p>"
}`,
    renderedHTML: `<h2>Our Mission</h2>
<p>We build tools that make content rendering effortless.</p>
<blockquote style="border-left: 4px solid #6c63ff; padding: 12px 16px; margin: 16px 0; background: #f5f5f8; border-radius: 0 8px 8px 0;">
  <p>&ldquo;Great content deserves great rendering.&rdquo;</p>
</blockquote>
<p>Learn more at <a href="https://example.com">example.com</a></p>`,
  },
  aem: {
    label: 'AEM-style',
    description: 'Adobe Experience Manager style response with nested content fragments and rich text.',
    mockResponse: `// GET /api/content/wknd/en/adventures
{
  ":type": "cq/Page",
  "jcr:title": "WKND Adventures",
  "jcr:description": "Explore the outdoors with WKND",
  "content": {
    "jcr:title": "WKND Adventures",
    "jcr:description": "Explore the outdoors",
    "hero": {
      "title": "Find Your Next Adventure",
      "description": "Discover hiking, camping, and kayaking trips curated by experts.",
      "imageRef": "/content/dam/wknd/hero.jpg"
    },
    "main": {
      "text": "<h2>Featured Trips</h2>\\n<div style=\\"display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px;\\">\\n  <div style=\\"background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);\\">\\n    <div style=\\"background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); height: 120px;\\"></div>\\n    <div style=\\"padding: 16px;\\">\\n      <h3 style=\\"margin: 0 0 8px;\\">Yosemite Valley</h3>\\n      <p style=\\"color: #666; margin: 0; font-size: 14px;\\">3-day guided hike through iconic granite cliffs.</p>\\n    </div>\\n  </div>\\n  <div style=\\"background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);\\">\\n    <div style=\\"background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); height: 120px;\\"></div>\\n    <div style=\\"padding: 16px;\\">\\n      <h3 style=\\"margin: 0 0 8px;\\">Pacific Coast</h3>\\n      <p style=\\"color: #666; margin: 0; font-size: 14px;\\">Coastal kayaking adventure along Big Sur.</p>\\n    </div>\\n  </div>\\n</div>"
    }
  }
}`,
    renderedHTML: `<h2>Featured Trips</h2>
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px;">
  <div style="background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); height: 120px;"></div>
    <div style="padding: 16px;">
      <h3 style="margin: 0 0 8px;">Yosemite Valley</h3>
      <p style="color: #666; margin: 0; font-size: 14px;">3-day guided hike through iconic granite cliffs.</p>
    </div>
  </div>
  <div style="background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); height: 120px;"></div>
    <div style="padding: 16px;">
      <h3 style="margin: 0 0 8px;">Pacific Coast</h3>
      <p style="color: #666; margin: 0; font-size: 14px;">Coastal kayaking adventure along Big Sur.</p>
    </div>
  </div>
</div>`,
  },
  headlessCms: {
    label: 'Headless CMS',
    description: 'Contentful / Strapi / Sanity style response with rich text stored as structured HTML.',
    mockResponse: `// GET /api/articles/slug/building-modern-uis
{
  "sys": { "id": "abc123", "type": "Entry" },
  "fields": {
    "title": "Building Modern UIs with Content Rendering",
    "slug": "building-modern-uis",
    "author": {
      "name": "Jane Developer",
      "avatar": "https://picsum.photos/seed/avatar/64/64"
    },
    "date": "2024-11-15",
    "tags": ["react", "content", "rendering"],
    "body": "<p>Modern applications need to render content from various sources. Here&rsquo;s a comparison:</p>\\n<table style=\\"width: 100%; border-collapse: collapse; font-size: 14px;\\">\\n  <thead>\\n    <tr style=\\"background: #f0f0f8;\\">\\n      <th style=\\"padding: 10px 12px; text-align: left; border-bottom: 2px solid #d0d0d0;\\">Approach</th>\\n      <th style=\\"padding: 10px 12px; text-align: left; border-bottom: 2px solid #d0d0d0;\\">Safety</th>\\n      <th style=\\"padding: 10px 12px; text-align: left; border-bottom: 2px solid #d0d0d0;\\">Flexibility</th>\\n    </tr>\\n  </thead>\\n  <tbody>\\n    <tr><td style=\\"padding: 8px 12px; border-bottom: 1px solid #eee;\\">dangerouslySetInnerHTML</td><td style=\\"padding: 8px 12px; border-bottom: 1px solid #eee; color: #e74c3c;\\">Low</td><td style=\\"padding: 8px 12px; border-bottom: 1px solid #eee;\\">High</td></tr>\\n    <tr><td style=\\"padding: 8px 12px; border-bottom: 1px solid #eee;\\">HTMLRenderer</td><td style=\\"padding: 8px 12px; border-bottom: 1px solid #eee; color: #27ae60;\\">High</td><td style=\\"padding: 8px 12px; border-bottom: 1px solid #eee;\\">High</td></tr>\\n    <tr><td style=\\"padding: 8px 12px; border-bottom: 1px solid #eee;\\">ContentServiceRenderer</td><td style=\\"padding: 8px 12px; border-bottom: 1px solid #eee; color: #27ae60;\\">High</td><td style=\\"padding: 8px 12px; border-bottom: 1px solid #eee; color: #27ae60;\\">Very High</td></tr>\\n  </tbody>\\n</table>\\n<p>The <strong>ContentServiceRenderer</strong> automatically detects the response format and extracts the HTML content for rendering.</p>"
  }
}`,
    renderedHTML: `<p>Modern applications need to render content from various sources. Here&rsquo;s a comparison:</p>
<table style="width: 100%; border-collapse: collapse; font-size: 14px;">
  <thead>
    <tr style="background: #f0f0f8;">
      <th style="padding: 10px 12px; text-align: left; border-bottom: 2px solid #d0d0d0;">Approach</th>
      <th style="padding: 10px 12px; text-align: left; border-bottom: 2px solid #d0d0d0;">Safety</th>
      <th style="padding: 10px 12px; text-align: left; border-bottom: 2px solid #d0d0d0;">Flexibility</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">dangerouslySetInnerHTML</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee; color: #e74c3c;">Low</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">High</td></tr>
    <tr><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">HTMLRenderer</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee; color: #27ae60;">High</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">High</td></tr>
    <tr><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">ContentServiceRenderer</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee; color: #27ae60;">High</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee; color: #27ae60;">Very High</td></tr>
  </tbody>
</table>
<p>The <strong>ContentServiceRenderer</strong> automatically detects the response format and extracts the HTML content for rendering.</p>`,
  },
  markdown: {
    label: 'Markdown API',
    description: 'API returns Markdown content that gets converted to HTML before rendering.',
    mockResponse: `// GET /api/docs/getting-started
{
  "id": "getting-started",
  "version": "2.1.0",
  "format": "markdown",
  "content": "# Getting Started\\n\\nFollow these steps to integrate content rendering into your app:\\n\\n## Installation\\n\\n\\\`\\\`\\\`bash\\nnpm install @laddhaanshul/content-renderer\\n\\\`\\\`\\\`\\n\\n## Quick Start\\n\\n1. Import the renderer\\n2. Pass your API response\\n3. Let it handle the rest\\n\\n> **Note:** Content is automatically sanitized for security.\\n\\n## Supported Formats\\n\\n| Format | Auto-detect | Notes |\\n|--------|:----------:|-------|\\n| HTML | Yes | Direct HTML strings |\\n| JSON | Yes | JSON with HTML fields |\\n| Markdown | Yes | Converted to HTML |\\n| AEM | Yes | Adobe Experience Manager |",
  "lastUpdated": "2024-12-10T08:00:00Z"
}`,
    renderedHTML: `<h1>Getting Started</h1>
<p>Follow these steps to integrate content rendering into your app:</p>
<h2>Installation</h2>
<pre style="background: #1a1a2e; color: #cdd6f4; padding: 16px; border-radius: 8px; font-size: 13px; overflow-x: auto;"><code>npm install @laddhaanshul/content-renderer</code></pre>
<h2>Quick Start</h2>
<ol>
  <li>Import the renderer</li>
  <li>Pass your API response</li>
  <li>Let it handle the rest</li>
</ol>
<blockquote style="border-left: 4px solid #6c63ff; padding: 12px 16px; margin: 16px 0; background: #f5f5f8; border-radius: 0 8px 8px 0;">
  <p><strong>Note:</strong> Content is automatically sanitized for security.</p>
</blockquote>
<h2>Supported Formats</h2>
<table style="width: 100%; border-collapse: collapse; font-size: 14px;">
  <thead>
    <tr style="background: #f0f0f8;">
      <th style="padding: 10px 12px; text-align: left; border-bottom: 2px solid #d0d0d0;">Format</th>
      <th style="padding: 10px 12px; text-align: center; border-bottom: 2px solid #d0d0d0;">Auto-detect</th>
      <th style="padding: 10px 12px; text-align: left; border-bottom: 2px solid #d0d0d0;">Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">HTML</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: center;">Yes</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">Direct HTML strings</td></tr>
    <tr><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">JSON</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: center;">Yes</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">JSON with HTML fields</td></tr>
    <tr><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">Markdown</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: center;">Yes</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">Converted to HTML</td></tr>
    <tr><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">AEM</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: center;">Yes</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">Adobe Experience Manager</td></tr>
  </tbody>
</table>`,
  },
};

export default function ContentServiceExample() {
  const [activeSample, setActiveSample] = useState('directHtml');

  const current = samples[activeSample];

  // Custom link handler
  const handleLinkClick = (href: string) => {
    alert(`Link clicked: ${href}`);
  };

  return (
    <div>
      {/* Description */}
      <div style={styles.description}>
        <p style={styles.descriptionText}>
          The <strong>ContentServiceRenderer</strong> accepts API responses in various formats
          and automatically extracts &amp; renders the HTML content. It handles direct HTML,
          JSON wrappers, AEM-style responses, headless CMS payloads, and Markdown APIs —
          all with built-in sanitization.
        </p>
      </div>

      {/* Scenario tabs */}
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

      {/* Scenario description */}
      <div style={styles.scenarioInfo}>
        <span style={styles.scenarioBadge}>{current.label}</span>
        <span style={styles.scenarioDesc}>{current.description}</span>
      </div>

      {/* Mock API Response */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Mock API Response</h3>
        <CodeBlock
          code={current.mockResponse}
          language="json"
          title="API Response"
        />
      </div>

      {/* Rendered output */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Expected Rendered Output</h3>
        <div style={styles.preview}>
          {/*
            In a real app this would use:
            <ContentServiceRenderer
              response={apiResponse}
              sanitize={true}
              linkHandler={handleLinkClick}
              autoDetectFormat={true}
            />
          */}
          <div
            dangerouslySetInnerHTML={{ __html: current.renderedHTML }}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (target.tagName === 'A') {
                e.preventDefault();
                handleLinkClick(target.getAttribute('href') || '');
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
          code={`import { ContentServiceRenderer } from '@laddhaanshul/content-renderer';

function ContentPage({ apiResponse }: { apiResponse: unknown }) {
  const handleLink = (href: string) => {
    console.log('Link clicked:', href);
  };

  return (
    <ContentServiceRenderer
      response={apiResponse}
      sanitize={true}
      linkHandler={handleLink}
      // Optional: specify format explicitly
      // format="aem" | "json" | "html" | "markdown"
      autoDetectFormat={true}
      renderAs="article"
      className="content-page"
    />
  );
}`}
        />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  description: {
    marginBottom: 20,
    padding: 16,
    background: '#fff',
    borderRadius: 8,
    border: '1px solid #e0e0e0',
  },
  descriptionText: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.7,
    color: '#444',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: 12,
    marginBottom: 16,
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
  scenarioInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    padding: '10px 16px',
    background: '#f8f8fc',
    borderRadius: 8,
    border: '1px solid #e0e0e0',
  },
  scenarioBadge: {
    display: 'inline-block',
    padding: '2px 10px',
    background: '#6c63ff',
    color: '#fff',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: 'nowrap' as const,
  },
  scenarioDesc: {
    fontSize: 13,
    color: '#555',
    lineHeight: 1.5,
  },
  section: {
    marginBottom: 24,
  },
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
    padding: 20,
    minHeight: 100,
    lineHeight: 1.7,
    fontSize: 14,
    color: '#333',
    overflow: 'auto',
  },
};
