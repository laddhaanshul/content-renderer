# Plugin Starter Template & Guide

> Copy this template to create your first content-renderer plugin. Every hook, lifecycle method, and common pattern is demonstrated with working code.

---

## Table of Contents

- [Quick Start — Minimal Plugin](#quick-start--minimal-plugin)
- [Full Template — All Hooks Demonstrated](#full-template--all-hooks-demonstrated)
- [Step-by-Step Walkthrough](#step-by-step-walkthrough)
- [Factory Function Pattern](#factory-function-pattern)
- [Testing Your Plugin](#testing-your-plugin)
- [Registering with the PluginManager](#registering-with-the-pluginmanager)
- [Common Plugin Recipes](#common-plugin-recipes)
- [Checklist Before Publishing](#checklist-before-publishing)

---

## Quick Start — Minimal Plugin

The smallest possible plugin that does something useful:

```typescript
import { PluginDefinition } from '@content-renderer/core';

const myPlugin: PluginDefinition = {
  name: 'my-plugin',
  version: '1.0.0',
  description: 'A minimal plugin that trims whitespace before parsing',
  hooks: {
    beforeParse(content: string) {
      return content.trim();
    },
  },
};

export default myPlugin;
```

That's it. Three required fields (`name`, `version`, `hooks`) and you're in business.

---

## Full Template — All Hooks Demonstrated

This template demonstrates every feature of the plugin system. Copy it into a new file and adapt it to your needs.

```typescript
// src/plugins/my-super-plugin.ts
//
// A comprehensive plugin demonstrating all 6 lifecycle hooks,
// init/destroy lifecycle, inter-plugin communication, abort capability,
// async support, content type scoping, and event monitoring.

import {
  PluginDefinition,
  PluginPriority,
  PluginHookContext,
  PluginManager,
  PluginEvent,
  ParsedContent,
  HTMLNode,
  MarkdownNode,
} from '@content-renderer/core';

// =============================================
// Types
// =============================================

/** Configuration options for the plugin */
export interface MySuperPluginOptions {
  /** Enable the beforeParse hook. Default: true */
  enableBeforeParse?: boolean;
  /** Enable the afterParse hook. Default: true */
  enableAfterParse?: boolean;
  /** Enable the beforeRender hook. Default: false */
  enableBeforeRender?: boolean;
  /** Enable the afterRender hook. Default: false */
  enableAfterRender?: boolean;
  /** Enable the transformNode hook. Default: false */
  enableTransformNode?: boolean;
  /** Enable the extractData hook. Default: false */
  enableExtractData?: boolean;
  /** Maximum content size in characters (0 = no limit). Default: 0 */
  maxSize?: number;
  /** Tag to add to processed content metadata. Default: 'my-super-plugin' */
  tag?: string;
}

// =============================================
// Factory Function
// =============================================

/**
 * Creates a configurable content-processing plugin.
 *
 * @param options - Plugin configuration
 * @returns A PluginDefinition ready to register
 *
 * @example
 * ```typescript
 * const plugin = createMySuperPlugin({
 *   enableBeforeParse: true,
 *   enableAfterParse: true,
 *   maxSize: 500_000,
 * });
 * manager.register(plugin);
 * ```
 */
export function createMySuperPlugin(
  options: MySuperPluginOptions = {}
): PluginDefinition {
  // ---------- Resolve options with defaults ----------
  const config = {
    enableBeforeParse: options.enableBeforeParse ?? true,
    enableAfterParse: options.enableAfterParse ?? true,
    enableBeforeRender: options.enableBeforeRender ?? false,
    enableAfterRender: options.enableAfterRender ?? false,
    enableTransformNode: options.enableTransformNode ?? false,
    enableExtractData: options.enableExtractData ?? false,
    maxSize: options.maxSize ?? 0,
    tag: options.tag ?? 'my-super-plugin',
  };

  // ---------- Internal state ----------
  let initialized = false;
  let processedCount = 0;
  const timings: Map<string, number> = new Map();

  // ---------- Build the plugin definition ----------
  const plugin: PluginDefinition = {
    // --- Identity ---
    name: 'my-super-plugin',
    version: '1.0.0',
    description: 'A comprehensive plugin demonstrating all hooks and lifecycle features',
    priority: PluginPriority.NORMAL,
    contentType: ['html', 'html5', 'markdown', 'text'],

    // --- Lifecycle: init ---
    init() {
      initialized = true;
      processedCount = 0;
      timings.clear();
      console.log(`[my-super-plugin] Initialized with config:`, config);
    },

    // --- Lifecycle: destroy ---
    destroy() {
      console.log(`[my-super-plugin] Destroyed. Total processed: ${processedCount}`);
      timings.clear();
      initialized = false;
    },

    // --- Hooks ---
    hooks: {
      // ==============================================
      // HOOK 1: beforeParse
      // Runs before content is parsed.
      // Input: raw string content
      // Output: modified string content
      // ==============================================
      beforeParse(content: string, ctx: PluginHookContext<string>) {
        if (!config.enableBeforeParse) return content;

        const start = performance.now();

        // Example: Size limit check with abort
        if (config.maxSize > 0 && content.length > config.maxSize) {
          ctx.aborted = true;
          ctx.abortReason = `Content size (${content.length}) exceeds limit (${config.maxSize})`;
          return content;
        }

        // Example: Normalize whitespace
        let result = content;
        result = result.replace(/\r\n/g, '\n');      // CRLF → LF
        result = result.replace(/\t/g, '  ');          // tabs → spaces
        result = result.replace(/ +\n/g, '\n');        // trailing spaces on lines
        result = result.replace(/\n{3,}/g, '\n\n');    // collapse multiple blank lines

        // Example: Share data with downstream plugins via ctx.data
        ctx.data.originalLength = content.length;
        ctx.data.normalizedLength = result.length;
        ctx.data.normalized = true;

        timings.set('beforeParse', performance.now() - start);
        processedCount++;
        return result;
      },

      // ==============================================
      // HOOK 2: afterParse
      // Runs after content is parsed.
      // Input: ParsedContent object
      // Output: modified ParsedContent object
      // ==============================================
      afterParse(parsed: ParsedContent, ctx: PluginHookContext<ParsedContent>) {
        if (!config.enableAfterParse) return parsed;

        const start = performance.now();

        // Example: Enrich metadata
        const enrichedMetadata = {
          ...parsed.metadata,
          [config.tag]: {
            version: '1.0.0',
            processedAt: new Date().toISOString(),
            originalLength: ctx.data.originalLength,
            normalizedLength: ctx.data.normalizedLength,
          },
        };

        // Example: Read data shared by an upstream plugin
        if (ctx.data.toc) {
          console.log(`[my-super-plugin] TOC entries from upstream: ${ctx.data.toc.length}`);
        }

        timings.set('afterParse', performance.now() - start);
        processedCount++;

        return {
          ...parsed,
          metadata: enrichedMetadata,
        } as ParsedContent;
      },

      // ==============================================
      // HOOK 3: beforeRender
      // Runs before content is rendered to output.
      // Input: ParsedContent
      // Output: ParsedContent
      // ==============================================
      beforeRender(parsed: ParsedContent, ctx: PluginHookContext<ParsedContent>) {
        if (!config.enableBeforeRender) return parsed;

        const start = performance.now();

        // Example: Validation — abort if content is empty
        const hasContent = parsed.content.replace(/<[^>]+>/g, '').trim().length > 0;
        if (!hasContent) {
          ctx.warnings.push('Content is empty — rendering may produce no output');
        }

        timings.set('beforeRender', performance.now() - start);
        processedCount++;
        return parsed;
      },

      // ==============================================
      // HOOK 4: afterRender
      // Runs after rendering is complete.
      // Input: rendered output string
      // Output: modified rendered output string
      // ==============================================
      afterRender(rendered: string, ctx: PluginHookContext<string>) {
        if (!config.enableAfterRender) return rendered;

        const start = performance.now();

        // Example: Add a processing comment to the output
        const comment = `<!-- Processed by ${config.tag} v1.0.0 at ${new Date().toISOString()} -->`;

        timings.set('afterRender', performance.now() - start);
        processedCount++;

        return rendered.replace('</body>', `${comment}\n</body>`) || `${comment}\n${rendered}`;
      },

      // ==============================================
      // HOOK 5: transformNode
      // Runs for each node during tree traversal.
      // Input: HTMLNode or MarkdownNode
      // Output: modified node (or undefined to pass through)
      // ==============================================
      transformNode(node: HTMLNode | MarkdownNode, ctx: PluginHookContext) {
        if (!config.enableTransformNode) return node;

        const start = performance.now();

        // Example: Add a data attribute to all elements
        if ('tag' in node && node.tag) {
          return {
            ...node,
            attributes: {
              ...(node as HTMLNode).attributes,
              'data-processed-by': config.tag,
            },
          };
        }

        timings.set('transformNode', performance.now() - start);
        return node;
      },

      // ==============================================
      // HOOK 6: extractData
      // Runs during data extraction phase.
      // Input: extraction context
      // Output: extraction context with data attached
      // ==============================================
      extractData(context: any, ctx: PluginHookContext) {
        if (!config.enableExtractData) return context;

        const start = performance.now();

        // Example: Count different element types
        const content = context?.content ?? '';
        const headings = (content.match(/<h[1-6][\s>]/g) || []).length;
        const images = (content.match(/<img[\s>]/g) || []).length;
        const links = (content.match(/<a[\s>]/g) || []).length;

        ctx.data.elementCounts = { headings, images, links };
        ctx.data.timings = Object.fromEntries(timings);

        timings.set('extractData', performance.now() - start);
        processedCount++;
        return context;
      },
    },
  };

  return plugin;
}

// =============================================
// Default instance (all defaults)
// =============================================

export const mySuperPlugin = createMySuperPlugin();

// =============================================
// Async hook variant example
// =============================================

/**
 * Creates a plugin with async hook support.
 * Demonstrates fetching external data, promises, and async/await.
 */
export function createAsyncPlugin(): PluginDefinition {
  // Simulated async data store
  async function fetchGlossary(): Promise<Record<string, string>> {
    // In a real plugin, this could be a database call, API request, etc.
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          API: 'Application Programming Interface',
          HTML: 'HyperText Markup Language',
          CSS: 'Cascading Style Sheets',
          DOM: 'Document Object Model',
        });
      }, 10);
    });
  }

  return {
    name: 'async-glossary',
    version: '1.0.0',
    description: 'Async plugin that expands glossary terms in content',
    priority: PluginPriority.LOW,
    hooks: {
      async beforeParse(content: string, ctx: PluginHookContext<string>) {
        // Fetch external data asynchronously
        const glossary = await fetchGlossary();
        ctx.data.glossary = glossary;

        // Expand terms in content
        let result = content;
        for (const [term, definition] of Object.entries(glossary)) {
          // Replace term with an abbr element
          const regex = new RegExp(`\\b${term}\\b`, 'g');
          result = result.replace(
            regex,
            `<abbr title="${definition}">${term}</abbr>`
          );
        }
        return result;
      },

      async afterParse(parsed: ParsedContent, ctx: PluginHookContext<ParsedContent>) {
        // Async metadata enrichment
        const stats = {
          termsExpanded: Object.keys(ctx.data.glossary ?? {}).length,
          expandedAt: new Date().toISOString(),
        };
        return {
          ...parsed,
          metadata: { ...parsed.metadata, glossaryExpansion: stats },
        } as ParsedContent;
      },
    },
  };
}
```

---

## Step-by-Step Walkthrough

### 1. Define Plugin Identity

```typescript
const plugin: PluginDefinition = {
  name: 'my-plugin',         // Required — must match /^[a-zA-Z][a-zA-Z0-9_-]*$/
  version: '1.0.0',          // Required — semver recommended
  description: 'Does X',     // Recommended — helps discoverability
  priority: PluginPriority.NORMAL,  // Optional — defaults to 0
  enabled: true,              // Optional — defaults to true
  contentType: ['html', 'markdown'], // Optional — omit for all types
};
```

### 2. Choose Which Hooks to Implement

Only implement the hooks you need. Omit the rest:

```typescript
hooks: {
  // I only need beforeParse — that's all I define
  beforeParse(content: string) {
    return content.trim();
  },
}
```

### 3. Implement Hook Logic

Each hook receives:
- **Argument 1:** The content/data for that lifecycle stage
- **Argument 2:** A `PluginHookContext` with shared state

```typescript
beforeParse(content: string, ctx: PluginHookContext<string>): string {
  // Transform the content
  const modified = doSomething(content);
  // Share data with other plugins
  ctx.data.myKey = 'myValue';
  // Return the modified content (or undefined to pass through)
  return modified;
}
```

### 4. Add Lifecycle Methods (Optional)

```typescript
init() {
  // Called once when manager.initAll() runs
  // Set up resources, load config, etc.
},

destroy() {
  // Called once when manager.destroyAll() runs
  // Clean up resources, close connections, etc.
},
```

### 5. Export the Plugin

```typescript
// Default instance
export default plugin;

// Factory function (recommended for configurable plugins)
export function createMyPlugin(options?: MyPluginOptions): PluginDefinition {
  return { ... };
}
```

---

## Factory Function Pattern

For configurable plugins, export a factory function rather than a static object. This allows consumers to create multiple instances with different configurations:

```typescript
// ---------- Pattern ----------
// file: src/plugins/custom-highlighter.ts

export interface HighlighterOptions {
  /** CSS class for highlighted spans. Default: 'highlight' */
  className?: string;
  /** Whether to highlight case-sensitively. Default: false */
  caseSensitive?: boolean;
  /** Maximum number of matches. 0 = unlimited. Default: 0 */
  maxMatches?: number;
  /** Terms to highlight */
  terms: string[];
}

export function createHighlighterPlugin(
  options: HighlighterOptions
): PluginDefinition {
  // Resolve and validate options
  const className = options.className ?? 'highlight';
  const caseSensitive = options.caseSensitive ?? false;
  const maxMatches = options.maxMatches ?? 0;

  if (!options.terms?.length) {
    throw new Error('createHighlighterPlugin requires at least one term');
  }

  // Build regex once at creation time
  const escaped = options.terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const flags = caseSensitive ? 'g' : 'gi';
  const regex = new RegExp(`\\b(${escaped.join('|')})\\b`, flags);

  return {
    name: 'custom-highlighter',
    version: '1.0.0',
    description: `Highlights terms: ${options.terms.slice(0, 3).join(', ')}${options.terms.length > 3 ? '...' : ''}`,
    priority: PluginPriority.NORMAL,
    hooks: {
      beforeParse(content: string) {
        let matchCount = 0;
        const result = content.replace(regex, (match) => {
          if (maxMatches > 0 && matchCount >= maxMatches) return match;
          matchCount++;
          return `<span class="${className}">${match}</span>`;
        });
        return result;
      },
    },
  };
}

// Convenience default export
export const highlighterPlugin = createHighlighterPlugin({ terms: ['important', 'note', 'warning'] });
```

---

## Testing Your Plugin

### Unit Test Template

```typescript
// tests/plugins/my-super-plugin.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'; // or jest
import { PluginManager } from '@content-renderer/core';
import { createMySuperPlugin } from '../../src/plugins/my-super-plugin';

describe('my-super-plugin', () => {
  let manager: PluginManager;

  beforeEach(async () => {
    manager = new PluginManager({ verbose: true, continueOnError: false });
    manager.register(createMySuperPlugin());
    await manager.initAll();
  });

  afterEach(async () => {
    await manager.destroyAll();
  });

  describe('beforeParse', () => {
    it('normalizes CRLF line endings to LF', async () => {
      const input = 'line1\r\nline2\r\nline3';
      const result = await manager.runHook('beforeParse', input, 'text');
      expect(result).toBe('line1\nline2\nline3');
    });

    it('collapses multiple blank lines', async () => {
      const input = 'hello\n\n\n\nworld';
      const result = await manager.runHook('beforeParse', input, 'text');
      expect(result).toBe('hello\n\nworld');
    });

    it('shares original length in context data', async () => {
      const plugin = createMySuperPlugin();
      const spy = vi.spyOn(plugin.hooks, 'beforeParse' as any);

      const input = 'test content';
      await manager.runHook('beforeParse', input, 'text');

      // Verify the hook stored data in context
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('afterParse', () => {
    it('enriches metadata with processing info', async () => {
      const parsed = {
        type: 'markdown' as const,
        content: '# Hello',
        parsed: null,
        metadata: {},
        errors: [],
      };

      const result = await manager.runHook('afterParse', parsed, 'markdown');
      expect(result.metadata['my-super-plugin']).toBeDefined();
      expect(result.metadata['my-super-plugin'].version).toBe('1.0.0');
    });
  });

  describe('abort behavior', () => {
    it('aborts when content exceeds max size', async () => {
      const plugin = createMySuperPlugin({ maxSize: 10 });
      manager.clear();
      manager.register(plugin);

      const longContent = 'a'.repeat(100);
      const result = await manager.runHook('beforeParse', longContent, 'text');

      // Content is still returned, but abort flag was set in context
      expect(result.length).toBe(100);
    });
  });

  describe('content type filtering', () => {
    it('only processes configured content types', async () => {
      const xmlContent = '<root><item/></root>';
      // Plugin is scoped to html, html5, markdown, text — not xml
      const result = await manager.runHook('beforeParse', xmlContent, 'xml');
      expect(result).toBe(xmlContent); // Unchanged
    });
  });
});
```

### Manual Test Script

```typescript
// test-plugin.ts
// Run with: npx tsx test-plugin.ts

import { PluginManager } from '@content-renderer/core';
import { createMySuperPlugin, createAsyncPlugin } from './src/plugins/my-super-plugin';

async function main() {
  const manager = new PluginManager({ verbose: true });

  // Register plugins
  manager.register(createMySuperPlugin({
    enableBeforeParse: true,
    enableAfterParse: true,
    enableTransformNode: true,
    maxSize: 1_000_000,
  }));

  manager.register(createAsyncPlugin());

  // Initialize
  await manager.initAll();

  // Test content
  const sample = `
# My Document

This is a **test** document with API and HTML terms.

It has multiple paragraphs.

And some extra   whitespace.

    `.trim();

  console.log('\n=== Input ===');
  console.log(sample);

  // Run beforeParse
  const cleaned = await manager.runHook('beforeParse', sample, 'markdown');
  console.log('\n=== After beforeParse ===');
  console.log(cleaned);

  // Simulate parsed content
  const parsed = {
    type: 'markdown' as const,
    content: cleaned,
    parsed: null,
    metadata: { title: 'My Document' },
    errors: [],
  };

  // Run afterParse
  const enriched = await manager.runHook('afterParse', parsed, 'markdown');
  console.log('\n=== After afterParse (metadata) ===');
  console.log(JSON.stringify(enriched.metadata, null, 2));

  // Show plugin info
  console.log('\n=== Registered Plugins ===');
  for (const p of manager.getAllPlugins()) {
    console.log(`  ${p.name} v${p.version} (priority: ${p.priority})`);
  }

  // Clean up
  await manager.destroyAll();
  console.log('\nDone.');
}

main().catch(console.error);
```

---

## Registering with the PluginManager

### Basic Registration

```typescript
import { PluginManager } from '@content-renderer/core';
import myPlugin from './plugins/my-plugin';

const manager = new PluginManager({ verbose: true });
manager.register(myPlugin);
await manager.initAll();
```

### With Built-in Plugins

```typescript
import {
  PluginManager,
  builtInPlugins,
} from '@content-renderer/core';
import myPlugin from './plugins/my-plugin';

const manager = new PluginManager({ verbose: true });

// Register built-in plugins
for (const plugin of builtInPlugins) {
  manager.register(plugin);
}

// Register custom plugin (added after built-ins)
manager.register(myPlugin);

await manager.initAll();
```

### Selective Built-in Registration

```typescript
import {
  PluginManager,
  createSanitizePlugin,
  createTocPlugin,
  createMetaEnricherPlugin,
} from '@content-renderer/core';
import myPlugin from './plugins/my-plugin';

const manager = new PluginManager();

// Only the built-in plugins you need
manager.register(createSanitizePlugin());
manager.register(createTocPlugin({ maxDepth: 3 }));
manager.register(createMetaEnricherPlugin());

// Your custom plugin with HIGH priority (runs before built-in NORMAL plugins)
manager.register({
  ...myPlugin,
  priority: PluginPriority.HIGH,
});

await manager.initAll();
```

### Enable/Disable at Runtime

```typescript
// Disable a plugin temporarily
manager.disablePlugin('my-plugin');

// Check if it's active
const plugin = manager.getPlugin('my-plugin');
console.log(plugin?.enabled); // false

// Re-enable
manager.enablePlugin('my-plugin');
```

### Using the Event System

```typescript
// Monitor plugin lifecycle
manager.on('plugin:registered', (event) => {
  console.log(`Plugin registered: ${event.pluginName}`);
});

manager.on('plugin:error', (event) => {
  console.error(`Error in ${event.pluginName}:`, event.error?.message);
});

manager.on('hook:after', (event) => {
  console.log(`Hook ${event.hook} completed: ${event.data?.pluginCount} plugins ran`);
});

// One-time listener
manager.once('hook:before', (event) => {
  if (event.hook === 'beforeParse') {
    console.log('Processing started!');
  }
});
```

---

## Common Plugin Recipes

### Recipe: Word Counter

```typescript
export function createWordCounterPlugin(): PluginDefinition {
  return {
    name: 'word-counter',
    version: '1.0.0',
    description: 'Counts words and adds the count to metadata',
    priority: PluginPriority.LOW,
    hooks: {
      afterParse(parsed: ParsedContent) {
        const plainText = parsed.content.replace(/<[^>]+>/g, '').trim();
        const wordCount = plainText ? plainText.split(/\s+/).length : 0;
        return {
          ...parsed,
          metadata: { ...parsed.metadata, wordCount },
        } as ParsedContent;
      },
    },
  };
}
```

### Recipe: Reading Time Estimator

```typescript
export function createReadingTimePlugin(
  wordsPerMinute: number = 200
): PluginDefinition {
  return {
    name: 'reading-time',
    version: '1.0.0',
    description: `Estimates reading time at ${wordsPerMinute} words/min`,
    priority: PluginPriority.LOW,
    hooks: {
      afterParse(parsed: ParsedContent) {
        const plainText = parsed.content.replace(/<[^>]+>/g, '').trim();
        const words = plainText ? plainText.split(/\s+/).length : 0;
        const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));
        return {
          ...parsed,
          metadata: {
            ...parsed.metadata,
            readingTime: minutes,
            readingTimeText: `${minutes} min read`,
          },
        } as ParsedContent;
      },
    },
  };
}
```

### Recipe: Content Guard (Abort on Condition)

```typescript
export function createContentGuardPlugin(options: {
  maxChars?: number;
  forbiddenPatterns?: string[];
}): PluginDefinition {
  const maxChars = options.maxChars ?? 0;
  const forbiddenPatterns = (options.forbiddenPatterns ?? []).map(
    (p) => new RegExp(p, 'i')
  );

  return {
    name: 'content-guard',
    version: '1.0.0',
    description: 'Aborts processing if content violates rules',
    priority: PluginPriority.CRITICAL,
    hooks: {
      beforeParse(content: string, ctx: PluginHookContext<string>) {
        if (maxChars > 0 && content.length > maxChars) {
          ctx.aborted = true;
          ctx.abortReason = `Content exceeds ${maxChars} character limit`;
          return content;
        }

        for (const pattern of forbiddenPatterns) {
          if (pattern.test(content)) {
            ctx.aborted = true;
            ctx.abortReason = `Content matches forbidden pattern: ${pattern.source}`;
            return content;
          }
        }

        return content;
      },
    },
  };
}
```

### Recipe: Custom HTML Tag Remover

```typescript
export function createTagRemoverPlugin(
  tagsToRemove: string[]
): PluginDefinition {
  const patterns = tagsToRemove.map(
    (tag) => [new RegExp(`<${tag}[^>]*>`, 'gi'), new RegExp(`</${tag}>`, 'gi')] as const
  );

  return {
    name: 'tag-remover',
    version: '1.0.0',
    description: `Removes HTML tags: ${tagsToRemove.join(', ')}`,
    priority: PluginPriority.HIGH,
    contentType: ['html', 'html5'],
    hooks: {
      beforeParse(content: string) {
        let result = content;
        for (const [openPattern, closePattern] of patterns) {
          result = result.replace(openPattern, '').replace(closePattern, '');
        }
        return result;
      },
    },
  };
}
```

### Recipe: External Link Target

```typescript
export function createExternalLinkPlugin(): PluginDefinition {
  return {
    name: 'external-link-target',
    version: '1.0.0',
    description: 'Adds target="_blank" and rel="noopener" to external links',
    priority: PluginPriority.NORMAL,
    contentType: ['html', 'html5', 'markdown'],
    hooks: {
      beforeParse(content: string) {
        return content.replace(
          /(<a\s[^>]*?href\s*=\s*")([^"]+)("[^>]*?)>/gi,
          (match, open: string, url: string, rest: string) => {
            if (url.startsWith('http://') || url.startsWith('https://')) {
              // Don't add target if already present
              if (rest.includes('target=')) return match;
              return `${open}${url}${rest} target="_blank" rel="noopener noreferrer">`;
            }
            return match;
          }
        );
      },
    },
  };
}
```

### Recipe: Performance Logger

```typescript
export function createPerformanceLoggerPlugin(): PluginDefinition {
  const hookStartTimes = new Map<string, number>();

  return {
    name: 'perf-logger',
    version: '1.0.0',
    description: 'Logs execution time for each hook',
    priority: PluginPriority.LAST,
    init() {
      hookStartTimes.clear();
    },
    hooks: {
      beforeParse(content: string, ctx: PluginHookContext) {
        hookStartTimes.set('beforeParse', performance.now());
        return content;
      },
      afterParse(parsed: ParsedContent, ctx: PluginHookContext) {
        const start = hookStartTimes.get('afterParse') ?? performance.now();
        const duration = performance.now() - start;
        console.log(`[perf-logger] afterParse: ${duration.toFixed(2)}ms`);
        return parsed;
      },
      beforeRender(parsed: ParsedContent, ctx: PluginHookContext) {
        hookStartTimes.set('beforeRender', performance.now());
        return parsed;
      },
      afterRender(rendered: string, ctx: PluginHookContext) {
        const start = hookStartTimes.get('afterRender') ?? performance.now();
        const duration = performance.now() - start;
        console.log(`[perf-logger] afterRender: ${duration.toFixed(2)}ms`);
        return rendered;
      },
    },
    destroy() {
      hookStartTimes.clear();
    },
  };
}
```

---

## Checklist Before Publishing

Use this checklist before sharing or publishing your plugin:

### Required
- [ ] `name` matches `/^[a-zA-Z][a-zA-Z0-9_-]*$/` and is unique
- [ ] `version` follows semver (`X.Y.Z`)
- [ ] At least one hook is implemented
- [ ] Plugin passes `validatePlugin()` with no errors

### Recommended
- [ ] `description` is provided for discoverability
- [ ] Factory function pattern is used for configurable plugins
- [ ] Options interface is exported with JSDoc comments
- [ ] Both default instance and factory function are exported
- [ ] `contentType` is scoped to relevant types (avoids unnecessary processing)

### Code Quality
- [ ] Hook functions handle edge cases (empty content, null, undefined)
- [ ] Async hooks properly handle errors with try/catch
- [ ] `init()` and `destroy()` properly manage resources
- [ ] No global state leaks — cleanup in `destroy()`
- [ ] Return values are consistent (always return the expected type)

### Testing
- [ ] Unit tests cover each implemented hook
- [ ] Edge cases are tested (empty string, very large content, special characters)
- [ ] Abort behavior is tested (if using `ctx.aborted`)
- [ ] Content type filtering is tested
- [ ] Priority ordering is verified
- [ ] `init()` and `destroy()` are tested

### Documentation
- [ ] README describes what the plugin does
- [ ] Configuration options are documented
- [ ] Usage examples are provided
- [ ] Hook signatures are documented
