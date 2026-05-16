import { PluginDefinition } from './plugin-manager';

/**
 * Mermaid Plugin for rendering diagrams in Markdown
 */
export const createMermaidPlugin = (): PluginDefinition => ({
  name: 'mermaid',
  version: '1.0.0',
  hooks: {
    afterRender: (html) => {
      if (typeof html !== 'string') return html;
      // Convert code blocks with mermaid class to div.mermaid
      return html
        .replace(
          /<pre><code class="[^"]*?(?:language-)?mermaid[^"]*?">([\s\S]*?)<\/code><\/pre>/g,
          '<div class="mermaid">$1</div>'
        );
    }
  }
});

/**
 * KaTeX Plugin for rendering math in Markdown
 */
export const createKaTeXPlugin = (): PluginDefinition => ({
  name: 'katex',
  version: '1.0.0',
  hooks: {
    beforeParse: (content) => {
      if (typeof content !== 'string') return content;
      // Basic protection for $ and $$ delimiters so they don't get broken by other markdown rules
      return content.replace(/\$\$([\s\S]+?)\$\$/g, (match, p1) => {
        return `<div class="katex-display">${p1}</div>`;
      }).replace(/\$([^\n\$]+?)\$/g, (match, p1) => {
        return `<span class="katex-inline">${p1}</span>`;
      });
    }
  }
});
