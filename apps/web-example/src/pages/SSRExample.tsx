import React from 'react';

export default function SSRExample() {
  return (
    <div style={{ padding: 24 }}>
      <h2>Server-Side Rendering (SSR)</h2>
      <p>Full SSR support for Next.js, Remix, and any Node.js server environment. Render content to static HTML markup on the server for faster initial page loads and improved SEO.</p>
      <h3>Features</h3>
      <ul>
        <li><strong>renderToString</strong> - Render content to an HTML string</li>
        <li><strong>renderToStaticMarkup</strong> - Render without React data attributes</li>
        <li><strong>extractMetadataForSSR</strong> - Extract metadata for hydration</li>
        <li><strong>generateHeadTags</strong> - Generate SEO-optimized head tags</li>
        <li><strong>generateStructuredData</strong> - Generate JSON-LD structured data</li>
        <li><strong>isServer / isClient</strong> - Environment detection utilities</li>
      </ul>
      <h3>Next.js Example</h3>
      <pre>{`import { renderToString } from '@laddhaanshul/content-renderer-core';

export default function Page({ content }) {
  const html = renderToString(content, {
    contentType: 'markdown',
    options: { sanitize: true },
  });
  return <main dangerouslySetInnerHTML={{ __html: html }} />;
}`}</pre>
    </div>
  );
}
