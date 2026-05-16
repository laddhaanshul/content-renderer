# Content Renderer Skills

The content-renderer monorepo provides a comprehensive set of skills for parsing, extracting, sanitizing, transforming, validating, and rendering content. This document describes each skill category in detail.

---

## Content Parsing Skills

### HTML Parsing

The HTML parser skill uses `htmlparser2` under the hood to build a full DOM tree from raw HTML strings.

**Capabilities:**
- Full HTML5 document parsing with DOCTYPE, `<head>`, and `<body>` extraction
- HTML fragment parsing (partial documents without a root element)
- Metadata extraction (title, description, author, charset, language)
- HTML validation (balanced tags, void element checking, DOCTYPE warnings)
- DOM manipulation (querySelector, querySelectorAll, appendChild, removeNode, etc.)
- Serialization back to HTML string

**Supported Elements:** All HTML5 elements including SVG, MathML, and custom elements.

```typescript
import { HTMLParser } from '@laddhaanshul/content-renderer-core';
const parser = new HTMLParser();
const doc = parser.parse(htmlString);
```

### JSON Parsing

The JSON parser skill provides rich JSON manipulation beyond simple parsing.

**Capabilities:**
- Parse with JSON Schema inference
- JSONPath querying (`$`, `$.key`, `$..recursive`, `$[0]`, `$[*]`)
- Deep diffing between two objects (added, removed, changed paths)
- Flatten/unflatten nested objects
- Sort keys alphabetically (deep or shallow)
- Deep clone via JSON round-trip
- Circular reference detection during validation

```typescript
import { JSONParser } from '@laddhaanshul/content-renderer-core';
const parser = new JSONParser();
const diff = parser.diff(obj1, obj2);
const value = parser.queryPath(data, '$.store.books[0].title');
```

### XML Parsing

The XML parser skill handles XML documents with namespace and processing instruction support.

**Capabilities:**
- XML declaration parsing (`<?xml version="1.0" encoding="UTF-8"?>`)
- CDATA section handling
- XPath-like queries with predicates (`/root/item[@id="1"]`)
- Namespace stripping or preservation
- Configurable attribute name prefix (default `@`)
- Conversion to JavaScript objects with `toObject()`

```typescript
import { XMLParser } from '@laddhaanshul/content-renderer-core';
const parser = new XMLParser({ stripNamespaces: false });
const obj = parser.toObject(doc.root);
```

### PHP Parsing

The PHP parser skill provides source-code-level analysis of PHP files.

**Capabilities:**
- PHP tag detection (`<?php`, `<?=`, `?>`)
- Class extraction with methods, properties, constants, visibility, inheritance
- Function extraction with parameters, return types, DocBlocks
- Variable tracking
- Namespace and use statement parsing
- Include/require statement extraction
- Brace balance validation

```typescript
import { PHPParser } from '@laddhaanshul/content-renderer-core';
const parser = new PHPParser({ extractDocBlocks: true });
const classes = parser.extractClasses(phpCode);
```

### Markdown Parsing

The Markdown parser skill implements GitHub-Flavored Markdown (GFM).

**Capabilities:**
- YAML frontmatter parsing
- Headings with slug generation
- Ordered and unordered lists (including nested)
- GFM tables with alignment
- Fenced code blocks with language identification
- Inline formatting (bold, italic, strikethrough, code)
- Links, images, blockquotes, horizontal rules
- Table of contents generation

```typescript
import { MarkdownParser } from '@laddhaanshul/content-renderer-core';
const parser = new MarkdownParser({ gfm: true, parseFrontmatter: true });
const toc = parser.extractTableOfContents(markdown);
```

### CSS Parsing

The CSS parser skill handles modern CSS features.

**Capabilities:**
- Rule and selector parsing
- CSS custom property extraction (`--variable`)
- Media query isolation and parsing
- `@keyframes` extraction
- `@supports`, `@layer`, `@container` at-rule support
- CSS specificity calculation
- CSS minification and formatting

```typescript
import { CSSParser } from '@laddhaanshul/content-renderer-core';
const parser = new CSSParser();
const variables = parser.getVariables(css);
const rules = parser.getRulesBySelector(css, /\.container/);
```

---

## Content Extraction Skills

### Structured Data Extraction

Extract structured data from any parsed content:

