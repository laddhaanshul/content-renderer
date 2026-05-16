# Content Renderer

<p align="center">
  <strong>Universal content rendering for React and React Native</strong>
</p>

<p align="center">
  Parse and render HTML, PHP, JSON, XML, Markdown, CSS, and source code as React components with zero-config auto-detection.
</p>

<p align="center">
  <a href="#features">Features</a> &bull;
  <a href="#installation">Installation</a> &bull;
  <a href="#quick-start">Quick Start</a> &bull;
  <a href="#api-reference">API Reference</a> &bull;
  <a href="#development">Development</a> &bull;
  <a href="#contributing">Contributing</a>
</p>

---

## Features

- **Auto Content Type Detection** — Automatically detects HTML, HTML5, JSON, XML, PHP, Markdown, CSS, JavaScript, TypeScript, YAML, and plain text from content strings
- **HTML/HTML5 Rendering** — Full DOM support with custom component overrides, sanitization, SVG support, inline style parsing, and event handlers
- **JSON Interactive Tree Viewer** — Collapsible tree view with search/filter, data type badges, copy-to-clipboard, sort keys, and dark/light themes
- **Markdown with GFM** — Full GitHub-Flavored Markdown support including tables, task lists, strikethrough, frontmatter parsing, and table of contents extraction
- **Code Syntax Highlighting** — 15+ language support with line numbers, line highlighting, copy button, dark/light themes, and customizable font sizes
- **PHP Code Rendering** — Syntax-aware rendering with PHPDoc extraction, class/function/variable analysis, and line numbers
- **XML Collapsible Tree Viewer** — Full XML document parsing with namespace support, XPath queries, attribute extraction, and serialization
- **CSS Syntax Highlighting** — Parses CSS with rule extraction, specificity calculation, media query isolation, custom property detection, and keyframe support
- **Content Extraction Utilities** — Extract links, images, scripts, styles, meta tags, headings, tables, forms, lists, code blocks, comments, SEO metadata, OpenGraph, Twitter Cards, and structured data
- **React Hooks** — `useContentParser`, `useExtract`, and `useTheme` hooks for programmatic content access
- **Higher-Order Components** — `withContentParser` and `withExtract` for class component support
- **Theme System** — Built-in light/dark themes with full customization via the `Theme` interface
- **TypeScript Support** — 100% TypeScript with comprehensive type definitions exported from `@laddhaanshul/content-renderer-core`
- **Zero External Runtime Dependencies** — Core package has minimal dependencies (`htmlparser2`, `entities`, `css-tree`)
- **React Native Support** — Native rendering with platform-appropriate components using React Native primitives
- **Error Boundaries** — Built-in error handling with custom fallback rendering
- **Accessibility** — ARIA attributes, roles, and labels on all components
- **Content Sanitization** — Built-in XSS protection with configurable allowed tags and attributes
- **Content Service** — Fetch content from API endpoints (AEM, headless CMS, REST APIs) and render it directly with auto-detection, JSON extraction strategies, loading/error states, retry, caching, and polling

---

## Packages

This monorepo contains two packages:

| Package | Description | Peer Dependencies |
|---|---|---|
| `@laddhaanshul/content-renderer-core` | Parsers, utilities, hooks, HOCs, providers, and themes | None |
| `@laddhaanshul/content-renderer` | React + React Native components for rendering all content types (unified) | `react >=17`, `react-dom >=17`, `react-native >=0.68` |

---

## Installation

Install the packages you need for your platform:

### Core Package (Shared logic, parsers, utilities)

```bash
# npm
npm install @laddhaanshul/content-renderer-core

# yarn
yarn add @laddhaanshul/content-renderer-core

# pnpm
pnpm add @laddhaanshul/content-renderer-core
```

### React Package (Web + Native)

```bash
# npm
npm install @laddhaanshul/content-renderer

# yarn
yarn add @laddhaanshul/content-renderer

# pnpm
pnpm add @laddhaanshul/content-renderer
```

```bash
# npm
npm install @laddhaanshul/content-renderer

# yarn
yarn add @laddhaanshul/content-renderer

# pnpm
pnpm add @laddhaanshul/content-renderer
```

> **Note:** `@laddhaanshul/content-renderer` depends on `@laddhaanshul/content-renderer-core` internally. You do not need to install it separately unless you want to use its parsers and utilities directly.

---

## Quick Start

### Basic Usage (Auto-Detection)

The `ContentRenderer` component automatically detects content type and renders accordingly:

```tsx
import { ContentRenderer } from '@laddhaanshul/content-renderer';

function App() {
  const content = '<h1>Hello World</h1><p>This is <strong>HTML</strong> content.</p>';
  return <ContentRenderer content={content} />;
}
```

### HTML Rendering

```tsx
import { HTMLRenderer } from '@laddhaanshul/content-renderer';

function App() {
  return (
    <HTMLRenderer
      html="<h1>Title</h1><p>Paragraph with a <a href='/link'>link</a></p>"
      sanitize={true}
      onLinkClick={(href, event) => {
        event.preventDefault();
        console.log('Link clicked:', href);
      }}
      components={{
        h1: ({ children }) => <h1 style={{ color: 'blue' }}>{children}</h1>,
      }}
    />
  );
}
```

### JSON Rendering

```tsx
import { JSONRenderer } from '@laddhaanshul/content-renderer';

function App() {
  const data = JSON.stringify({
    name: 'John Doe',
    age: 30,
    address: { city: 'New York', zip: '10001' },
    hobbies: ['reading', 'coding', 'hiking'],
  }, null, 2);

  return (
    <JSONRenderer
      json={data}
      theme="dark"
      searchable
      sortKeys
      defaultCollapseDepth={1}
      showCopyButton
      showTypes
    />
  );
}
```

### Markdown Rendering

```tsx
import { MarkdownRenderer } from '@laddhaanshul/content-renderer';

function App() {
  return (
    <MarkdownRenderer
      content={`
# Getting Started

This is **bold** and this is *italic*.

- Item one
- Item two
- Item three

| Feature | Status |
|---------|--------|
| HTML    | Done   |
| JSON    | Done   |

