import React from 'react';

export default function PluginExample() {
  return (
    <div style={{ padding: 24 }}>
      <h2>Plugin System</h2>
      <p>The Content Renderer includes a powerful plugin system that allows you to extend and customize content processing at every stage of rendering.</p>
      <h3>Built-in Plugins</h3>
      <ul>
        <li><strong>Line Numbers</strong> - Adds line numbers to code blocks</li>
        <li><strong>Sanitize</strong> - HTML sanitization with configurable rules</li>
        <li><strong>Table of Contents</strong> - Auto-generates TOC from headings</li>
        <li><strong>Meta Enricher</strong> - Enhances document metadata</li>
        <li><strong>Link Rewrite</strong> - Rewrites URLs with custom rules</li>
        <li><strong>Image Proxy</strong> - Routes images through a proxy</li>
        <li><strong>Emoji</strong> - Converts emoji shortcodes to Unicode</li>
        <li><strong>Heading Anchor</strong> - Adds anchor links to headings</li>
      </ul>
      <h3>Custom Plugin API</h3>
      <pre>{`import { PluginManager } from '@content-renderer/core';

const plugin = {
  name: 'my-plugin',
  hooks: {
    beforeParse(content, options) {
      return content.toUpperCase();
    },
    afterRender(html, metadata) {
      return html;
    },
  },
};

const manager = new PluginManager();
manager.register(plugin);`}</pre>
    </div>
  );
}