```typescript
import {
  extractAll, extractText, extractLinks, extractImages, extractScripts,
  extractStyles, extractMeta, extractHeadings, extractTables, extractForms,
  extractLists, extractCodeBlocks, extractComments,
} from '@laddhaanshul/content-renderer-core';
```

**SEO Extraction:**
```typescript
const seo = extractSEO(htmlContent);
// Returns title, description, keywords, canonical, OG tags,
// Twitter Cards, robots, author, favicon, language, charset, viewport
```

**Specialized Extraction:**
- `extractClasses(content)` — All CSS class names
- `extractIds(content)` — All element IDs
- `extractDataAttributes(content)` — All `data-*` attributes
- `extractByTag(content, 'table')` — Inner content of specific tags
- `extractAttributes(content, 'data-src')` — Values of specific attributes
- `extractFavicon(content)` — Favicon URL
- `extractCanonical(content)` — Canonical link URL
- `extractStructuredData(content)` — JSON-LD objects

---

## Content Sanitization Skills

### HTML Sanitization

The sanitization skill provides multi-layer XSS protection:

```typescript
import {
  sanitizeHTML, stripTags, stripAttributes, stripScripts,
  stripStyles, escapeHTML, unescapeHTML, encodeEntities, decodeEntities,
} from '@laddhaanshul/content-renderer-core';
```

**Layers:**
1. **Tag Filtering** — Whitelist/blacklist approach for HTML tags
2. **Attribute Filtering** — Per-tag attribute whitelists with wildcard support (`aria-*`, `data-*`)
3. **Event Handler Removal** — Blocks all `on*` event attributes
4. **URL Sanitization** — Blocks `javascript:`, `vbscript:`, and non-image `data:` URLs
5. **Comment Stripping** — Removes HTML comments by default
6. **Entity Handling** — Encode/decode HTML and XML entities

---

## Content Transformation Skills

### Format and Convert

```typescript
import {
  minifyHTML, minifyCSS, minifyJSON, minifyXML,
  formatHTML, formatCSS, formatJSON, formatXML, prettify,
  convertToJSON, convertToXML, convertToMarkdown,
} from '@laddhaanshul/content-renderer-core';
```

**Formatting:** Pretty-print HTML, CSS, JSON, and XML with configurable indentation.

**Minification:** Remove comments, collapse whitespace, strip unnecessary characters.

**Conversion:**
- XML → JSON: `convertToJSON(xml, 'xml')`
- Markdown → JSON: `convertToJSON(markdown, 'markdown')`
- CSS → JSON: `convertToJSON(css, 'css')`
- JSON → XML: `convertToXML(json, 'json')`
- HTML → Markdown: `convertToMarkdown(html, 'html')`
- JSON → Markdown: `convertToMarkdown(json, 'json')`

**String Utilities:**
```typescript
import { truncate, slugify, camelCase, kebabCase, snakeCase, pascalCase, titleCase, capitalize } from '@laddhaanshul/content-renderer-core';
```

---

## Content Validation Skills

```typescript
import {
  isValidHTML, isValidJSON, isValidXML, isValidCSS,
  isValidURL, isValidEmail, isValidPhoneNumber,
  getContentTypeFromExtension, getContentTypeFromMIME, getContentTypeFromHeader,
} from '@laddhaanshul/content-renderer-core';
```

**Content Validation:**
- `isValidHTML` — Checks balanced tags, void elements
- `isValidJSON` — Uses `JSON.parse()` validation
- `isValidXML` — Checks balanced tags with CDATA/comment awareness
- `isValidCSS` — Checks balanced braces with comment/string awareness

**Utility Validation:**
- `isValidURL` — Protocol-based URL validation
- `isValidEmail` — RFC 5322 compliant validation
- `isValidPhoneNumber` — E.164 format validation

**Content Type Resolution:**
- `getContentTypeFromExtension('.json')` → `'json'`
- `getContentTypeFromMIME('text/html')` → `'html'`
- `getContentTypeFromHeader(content)` → Auto-detects from first line

---

## Rendering Skills

### React DOM Rendering

Render content as interactive React elements:

