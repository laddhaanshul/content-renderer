# @laddhaanshul/content-renderer-core

[![npm version](https://img.shields.io/npm/v/@laddhaanshul/content-renderer-core.svg)](https://www.npmjs.com/package/@laddhaanshul/content-renderer-core)
[![npm downloads](https://img.shields.io/npm/dm/@laddhaanshul/content-renderer-core.svg)](https://www.npmjs.com/package/@laddhaanshul/content-renderer-core)
[![license](https://img.shields.io/npm/l/@laddhaanshul/content-renderer-core.svg)](https://github.com/laddhaanshul/content-renderer/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)

> Platform-agnostic parsing, extraction, sanitization, and transformation engine for HTML, JSON, XML, Markdown, PHP, and CSS. Works in browsers, Node.js, and server-side rendering environments with zero peer dependencies.

**🌍 Official Website & Documentation: [https://content-renderer.anshulladdha.in/](https://content-renderer.anshulladdha.in/)**

---

## Installation

```bash
npm install @laddhaanshul/content-renderer-core
yarn add @laddhaanshul/content-renderer-core
pnpm add @laddhaanshul/content-renderer-core
```

**No peer dependencies.** Works in any JavaScript environment.

| Runtime | Supported |
|---------|-----------|
| Node.js ≥ 18 | ✅ |
| Browser (ESM) | ✅ |
| Next.js / SSR | ✅ |
| React Native (via Metro) | ✅ |

---

## Quick Start

```typescript
import { HTMLParser, extractSEO, sanitizeHTML, detectContentType } from '@laddhaanshul/content-renderer-core';

// Parse HTML
const parser = new HTMLParser();
const doc = parser.parse('<h1 id="title">Hello</h1><p class="intro">World</p>');
const h1 = parser.querySelector(doc.body, '#title');
console.log(parser.getTextContent(h1)); // "Hello"

// Auto-detect content type
const type = detectContentType('{"name":"Alice"}'); // 'json'

// Extract SEO metadata
const seo = extractSEO(htmlString);
// { title, description, ogTitle, ogImage, canonical, ... }

// Sanitize unsafe HTML
const safe = sanitizeHTML(untrustedHtml, {
  allowedTags: ['p', 'a', 'strong', 'em'],
  allowedAttributes: { a: ['href', 'title'] },
});
```

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `htmlparser2` | `^9.0.0` | Fast HTML/XML parsing |
| `entities` | `^4.5.0` | HTML entity encoding/decoding |
| `css-tree` | `^2.3.1` | CSS AST parsing and traversal |

---

## Parsers

### `HTMLParser`

Full HTML5 parser with DOM querying, manipulation, and serialization.

```typescript
import { HTMLParser } from '@laddhaanshul/content-renderer-core';

const parser = new HTMLParser({
  lowercaseTags: true,           // default: true
  lowercaseAttributeNames: true, // default: true
  recognizeSelfClosing: true,    // default: true
  decodeEntities: true,          // default: true
});

const doc = parser.parse(htmlString);
```

**Methods:**

| Method | Returns | Description |
|--------|---------|-------------|
| `parse(content, opts?)` | `HTMLDocument` | Parse full document |
| `parseFragment(content, opts?)` | `HTMLNode[]` | Parse HTML fragment |
| `validate(content)` | `ValidationResult` | Validate tag balance |
| `serialize(node)` | `string` | Back to HTML string |
| `querySelector(root, selector)` | `HTMLNode \| null` | CSS selector query |
| `querySelectorAll(root, selector)` | `HTMLNode[]` | All matches |
| `getElementById(root, id)` | `HTMLNode \| null` | Find by ID |
| `getElementsByClassName(root, cls)` | `HTMLNode[]` | Find by class |
| `getElementsByTagName(root, tag)` | `HTMLNode[]` | Find by tag |
| `getTextContent(node)` | `string` | Text content |
| `getInnerHTML(node)` | `string` | Inner HTML |
| `getOuterHTML(node)` | `string` | Outer HTML |
| `removeNode(node)` | `void` | Remove from tree |
| `appendChild(parent, child)` | `void` | Append child |
| `cloneNode(node, deep?)` | `HTMLNode` | Deep/shallow clone |

---

### `JSONParser`

JSON parser with JSONPath, diffing, schema inference, and deep manipulation.

```typescript
import { JSONParser } from '@laddhaanshul/content-renderer-core';

const parser = new JSONParser();
const doc = parser.parse(jsonString); // doc.schema auto-inferred

const names = parser.queryPath(data, '$.users[*].name');
const diff  = parser.diff(obj1, obj2);
const flat  = parser.flatten(nested);
```

**Methods:**

| Method | Returns | Description |
|--------|---------|-------------|
| `parse(content, opts?)` | `JSONDocument` | Parse with schema inference |
| `validate(content)` | `ValidationResult` | Circular ref + JSON.parse check |
| `queryPath(root, path)` | `any` | JSONPath (`$`, `$.key`, `$..name`, `$[0]`) |
| `diff(obj1, obj2)` | `JSONDiffResult` | Deep diff — added/removed/changed |
| `flatten(value, sep?)` | `Record<string,any>` | Flatten nested object |
| `unflatten(flat, sep?)` | `any` | Unflatten to nested |
| `sortByKeys(value, deep?)` | `any` | Sort keys alphabetically |
| `deepClone(value)` | `any` | Deep clone |
| `inferSchema(value)` | `JSONSchema` | Infer JSON schema |

---

### `XMLParser`

XML parser with XPath-like queries, namespace support, and JS object conversion.

```typescript
import { XMLParser } from '@laddhaanshul/content-renderer-core';

const parser = new XMLParser({
  preserveWhitespace: false,
  preserveComments: true,
  stripNamespaces: false,
  attributeNamePrefix: '@',
});

const doc   = parser.parse(xmlString);
const nodes = parser.queryXPath(doc.root, '/catalog/book[@id="bk101"]');
const obj   = parser.toObject(doc.root);
```

**Methods:**

| Method | Returns | Description |
|--------|---------|-------------|
| `parse(content, opts?)` | `XMLDocument` | Parse XML |
| `validate(content)` | `ValidationResult` | Well-formedness check |
| `serialize(node)` | `string` | Back to XML string |
| `queryXPath(root, path)` | `XMLNode[]` | XPath-like query with predicates |
| `toObject(node)` | `any` | Convert to plain JS object |
| `getTextContent(node)` | `string` | Get text |
| `getAttributeValue(node, name)` | `string \| null` | Get attribute |

---

### `MarkdownParser`

GitHub-Flavored Markdown parser with frontmatter and TOC generation.

```typescript
import { MarkdownParser } from '@laddhaanshul/content-renderer-core';

const parser = new MarkdownParser({ gfm: true, parseFrontmatter: true });
const doc  = parser.parse(markdownString);
const toc  = parser.extractTableOfContents(markdownString);
// [{ level: 1, text: 'Introduction', slug: 'introduction' }, ...]
```

**Methods:**

| Method | Returns | Description |
|--------|---------|-------------|
| `parse(content, opts?)` | `MarkdownDocument` | Parse Markdown + frontmatter |
| `extractHeadings(content)` | `MarkdownHeading[]` | H1–H6 with slugs |
| `extractLinks(content)` | `MarkdownLink[]` | All links |
| `extractImages(content)` | `MarkdownImage[]` | All images |
| `extractTableOfContents(content)` | `{level,text,slug}[]` | Table of contents |

---

### `PHPParser`

PHP source code analyzer extracting classes, functions, and variables.

```typescript
import { PHPParser } from '@laddhaanshul/content-renderer-core';

const parser = new PHPParser({ extractDocBlocks: true, trackLineNumbers: true });
const doc     = parser.parse(phpCode);
const classes = parser.extractClasses(phpCode);
```

**Methods:** `parse`, `validate`, `extractClasses`, `extractFunctions`, `extractVariables`

---

### `CSSParser`

CSS parser with custom properties, media queries, keyframes, and specificity.

```typescript
import { CSSParser } from '@laddhaanshul/content-renderer-core';

const parser   = new CSSParser({ preserveComments: false });
const vars     = parser.getVariables(cssString);   // { '--primary': '#6C63FF', ... }
const media    = parser.getMediaQueries(cssString);
const frames   = parser.getKeyframes(cssString);
```

**Methods:**

| Method | Returns | Description |
|--------|---------|-------------|
| `parse(content, opts?)` | `CSSDocument` | Parse CSS |
| `validate(content)` | `ValidationResult` | Brace balance check |
| `serialize(doc)` | `string` | Back to CSS |
| `getVariables(content)` | `Record<string,string>` | CSS custom properties |
| `getMediaQueries(content)` | `CSSMediaQuery[]` | All @media rules |
| `getKeyframes(content)` | `CSSKeyframes[]` | All @keyframes |
| `getRulesBySelector(content, pattern)` | `CSSRule[]` | Filter by selector regex |
| `minify(content)` | `string` | Minified CSS |
| `format(content, indent?)` | `string` | Pretty-printed CSS |

---

## Extraction Utilities

```typescript
import {
  extractAll,              // Run all extractors at once
  extractText,             // Plain text
  extractLinks,            // All anchor/Markdown links
  extractImages,           // img tags / Markdown images
  extractScripts,          // <script> tags
  extractStyles,           // <style> tags & <link rel="stylesheet">
  extractMeta,             // <meta> tags
  extractHeadings,         // H1–H6
  extractTables,           // HTML and Markdown tables
  extractForms,            // <form> elements with inputs
  extractLists,            // <ol> / <ul> lists
  extractCodeBlocks,       // <code> / <pre> blocks
  extractComments,         // HTML / CSS / JS comments
  extractSEO,              // Full SEO object
  extractOpenGraph,        // og:* meta properties
  extractTwitterCards,     // twitter:* meta properties
  extractStructuredData,   // JSON-LD from <script type="application/ld+json">
  extractClasses,          // All CSS class names
  extractIds,              // All element IDs
  extractAttributes,       // All values of a specific attribute
  extractDataAttributes,   // All data-* attributes
  extractFavicon,          // Favicon URL
  extractCanonical,        // Canonical URL
} from '@laddhaanshul/content-renderer-core';

// Extract everything at once
const data = extractAll(htmlContent, 'html');
// data.text | data.links | data.images | data.headings | data.tables | ...

// Full SEO object
const seo = extractSEO(html);
// seo.title | seo.description | seo.keywords | seo.canonical
// seo.ogTitle | seo.ogImage | seo.ogUrl | seo.twitterCard | ...
```

---

## Sanitization Utilities

```typescript
import {
  sanitizeHTML,           // Full allow-list sanitizer (XSS-safe)
  sanitizeHTMLWithOptions,// Extended sanitizer with more control
  sanitizeSVG,            // SVG-specific sanitizer
  sanitizeMathML,         // MathML-specific sanitizer
  stripTags,              // Remove specific tags
  stripAttributes,        // Remove specific attributes
  stripScripts,           // Remove all scripts + event handlers
  stripStyles,            // Remove all style blocks
  stripEventHandlers,     // Remove on* attributes
  stripDataAttributes,    // Remove data-* attributes
  escapeHTML,             // < > & " ' → HTML entities
  unescapeHTML,           // HTML entities → characters
  encodeEntities,         // Encode for XML
  decodeEntities,         // Decode HTML/XML entities
  isSafeHTML,             // Boolean — is content safe?
  DEFAULT_ALLOWED_TAGS,   // Default tag allow-list array
  DEFAULT_ALLOWED_ATTRIBUTES, // Default attribute allow-list
} from '@laddhaanshul/content-renderer-core';

// Example — allow-list sanitization
sanitizeHTML(untrustedHtml, {
  allowedTags: ['p', 'a', 'img', 'strong', 'em', 'h1', 'h2', 'ul', 'li'],
  allowedAttributes: {
    a:   ['href', 'title', 'target'],
    img: ['src', 'alt', 'width', 'height'],
  },
  allowScripts: false,
  allowStyles: false,
  allowComments: false,
});
```

---

## Transform Utilities

```typescript
import {
  // Minify
  minifyHTML, minifyCSS, minifyJSON, minifyXML,

  // Format / pretty-print
  formatHTML, formatCSS, formatJSON, formatXML, prettify,

  // Convert between formats
  convertToJSON, convertToXML, convertToMarkdown,

  // String case utilities
  slugify, camelCase, kebabCase, snakeCase, pascalCase, titleCase, capitalize, truncate,

  // Auto-detect
  detectContentType,
} from '@laddhaanshul/content-renderer-core';
```

**`detectContentType(content)`** — heuristic detection:

| Returns | Trigger |
|---------|---------|
| `html5` | `<!DOCTYPE html>` or `<html>` tag |
| `html` | Common HTML tags |
| `json` | Starts with `{` or `[`, parses as valid JSON |
| `xml` | `<?xml` declaration or balanced tags |
| `php` | `<?php` or `<?=` |
| `css` | `@media`, `selector { prop: val }` |
| `markdown` | Headings, fenced code, list items |
| `typescript` | `interface`, `type`, `enum`, type annotations |
| `javascript` | `const`, `let`, `function`, `import` |

---

## Validation Utilities

```typescript
import {
  isValidHTML, isValidJSON, isValidXML, isValidCSS,
  isValidURL, isValidEmail, isValidPhoneNumber,
  getContentTypeFromExtension,  // '.json' → 'json'
  getContentTypeFromMIME,       // 'text/html' → 'html'
  getContentTypeFromHeader,     // First-line detection
} from '@laddhaanshul/content-renderer-core';
```

---

## React Hooks

> These hooks require React as a peer dependency.

### `useContentParser(options?)`

```typescript
import { useContentParser } from '@laddhaanshul/content-renderer-core';

const {
  parsed, metadata, errors, warnings,
  isLoading, isError, error,
  parse, reset, refetch,
} = useContentParser({ contentType: 'json' });
```

### `useExtract(options?)`

```typescript
import { useExtract } from '@laddhaanshul/content-renderer-core';

const { extracted, isLoading, extract, reset } = useExtract({
  extractors: ['links', 'images', 'headings', 'meta'],
});
```

### `useTheme(initial?)`

```typescript
import { useTheme } from '@laddhaanshul/content-renderer-core';

const { theme, setTheme, toggleTheme, resetTheme, mode } = useTheme();
```

### `useContentService(config)`

Fetch content from any URL with auto-detection, caching, retry, and polling.

```typescript
import { useContentService } from '@laddhaanshul/content-renderer-core';

const { content, contentType, isLoading, isError, error, retry, abort } =
  useContentService({
    url: '/api/pages/home',
    extractStrategy: 'auto', // 'auto'|'direct'|'json-html'|'json-markdown'|'aem'|'headless-cms'|'custom'
    cacheTime: 300_000,
    retry: true,
    retryCount: 3,
    refetchOnWindowFocus: true,
    headers: { Authorization: 'Bearer token' },
  });
```

---

## Higher-Order Components

```typescript
import { withContentParser, withExtract } from '@laddhaanshul/content-renderer-core';

// Inject parsed content into any component
const Enhanced = withContentParser(MyComponent, {
  autoParse: true,
  contentType: 'markdown',
  contentPropName: 'source',
});
// MyComponent receives: parsedContent, parseContent, isParsing, parseError

const Enhanced2 = withExtract(MyComponent, {
  autoExtract: true,
  extractors: ['links', 'images'],
  contentPropName: 'htmlContent',
});
// MyComponent receives: extractedData, extractData, isExtracting, extractError
```

---

## Provider

```tsx
import { ContentParserProvider, darkTheme } from '@laddhaanshul/content-renderer-core';

<ContentParserProvider config={{
  theme: darkTheme,
  defaultContentType: 'html',
  sanitizeHTML: true,
  linkHandler: (href) => window.open(href),
  plugins: [lineNumbersPlugin, tocPlugin],
}}>
  <App />
</ContentParserProvider>
```

---

## Plugin System

```typescript
import { PluginManager, PluginPriority, lineNumbersPlugin, tocPlugin } from '@laddhaanshul/content-renderer-core';

const manager = new PluginManager({ verbose: false, hookTimeout: 5000 });

manager.register({
  name: 'my-plugin',
  version: '1.0.0',
  priority: PluginPriority.NORMAL, // CRITICAL=1000 | HIGH=100 | NORMAL=0 | LOW=-100 | LAST=-1000
  hooks: {
    beforeParse: (content) => content.trim(),
    afterParse:  (parsed)  => ({ ...parsed, metadata: { ...parsed.metadata, processedBy: 'my-plugin' } }),
  },
});

await manager.initAll();
const result = await manager.runHook('beforeParse', rawContent, 'html');
await manager.destroyAll();
```

**Built-in plugins:** `lineNumbersPlugin`, `sanitizePlugin`, `tocPlugin`, `metaEnricherPlugin`, `linkRewritePlugin`, `imageProxyPlugin`, `emojiPlugin`, `headingAnchorPlugin`

**Factory functions:** `createLineNumbersPlugin`, `createSanitizePlugin`, `createTocPlugin`, `createMetaEnricherPlugin`, `createLinkRewritePlugin`, `createImageProxyPlugin`, `createEmojiPlugin`, `createHeadingAnchorPlugin`

---

## Advanced Features

### SSR / Next.js

```typescript
import {
  renderToString, renderToStaticMarkup,
  extractMetadataForSSR, generateHeadTags,
  generateStructuredData, createSSRContent,
  isServer, isClient,
} from '@laddhaanshul/content-renderer-core';
```

### Accessibility

```typescript
import {
  getAriaRole, getAriaAttributes,
  generateAriaLabel, generateAriaLive,
  createAccessibleTree, validateAccessibility,
  checkColorContrast, generateScreenReaderText,
  ARIA_ROLES, ARIA_LANDMARK_ROLES,
} from '@laddhaanshul/content-renderer-core';
```

### i18n & RTL (42 locales)

```typescript
import {
  isRTL, getDirection, formatNumber, formatDate, formatCurrency,
  getLocalizedText, pluralize, interpolate,
  loadLocale, addLocale, setLocaleMessages,
  SUPPORTED_LOCALES, RTL_LOCALES,
} from '@laddhaanshul/content-renderer-core';
```

### PDF Export

```typescript
import {
  contentToPrintableHTML, generatePDFStyles,
  createPDFBlob, downloadPDF, previewPDF,
} from '@laddhaanshul/content-renderer-core';
```

### Diff Engine

```typescript
import { createDiff, createUnifiedDiff, computeLineChanges, applyDiff } from '@laddhaanshul/content-renderer-core';
```

### JSONPath

```typescript
import { queryPath, queryPathSingle, parseJSONPath } from '@laddhaanshul/content-renderer-core';
```

### Syntax Highlighting

```typescript
import { EXTENDED_LANGUAGES, getLanguageDefinition, getAllLanguageNames } from '@laddhaanshul/content-renderer-core';
import { THEME_REGISTRY, getTheme, getAllThemeNames, createCustomTheme } from '@laddhaanshul/content-renderer-core';
// 56 languages · 12 themes
```

### Error Recovery

```typescript
import {
  recoverFromHTMLError, recoverFromJSONError, recoverFromMarkdownError,
  recoverFromCSSError, recoverFromXMLError,
  sanitizeErrorOutput, createFallbackContent, suggestFixes,
} from '@laddhaanshul/content-renderer-core';
```

---

## Themes

```typescript
import { lightTheme, darkTheme } from '@laddhaanshul/content-renderer-core';

// Extend a theme
const customTheme = {
  ...darkTheme,
  colors: { ...darkTheme.colors, primary: '#7c3aed' },
};
```

Both themes include: colors, fonts, spacing, border radius, shadows, code block tokens, and typography scales (h1–h6).

---

## TypeScript

Full type definitions ship with the package. Key types:

```typescript
import type {
  // Core
  ContentType, ParsedContent, ContentMetadata, ParseError, ParseWarning,
  // Parsers
  HTMLDocument, HTMLNode, JSONDocument, JSONSchema, XMLDocument, XMLNode,
  PHPDocument, PHPClass, PHPFunction, MarkdownDocument, MarkdownHeading,
  CSSDocument, CSSRule, CSSDeclaration, CSSMediaQuery, CSSKeyframes,
  // Extraction
  ExtractedData, ExtractedLink, ExtractedImage, ExtractedHeading, SEOMetadata,
  // Themes
  Theme, ThemeColors, CodeBlockTheme,
  // Hooks
  UseContentParserOptions, UseContentServiceReturn, ContentServiceConfig,
  ContentExtractStrategy,
  // Plugin system
  PluginDefinition, PluginHook, PluginManagerOptions, PluginHookContext,
  // Misc
  SanitizeOptions, ValidationResult, SSRRenderOptions, PDFExportOptions,
} from '@laddhaanshul/content-renderer-core';
```

---

## License

MIT © content-renderer contributors
