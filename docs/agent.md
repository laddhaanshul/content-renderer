# Content Renderer Agent

## What is the Content Renderer Agent?

The content-renderer agent is the internal processing pipeline that powers universal content rendering. It is responsible for taking raw content strings of any type (HTML, JSON, XML, PHP, Markdown, CSS, JavaScript, TypeScript, YAML, or plain text) and transforming them into structured, renderable React or React Native components.

The agent operates as a stateless pipeline that follows three distinct phases: **Detection**, **Parsing**, and **Rendering**. Each phase is designed to be independently configurable and extensible through the plugin system.

---

## Architecture Overview

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Content     │───▶│  Detection   │───▶│   Parsing    │───▶│  Rendering   │
│   Input       │    │  Engine      │    │   Pipeline   │    │   Pipeline   │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
       │                                     │                     │
       │                   ┌────────────────┐              │
       │                   │   Plugin       │              │
       │                   │   System       │──────────────┘
       │                   └────────────────┘
       │                                     │
       └───── Provider Config ──────────────┘
```

The architecture follows a layered design:

1. **Configuration Layer** — `ContentParserProvider` supplies global config (theme, sanitization rules, custom parsers, plugins)
2. **Detection Layer** — `detectContentType()` analyzes raw content using pattern heuristics
3. **Parsing Layer** — Specialized parser classes convert content to typed AST/document objects
4. **Rendering Layer** — Platform-specific components convert AST to native UI elements
5. **Plugin Layer** — Hooks for `beforeParse`, `afterParse`, custom parsing, and custom rendering

---

## Parser Pipeline

The parser pipeline processes content through these stages:

### 1. Pre-Processing (Plugin: beforeParse)

If plugins are registered with a `beforeParse` hook, the raw content string is passed through each plugin's transform function before any parsing occurs. This allows plugins to:

- Normalize line endings (CRLF → LF)
- Strip BOM characters
- Inject or modify content
- Pre-process templates

```typescript
const plugin: ContentRendererPlugin = {
  name: 'my-plugin',
  version: '1.0.0',
  beforeParse: (content: string) => content.replace(/\r\n/g, '\n'),
};
```

### 2. Content Type Detection

The `detectContentType()` function applies a series of heuristic checks in priority order:

1. **HTML5** — Checks for `<!DOCTYPE html>` or `<html` tag
2. **HTML** — Checks for common HTML tags (`<div>`, `<p>`, `<a>`, `<table>`, etc.)
3. **JSON** — Starts with `{` or `[`, validates with `JSON.parse()`
4. **XML** — Checks for `<?xml` declaration or matched open/close root tags
5. **PHP** — Checks for `<?php` or `<?=` opening tags
6. **CSS** — Checks for CSS patterns (`@media`, `selector { prop: val }`)
7. **Markdown** — Checks for headings, list items, fenced code blocks, links
8. **TypeScript** — Checks for type annotations (`interface`, `type`, `enum`)
9. **JavaScript** — Checks for `const`, `let`, `function`, `import`, `export`
10. **YAML** — Checks for key-value pairs with `-` list items
11. **Text** — Default fallback

### 3. Parsing

Once the content type is identified, the appropriate parser class is instantiated and invoked:

```typescript
switch (contentType) {
  case 'html':
  case 'html5':
    return htmlParser.parse(content, options);
  case 'json':
    return jsonParser.parse(content, options);
  case 'xml':
    return xmlParser.parse(content, options);
  case 'php':
    return phpParser.parse(content, options);
  case 'markdown':
    return markdownParser.parse(content, options);
  case 'css':
    return cssParser.parse(content, options);
  default:
    return { type: contentType, content, parsed: content };
}
```

Each parser returns a typed document object:
- `HTMLParser` → `HTMLDocument` (tree of `HTMLNode` elements)
- `JSONParser` → `JSONDocument` (root value, schema, type)
- `XMLParser` → `XMLDocument` (declaration, root `XMLNode`, nodes)
- `PHPParser` → `PHPDocument` (classes, functions, variables, nodes)
- `MarkdownParser` → `MarkdownDocument` (headings, links, images, tables, code blocks)
- `CSSParser` → `CSSDocument` (rules, variables, media queries, keyframes)

### 4. Post-Processing (Plugin: afterParse)

Plugins with an `afterParse` hook receive the `ParsedContent` object and can:
- Modify the parsed AST
- Add metadata
- Transform the document structure
- Enrich with additional data

```typescript
const plugin: ContentRendererPlugin = {
  name: 'meta-enricher',
  version: '1.0.0',
  afterParse: (parsed: ParsedContent) => {
    parsed.metadata.customField = 'enriched';
    return parsed;
  },
};
```

---

## Rendering Pipeline

The rendering pipeline converts parsed ASTs into platform-specific React elements:

### Web (React DOM)

```
Parsed AST → Node Iterator → Attribute Conversion → Component Mapping → React Elements
```

1. **Node Iteration** — Walk the AST tree depth-first
2. **Attribute Conversion** — Convert HTML attributes to React props:
   - `class` → `className`
   - `for` → `htmlFor`
   - `style="..."` → `style={{ ... }}`
   - Boolean attributes (`disabled`, `checked`)
   - `data-*` and `aria-*` preserved
   - SVG attributes via `svgAttrToReact()`
3. **Component Mapping** — Check for custom component overrides before rendering
4. **React Element Creation** — `React.createElement()` for each node
5. **Sanitization** — If enabled, remove dangerous tags/attributes before rendering

### Native (React Native)

```
Parsed AST → Node Iterator → HTML-to-RN Mapping → Native Primitives → React Native Elements
```

1. **Node Iteration** — Walk the AST tree
2. **HTML-to-RN Mapping** — Convert HTML elements to native equivalents:
   - Block elements → `View`
   - Inline elements → `Text`
   - Links → `TouchableOpacity` + `Text`
   - Images → `Image`
   - Lists → Nested `View` + `Text`
3. **Style Conversion** — Convert CSS properties to `StyleSheet.create()` compatible styles
4. **Syntax Highlighting** — Token-based highlighting using `Text` spans

---

## Plugin System

The plugin system allows extending the content-renderer at multiple points:

```typescript
interface ContentRendererPlugin {
  name: string;
  version: string;
  contentType?: ContentType;        // Scope to a specific content type
  parse?: ParserFunction;            // Replace or supplement parsing
  render?: (parsed, options?) => any; // Replace or supplement rendering
  beforeParse?: (content) => string;  // Transform content before parsing
  afterParse?: (parsed) => ParsedContent; // Transform parsed result
}
```

### Plugin Registration

Plugins are registered through the `ContentParserProvider`:

```tsx
<ContentParserProvider config={{
  plugins: [
    {
      name: 'line-numbers',
      version: '1.0.0',
      contentType: 'code',
      afterParse: (parsed) => {
        // Add line numbers to parsed code
        return parsed;
      },
    },
  ],
}}>
  <ContentRenderer content={codeString} />
</ContentParserProvider>
```

---

## Extension Points

### Custom Parsers

Register custom parsers for unsupported content types:

```typescript
<ContentParserProvider config={{
  customParsers: {
    csv: (content) => ({
      type: 'text',
      content,
      parsed: parseCSV(content),
      metadata: { size: content.length },
      errors: [],
      warnings: [],
    }),
  },
}}>
  <ContentRenderer content={csvData} contentType="csv" />
</ContentParserProvider>
```

### Custom Renderers

Override rendering per-tag in HTML or per-type:

```tsx
<ContentRenderer
  content={htmlString}
  components={{
    h1: ({ children }) => <h1 className="custom-h1">{children}</h1>,
    img: ({ src, alt }) => <LazyImage src={src} alt={alt} />,
    table: TableComponent,
  }}
/>
```

### Custom Link/Image Handlers

```tsx
<ContentRenderer
  content={content}
  linkHandler={(href) => navigation.navigate(href)}
  imageHandler={(src) => proxyImageUrl(src)}
  codeBlockHandler={(code, lang) => <CustomCodeEditor code={code} language={lang} />}
/>
```

---

## Configuration Options

All configuration is provided through `ContentParserProvider`:

```typescript
interface ContentRendererConfig {
  theme?: Theme;                         // Theme object
  defaultContentType?: ContentType;       // Default when detection fails
  maxRenderDepth?: number;                // Maximum tree depth
  sanitizeHTML?: boolean;                  // Global sanitization toggle
  allowedTags?: string[];                 // Whitelist of HTML tags
  allowedAttributes?: Record<string, string[]>; // Attribute whitelist per tag
  linkHandler?: (href: string) => void;   // Global link handler
  imageHandler?: (src: string) => string; // Global image handler
  errorHandler?: (error, content) => ReactNode; // Global error component
  loadingFallback?: React.ReactNode;        // Global loading component
  customParsers?: Record<string, ParserFunction>; // Custom content parsers
  plugins?: ContentRendererPlugin[];       // Plugin array
}
```

---

## Performance Considerations

1. **Memoization** — All renderer components are wrapped in `React.memo()` to prevent unnecessary re-renders
2. **Lazy Parsing** — Content is only parsed when the `content` prop changes (detected via `useEffect` dependency)
3. **Shallow Comparisons** — Common props are memoized together to minimize dependency arrays
4. **Key Generation** — Unique stable keys are generated for each node in the render tree
5. **Depth Limiting** — `maxRenderDepth` prevents stack overflow on deeply nested content
6. **Early Return** — Empty and null content returns `null` immediately without parsing

### Performance Tips

```tsx
// ✅ Good: Memoize content before passing
const memoizedContent = useMemo(() => htmlString, [htmlString]);
<ContentRenderer content={memoizedContent} />

// ✅ Good: Use specific renderer when type is known
<JSONRenderer json={jsonString} />

// ✅ Good: Limit extraction to only what you need
const { extract } = useExtract({ extractors: ['links'] });

// ❌ Avoid: Passing large content that changes frequently
<ContentRenderer content={largeDynamicString} />
```

---

## Security Considerations

### HTML Sanitization

The HTML sanitizer provides defense against XSS attacks:

1. **Dangerous Tags** — `script`, `object`, `embed`, `applet`, `iframe`, `form`, `input`, `textarea`, `select`, `button`, `frame`, `frameset` are stripped by default
2. **Event Handlers** — All `on*` attributes (80+ handlers including `onclick`, `onerror`, `onload`, `onfocus`, `onblur`, etc.) are removed
3. **Dangerous URLs** — `javascript:`, `vbscript:`, and non-image `data:` URLs are blocked in `href` and `src` attributes
4. **Attribute Filtering** — Only explicitly allowed attributes are preserved per tag
5. **Comment Stripping** — HTML comments are removed by default

### Configuration Recommendations

```tsx
// Production-safe configuration
<ContentParserProvider config={{
  sanitizeHTML: true,
  maxRenderDepth: 100,
  allowedTags: ['p', 'a', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
               'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'br', 'hr',
               'strong', 'em', 'blockquote', 'pre', 'code', 'span', 'div'],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height', 'loading'],
    td: ['colspan', 'rowspan'],
    th: ['colspan', 'rowspan', 'scope'],
  },
}}>
```