- **HTMLRenderer** — Full DOM rendering with component overrides, sanitization, SVG, and event handlers
- **JSONRenderer** — Interactive tree viewer with search, copy, and collapse
- **CodeRenderer** — Syntax-highlighted code blocks with 15+ language themes
- **MarkdownRenderer** — GFM rendering with custom link/image handlers
- **PHPRenderer** — PHP syntax highlighting
- **XMLRenderer** — Collapsible tree view
- **CSSRenderer** — CSS syntax highlighting

### React Native Rendering

Render content using native primitives:

- **HTMLRenderer** — HTML → View, Text, Image, TouchableOpacity mapping
- **JSONRenderer** — Touch-friendly tree viewer
- **CodeRenderer** — Token-based syntax highlighting with Text spans
- **MarkdownRenderer** — Markdown → native View/Text conversion

---

## Theme Customization Skills

### Built-in Themes

```typescript
import { lightTheme, darkTheme } from '@laddhaanshul/content-renderer-core';
```

### Theme Customization

```typescript
const customTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: '#7c3aed',
  },
  codeBlock: {
    ...lightTheme.codeBlock,
    background: '#1a1a2e',
  },
};
```

### Theme Hooks

```typescript
const { theme, setTheme, toggleTheme, mode } = useTheme(customTheme);
```

---

## Integration Patterns

### Server-Side Rendering (SSR)

```typescript
import { extractSEO, detectContentType } from '@laddhaanshul/content-renderer-core';

// In your SSR framework
function extractMetadataFromContent(html: string) {
  return extractSEO(html);
}

function getContentType(content: string) {
  return detectContentType(content);
}
```

### API Response Processing

```typescript
import { JSONParser, extractLinks, validate } from '@laddhaanshul/content-renderer-core';

async function processAPIResponse(responseText: string) {
  const parser = new JSONParser();
  const doc = parser.parse(responseText);
  const validation = parser.validate(responseText);

  if (!validation.valid) {
    throw new Error(`Invalid JSON: ${validation.errors.map(e => e.message).join(', ')}`);
  }

  return doc;
}
```

### Content Management Integration

```typescript
import {
  sanitizeHTML, extractText, extractSEO,
  detectContentType, convertToMarkdown,
} from '@laddhaanshul/content-renderer-core';

function processUserContent(rawContent: string) {
  const type = detectContentType(rawContent);
  const sanitized = type === 'html' ? sanitizeHTML(rawContent) : rawContent;
  const plainText = extractText(sanitized, type);
  const seo = type === 'html' ? extractSEO(sanitized) : null;

  return { type, sanitized, plainText, seo };
}
```

---

## Content Service Skills

### ContentServiceRenderer

Drop-in component that fetches content from API endpoints and renders it directly as React components. Supports AEM, headless CMS, and any REST API.

**Capabilities:**
- Auto-detection of content extraction strategy from API responses
- Multiple extraction strategies: `auto`, `direct`, `json-html`, `json-markdown`, `json-field`, `json-property`, `aem`, `headless-cms`, `custom`
- Loading skeleton with configurable delay to prevent flash
- Error rendering with built-in retry support
- Request deduplication and caching
- Refetch on window focus and network reconnect
- Polling with configurable interval
- Abort controller support
- Custom fetcher for authenticated requests

```tsx
import { ContentServiceRenderer } from '@laddhaanshul/content-renderer';

// AEM page content
<ContentServiceRenderer
  url={`https://publish-p123-e456.adobeaemcloud.com${path}.model.json`}
  config={{ extractStrategy: 'aem' }}
  sanitize
/>

// Headless CMS (WordPress, Strapi, Contentful)
<ContentServiceRenderer
  url={`/api/posts/${id}`}
  config={{
    extractStrategy: 'headless-cms',
    contentField: 'content',
    headers: { 'X-API-Key': apiKey },
  }}
  loading={<Skeleton />}
  errorRenderer={(error, retry) => <ErrorWithRetry error={error} onRetry={retry} />}
/>
```

### useContentService

React hook for full control over content fetching with all the same capabilities.

```typescript
import { useContentService } from '@laddhaanshul/content-renderer-core';

const { content, isLoading, isError, error, retry, abort } = useContentService({
  url: '/api/content',
  extractStrategy: 'auto',
  cacheTime: 300000,
  retry: true,
  refetchOnWindowFocus: true,
  refetchInterval: 30000, // Poll every 30s
});
```
