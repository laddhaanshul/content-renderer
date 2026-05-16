# @content-renderer/react-and-native

[![npm version](https://img.shields.io/npm/v/@content-renderer/react-and-native.svg)](https://www.npmjs.com/package/@content-renderer/react-and-native)
[![npm downloads](https://img.shields.io/npm/dm/@content-renderer/react-and-native.svg)](https://www.npmjs.com/package/@content-renderer/react-and-native)
[![license](https://img.shields.io/npm/l/@content-renderer/react-and-native.svg)](https://github.com/laddhaanshul/content-renderer/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

> Universal React components for rendering HTML, Markdown, JSON, XML, PHP, CSS, and source code — on both **React DOM (web)** and **React Native (mobile)** from a single import. Components auto-select the correct platform implementation at bundle time.

**🌍 Official Website & Documentation: [https://content-renderer.anshulladdha.in/](https://content-renderer.anshulladdha.in/)**

---

## Installation

```bash
npm install @content-renderer/react-and-native
yarn add @content-renderer/react-and-native
pnpm add @content-renderer/react-and-native
```

**Peer Dependencies:**

| Dependency | Version | Required |
|------------|---------|----------|
| `react` | `>=17.0.0` | ✅ Always |
| `react-dom` | `>=17.0.0` | Web only |
| `react-native` | `>=0.68.0` | Native only |

**Also installs:** `@content-renderer/core` (same version — automatically kept in sync).

---

## Quick Start

```tsx
import { ContentRenderer } from '@content-renderer/react-and-native';

// Auto-detects HTML, JSON, Markdown, code, XML, CSS, PHP
<ContentRenderer content={anyString} />

// Force type + dark theme
<ContentRenderer
  content={markdownString}
  contentType="markdown"
  theme={darkTheme}
  onError={(err) => console.error(err)}
/>
```

---

## Components

### `ContentRenderer` — Universal Auto-Detect

The single entry point. Detects the content type and delegates to the right renderer.

```tsx
import { ContentRenderer } from '@content-renderer/react-and-native';

<ContentRenderer
  content={anyString}
  contentType="auto"          // 'auto' | 'html' | 'json' | 'markdown' | 'code' | 'xml' | 'css' | 'php'
  theme={darkTheme}
  sanitize={true}
  allowedTags={['p', 'a', 'strong']}
  fallback={<MyErrorUI />}
  loading={<Spinner />}
  linkHandler={(href) => navigate(href)}
  imageHandler={(src) => `/cdn${src}`}
  onError={(err) => report(err)}
  onRender={() => console.log('rendered')}
/>
```

**All props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | required | Content to render |
| `contentType` | `ContentType \| 'auto'` | `'auto'` | Force or auto-detect type |
| `theme` | `Partial<Theme>` | — | Theme overrides |
| `sanitize` | `boolean` | `true` | Enable HTML sanitization |
| `allowedTags` | `string[]` | — | Allowed HTML tags |
| `allowedAttributes` | `Record<string, string[]>` | — | Allowed attributes per tag |
| `maxDepth` | `number` | — | Max render tree depth |
| `components` | `Record<string, ComponentType>` | — | Custom component per tag |
| `renderers` | `Record<string, ComponentType>` | — | Custom renderers per content type |
| `transform` | `(node) => any` | — | Node transform function |
| `linkHandler` | `(href, e?) => void` | — | Link click handler |
| `imageHandler` | `(src, alt?) => string` | — | Image URL rewriter |
| `codeBlockHandler` | `(code, lang) => ReactNode` | — | Custom code block |
| `tableHandler` | `(table) => ReactNode` | — | Custom table renderer |
| `fallback` | `ReactNode` | — | Shown on error |
| `loading` | `ReactNode` | — | Shown while loading |
| `onError` | `(err: Error) => void` | — | Error callback |
| `onRender` | `() => void` | — | Render complete callback |
| `testID` | `string` | — | Test ID (React Native) |
| `accessible` | `boolean` | — | Accessibility enable |
| `accessibilityLabel` | `string` | — | Accessibility label |
| `className` | `string` | — | CSS class (web only) |
| `style` | `CSSProperties` | — | Inline style (web only) |

---

### `HTMLRenderer`

Renders raw HTML strings as React elements with full DOM support.

```tsx
import { HTMLRenderer } from '@content-renderer/react-and-native';

<HTMLRenderer
  html="<h1>Hello</h1><p>Click <a href='/page'>here</a></p>"
  sanitize={true}
  components={{
    h1: ({ children }) => <h1 className="title">{children}</h1>,
    a:  CustomLink,
  }}
  onLinkClick={(href, event) => { event.preventDefault(); navigate(href); }}
  wrapperTag="article"
  transform={(node, element) => {
    if (node.tagName === 'img') return <LazyImage {...element.props} />;
    return element;
  }}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `html` | `string` | required | Raw HTML |
| `components` | `Record<string, ComponentType>` | — | Tag overrides |
| `onLinkClick` | `(href, event) => void` | — | Anchor click |
| `onFormSubmit` | `(event) => void` | — | Form submit |
| `sanitize` | `boolean` | `false` | Enable sanitization |
| `renderComments` | `boolean` | `false` | Render HTML comments |
| `wrapperTag` | `keyof JSX.IntrinsicElements` | `'div'` | Wrapper tag |
| `allowDangerousHTML` | `boolean` | `false` | dangerouslySetInnerHTML |
| `transform` | `(node, element) => ReactElement \| null` | — | Element transform |
| `fallback` | `ReactNode` | — | Parse failure fallback |
| `onRenderComplete` | `() => void` | — | Render complete callback |

---

### `MarkdownRenderer`

Renders GitHub-Flavored Markdown with custom component support.

```tsx
import { MarkdownRenderer } from '@content-renderer/react-and-native';

<MarkdownRenderer
  content={markdownString}
  components={{
    code: ({ children, className }) => (
      <SyntaxHighlighter language={className?.replace('language-', '')}>
        {children}
      </SyntaxHighlighter>
    ),
  }}
  linkHandler={(href) => navigate(href)}
  imageHandler={(src) => `/cdn${src}`}
  escapeHtml={false}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | required | Markdown string |
| `components` | `Record<string, ComponentType>` | — | Custom node renderers |
| `linkHandler` | `(href) => void` | — | Link click handler |
| `imageHandler` | `(src) => string` | — | Image URL rewriter |
| `escapeHtml` | `boolean` | — | Escape HTML in Markdown |
| `skipHtml` | `boolean` | — | Skip HTML blocks |
| `linkTarget` | `string` | — | Default link target |
| `plugins` | `any[]` | — | Remark/rehype plugins |

---

### `JSONRenderer`

Interactive, collapsible JSON tree viewer with search and copy.

```tsx
import { JSONRenderer } from '@content-renderer/react-and-native';

<JSONRenderer
  json={JSON.stringify(apiResponse, null, 2)}
  theme="dark"
  searchable
  sortKeys
  defaultCollapseDepth={1}
  showTypes
  showCopyButton
  onValueClick={(path, value) => console.log(path, value)}
  excludeKeys={['__meta', '_internal']}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `json` | `string \| unknown` | required | JSON string or value |
| `theme` | `'light' \| 'dark'` | `'light'` | Color theme |
| `indent` | `number` | `2` | Indent spaces |
| `defaultCollapseDepth` | `number` | `Infinity` | Auto-collapse depth |
| `sortKeys` | `boolean` | `false` | Alphabetical keys |
| `showTypes` | `boolean` | `true` | Type badges |
| `showArrayIndices` | `boolean` | `true` | Array indices |
| `showCopyButton` | `boolean` | `true` | Copy button |
| `searchable` | `boolean` | `false` | Search bar |
| `maxDepth` | `number` | `50` | Max render depth |
| `onValueClick` | `(path, value) => void` | — | Value click handler |
| `excludeKeys` | `string[]` | — | Keys to hide |
| `includeKeys` | `string[]` | — | Keys to show exclusively |

---

### `CodeRenderer`

Syntax-highlighted code blocks with line numbers, diff highlighting, and copy.

```tsx
import { CodeRenderer } from '@content-renderer/react-and-native';

<CodeRenderer
  code={sourceCode}
  language="typescript"
  showLineNumbers
  highlightLines={[3, 4, 5]}
  theme="monokai"
  showCopyButton
  wrapLines={false}
  startingLineNumber={1}
  fontSize={14}
  tabSize={2}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `code` | `string` | required | Source code |
| `language` | `string` | — | Language identifier |
| `showLineNumbers` | `boolean` | `false` | Show line numbers |
| `highlightLines` | `number[]` | — | Lines to highlight |
| `theme` | `string` | `'light'` | `light`\|`dark`\|`monokai`\|`dracula`\|`github`\|`vscode` |
| `wrapLines` | `boolean` | `false` | Line wrapping |
| `startingLineNumber` | `number` | `1` | First line number |
| `showCopyButton` | `boolean` | `true` | Copy button |
| `fontSize` | `number` | — | Font size px |
| `tabSize` | `number` | `2` | Tab width |

**Supported languages (56):** `javascript`, `typescript`, `jsx`, `tsx`, `python`, `java`, `go`, `rust`, `c`, `cpp`, `csharp`, `php`, `ruby`, `swift`, `kotlin`, `scala`, `sql`, `bash`, `sh`, `yaml`, `json`, `xml`, `html`, `css`, `scss`, `graphql`, `markdown`, `dockerfile`, `toml`, `ini`, and 26 more.

---

### `DiffRenderer`

Side-by-side or unified diff viewer.

```tsx
import { DiffRenderer } from '@content-renderer/react-and-native';
import type { DiffRendererProps } from '@content-renderer/react-and-native';

<DiffRenderer
  oldContent={previousCode}
  newContent={updatedCode}
  mode="unified"       // 'unified' | 'split'
  language="javascript"
  showLineNumbers
  theme="dark"
/>
```

---

### `VirtualizedCodeRenderer`

Performance-optimized code renderer for files with thousands of lines.

```tsx
import { VirtualizedCodeRenderer } from '@content-renderer/react-and-native';
import type { VirtualizedCodeRendererProps } from '@content-renderer/react-and-native';

<VirtualizedCodeRenderer
  code={largeFile}
  language="python"
  height={600}
  rowHeight={22}
  overscanCount={10}
/>
```

---

### `PHPRenderer`

PHP source code with dedicated syntax highlighting.

```tsx
import { PHPRenderer } from '@content-renderer/react-and-native';

<PHPRenderer content={phpCode} showLineNumbers theme="monokai" />
```

---

### `XMLRenderer`

Collapsible XML tree view with attribute highlighting.

```tsx
import { XMLRenderer } from '@content-renderer/react-and-native';

<XMLRenderer content={xmlString} defaultCollapsed={false} theme="dark" />
```

---

### `CSSRenderer`

CSS source display with property and value highlighting.

```tsx
import { CSSRenderer } from '@content-renderer/react-and-native';

<CSSRenderer content={cssString} showLineNumbers theme="github" />
```

---

### `ContentServiceRenderer`

Fetches content from a URL and renders it directly. Supports AEM, headless CMS, and any REST API.

```tsx
import { ContentServiceRenderer } from '@content-renderer/react-and-native';

// Auto-detect
<ContentServiceRenderer
  url="https://api.example.com/pages/home"
  config={{ extractStrategy: 'auto' }}
  loading={<Spinner />}
  errorRenderer={(error, retry) => (
    <div>
      <p>{error.message}</p>
      <button onClick={retry}>Retry</button>
    </div>
  )}
/>

// AEM
<ContentServiceRenderer
  url={`https://publish-p123-e456.adobeaemcloud.com${path}.model.json`}
  config={{ extractStrategy: 'aem' }}
  sanitize
/>

// Headless CMS (WordPress / Strapi / Contentful)
<ContentServiceRenderer
  url={`/api/posts/${id}`}
  config={{
    extractStrategy: 'headless-cms',
    contentField: 'content',
    headers: { 'X-API-Key': process.env.API_KEY },
  }}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `url` | `string` | — | URL to fetch |
| `config` | `Partial<ContentServiceConfig>` | — | Service configuration |
| `loading` | `ReactNode` | — | Loading state |
| `errorRenderer` | `(error, retry) => ReactNode` | — | Error with retry |
| `fallback` | `ReactNode` | — | Empty content fallback |
| `fetchOnMount` | `boolean` | `true` | Fetch on mount |
| `fetchKey` | `string \| number` | — | Refetch trigger key |
| `fetchDebounce` | `number` | `0` | Debounce ms |
| `onLoad` | `(result) => void` | — | Success callback |
| `onLoadError` | `(error) => void` | — | Error callback |

**Extraction Strategies:**

| Strategy | Use Case |
|----------|----------|
| `auto` | General purpose — auto-detects |
| `direct` | Raw HTML/Markdown response |
| `json-html` | JSON with HTML content field |
| `json-markdown` | JSON with Markdown content field |
| `json-field` | JSON path extraction |
| `json-property` | Unknown JSON structures |
| `aem` | Adobe Experience Manager |
| `headless-cms` | WordPress, Strapi, Contentful |
| `custom` | Fully custom `transformResponse` |

---

### `ErrorBoundary`

Catches rendering errors and displays a fallback.

```tsx
import { ErrorBoundary } from '@content-renderer/react-and-native';

<ErrorBoundary
  fallback={<div className="error">Something went wrong</div>}
  onError={(error, info) => logToSentry(error, info)}
>
  <ContentRenderer content={content} />
</ErrorBoundary>
```

---

## Hooks

All hooks from `@content-renderer/core` are re-exported here for convenience:

```typescript
import {
  useContentParser,   // Parse content programmatically
  useExtract,         // Extract links/images/meta/etc.
  useTheme,           // Manage light/dark theme
  useContentService,  // Fetch + render from URL
} from '@content-renderer/react-and-native';
```

### Animation Hooks

```typescript
import {
  useFadeIn,               // Fade-in opacity animation
  useSlideIn,              // Slide-in transform animation
  useCollapseAnimation,    // Expand/collapse height animation
  useTypewriter,           // Typewriter text effect
  useThemeTransition,      // Smooth theme transition
  useScrollAnimation,      // Trigger animation on scroll into view
  animateNumber,           // Animate a numeric value over time
  createStaggerAnimation,  // Stagger children animations
  getTransitionCSS,        // Get CSS transition string
} from '@content-renderer/react-and-native';
import type { EasingFunction } from '@content-renderer/react-and-native';

// Example: fade in on mount
function MyComponent() {
  const { style, ref } = useFadeIn({ duration: 300, delay: 100 });
  return <div ref={ref} style={style}>Hello</div>;
}

// Example: typewriter
function TypewriterDemo() {
  const { displayText } = useTypewriter({ text: 'Hello, World!', speed: 60 });
  return <p>{displayText}</p>;
}
```

---

## Platform Utilities

### Web (React DOM)

```typescript
import {
  styleStringToObject,   // 'color: red; font-size: 14px' → { color: 'red', fontSize: '14px' }
  attrToReactProp,       // 'class' → 'className', 'for' → 'htmlFor'
  isBooleanAttribute,    // 'disabled' → true
  isVoidElement,         // 'img' → true
  svgAttrToReact,        // SVG attribute name conversion
  isSVGElement,          // true if tag is an SVG element
  parseAttributes,       // Parse raw attribute string to object
  tokenize,              // Tokenize source code into tokens
  highlight,             // Syntax highlight source code
  getSupportedLanguages, // List all supported languages
  isLanguageSupported,   // Check language support
  resolveLanguageName,   // 'js' → 'javascript'
  tokensToHtml,          // Convert tokens to HTML string
} from '@content-renderer/react-and-native';

import type { Token, TokenType } from '@content-renderer/react-and-native';
```

### Native (React Native)

```typescript
import {
  HTML_TO_RN_MAP,        // HTML tag → RN component mapping
  styleStringToRNStyle,  // CSS string → React Native StyleSheet
  classToRNStyle,        // CSS class → RN style object
  flattenInlineNodes,    // Flatten inline text nodes for Text component
  isInlineNode,          // true if node renders inline
  tokenizeLine,          // Tokenize a single line for Native code view
  highlightCode,         // Native syntax highlighting
  detectLanguage,        // Auto-detect language from code
  LIGHT_SYNTAX_THEME,    // Light native syntax theme
  DARK_SYNTAX_THEME,     // Dark native syntax theme
  lightNativeTheme,      // Light theme for native components
  darkNativeTheme,       // Dark theme for native components
  mergeNativeTheme,      // Deep merge two native themes
} from '@content-renderer/react-and-native';

import type {
  HTMLTagMappingRN, HTMLNodeRN,
  SyntaxToken, SyntaxTheme, TokenizerState,
  NativeTheme, NativeThemeColors, NativeThemeTypography,
  NativeThemeSpacing, NativeThemeCodeBlock,
} from '@content-renderer/react-and-native';
```

### Worker (background highlighting)

```typescript
import {
  createHighlightWorker, // Create a Web Worker for highlighting
  highlightInWorker,     // Highlight in background thread
  highlightOnce,         // One-shot background highlight
} from '@content-renderer/react-and-native';

import type { WorkerMessage, WorkerResult, HighlightToken } from '@content-renderer/react-and-native';
```

---

## Re-exports from `@content-renderer/core`

Everything from `@content-renderer/core` is re-exported for convenience:

```typescript
// Parsers
import { HTMLParser, JSONParser, XMLParser, PHPParser, MarkdownParser, CSSParser }
  from '@content-renderer/react-and-native';

// Extraction
import { extractAll, extractLinks, extractSEO, extractOpenGraph, extractStructuredData }
  from '@content-renderer/react-and-native';

// Sanitization
import { sanitizeHTML, stripTags, escapeHTML, DEFAULT_ALLOWED_TAGS }
  from '@content-renderer/react-and-native';

// Transform
import { minifyHTML, formatHTML, detectContentType, slugify }
  from '@content-renderer/react-and-native';

// Validation
import { isValidHTML, isValidJSON, isValidURL }
  from '@content-renderer/react-and-native';

// Hooks
import { useContentParser, useExtract, useTheme, useContentService }
  from '@content-renderer/react-and-native';

// HOCs
import { withContentParser, withExtract }
  from '@content-renderer/react-and-native';

// Provider + themes
import { ContentParserProvider, lightTheme, darkTheme }
  from '@content-renderer/react-and-native';

// Plugin system
import { PluginManager, lineNumbersPlugin, tocPlugin, sanitizePlugin }
  from '@content-renderer/react-and-native';

// Advanced
import { renderToString, generateHeadTags }           from '@content-renderer/react-and-native'; // SSR
import { isRTL, formatDate, SUPPORTED_LOCALES }       from '@content-renderer/react-and-native'; // i18n
import { downloadPDF, previewPDF }                     from '@content-renderer/react-and-native'; // PDF
import { createDiff, createUnifiedDiff }               from '@content-renderer/react-and-native'; // Diff
import { queryPath, queryPathSingle }                  from '@content-renderer/react-and-native'; // JSONPath
import { EXTENDED_LANGUAGES, THEME_REGISTRY }          from '@content-renderer/react-and-native'; // Syntax
import { recoverFromHTMLError, suggestFixes }          from '@content-renderer/react-and-native'; // Errors
import { validateAccessibility, checkColorContrast }  from '@content-renderer/react-and-native'; // a11y
```

---

## TypeScript

Full types ship with the package. Key types from this package:

```typescript
import type {
  DiffRendererProps,
  VirtualizedCodeRendererProps,
  EasingFunction,
  HTMLTagMappingRN, HTMLNodeRN,
  SyntaxToken, SyntaxTheme, TokenizerState,
  NativeTheme, NativeThemeColors, NativeThemeCodeBlock,
  WorkerMessage, WorkerResult, HighlightToken,
  Token, TokenType,
} from '@content-renderer/react-and-native';

// Re-exported core types:
import type {
  ContentType, ParsedContent, Theme, ContentServiceConfig,
  ContentExtractStrategy, ContentServiceRendererProps,
  BaseRendererProps, HTMLRendererProps, CodeRendererProps,
  JSONRendererProps, MarkdownRendererProps, PHPRendererProps,
  UseContentParserOptions, UseContentServiceReturn,
  PluginDefinition, SanitizeOptions, SSRRenderOptions,
} from '@content-renderer/react-and-native';
```

---

## React Native Setup

Metro automatically resolves `.native.tsx` files when bundling for React Native — no extra configuration needed.

```tsx
// Works identically on web and native
import { HTMLRenderer, CodeRenderer } from '@content-renderer/react-and-native';

<CodeRenderer code={snippet} language="javascript" showLineNumbers />
```

For Expo-managed workflows, add to `metro.config.js` if needed:

```js
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
config.resolver.sourceExts.push('native.tsx', 'native.ts');
module.exports = config;
```

---

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome / Edge (last 2) | ✅ |
| Firefox (last 2) | ✅ |
| Safari (last 2) | ✅ |
| Node.js ≥ 18 (SSR) | ✅ |

---

## License

MIT © content-renderer contributors
