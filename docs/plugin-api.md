# Plugin API Reference

> **Version:** 1.0.0 | **Package:** `@laddhaanshul/content-renderer-core`

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [PluginDefinition Interface](#plugindefinition-interface)
- [Available Hooks](#available-hooks)
  - [beforeParse](#beforeparse)
  - [afterParse](#afterparse)
  - [beforeRender](#beforerender)
  - [afterRender](#afterrender)
  - [transformNode](#transformnode)
  - [extractData](#extractdata)
- [Priority System](#priority-system)
- [PluginHookContext](#pluginhookcontext)
- [PluginManager API](#pluginmanager-api)
  - [Constructor & Options](#constructor--options)
  - [Registration](#registration)
  - [Query Methods](#query-methods)
  - [Enable / Disable](#enable--disable)
  - [Hook Execution](#hook-execution)
  - [Lifecycle Management](#lifecycle-management)
  - [Event System](#event-system)
  - [Validation](#validation)
- [Built-in Plugins](#built-in-plugins)
- [Type Reference](#type-reference)
- [Best Practices](#best-practices)

---

## Overview

The content-renderer plugin system provides a **lifecycle-based hook architecture** that allows you to intercept, transform, and enrich content at every stage of the rendering pipeline. Plugins are registered with a `PluginManager` and executed in priority order through a pipeline pattern, where the output of each plugin feeds into the next.

Key features:

- **6 lifecycle hooks** covering the full parse-to-render pipeline
- **Priority-based ordering** with 5 semantic levels (CRITICAL through LAST)
- **Pipeline pattern** — each plugin's output becomes the next plugin's input
- **Inter-plugin communication** via a shared data bag and event system
- **Async support** — all hooks can return `Promise<T>`
- **Abort capability** — plugins can halt the pipeline at any point
- **Timeout enforcement** — optional per-hook execution time limits
- **Validation** — structural checks run automatically on registration

---

## Architecture

```
                    PluginManager
                         |
          ┌──────────────┼──────────────┐
          │              │              │
     Registration    Execution     Events
          │              │              │
     validate()    runHook()       on/once/off
     register()    (pipeline)       emit()
     unregister()                    │
          │              │       PluginEvent
          │              │
    ┌─────┼─────┐   ┌───┴───┐
    │     │     │   │       │
  init  hooks  destroy  before → after
                          │
                    Hook Pipeline
                    ┌────┼────┐
                   P1   P2   P3   (by priority)
```

### Processing Pipeline

```
Raw Content
    │
    ▼
┌─────────────┐
│ beforeParse  │ ◄── Sanitize, emoji conversion, link rewriting
└──────┬──────┘
       ▼
┌─────────────┐
│   Parser     │ (core engine)
└──────┬──────┘
       ▼
┌─────────────┐
│  afterParse  │ ◄── TOC generation, metadata enrichment, line numbers
└──────┬──────┘
       ▼
┌─────────────┐
│ beforeRender │ ◄── Final transformations
└──────┬──────┘
       ▼
┌─────────────┐
│   Renderer   │ (core engine)
└──────┬──────┘
       ▼
┌─────────────┐
│  afterRender │ ◄── Post-render processing, analytics
└──────┬──────┘
       ▼
Final Output
```

---

## Quick Start

```typescript
import {
  PluginManager,
  PluginPriority,
} from '@laddhaanshul/content-renderer-core';

// 1. Create a plugin manager
const manager = new PluginManager({ verbose: true });

// 2. Define your plugin
const upperCasePlugin = {
  name: 'upper-case-preprocessor',
  version: '1.0.0',
  description: 'Converts content to uppercase before parsing',
  priority: PluginPriority.LOW,
  contentType: ['text', 'markdown'],
  hooks: {
    beforeParse(content: string) {
      return content.toUpperCase();
    },
  },
};

// 3. Register the plugin
manager.register(upperCasePlugin);

// 4. Initialize all plugins
await manager.initAll();

// 5. Run hooks during processing
const rawContent = 'Hello, World!';
const processed = await manager.runHook('beforeParse', rawContent, 'text');
// processed === 'HELLO, WORLD!'

// 6. Clean up when done
await manager.destroyAll();
```

---

## PluginDefinition Interface

Every plugin implements the `PluginDefinition` interface:

```typescript
interface PluginDefinition {
  /** Unique plugin name (required). Must match /^[a-zA-Z][a-zA-Z0-9_-]*$/ */
  name: string;

  /** Semantic version string (required). e.g., "1.2.3" */
  version: string;

  /** Human-readable description (recommended) */
  description?: string;

  /** Execution priority. Higher values run first. Default: 0 (NORMAL) */
  priority?: number;

  /** Whether plugin is enabled on registration. Default: true */
  enabled?: boolean;

  /** Content types this plugin applies to. Omit for all types. */
  contentType?: ContentType | ContentType[];

  /** Hook functions the plugin implements */
  hooks: Partial<Record<PluginHook, (...args: any[]) => any>>;

  /** Called once when manager.initAll() is invoked */
  init?: () => void | Promise<void>;

  /** Called once when manager.destroyAll() is invoked */
  destroy?: () => void | Promise<void>;
}
```

### Minimal Plugin

```typescript
const plugin: PluginDefinition = {
  name: 'my-plugin',
  version: '1.0.0',
  hooks: {
    beforeParse(content: string) {
      return content.trim();
    },
  },
};
```

### Full-Featured Plugin

```typescript
const plugin: PluginDefinition = {
  name: 'my-full-plugin',
  version: '2.1.0',
  description: 'A comprehensive content processing plugin',
  priority: PluginPriority.HIGH,
  contentType: ['html', 'markdown'],
  init() {
    console.log('Plugin initialized');
  },
  destroy() {
    console.log('Plugin cleaned up');
  },
  hooks: {
    beforeParse(content: string, context: PluginHookContext<string>) {
      return content.replace(/\t/g, '  ');
    },
    afterParse(parsed: ParsedContent, context: PluginHookContext<ParsedContent>) {
      parsed.metadata.processedBy = 'my-full-plugin';
      return parsed;
    },
  },
};
```

---

## Available Hooks

There are **6 hooks** in the content rendering lifecycle. Each hook receives the current content value as its first argument and a `PluginHookContext` as its second argument.

> **Pipeline pattern:** The return value from one plugin becomes the input for the next. Return `undefined` or `null` to pass the current value through unchanged.

### `beforeParse`

Runs **before** content is parsed. Receives the raw string content and returns a (possibly modified) string.

| Property       | Value                          |
|----------------|--------------------------------|
| **Input**      | `string` (raw content)         |
| **Output**     | `string` (modified content)    |
| **Use cases**  | Sanitization, encoding fixes, link rewriting, emoji conversion, whitespace normalization |

```typescript
beforeParse(content: string, context: PluginHookContext<string>): string | Promise<string>
```

**Example — Normalize line endings:**
```typescript
const normalizeLineEndings: PluginDefinition = {
  name: 'normalize-line-endings',
  version: '1.0.0',
  hooks: {
    beforeParse(content: string) {
      return content.replace(/\r\n/g, '\n');
    },
  },
};
```

**Example — Async beforeParse with external API:**
```typescript
const expandMacrosPlugin: PluginDefinition = {
  name: 'expand-macros',
  version: '1.0.0',
  hooks: {
    async beforeParse(content: string) {
      const macros = await fetchMacrosFromAPI();
      let result = content;
      for (const [key, value] of Object.entries(macros)) {
        result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
      }
      return result;
    },
  },
};
```

---

### `afterParse`

Runs **after** content is parsed. Receives a `ParsedContent` object and returns a (possibly modified) `ParsedContent`.

| Property       | Value                                                      |
|----------------|------------------------------------------------------------|
| **Input**      | `ParsedContent<T>`                                         |
| **Output**     | `ParsedContent<T>` (modified parsed result)                |
| **Use cases**  | TOC generation, metadata enrichment, line numbering, heading anchors |

```typescript
afterParse(parsed: ParsedContent, context: PluginHookContext<ParsedContent>): ParsedContent | Promise<ParsedContent>
```

**Example — Add processing timestamp:**
```typescript
const timestampPlugin: PluginDefinition = {
  name: 'processing-timestamp',
  version: '1.0.0',
  hooks: {
    afterParse(parsed: ParsedContent) {
      return {
        ...parsed,
        metadata: {
          ...parsed.metadata,
          processedAt: new Date().toISOString(),
        },
      };
    },
  },
};
```

**Example — Store computed data in shared context:**
```typescript
const dataSharingPlugin: PluginDefinition = {
  name: 'data-sharing',
  version: '1.0.0',
  hooks: {
    afterParse(parsed: ParsedContent, context: PluginHookContext<ParsedContent>) {
      // Store data for other plugins to read
      context.data.myCustomData = {
        sectionCount: (parsed.content.match(/<h[1-6]/g) || []).length,
      };
      return parsed;
    },
  },
};
```

---

### `beforeRender`

Runs **before** content is rendered to output format. Receives the parsed content.

| Property       | Value                                                      |
|----------------|------------------------------------------------------------|
| **Input**      | `ParsedContent<T>`                                         |
| **Output**     | `ParsedContent<T>` (modified parsed content)               |
| **Use cases**  | Final content validation, last-minute transformations, template application |

```typescript
beforeRender(parsed: ParsedContent, context: PluginHookContext<ParsedContent>): ParsedContent | Promise<ParsedContent>
```

**Example — Abort rendering for empty content:**
```typescript
const emptyContentGuard: PluginDefinition = {
  name: 'empty-content-guard',
  version: '1.0.0',
  priority: PluginPriority.CRITICAL,
  hooks: {
    beforeRender(parsed: ParsedContent, context: PluginHookContext<ParsedContent>) {
      const plainText = parsed.content.replace(/<[^>]+>/g, '').trim();
      if (!plainText) {
        context.aborted = true;
        context.abortReason = 'Content is empty after stripping tags';
      }
      return parsed;
    },
  },
};
```

---

### `afterRender`

Runs **after** rendering is complete. Receives the rendered output.

| Property       | Value                                         |
|----------------|-----------------------------------------------|
| **Input**      | `string` (rendered output)                    |
| **Output**     | `string` (modified rendered output)           |
| **Use cases**  | Post-processing, analytics injection, minification |

```typescript
afterRender(rendered: string, context: PluginHookContext<string>): string | Promise<string>
```

**Example — Inject analytics snippet:**
```typescript
const analyticsPlugin: PluginDefinition = {
  name: 'analytics-injector',
  version: '1.0.0',
  priority: PluginPriority.LAST,
  hooks: {
    afterRender(rendered: string) {
      const snippet = `<script>/* analytics code */</script>`;
      return rendered.replace('</body>', `${snippet}</body>`);
    },
  },
};
```

---

### `transformNode`

Runs for **each node** during tree traversal. Receives an AST node.

| Property       | Value                                               |
|----------------|-----------------------------------------------------|
| **Input**      | `HTMLNode` or `MarkdownNode`                        |
| **Output**     | `HTMLNode` or `MarkdownNode` (modified node)        |
| **Use cases**  | Per-node transformations, attribute manipulation, conditional removal |

```typescript
transformNode(node: HTMLNode | MarkdownNode, context: PluginHookContext): HTMLNode | MarkdownNode | undefined
```

**Example — Add target="_blank" to external links:**
```typescript
const externalLinkPlugin: PluginDefinition = {
  name: 'external-link-target',
  version: '1.0.0',
  hooks: {
    transformNode(node: HTMLNode) {
      if (node.tag === 'a' && node.attributes?.href?.startsWith('http')) {
        return {
          ...node,
          attributes: {
            ...node.attributes,
            target: '_blank',
            rel: 'noopener noreferrer',
          },
        };
      }
      return node;
    },
  },
};
```

---

### `extractData`

Runs during the **data extraction** phase. Receives the extraction context.

| Property       | Value                                                    |
|----------------|----------------------------------------------------------|
| **Input**      | Extraction context object                                |
| **Output**     | Extraction context object (with extracted data attached) |
| **Use cases**  | Custom data extraction, structured data generation, search indexing |

```typescript
extractData(context: any, hookContext: PluginHookContext): any
```

**Example — Extract all image URLs:**
```typescript
const imageExtractorPlugin: PluginDefinition = {
  name: 'image-extractor',
  version: '1.0.0',
  priority: PluginPriority.LOW,
  hooks: {
    extractData(context: any, hookContext: PluginHookContext) {
      const images = context.content.match(/<img[^>]+src="([^"]+)"/g) || [];
      hookContext.data.extractedImages = images.map((img: string) => {
        const src = img.match(/src="([^"]+)"/)?.[1];
        return { src, raw: img };
      });
      return context;
    },
  },
};
```

---

## Priority System

Plugins are executed in **descending priority order** — higher values run first.

### Priority Constants

| Constant    | Value   | Description                                      |
|-------------|---------|--------------------------------------------------|
| `CRITICAL`  | `1000`  | Must run first (security sanitization, guards)   |
| `HIGH`      | `100`   | Important transformations (validation, anchors)  |
| `NORMAL`    | `0`     | Default for all plugins                          |
| `LOW`       | `-100`  | Analytics, logging, metadata enrichment          |
| `LAST`      | `-1000` | Last-resort handlers, fallbacks, post-processing |

### How Priority Affects Execution

```typescript
import { PluginPriority } from '@laddhaanshul/content-renderer-core';

// CRITICAL (1000) runs first
const securityPlugin = { name: 'security', priority: PluginPriority.CRITICAL, ... };

// HIGH (100) runs second
const validationPlugin = { name: 'validation', priority: PluginPriority.HIGH, ... };

// NORMAL (0) runs third (default)
const transformPlugin = { name: 'transform', priority: PluginPriority.NORMAL, ... };

// LOW (-100) runs fourth
const analyticsPlugin = { name: 'analytics', priority: PluginPriority.LOW, ... };

// LAST (-1000) runs last
const fallbackPlugin = { name: 'fallback', priority: PluginPriority.LAST, ... };
```

### Custom Priorities

You can use any numeric value for fine-grained ordering:

```typescript
const plugin = {
  name: 'my-plugin',
  priority: 250, // Between HIGH (100) and CRITICAL (1000)
  // ...
};
```

### Priority and Lifecycle

- **`initAll()`** — Plugins initialize in **descending** priority order (highest first)
- **`destroyAll()`** — Plugins destroy in **ascending** priority order (lowest first — reverse of init)
- **`runHook()`** — Plugins execute in **descending** priority order (highest first)

---

## PluginHookContext

Every hook function receives a `PluginHookContext` as its second argument. This context provides access to shared state and control flow.

```typescript
interface PluginHookContext<T = any> {
  /** The content being processed (updated by each plugin in the pipeline) */
  content: T;

  /** The content type being processed */
  contentType: ContentType;

  /** Name of the plugin currently executing */
  pluginName?: string;

  /** Shared data bag for inter-plugin communication */
  data: Record<string, any>;

  /** Set to true to abort the hook pipeline */
  aborted: boolean;

  /** Reason for abort (required when aborted is true) */
  abortReason?: string;

  /** Accumulated warnings from plugins that threw errors */
  warnings: string[];

  /** Metadata extracted or enriched by plugins */
  metadata: ContentMetadata;
}
```

### Inter-Plugin Communication via `data`

```typescript
// Plugin A writes data
const pluginA: PluginDefinition = {
  name: 'plugin-a',
  priority: PluginPriority.HIGH,
  hooks: {
    beforeParse(content: string, ctx: PluginHookContext) {
      ctx.data.wordCount = content.split(/\s+/).length;
      return content;
    },
  },
};

// Plugin B reads data (runs later due to lower priority)
const pluginB: PluginDefinition = {
  name: 'plugin-b',
  priority: PluginPriority.LOW,
  hooks: {
    beforeParse(content: string, ctx: PluginHookContext) {
      const count = ctx.data.wordCount ?? 0;
      console.log(`Content has ${count} words`);
      return content;
    },
  },
};
```

### Aborting the Pipeline

```typescript
const abortPlugin: PluginDefinition = {
  name: 'content-size-limit',
  version: '1.0.0',
  priority: PluginPriority.CRITICAL,
  hooks: {
    beforeParse(content: string, ctx: PluginHookContext) {
      if (content.length > 1_000_000) {
        ctx.aborted = true;
        ctx.abortReason = 'Content exceeds 1MB size limit';
      }
      return content;
    },
  },
};
```

---

## PluginManager API

### Constructor & Options

```typescript
const manager = new PluginManager(options?: PluginManagerOptions);
```

```typescript
interface PluginManagerOptions {
  /** Maximum number of plugins allowed. Default: 50 */
  maxPlugins?: number;

  /** Log hook executions and lifecycle events to console. Default: false */
  verbose?: boolean;

  /** Continue running remaining plugins when one throws. Default: true */
  continueOnError?: boolean;

  /** Maximum execution time per hook in ms. 0 = no limit. Default: 0 */
  hookTimeout?: number;
}
```

**Examples:**

```typescript
// Development — full logging
const devManager = new PluginManager({
  verbose: true,
  maxPlugins: 100,
});

// Production — strict, fail-fast
const prodManager = new PluginManager({
  continueOnError: false,
  hookTimeout: 5000,
  maxPlugins: 20,
});
```

---

### Registration

#### `register(plugin: PluginDefinition): void`

Validates and registers a plugin. Throws on validation failure, max plugins reached, or duplicate name.

```typescript
manager.register(myPlugin);
```

#### `unregister(name: string): boolean`

Removes a plugin by name. Calls `destroy()` if the plugin was initialized. Returns `true` if found.

```typescript
const removed = manager.unregister('my-plugin'); // true | false
```

---

### Query Methods

#### `getPlugin(name: string): PluginDefinition | undefined`

Get a single plugin by name.

#### `getAllPlugins(): PluginDefinition[]`

Get all plugins sorted by priority (highest first).

#### `hasPlugin(name: string): boolean`

Check if a plugin is registered.

#### `pluginCount: number`

Get the total number of registered plugins.

#### `getPluginsForContentType(contentType: ContentType): PluginDefinition[]`

Get plugins that apply to a specific content type.

#### `getPluginsForHook(hook: PluginHook): PluginDefinition[]`

Get enabled plugins that implement a specific hook, sorted by priority.

```typescript
const allPlugins = manager.getAllPlugins();
const markdownPlugins = manager.getPluginsForContentType('markdown');
const beforeParsePlugins = manager.getPluginsForHook('beforeParse');
console.log(`Registered: ${manager.pluginCount} plugins`);
```

---

### Enable / Disable

#### `enablePlugin(name: string): boolean`

Enable a previously disabled plugin. Returns `true` if found and was disabled.

#### `disablePlugin(name: string): boolean`

Disable a plugin. It will be skipped in `runHook()` and `getPluginsForHook()`. Returns `true` if found and was enabled.

```typescript
manager.disablePlugin('analytics');
// ... process without analytics ...
manager.enablePlugin('analytics');
```

---

### Hook Execution

#### `runHook<T>(hook: PluginHook, context: T, contentType?: ContentType): Promise<T>`

Execute all plugins registered for a hook in priority order. The result of each plugin feeds into the next (pipeline pattern).

| Parameter     | Type           | Description                                   |
|---------------|----------------|-----------------------------------------------|
| `hook`        | `PluginHook`   | The hook name to execute                      |
| `context`     | `T`            | The content/context to process                |
| `contentType` | `ContentType`  | Optional filter — only run plugins for this type |

**Returns:** The final processed content after all plugins have run.

**Behavior:**
- Plugins are executed in descending priority order
- If a plugin returns `undefined` or `null`, the previous value passes through
- If a plugin sets `context.aborted = true`, the pipeline stops immediately
- If `continueOnError` is `true` (default), errors are caught and logged, and remaining plugins continue
- If `continueOnError` is `false`, the first error is thrown
- Hook metadata from `PluginHookContext` is merged into the result if the result has a `metadata` property

```typescript
// Process through the beforeParse hook
const cleaned = await manager.runHook('beforeParse', rawHtml, 'html');

// Process through afterParse (parsed content)
const enriched = await manager.runHook('afterParse', parsedContent, 'markdown');
```

---

### Lifecycle Management

#### `initAll(): Promise<void>`

Initialize all registered plugins in priority order (highest first). Calls each plugin's `init()` method if defined and the plugin is enabled.

```typescript
await manager.initAll();
```

#### `destroyAll(): Promise<void>`

Destroy all initialized plugins in reverse priority order (lowest first). Calls each plugin's `destroy()` method. Once called, the `PluginManager` is inactive and cannot accept further operations.

```typescript
await manager.destroyAll();
```

#### `clear(): void`

Remove all plugins without calling `destroy()`. Use `destroyAll()` for clean teardown instead.

```typescript
manager.clear();
```

---

### Event System

The plugin manager emits events for inter-plugin communication and observability.

#### Event Types

| Event               | Description                                     |
|---------------------|-------------------------------------------------|
| `plugin:registered` | A plugin was registered                          |
| `plugin:unregistered` | A plugin was unregistered                      |
| `plugin:enabled`    | A plugin was enabled                             |
| `plugin:disabled`   | A plugin was disabled                            |
| `plugin:error`      | A plugin threw an error during init/destroy      |
| `hook:before`       | A hook is about to execute                       |
| `hook:after`        | A hook finished executing                        |
| `hook:error`        | A plugin threw an error during hook execution    |

#### `PluginEvent` Shape

```typescript
interface PluginEvent {
  type: PluginEventType;
  pluginName?: string;
  hook?: PluginHook;
  timestamp: number;
  data?: any;
  error?: Error;
}
```

#### `on(event, listener): () => void`

Subscribe to an event. Returns an unsubscribe function.

```typescript
const unsubscribe = manager.on('plugin:error', (event) => {
  console.error(`Plugin "${event.pluginName}" failed:`, event.error?.message);
});

// Later...
unsubscribe();
```

#### `once(event, listener): () => void`

Subscribe to an event for one invocation only. Automatically unsubscribes after the first event.

```typescript
manager.once('hook:after', (event) => {
  if (event.hook === 'beforeParse') {
    console.log('First beforeParse hook completed!');
  }
});
```

#### `off(event?: PluginEventType): void`

Remove all listeners for a specific event, or all listeners if no event is specified.

```typescript
manager.off('plugin:error');  // Remove all error listeners
manager.off();                 // Remove ALL listeners
```

**Full example — Error monitoring:**
```typescript
const manager = new PluginManager({ verbose: false });

manager.on('plugin:error', (event) => {
  errorReporter.report({
    plugin: event.pluginName,
    error: event.error,
    timestamp: new Date(event.timestamp),
  });
});

manager.on('hook:error', (event) => {
  metrics.increment('plugin.hook_errors', { hook: event.hook });
});
```

---

### Validation

#### `validatePlugin(plugin: PluginDefinition): PluginValidationResult`

Validate a plugin definition. Called automatically by `register()`, but can also be called manually for pre-registration checks.

```typescript
interface PluginValidationResult {
  valid: boolean;
  errors: string[];   // Fatal issues that prevent registration
  warnings: string[]; // Non-fatal issues (plugin still registers)
}
```

#### Validation Rules

| Rule | Severity | Description |
|------|----------|-------------|
| `name` is required | Error | Plugin must have a non-empty `"name"` string |
| `name` max length | Error | Name must be 100 characters or less |
| `name` format | Error | Must match `/^[a-zA-Z][a-zA-Z0-9_-]*$/` |
| `version` is required | Error | Plugin must have a non-empty `"version"` string |
| `version` format | Warning | Should follow semver (`X.Y.Z`) |
| `hooks` defined | Warning | No hooks means the plugin won't participate in any lifecycle events |
| Hook names valid | Error | Unknown hook names are rejected |
| Hook values are functions | Error | Each hook property must be a function |
| `contentType` values valid | Error | Must be a valid `ContentType` value |
| `priority` is a number | Error | Must be numeric if specified |
| `description` present | Warning | Adding a description is recommended |

**Manual validation example:**
```typescript
const result = manager.validatePlugin(myPlugin);
if (!result.valid) {
  console.error('Invalid plugin:', result.errors);
}
if (result.warnings.length > 0) {
  console.warn('Plugin warnings:', result.warnings);
}
```

---

## Built-in Plugins

The package ships with 8 built-in plugins, accessible as both default instances and factory functions:

| Plugin            | Factory Function              | Priority  | Content Types           | Description                                |
|-------------------|-------------------------------|-----------|-------------------------|--------------------------------------------|
| **sanitize**      | `createSanitizePlugin(opts)`  | CRITICAL  | html, html5             | Removes dangerous tags, scripts, attributes |
| **heading-anchor**| `createHeadingAnchorPlugin()` | HIGH      | html, html5, markdown   | Adds anchor IDs to headings                |
| **line-numbers**  | `createLineNumbersPlugin()`   | NORMAL    | html, html5, markdown   | Adds line numbers to code blocks           |
| **toc**           | `createTocPlugin()`           | NORMAL    | html, html5, markdown   | Generates table of contents from headings  |
| **link-rewrite**  | `createLinkRewritePlugin()`   | NORMAL    | html, html5, markdown   | Rewrites URLs with base URL or custom rules|
| **image-proxy**   | `createImageProxyPlugin()`    | NORMAL    | html, html5, markdown   | Proxies image URLs through a service       |
| **emoji**         | `createEmojiPlugin()`         | LOW       | html, html5, markdown, text | Converts emoji shortcodes to Unicode   |
| **meta-enricher** | `createMetaEnricherPlugin()`  | LOW       | all                     | Adds word count, reading time, fingerprint |

### Using Built-in Plugins

```typescript
import {
  PluginManager,
  builtInPlugins,
  createSanitizePlugin,
  createLinkRewritePlugin,
} from '@laddhaanshul/content-renderer-core';

// Option 1: Register all built-in plugins
const manager = new PluginManager({ verbose: true });
for (const plugin of builtInPlugins) {
  manager.register(plugin);
}
await manager.initAll();

// Option 2: Register only specific plugins
manager.register(createSanitizePlugin({ allowComments: true }));
manager.register(createLinkRewritePlugin({ baseUrl: 'https://example.com' }));
```

### Built-in Plugin Configuration Examples

```typescript
// Sanitize with custom settings
createSanitizePlugin({
  allowScripts: false,
  allowStyles: true,
  allowComments: true,
  allowedTags: ['custom-tag'],
  allowedAttributes: { 'custom-tag': ['data-value'] },
});

// TOC with depth control
createTocPlugin({ minDepth: 2, maxDepth: 4 });

// Line numbers with highlighting
createLineNumbersPlugin({
  startingLine: 10,
  highlightLines: [15, 20, 25],
  className: 'ln',
});

// Link rewrite with custom function
createLinkRewritePlugin({
  baseUrl: '/blog',
  rewriteFn: (url, attr) => {
    if (attr === 'href' && url.startsWith('/')) {
      return `https://cdn.example.com${url}`;
    }
    return url;
  },
  stripTrailingSlash: true,
});

// Image proxy with domain allowlist
createImageProxyPlugin({
  proxyUrl: 'https://images.example.com/proxy?url={url}',
  onlyExternal: true,
  allowedDomains: ['images.unsplash.com', 'assets.example.com'],
});

// Emoji with custom mappings
createEmojiPlugin({
  customEmojis: { ':company-logo:': '🏢', ':custom-check:': '✅' },
  onlyInText: true,
});

// Meta enricher with custom reading speed
createMetaEnricherPlugin({ wordsPerMinute: 250 });

// Heading anchor with permalinks
createHeadingAnchorPlugin({
  prefix: 'doc-',
  addPermalink: true,
  permalinkSymbol: '🔗',
  permalinkClass: 'permalink',
});
```

---

## Type Reference

### ContentType

```typescript
type ContentType =
  | 'html'
  | 'html5'
  | 'json'
  | 'xml'
  | 'php'
  | 'markdown'
  | 'text'
  | 'code'
  | 'css'
  | 'javascript'
  | 'typescript'
  | 'yaml';
```

### ParsedContent

```typescript
interface ParsedContent<T = any> {
  type: ContentType;
  content: string;
  parsed: T;
  metadata: ContentMetadata;
  errors: ParseError[];
}
```

### ContentMetadata

```typescript
interface ContentMetadata {
  title?: string;
  description?: string;
  language?: string;
  encoding?: string;
  charset?: string;
  generator?: string;
  viewport?: string;
  [key: string]: any; // Extended by plugins
}
```

### HTMLNode

```typescript
interface HTMLNode {
  type: 'element' | 'text' | 'comment' | 'doctype' | 'cdata';
  tag?: string;
  attributes?: Record<string, string>;
  children?: HTMLNode[];
  content?: string;
}
```

### MarkdownNode

```typescript
interface MarkdownNode {
  type:
    | 'heading' | 'paragraph' | 'list' | 'list-item'
    | 'code-block' | 'code-inline' | 'link' | 'image'
    | 'bold' | 'italic' | 'strikethrough' | 'blockquote'
    | 'horizontal-rule' | 'table' | 'table-row' | 'table-cell'
    | 'html' | 'thematic-break' | 'footnote-reference'
    | 'footnote-section' | 'definition-list' | 'definition-item'
    | 'abbreviation' | 'math-block' | 'math-inline'
    | 'subscript' | 'superscript' | 'highlight' | 'autolink';
  content?: string;
  children?: MarkdownNode[];
  level?: number;
  ordered?: boolean;
  // ... additional properties
}
```

### PluginEventType

```typescript
type PluginEventType =
  | 'plugin:registered'
  | 'plugin:unregistered'
  | 'plugin:enabled'
  | 'plugin:disabled'
  | 'plugin:error'
  | 'hook:before'
  | 'hook:after'
  | 'hook:error';
```

---

## Best Practices

### 1. Choose the Right Hook

| Goal                              | Hook            |
|-----------------------------------|-----------------|
| Sanitize or transform raw text    | `beforeParse`   |
| Enrich parsed data or metadata    | `afterParse`    |
| Validate before rendering         | `beforeRender`  |
| Post-process rendered output      | `afterRender`   |
| Modify individual AST nodes       | `transformNode` |
| Extract structured data           | `extractData`   |

### 2. Always Return the Content

Even if your plugin doesn't modify the content, return it. Returning `undefined` will pass through the previous value, which is fine, but explicit returns improve readability:

```typescript
// Good — explicit return
hooks: {
  beforeParse(content: string) {
    // No modification, but explicit return
    return content;
  },
}

// Also fine — undefined passes through
hooks: {
  beforeParse(content: string) {
    // Conditionally modify
    if (shouldModify(content)) {
      return modify(content);
    }
    // undefined returned → previous value passes through
  },
}
```

### 3. Use Factory Functions for Configurable Plugins

```typescript
// Recommended pattern
export function createMyPlugin(options: {
  enabled?: boolean;
  threshold?: number;
}): PluginDefinition {
  const threshold = options.threshold ?? 100;
  return {
    name: 'my-plugin',
    version: '1.0.0',
    hooks: {
      beforeParse(content: string) {
        if (content.length > threshold) {
          return content.slice(0, threshold) + '...';
        }
        return content;
      },
    },
  };
}
```

### 4. Clean Up Resources in `destroy()`

```typescript
const statefulPlugin: PluginDefinition = {
  name: 'stateful',
  version: '1.0.0',
  privateCache: new Map<string, any>(),

  init() {
    // Load resources
    this.privateCache = loadFromDisk();
  },

  destroy() {
    // Free resources
    this.privateCache.clear();
  },

  hooks: { /* ... */ },
};
```

### 5. Set Appropriate Priority

- **CRITICAL** (`1000`) — Security, content guards, abort conditions
- **HIGH** (`100`) — Structural transformations that affect downstream plugins
- **NORMAL** (`0`) — Standard content processing (default)
- **LOW** (`-100`) — Metadata enrichment, analytics, non-critical additions
- **LAST** (`-1000`) — Final fallbacks, post-processing that should not affect others

### 6. Scope Content Types

Limit your plugin to relevant content types to avoid unnecessary processing:

```typescript
const markdownOnlyPlugin: PluginDefinition = {
  name: 'frontmatter-parser',
  version: '1.0.0',
  contentType: ['markdown'], // Only runs for markdown content
  hooks: { /* ... */ },
};
```

### 7. Handle Errors Gracefully

```typescript
const resilientPlugin: PluginDefinition = {
  name: 'resilient',
  version: '1.0.0',
  hooks: {
    async beforeParse(content: string) {
      try {
        return await riskyOperation(content);
      } catch (error) {
        // Log but don't throw — let the pipeline continue
        console.warn('Plugin failed:', error);
        return content; // Return original content as fallback
      }
    },
  },
};
```

### 8. Use the Shared Data Bag for Cross-Plugin Communication

```typescript
// Plugin A: Compute and store data
context.data.computedStats = { paragraphs: 12, images: 3 };

// Plugin B: Read data from Plugin A (ensure B has lower priority)
const stats = context.data.computedStats;
```

### 9. Use Events for Observability

```typescript
// In your application setup:
manager.on('plugin:error', (event) => {
  monitoring.captureException(event.error, {
    tags: { plugin: event.pluginName, hook: event.hook },
  });
});

manager.on('hook:after', (event) => {
  logger.debug(`Hook ${event.hook} completed`, {
    pluginCount: event.data?.pluginCount,
    warnings: event.data?.warnings,
  });
});
```

### 10. Prefer Semver for Version Strings

```typescript
// Recommended
version: '1.0.0'
version: '2.3.1-beta.1'

// Avoid (triggers validation warning)
version: 'v1'
version: '1.0'
```