\`\`\`typescript
const greeting: string = "Hello, World!";
console.log(greeting);
\`\`\`
`}
      linkHandler={(href) => console.log('Navigate to:', href)}
      imageHandler={(src) => `/cdn${src}`}
    />
  );
}
```

### Code Rendering

```tsx
import { CodeRenderer } from '@laddhaanshul/content-renderer';

function App() {
  return (
    <CodeRenderer
      code={`function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`}
      language="typescript"
      showLineNumbers
      highlightLines={[1, 3]}
      theme="monokai"
      fontSize={14}
      showCopyButton
    />
  );
}
```

### Auto-Detection with the Core Hook

```tsx
import { useContentParser } from '@laddhaanshul/content-renderer-core';

function ContentDisplayer({ content }: { content: string }) {
  const { parsed, data, isLoading, isError, errors } = useContentParser({
    onSuccess: (result) => console.log('Parsed:', result.metadata),
    onError: (error) => console.error('Parse error:', error),
  });

  // Call parse when content changes
  React.useEffect(() => {
    if (content) {
      parse(content);
    }
  }, [content]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {errors.map(e => e.message).join(', ')}</div>;

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

### Using Extraction Utilities

```tsx
import { useExtract } from '@laddhaanshul/content-renderer-core';

function SEOExtractor({ htmlContent }: { htmlContent: string }) {
  const { extracted, isLoading } = useExtract({
    extractors: ['text', 'links', 'images', 'headings', 'meta'],
  });

  React.useEffect(() => {
    extract(htmlContent, 'html');
  }, [htmlContent]);

  if (!extracted) return null;

  return (
    <div>
      <h3>Page Text</h3>
      <p>{extracted.text.slice(0, 200)}...</p>

      <h3>Links ({extracted.links.length})</h3>
      <ul>
        {extracted.links.map((link, i) => (
          <li key={i}>{link.text} - {link.href}</li>
        ))}
      </ul>

      <h3>Headings ({extracted.headings.length})</h3>
      <ul>
        {extracted.headings.map((h, i) => (
          <li key={i}>H{h.level}: {h.text}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Using HOCs (Higher-Order Components)

```tsx
import { withContentParser } from '@laddhaanshul/content-renderer-core';

interface MyProps {
  content: string;
}

const MyComponent = withContentParser<MyProps>(
  ({ parsedContent, parseContent, isParsing, parseError, content }) => {
    if (isParsing) return <div>Parsing...</div>;
    if (parseError) return <div>Error: {parseError.message}</div>;

    return (
      <div>
        <h2>Content Metadata</h2>
        <p>Type: {parsedContent?.type}</p>
        <p>Size: {parsedContent?.metadata.size} bytes</p>
        <button onClick={() => parseContent(content)}>Re-parse</button>
      </div>
    );
  },
  { autoParse: true, contentType: 'markdown' }
);
```

### Using the Provider

```tsx
import {
  ContentParserProvider,
  ContentRenderer,
  lightTheme,
  darkTheme,
} from '@laddhaanshul/content-renderer';

function App() {
  return (
    <ContentParserProvider
      config={{
        theme: darkTheme,
        defaultContentType: 'html',
        sanitizeHTML: true,
        maxRenderDepth: 100,
        linkHandler: (href) => window.open(href, '_blank'),
        errorHandler: (error, content) => (
          <div className="error">Failed to render: {error.message}</div>
        ),
      }}
    >
      <ContentRenderer content="<h1>Hello from Provider!</h1>" />
    </ContentParserProvider>
  );
}
```

---

### Content Service Rendering

Fetch content from any API endpoint and render it directly. Perfect for AEM pages, headless CMS responses, or any REST API that returns content.

```tsx
import { ContentServiceRenderer } from '@laddhaanshul/content-renderer';

// Fetch and render content from an API URL
function Page() {
  return (
    <ContentServiceRenderer
      url="https://api.example.com/pages/home"
      config={{
        extractStrategy: 'auto', // auto-detect extraction strategy
        headers: { Authorization: 'Bearer token123' },
      }}
      loading={<div>Loading page...</div>}
      errorRenderer={(error, retry) => (
        <div>
          <p>Failed to load: {error.message}</p>
          <button onClick={retry}>Retry</button>
        </div>
      )}
    />
  );
}
```

```tsx
import { useContentService } from '@laddhaanshul/content-renderer-core';
import { ContentRenderer } from '@laddhaanshul/content-renderer';

// Use the hook for full control
function CustomPage() {
  const { content, isLoading, isError, error, fetchContent } = useContentService({
    url: '/api/content',
    extractStrategy: 'aem',
    contentType: 'html',
    cacheTime: 300000, // 5 minute cache
    retry: true,
    retryCount: 3,
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error?.message}</div>;
  if (!content) return null;

  return <ContentRenderer content={content} sanitize />;
}
```

```tsx
// AEM-style content fetching
function AEMPage({ pagePath }: { pagePath: string }) {
  return (
    <ContentServiceRenderer
      url={`https://publish-p123-e456.adobeaemcloud.com${pagePath}.model.json`}
      config={{
        extractStrategy: 'aem',
        headers: { 'Content-Type': 'application/json' },
      }}
      sanitize
    />
  );
}
```

```tsx
// Headless CMS (WordPress, Strapi, Contentful, etc.)
function CMSPage({ postId }: { postId: string }) {
  return (
    <ContentServiceRenderer
      url={`/api/posts/${postId}`}
      config={{
        extractStrategy: 'headless-cms',
        contentField: 'content', // field containing HTML/markdown
        headers: { 'X-API-Key': 'your-api-key' },
      }}
    />
  );
}
```

```tsx
// Custom fetcher for authenticated requests
function SecurePage() {
  const customFetcher = async (url: string) => {
    const token = await getAuthToken();
    return fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  return (
    <ContentServiceRenderer
      url="https://api.example.com/secure-page"
      config={{ fetcher: customFetcher }}
    />
  );
}
```

**Extraction Strategies:**

| Strategy | Description | Use Case |
|----------|-------------|----------|
| `auto` | Auto-detect extraction method | General purpose |
| `direct` | Response body is the content string directly | APIs returning raw HTML/Markdown |
| `json-html` | Extract HTML from JSON response field | JSON APIs with HTML content |
| `json-markdown` | Extract Markdown from JSON response | Markdown-based CMS APIs |
| `json-field` | Extract value at a specific JSON path | Custom API response structures |
| `json-property` | Find first string property that looks like content | Unknown JSON structures |
| `aem` | Extract from AEM-specific response format | Adobe Experience Manager |
| `headless-cms` | Search common CMS content fields | WordPress, Strapi, Contentful |
| `custom` | Use `transformResponse` callback | Fully custom extraction |

---

## Available API & Exported Items

### `@laddhaanshul/content-renderer-core`

The foundational package providing parsing logic and utilities.

- **Parsers:** `HTMLParser`, `JSONParser`, `MarkdownParser`, `XMLParser`, `PHPParser`, `CSSParser`.
- **Extraction:** `extractAll`, `extractText`, `extractLinks`, `extractSEO`, `extractOpenGraph`, `extractStructuredData`.
- **Utilities:** `sanitizeHTML`, `minifyHTML`, `formatHTML`, `detectContentType`, `CSEngine`, `Accessibility`.
- **Advanced:** `PluginManager`, `SSR` utilities, `Error Recovery`, `i18n` (42 locales), `PDF Export`.

### `@laddhaanshul/content-renderer`

The UI package with platform-aware components for Web and Mobile.

- **Components:** `ContentRenderer`, `HTMLRenderer`, `MarkdownRenderer`, `JSONRenderer`, `CodeRenderer`, `DiffRenderer`, `VirtualizedCodeRenderer`, `ContentServiceRenderer`, `StreamingContentRenderer`.
- **Hooks:** `useContentParser`, `useExtract`, `useTheme`, `useContentService`.
- **Animations:** `useFadeIn`, `useSlideIn`, `useTypewriter`, `useThemeTransition`, `useScrollAnimation`, `animateNumber`.
- **Platform Utilities:** `highlightInWorker`, `styleStringToRNStyle`, `HTML_TO_RN_MAP`, `queryPath`.

---

## API Reference

### Components

#### ContentRenderer

The universal content renderer that auto-detects content type and delegates to the appropriate sub-renderer.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | — | The content string to render |
| `contentType` | `ContentType \| 'auto'` | `'auto'` | Explicit content type or auto-detection |
| `className` | `string` | — | CSS class for the wrapper element |
| `style` | `CSSProperties` | — | Inline styles for the wrapper element |
| `theme` | `Partial<Theme>` | — | Theme overrides |
| `sanitize` | `boolean` | `true` | Whether to sanitize HTML content |
| `allowedTags` | `string[]` | — | Tags allowed during sanitization |
| `allowedAttributes` | `Record<string, string[]>` | — | Attributes allowed per tag |
| `maxDepth` | `number` | — | Maximum render depth |
| `onError` | `(error: Error) => void` | — | Error callback |
| `onRender` | `() => void` | — | Render completion callback |
| `fallback` | `ReactNode` | — | Fallback component on error |
| `loading` | `ReactNode` | — | Loading state component |
| `renderers` | `Record<string, ComponentType>` | — | Custom renderers per node type |
| `components` | `Record<string, ComponentType>` | — | Custom components per tag name |
| `transform` | `(node: any) => any` | — | Transform function for nodes |
| `linkHandler` | `(href: string, e?: any) => void` | — | Link click handler |
| `imageHandler` | `(src: string, alt?: string) => string` | — | Image URL handler |
| `codeBlockHandler` | `(code: string, lang: string) => ReactNode` | — | Custom code block renderer |
| `tableHandler` | `(table: ExtractedTable) => ReactNode` | — | Custom table renderer |
| `testID` | `string` | — | Test ID for testing |
| `accessible` | `boolean` | — | Enable accessibility |
| `accessibilityLabel` | `string` | — | Accessibility label |

#### HTMLRenderer

Renders HTML content as React elements.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `html` | `string` | — | Raw HTML string to render |
| `components` | `Record<string, ComponentType>` | — | Custom component overrides per tag |
| `onLinkClick` | `(href: string, event: MouseEvent) => void` | — | Click handler for anchor tags |
| `onFormSubmit` | `(event: FormEvent) => void` | — | Submit handler for form elements |
| `sanitize` | `boolean` | `false` | Whether to sanitize the HTML |
| `renderComments` | `boolean` | `false` | Whether to render HTML comments |
| `className` | `string` | — | CSS class for the wrapper |
| `style` | `CSSProperties` | — | Inline styles for the wrapper |
| `wrapperTag` | `keyof JSX.IntrinsicElements` | `'div'` | Wrapper element tag |
| `wrapperStyle` | `string` | — | Inline style string on the wrapper |
| `allowDangerousHTML` | `boolean` | `false` | Allow `dangerouslySetInnerHTML` |
| `transform` | `(node, element) => ReactElement \| null` | — | Transform function for elements |
| `fallback` | `ReactNode` | — | Fallback on parse failure |
| `onRenderComplete` | `() => void` | — | Callback when rendering completes |
| `testId` | `string` | — | Test ID |

#### JSONRenderer

Interactive JSON tree viewer with search, copy, and collapse support.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `json` | `string \| unknown` | — | JSON string or parsed value |
| `theme` | `'light' \| 'dark'` | `'light'` | Color theme |
| `indent` | `number` | `2` | Indent size in spaces |
| `defaultCollapseDepth` | `number` | `Infinity` | Initial collapse depth |
| `sortKeys` | `boolean` | `false` | Sort object keys alphabetically |
| `showTypes` | `boolean` | `true` | Show data type badges |
| `showArrayIndices` | `boolean` | `true` | Show array indices |
| `showCopyButton` | `boolean` | `true` | Show copy to clipboard button |
| `searchable` | `boolean` | `false` | Enable search/filter bar |
| `className` | `string` | — | CSS class for container |
| `style` | `CSSProperties` | — | Inline styles for container |
| `maxDepth` | `number` | `50` | Maximum render depth |
| `rootLabel` | `string` | — | Custom root node label |
| `showRoot` | `boolean` | `true` | Show root node wrapper |
| `onValueClick` | `(path, value) => void` | — | Callback when value clicked |
| `excludeKeys` | `string[]` | — | Keys to exclude |
| `includeKeys` | `string[]` | — | Keys to include |
| `classPrefix` | `string` | `'cr'` | CSS class prefix |

#### CodeRenderer

Syntax-highlighted code block with line numbers and copy support.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `code` | `string` | — | Source code to render |
| `language` | `string` | — | Programming language identifier |
| `showLineNumbers` | `boolean` | — | Show line numbers |
| `highlightLines` | `number[]` | — | Lines to highlight |
| `theme` | `'light' \| 'dark' \| 'monokai' \| 'dracula' \| 'github' \| 'vscode'` | `'light'` | Color theme |
| `wrapLines` | `boolean` | — | Enable line wrapping |
| `startingLineNumber` | `number` | `1` | Starting line number |
| `fontSize` | `number` | — | Font size in pixels |
| `tabSize` | `number` | — | Tab size in spaces |

#### MarkdownRenderer

Renders Markdown with GFM support.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | — | Markdown content |
| `allowedTypes` | `string[]` | — | Allowed node types |
| `disallowedTypes` | `string[]` | — | Disallowed node types |
| `unwrapDisallowed` | `boolean` | — | Unwrap instead of strip |
| `renderers` | `Record<string, ComponentType>` | — | Custom renderers per type |
| `plugins` | `any[]` | — | Remark plugins |
| `sourcePos` | `boolean` | — | Include source position |
| `escapeHtml` | `boolean` | — | Escape HTML in content |
| `skipHtml` | `boolean` | — | Skip HTML blocks |
| `linkTarget` | `string` | — | Default link target |
| `transformLinkUri` | `(uri) => string` | — | Transform link URIs |
| `transformImageUri` | `(uri) => string` | — | Transform image URIs |
| `linkHandler` | `(href) => void` | — | Link click handler |
| `imageHandler` | `(src) => string` | — | Image URL handler |

#### PHPRenderer

Renders PHP source code with syntax highlighting.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | — | PHP source code |
| `highlightPHP` | `boolean` | — | Enable PHP highlighting |
| `showLineNumbers` | `boolean` | — | Show line numbers |
| `fontSize` | `number` | — | Font size in pixels |
| `wrapLines` | `boolean` | — | Enable line wrapping |
| `theme` | `'light' \| 'dark' \| 'monokai'` | `'light'` | Color theme |

#### XMLRenderer

Renders XML content as a collapsible tree.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | — | XML content string |

#### CSSRenderer

Renders CSS with syntax highlighting.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | — | CSS content string |

#### ErrorBoundary

Catches rendering errors and displays a fallback.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fallback` | `ReactNode` | — | Fallback component |
| `onError` | `(error: Error) => void` | — | Error callback |
| `children` | `ReactNode` | — | Children to wrap |

#### ContentServiceRenderer

Drop-in component to fetch content from a URL and render it using ContentRenderer.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `url` | `string` | — | URL to fetch content from |
| `config` | `Partial<ContentServiceConfig>` | — | Content service configuration |
| `loading` | `ReactNode` | — | Loading state component |
| `errorRenderer` | `(error, retry) => ReactNode` | — | Custom error renderer |
| `fallback` | `ReactNode` | — | Fallback when no content |
| `fetchOnMount` | `boolean` | `true` | Fetch content on mount |
| `loadingDelay` | `number` | `200` | Delay before showing loading (ms) |
| `skeleton` | `ReactNode` | — | Skeleton shown during delay |
| `onLoad` | `(result) => void` | — | Success callback |
| `onLoadError` | `(error) => void` | — | Error callback |
| `fetchKey` | `string \| number` | — | Refetch trigger key |
| `fetchDebounce` | `number` | `0` | Refetch debounce (ms) |

#### StreamingContentRenderer

Incremental rendering component for processing chunks of HTML or AST nodes in real-time. Ideal for rendering LLM/AI streaming responses.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `stream` | `ReadableStream<Uint8Array> \| any` | — | Stream yielding HTML chunks |
| `astStream` | `ReadableStream<any> \| any` | — | Stream yielding pre-parsed AST nodes |
| `fallback` | `ReactNode` | — | Fallback component to show before stream starts |
| `onStreamStart` | `() => void` | — | Callback triggered when stream starts |
| `onStreamComplete` | `() => void` | — | Callback triggered when stream completes |
| `onStreamError` | `(error) => void` | — | Callback triggered on stream error |

---

### Hooks

#### useContentParser

Parse any content string into a structured `ParsedContent` object.

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `contentType` | `ContentType` | auto-detect | Force a specific content type |
| `enabled` | `boolean` | `true` | Enable/disable parsing |
| `onError` | `(error: Error) => void` | — | Error callback |
| `onSuccess` | `(parsed: ParsedContent) => void` | — | Success callback |
| `transform` | `(parsed: ParsedContent) => any` | — | Transform parsed result |

**Return Value:**

| Property | Type | Description |
|----------|------|-------------|
| `parsed` | `ParsedContent \| null` | The parsed content |
| `data` | `any` | The parsed data (after transform) |
| `metadata` | `ContentMetadata \| null` | Content metadata |
| `errors` | `ParseError[]` | Parse errors |
| `warnings` | `ParseWarning[]` | Parse warnings |
| `isLoading` | `boolean` | Loading state |
| `isError` | `boolean` | Error state |
| `error` | `Error \| null` | Error object |
| `parse` | `(content: string) => void` | Trigger parsing |
| `reset` | `() => void` | Reset state |
| `refetch` | `() => void` | Re-parse last content |

```tsx
const { parsed, data, isLoading, isError, parse, reset } = useContentParser({
  contentType: 'json',
  onSuccess: (result) => console.log('Parsed:', result),
});
```

#### useExtract

Extract structured data (links, images, headings, etc.) from content.

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable/disable extraction |
| `extractors` | `(keyof ExtractedData)[]` | all | Which extractors to run |
| `options` | `ExtractOptions` | — | Extraction options |
| `onError` | `(error: Error) => void` | — | Error callback |

**Return Value:**

| Property | Type | Description |
|----------|------|-------------|
| `extracted` | `ExtractedData \| null` | Extracted data |
| `isLoading` | `boolean` | Loading state |
| `isError` | `boolean` | Error state |
| `error` | `Error \| null` | Error object |
| `extract` | `(content: string, type?: ContentType) => void` | Trigger extraction |
| `reset` | `() => void` | Reset state |

```tsx
const { extracted, extract } = useExtract({
  extractors: ['links', 'images', 'headings', 'meta'],
});
```

#### useTheme

Manage the content renderer theme.

**Return Value:**

| Property | Type | Description |
|----------|------|-------------|
| `theme` | `Theme` | Current theme |
| `setTheme` | `(partial: Partial<Theme>) => void` | Update theme |
| `resetTheme` | `() => void` | Reset to default |
| `toggleTheme` | `() => void` | Toggle light/dark |
| `mode` | `'light' \| 'dark'` | Current mode |

```tsx
const { theme, toggleTheme, setTheme } = useTheme();
```

#### useContentService

Fetch content from a URL and get loading/error/content state.

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | `string` | — | URL to fetch |
| `fetcher` | `(url, options?) => Promise<Response>` | `fetch` | Custom fetch function |
| `headers` | `Record<string, string>` | — | Request headers |
| `credentials` | `RequestCredentials` | — | Credentials mode |
| `extractStrategy` | `ContentExtractStrategy` | `'auto'` | Content extraction strategy |
| `contentField` | `string \| string[]` | — | JSON field path(s) |
| `contentType` | `ContentType` | auto-detect | Content type override |
| `maxContentLength` | `number` | `5MB` | Max content length |
| `timeout` | `number` | `30000` | Timeout in ms |
| `retry` | `boolean` | `false` | Enable retry |
| `retryCount` | `number` | `3` | Max retries |
| `retryDelay` | `number` | `1000` | Initial retry delay (ms) |
| `cacheTime` | `number` | `0` | Cache time (ms) |
| `dedupe` | `boolean` | `true` | Deduplicate requests |
| `refetchOnWindowFocus` | `boolean` | `false` | Refetch on focus |
| `refetchOnReconnect` | `boolean` | `false` | Refetch on reconnect |
| `refetchInterval` | `number` | `0` | Polling interval (ms) |
| `onError` | `(error) => void` | — | Error callback |
| `onRequest` | `(url) => void` | — | Before request callback |
| `onSuccess` | `(result) => void` | — | Success callback |
| `transformResponse` | `(response) => any` | — | Custom response transformer |

**Return Value:**

| Property | Type | Description |
|----------|------|-------------|
| `result` | `ContentServiceResult \| null` | Full fetch result |
| `content` | `string \| null` | Renderable content string |
| `contentType` | `ContentType \| null` | Detected content type |
| `parsed` | `ParsedContent \| null` | Parsed content |
| `isLoading` | `boolean` | Fetching state |
| `isError` | `boolean` | Error state |
| `error` | `ContentServiceError \| null` | Error object |
| `isFetched` | `boolean` | Whether fetched at least once |
| `fetchContent` | `(url?, options?) => Promise<void>` | Manual fetch |
| `reset` | `() => void` | Reset to initial state |
| `retry` | `() => void` | Retry last fetch |
| `abort` | `() => void` | Abort current fetch |

---

### HOCs

#### withContentParser

Wraps a component with content parsing capabilities.

```tsx
const EnhancedComponent = withContentParser(MyComponent, {
  autoParse: true,
  contentType: 'markdown',
  contentPropName: 'content', // default
});
```

Injected props: `parsedContent`, `parseContent`, `isParsing`, `parseError`

#### withExtract

Wraps a component with content extraction capabilities.

```tsx
const EnhancedComponent = withExtract(MyComponent, {
  autoExtract: true,
  extractors: ['links', 'images', 'headings'],
});
```

Injected props: `extractedData`, `extractData`, `isExtracting`, `extractError`

---

### Providers

#### ContentParserProvider

Provides global configuration to all descendant content renderers.

```tsx
<ContentParserProvider
  config={{
    theme: darkTheme,
    defaultContentType: 'html',
    sanitizeHTML: true,
    maxRenderDepth: 100,
    linkHandler: (href) => window.open(href),
    customParsers: {},
    plugins: [],
  }}
>
  <App />
</ContentParserProvider>
```

---

### Parsers

#### HTMLParser

Full-featured HTML parser with DOM manipulation utilities.

```typescript
import { HTMLParser } from '@laddhaanshul/content-renderer-core';

const parser = new HTMLParser();

// Parse full HTML document
const doc = parser.parse('<html><head><title>Test</title></head><body><h1>Hello</h1></body></html>');

// Parse HTML fragment
const nodes = parser.parseFragment('<div><span>Hello</span></div>');

// Validate HTML
const result = parser.validate(htmlString);
console.log(result.valid, result.errors, result.warnings);

// Serialize back to HTML string
const html = parser.serialize(doc);

// Query selectors
const node = parser.querySelector(root, '#my-id');
const elements = parser.querySelectorAll(root, '.my-class');

// DOM manipulation
parser.appendChild(parent, child);
parser.insertBefore(parent, newNode, reference);
parser.removeNode(node);
parser.setTextContent(node, 'new text');
const text = parser.getTextContent(node);

// Attribute operations
const value = parser.getAttribute(node, 'class');
parser.setAttribute(node, 'class', 'new-class');
parser.cloneNode(node, true); // deep clone
```

#### JSONParser

JSON parser with path querying, diffing, and schema inference.

```typescript
import { JSONParser } from '@laddhaanshul/content-renderer-core';

const parser = new JSONParser();

// Parse JSON
const doc = parser.parse('{"name": "John", "age": 30}');

// Validate JSON
const result = parser.validate(jsonString);

// JSONPath querying
const value = parser.queryPath(root, '$.store.books[0].title');
const allNames = parser.queryPath(root, '$..name');

// Diff two JSON objects
const diff = parser.diff(obj1, obj2);
// diff.added, diff.removed, diff.changed, diff.unchanged

// Flatten nested object
const flat = parser.flatten({ a: { b: { c: 1 } } });
// { 'a.b.c': 1 }

// Unflatten back to nested
const nested = parser.unflatten({ 'a.b.c': 1 });

// Sort keys
const sorted = parser.sortByKeys({ z: 1, a: 2, m: 3 });
// { a: 2, m: 3, z: 1 }

// Extract all paths
const paths = parser.extractPaths(data);

// Infer schema
const schema = parser.inferSchema(data);
```

#### XMLParser

XML parser with XPath-like queries and object conversion.

```typescript
import { XMLParser } from '@laddhaanshul/content-renderer-core';

const parser = new XMLParser({
  preserveWhitespace: false,
  preserveComments: true,
  stripNamespaces: false,
  attributeNamePrefix: '@',
});

// Parse XML
const doc = parser.parse('<?xml version="1.0"?><root><item id="1">Hello</item></root>');

// Validate XML
const result = parser.validate(xmlString);

// Serialize back to XML
const xml = parser.serialize(doc);

// Query by XPath
const nodes = parser.queryXPath(root, '/root/item[@id="1"]');

// Find element by name
const item = parser.getElementByName(root, 'item');

// Convert to plain JavaScript object
const obj = parser.toObject(root);
```

#### PHPParser

PHP source code parser with class and function extraction.

```typescript
import { PHPParser } from '@laddhaanshul/content-renderer-core';

const parser = new PHPParser({
  extractDocBlocks: true,
  includeMethodBodies: false,
  trackLineNumbers: true,
});

// Parse PHP code
const doc = parser.parse('<?php\nclass MyClass {\n  public function hello() {\n    return "Hello";\n  }\n}');

// Validate PHP
const result = parser.validate(phpCode);

// Extract classes, functions, variables
const classes = parser.extractClasses(phpCode);
const functions = parser.extractFunctions(phpCode);
const variables = parser.extractVariables(phpCode);
```

#### MarkdownParser

Markdown parser with GFM support and frontmatter extraction.

```typescript
import { MarkdownParser } from '@laddhaanshul/content-renderer-core';

const parser = new MarkdownParser({
  parseFrontmatter: true,
  gfm: true,
  breaks: false,
});

// Parse Markdown
const doc = parser.parse('# Title\n\nSome **bold** text');

// Access extracted data
doc.headings;   // [{ level: 1, text: 'Title', slug: 'title' }]
doc.links;      // [{ text: 'link text', href: '/url', title: '...' }]
doc.images;     // [{ alt: 'alt', src: '/img.png' }]
doc.codeBlocks; // [{ language: 'js', code: 'const x = 1;' }]
doc.tables;     // [{ headers: [...], rows: [[...]] }]
doc.frontmatter; // { title: 'My Post', date: '2024-01-01' }

// Extract specific elements
const headings = parser.extractHeadings(markdown);
const links = parser.extractLinks(markdown);
const images = parser.extractImages(markdown);
const toc = parser.extractTableOfContents(markdown);
```

#### CSSParser

CSS parser with rule extraction and specificity calculation.

```typescript
import { CSSParser } from '@laddhaanshul/content-renderer-core';

const parser = new CSSParser({
  preserveComments: true,
  preserveWhitespace: false,
});

// Parse CSS
const doc = parser.parse('.container { color: red; }\n@media (max-width: 768px) { .container { font-size: 14px; } }');

// Validate CSS
const result = parser.validate(cssString);

// Serialize back to CSS
const css = parser.serialize(doc);

// Extract specific data
const variables = parser.getVariables(css);           // { '--primary': '#2563eb' }
const mediaQueries = parser.getMediaQueries(css);
const keyframes = parser.getKeyframes(css);
const rules = parser.getRulesBySelector(css, /\.container/);
const decls = parser.getDeclarationsByProperty(css, 'color');

// Minify and format
const minified = parser.minify(css);
const formatted = parser.format(css, 2);
```

---

### Extraction Utilities

All extraction functions work on raw content strings:

```typescript
import {
  extractAll, extractText, extractLinks, extractImages,
  extractScripts, extractStyles, extractMeta, extractHeadings,
  extractTables, extractForms, extractLists, extractCodeBlocks,
  extractComments, extractSEO, extractOpenGraph, extractTwitterCards,
  extractStructuredData, extractClasses, extractIds, extractAttributes,
  extractByTag, extractDataAttributes, extractFavicon, extractCanonical,
} from '@laddhaanshul/content-renderer-core';
```

| Function | Signature | Description |
|----------|-----------|-------------|
| `extractAll` | `(content, contentType, options?) => ExtractedData` | Run all extractors at once |
| `extractText` | `(content, contentType) => string` | Extract plain text |
| `extractLinks` | `(content, contentType?) => ExtractedLink[]` | Extract all links |
| `extractImages` | `(content, contentType?) => ExtractedImage[]` | Extract all images |
| `extractScripts` | `(content, contentType?) => ExtractedScript[]` | Extract script tags |
| `extractStyles` | `(content, contentType?) => ExtractedStyle[]` | Extract style tags |
| `extractMeta` | `(content, contentType?) => ExtractedMeta[]` | Extract meta tags |
| `extractHeadings` | `(content, contentType?) => ExtractedHeading[]` | Extract headings |
| `extractTables` | `(content, contentType?) => ExtractedTable[]` | Extract tables |
| `extractForms` | `(content, contentType?) => ExtractedForm[]` | Extract form elements |
| `extractLists` | `(content, contentType?) => ExtractedList[]` | Extract lists |
| `extractCodeBlocks` | `(content, contentType?) => ExtractedCodeBlock[]` | Extract code blocks |
| `extractComments` | `(content, contentType?) => string[]` | Extract comments |
| `extractSEO` | `(content) => SEOMetadata` | Extract complete SEO metadata |
| `extractOpenGraph` | `(content) => Record<string, string>` | Extract OG tags |
| `extractTwitterCards` | `(content) => Record<string, string>` | Extract Twitter card tags |
| `extractStructuredData` | `(content) => object[]` | Extract JSON-LD structured data |
| `extractClasses` | `(content) => string[]` | Extract all CSS classes |
| `extractIds` | `(content) => string[]` | Extract all element IDs |
| `extractAttributes` | `(content, attributeName) => string[]` | Extract specific attribute values |
| `extractByTag` | `(content, tagName) => string[]` | Extract inner content by tag |
| `extractDataAttributes` | `(content) => Record<string, string>[]` | Extract data-* attributes |
| `extractFavicon` | `(content) => string \| null` | Extract favicon URL |
| `extractCanonical` | `(content) => string \| null` | Extract canonical URL |

---

### Sanitization Utilities

```typescript
import {
  sanitizeHTML, stripTags, stripAttributes, stripScripts,
  stripStyles, escapeHTML, unescapeHTML, encodeEntities, decodeEntities,
} from '@laddhaanshul/content-renderer-core';
import type { SanitizeOptions } from '@laddhaanshul/content-renderer-core';
```

| Function | Signature | Description |
|----------|-----------|-------------|
| `sanitizeHTML` | `(content, options?) => string` | Sanitize HTML with configurable rules |
| `stripTags` | `(content, tags?) => string` | Remove specific HTML tags |
| `stripAttributes` | `(content, attributes?) => string` | Remove specific attributes |
| `stripScripts` | `(content) => string` | Remove script tags and event handlers |
| `stripStyles` | `(content) => string` | Remove style tags and inline styles |
| `escapeHTML` | `(content) => string` | Escape HTML entities |
| `unescapeHTML` | `(content) => string` | Unescape HTML entities |
| `encodeEntities` | `(content) => string` | Encode XML entities |
| `decodeEntities` | `(content) => string` | Decode XML/HTML entities |

**SanitizeOptions:**

```typescript
interface SanitizeOptions {
  allowedTags?: string[];
  disallowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  disallowedAttributes?: string[];
  allowScripts?: boolean;
  allowStyles?: boolean;
  allowComments?: boolean;
  allowDangerousTags?: boolean;
  stripTags?: string[];
}
```

---

### Transform Utilities

```typescript
import {
  minifyHTML, minifyCSS, minifyJSON, minifyXML,
  formatHTML, formatCSS, formatJSON, formatXML, prettify,
  convertToJSON, convertToXML, convertToMarkdown,
  truncate, slugify, camelCase, kebabCase, snakeCase,
  pascalCase, titleCase, capitalize, detectContentType,
} from '@laddhaanshul/content-renderer-core';
```

---

### Validation Utilities

```typescript
import {
  isValidHTML, isValidJSON, isValidXML, isValidCSS,
  isValidURL, isValidEmail, isValidPhoneNumber,
  getContentTypeFromExtension, getContentTypeFromMIME,
  getContentTypeFromHeader,
} from '@laddhaanshul/content-renderer-core';
```

---

### Themes

Two built-in themes are provided:

```typescript
import { lightTheme, darkTheme } from '@laddhaanshul/content-renderer-core';
```

**Theme interface:**

```typescript
interface Theme {
  colors: ThemeColors;
  fonts: ThemeFonts;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  shadows: ThemeShadows;
  codeBlock: CodeBlockTheme;
  typography: TypographyTheme;
}
```

---

## Monorepo Structure

```
content-renderer/
├── package.json                    # Root monorepo config (npm workspaces)
├── tsconfig.json                   # Shared TypeScript config
├── LICENSE                         # MIT License
├── README.md                       # This file
├── docs/
│   ├── agent.md                    # Agent architecture documentation
│   ├── skills.md                   # Skills documentation
│   ├── contributors.md             # Contributor guidelines
│   └── context.md                  # Project context and history
├── packages/
│   ├── core/
│   │   ├── package.json            # @laddhaanshul/content-renderer-core
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts            # Main entry point
│   │       ├── types/
│   │       │   └── index.ts        # All TypeScript types
│   │       ├── parsers/
│   │       │   ├── index.ts
│   │       │   ├── html-parser.ts
│   │       │   ├── json-parser.ts
│   │       │   ├── xml-parser.ts
│   │       │   ├── php-parser.ts
│   │       │   ├── markdown-parser.ts
│   │       │   └── css-parser.ts
│   │       ├── utils/
│   │       │   ├── index.ts
│   │       │   ├── extract.ts      # Content extraction utilities
│   │       │   ├── sanitize.ts     # HTML sanitization utilities
│   │       │   ├── transform.ts    # Format, minify, convert utilities
│   │       │   └── validate.ts     # Validation utilities
│   │       ├── hooks/
│   │       │   ├── index.ts
│   │       │   ├── useContentParser.ts
│   │       │   ├── useExtract.ts
│   │       │   ├── useContentService.ts
│   │       │   └── useTheme.ts
│   │       ├── hoc/
│   │       │   ├── index.ts
│   │       │   ├── withContentParser.ts
│   │       │   └── withExtract.ts
│   │       ├── providers/
│   │       │   ├── index.ts
│   │       │   └── ContentParserProvider.tsx
│   │       └── themes/
│   │           ├── index.ts
│   │           └── default.ts      # lightTheme, darkTheme
│   ├── react/
│   │   ├── package.json            # @laddhaanshul/content-renderer
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── components/
│   │       │   ├── index.ts
│   │       │   ├── ContentRenderer.tsx
│   │       │   ├── HTMLRenderer.tsx
│   │       │   ├── JSONRenderer.tsx
│   │       │   ├── CodeRenderer.tsx
│   │       │   ├── MarkdownRenderer.tsx
│   │       │   ├── PHPRenderer.tsx
│   │       │   ├── XMLRenderer.tsx
│   │       │   ├── CSSRenderer.tsx
│   │       │   ├── ContentServiceRenderer.tsx
│   │       │   ├── ContentServiceRenderer.web.tsx
│   │       │   ├── ContentServiceRenderer.native.tsx
│   │       │   └── ErrorBoundary.tsx
│   │       └── utils/
│   │           ├── index.ts
│   │           ├── style-parser.ts
│   │           └── syntax-highlight.ts
├── apps/
│   ├── web-example/
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       ├── components/
│   │       │   ├── Sidebar.tsx
│   │       │   ├── ExampleLayout.tsx
│   │       │   └── CodeBlock.tsx
│   │       └── pages/
│   │           ├── HTMLExample.tsx
│   │           ├── JSONExample.tsx
│   │           ├── MarkdownExample.tsx
│   │           ├── CodeExample.tsx
│   │           ├── PHPExample.tsx
│   │           ├── XMLExample.tsx
│   │           ├── CSSExample.tsx
│   │           ├── AutoDetectExample.tsx
│   │           ├── HooksExample.tsx
│   │           ├── ExtractionExample.tsx
│   │           ├── HOCExample.tsx
│   │           ├── ContentServiceExample.tsx
│   │           └── ThemeExample.tsx
│   └── native-example/
│       ├── package.json
│       ├── app.json
│       └── app/
│           ├── _layout.tsx
│           └── (tabs)/
│               ├── _layout.tsx
│               ├── index.tsx
│               ├── html.tsx
│               ├── json.tsx
│               ├── markdown.tsx
│               ├── code.tsx
│               └── service.tsx
└── website/
    ├── index.php
    ├── README.md
    └── assets/
        ├── style.css
        └── script.js
```

---

## Development

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 (or yarn / pnpm)
- **TypeScript** >= 5.3.3

### Setup

```bash
# Clone the repository
git clone https://github.com/user/content-renderer.git
cd content-renderer

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test
```

### Building

```bash
# Build all packages
npm run build

# Build specific packages
npm run build:core
npm run build:react

# Build all in order (core first)
npm run build:all
```

### Testing

```bash
# Run all tests
npm test

# Run tests for a specific package
npm run test:core
npm run test:react

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:core -- --watch
```

### Linting

```bash
# Lint all packages
npm run lint

# Type check all packages
npm run typecheck
```

---

## Example Apps

### Web Example (Vite + React)

The web example app demonstrates all features of `@laddhaanshul/content-renderer`:

```bash
cd apps/web-example
npm install
npm run dev
```

Includes interactive examples for:
- HTML rendering with sanitization
- JSON tree viewer with search
- Markdown with GFM
- Code syntax highlighting
- PHP rendering
- XML tree viewer
- CSS syntax highlighting
- Auto-detection
- Hooks usage
- Extraction utilities
- HOC usage
- Theme customization
- Content Service

### Native Example (Expo)

The native example app demonstrates `@laddhaanshul/content-renderer` (React Native):

```bash
cd apps/native-example
npm install
npx expo start
```

Includes tabs for:
- HTML rendering
- JSON viewer
- Markdown rendering
- Code highlighting
- Content Service

---

## Publishing

### CI/CD Pipeline

The monorepo uses npm workspaces with automated publishing:

1. **Build** — All packages are built in dependency order (core → react)
2. **Test** — All tests must pass before publishing
3. **Version** — Use `npm run version:patch|minor|major` to bump versions across all packages
4. **Publish** — Each package is published independently to npm

### Creating Releases

```bash
# Patch release (1.0.0 → 1.0.1)
npm run version:patch

# Minor release (1.0.0 → 1.1.0)
npm run version:minor

# Major release (1.0.0 → 2.0.0)
npm run version:major

# Push tags
git push --follow-tags
```

---

## Contributing

See [docs/contributors.md](docs/contributors.md) for detailed contribution guidelines.

### Quick Guidelines

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes with tests
4. Ensure all tests pass: `npm test`
5. Commit with conventional format: `feat: add new parser`
6. Push and open a Pull Request

### Code Style

- TypeScript strict mode enabled
- ESLint for linting
- Prettier for formatting
- Conventional Commits for commit messages

---

## License

MIT License. See [LICENSE](LICENSE) for details.


---

## Recent Updates

### Table Rowspan Support
The native HTMLRenderer now supports the `rowspan` attribute on `<th>` and `<td>` elements. Cells spanning multiple rows are rendered with appropriate minimum heights.

### Media Placeholders
`<video>`, `<audio>`, `<canvas>`, `<svg>`, and `<iframe>` elements render as styled placeholders on native, with accessibility labels and the element icon.

### CSS Engine Enhancements
- **CSS Variables**: `var(--custom-prop)` values are now passed through (previously dropped).
- **calc() expressions**: `calc(100% - 20px)` values are preserved.
- **CSS Grid**: `grid-template-columns`, `grid-template-rows`, `grid-column`, `grid-row`, and related properties are mapped.
- **Additional properties**: `inset`, `place-items`, `place-content`, etc.

### Concurrent Render Safety
The internal node key counter is now instance-scoped rather than module-level, making it safe for React 18+ concurrent rendering.

### SVGRenderer
A new `SVGRenderer` component is exported for React Native. It attempts to load `react-native-svg` dynamically and falls back to a placeholder if unavailable.

### VirtualizedHTMLRenderer
Already shipped: `VirtualizedHTMLRenderer` efficiently renders large HTML documents using `FlatList` for virtualized rendering.


---

## v3 Updates — Full Gap Fix

### CSS Engine (NEW — zero dependencies)
A complete, lightweight CSS engine that parses `<style>` tags and class-based selectors:
- **Tag, class, id, attribute selectors**: `.btn`, `#header`, `[data-type]`
- **Combinators**: descendant (`A B`) and child (`A > B`)
- **CSS Variables**: `var(--primary-color)` with fallback support
- **calc()**: `calc(100% - 20px)` with px/%/em/rem conversion
- **@media queries**: responsive styles with min/max-width breakpoints
- **Specificity cascading**: proper priority ordering
- **!important support**: highest precedence handling
- **No external dependencies**: ~530 lines, zero bundle size increase from libs

### SVG Renderer (NEW — native)
Converts raw SVG markup to `react-native-svg` components:
- Supports 16+ SVG elements (rect, circle, path, text, gradients, etc.)
- 30 attribute mappings (kebab-case → camelCase)
- Optional peer dependency — graceful fallback to placeholder
- Percentage-based value resolution

### Enhanced Markdown (NEW — GFM)
Full CommonMark/GFM extensions:
- Reference-style links `[text][ref]`
- Footnotes `[^1]` with back-references
- Strikethrough `~~text~~`
- Task lists `- [x] done`
- Definition lists
- GFM tables with alignment
- Autolinks `<http://...>`
- Math passthrough `$$ ... $$`
- Emoji shortcodes `:smile:` (30 basic)

### CSS_PROP_MAP Expanded
25+ new properties: grid layout, float, white-space, overflow, transform, backface-visibility, opacity, pointer-events, and more.

### calc()/var()/clamp()/min()/max() Passthrough
CSS functions are now preserved instead of being dropped.

### Media Placeholders (native)
`<video>`, `<audio>`, `<canvas>`, `<svg>`, `<iframe>` render as styled, accessible placeholders on native.

### Concurrent Render Safety
Internal node key counter is instance-scoped for React 18+ concurrent mode.

### Table Rowspan
Native renderer supports `rowspan` attribute with column tracking.

### Bundle Size
**Still the smallest** — zero new runtime dependencies added. All features are hand-written TypeScript.
