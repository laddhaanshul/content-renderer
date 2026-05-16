# Content Renderer Monorepo — Project Context

## Overview

**Content Renderer** is a universal content rendering library for React and React Native. It provides components and utilities to parse and render HTML, Markdown, JSON, XML, CSS, PHP, and source code as interactive UI components. The library is organized as an npm workspaces monorepo with three core packages and two example applications.

| Field | Value |
|---|---|
| **Repository** | `content-renderer-monorepo` |
| **Version** | 1.0.0 |
| **License** | MIT |
| **Node** | >= 18.0.0 |
| **Package Manager** | npm workspaces (yarn.lock also present) |
| **Language** | TypeScript 5.3.3 |

---

## Directory Structure

```
content-renderer/
├── package.json                    # Root monorepo config
├── tsconfig.json                   # Root TypeScript project references
├── yarn.lock / package-lock.json
├── final-updated-fix.sh            # Build fix script
├── context.md                      # THIS FILE
├── worklog.md                      # Development worklog
├── LICENSE
├── README.md
│
├── packages/
│   ├── core/                       # @content-renderer/core
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── types/              # Type definitions
│   │   │   ├── parsers/            # HTML, JSON, XML, Markdown, CSS, PHP
│   │   │   ├── utils/              # extract, sanitize, transform, validate,
│   │   │   │                       #   css-engine, css-selector, ssr,
│   │   │   │                       #   error-recovery, pdf-export
│   │   │   ├── hooks/              # useContentParser, useExtract, useTheme,
│   │   │   │                       #   useContentService
│   │   │   ├── hoc/                # withContentParser, withExtract
│   │   │   ├── plugins/            # PluginManager, 8 built-in plugins
│   │   │   ├── providers/          # ContentParserProvider
│   │   │   ├── themes/             # lightTheme, darkTheme
│   │   │   ├── accessibility/      # ARIA, contrast, screen reader
│   │   │   ├── i18n/               # 42 locales, 13 RTL, I18nContext
│   │   │   ├── __benchmarks__/     # Performance benchmarks
│   │   │   └── __tests__/          # Unit tests
│   │   ├── tsconfig.json / .cjs.json / .esm.json
│   │   └── package.json
│   │
│   ├── react/                      # @content-renderer/react-and-native
│   │   ├── src/
│   │   │   ├── index.ts            # Main entry (re-exports everything from core)
│   │   │   ├── index.native.ts     # Native entry point
│   │   │   ├── components/
│   │   │   │   ├── *.tsx           # Base component implementations
│   │   │   │   ├── *.web.tsx       # Web-specific overrides (11 files)
│   │   │   │   ├── *.native.tsx    # Native-specific overrides (11 files)
│   │   │   │   ├── web/            # Web-only components (11 files)
│   │   │   │   ├── native/         # Native-only components (11 files)
│   │   │   │   ├── index.ts        # Default barrel export
│   │   │   │   ├── index.web.ts    # Web barrel export
│   │   │   │   ├── index.native.ts # Native barrel export
│   │   │   │   └── __tests__/      # Component tests (6 files)
│   │   │   ├── utils/
│   │   │   │   ├── syntax-highlight.ts / .web.ts / index.native.ts
│   │   │   │   ├── style-parser.ts
│   │   │   │   ├── animations.ts   # 9 animation hooks (own code)
│   │   │   │   ├── html-to-rn.ts / .web.ts
│   │   │   │   ├── svg-renderer.ts / .native.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── index.web.ts
│   │   │   │   └── index.native.ts
│   │   │   └── themes/
│   │   │       ├── index.ts
│   │   │       ├── native/         # Native theme definitions
│   │   │       └── web/            # Web theme definitions
│   │   ├── tsconfig.json / .cjs.json / .esm.json / .native.json / .web.json
│   │   └── package.json
│   │
│   └── react-native/               # @content-renderer/react-and-native (REDUNDANT)
│       ├── src/
│       │   ├── index.ts
│       │   ├── turbo-modules.ts    # Only unique file in this package
│       │   ├── components/         # 9 components (duplicated from react/)
│       │   ├── utils/              # 2 utils (duplicated from react/)
│       │   └── themes/             # 1 theme (duplicated from react/)
│       ├── tsconfig.json
│       └── package.json
│
├── apps/
│   ├── web-example/                # Vite + React SPA (21 example pages)
│   │   ├── src/
│   │   │   ├── main.tsx, App.tsx
│   │   │   ├── components/ (CodeBlock, ExampleLayout, Sidebar)
│   │   │   └── pages/ (HTML, Markdown, Code, JSON, XML, CSS, PHP,
│   │   │             Plugins, PDF, I18N, Animation, SSR, HOC, Theme,
│   │   │             Accessibility, ContentService, ErrorRecovery,
│   │   │             Extraction, Virtualized, Hooks, AutoDetect)
│   │   ├── index.html, vite.config.ts
│   │   └── package.json
│   │
│   └── native-example/             # Expo Router app
│       ├── app/
│       │   ├── _layout.tsx
│       │   ├── php.tsx, css.tsx, xml.tsx, extraction.tsx
│       │   └── (tabs)/ (index, html, markdown, code, json, i18n,
│       │               plugins, service, accessibility, more)
│       ├── assets/
│       ├── babel.config.js, metro.config.js, app.json
│       └── package.json
│
└── website/                        # PHP website (index.php + assets)
```

---

## Package Architecture

### Dependency Graph

```
@content-renderer/core (standalone, zero React dependency)
        │
        ▼
@content-renderer/react-and-native (depends on core + React + React DOM + React Native)
        │               ├── react-dom (optional peer dep)
        │               └── react-native (optional peer dep)
        ▼
@content-renderer/react-and-native (depends on core + React Native)  ← REDUNDANT
```

### `@content-renderer/core`

The foundational package. Contains all parsers, utilities, hooks, providers, plugins, themes, accessibility, SSR, error recovery, i18n, and PDF export. Has zero React dependencies — purely TypeScript logic.

**Sub-path exports:**
| Export Path | Contents |
|---|---|
| `@content-renderer/core` | Main entry — all parsers, utils, hooks, types, plugins, themes |
| `@content-renderer/core/parsers` | HTMLParser, JSONParser, XMLParser, PHPParser, MarkdownParser, CSSParser |
| `@content-renderer/core/utils` | Extract, sanitize, transform, validate, CSS engine, SSR, error recovery, PDF |
| `@content-renderer/core/hooks` | useContentParser, useExtract, useTheme, useContentService |
| `@content-renderer/core/plugins` | PluginManager, PluginPriority, 8 built-in plugins |
| `@content-renderer/core/themes` | lightTheme, darkTheme |
| `@content-renderer/core/types` | All TypeScript type definitions |

**Build output:** Dual CJS + ESM via separate tsconfig files (`tsconfig.cjs.json`, `tsconfig.esm.json`)

### `@content-renderer/react-and-native`

The UI package. Provides React components with platform-aware file resolution. When Metro bundler (React Native) processes imports, it automatically selects `.native.tsx` variants. When Vite/Webpack processes imports, it selects `.web.tsx` or `.tsx` base variants.

**Platform file resolution:**
```
ContentRenderer.tsx           ← Base implementation (shared logic)
ContentRenderer.web.tsx       ← Web override (uses ReactDOM, dangerouslySetInnerHTML)
ContentRenderer.native.tsx    ← Native override (uses View, Text, ScrollView from RN)
components/native/            ← Native-only component implementations
components/web/               ← Web-only component implementations
```

**Entry points:**
| Entry | File | Used By |
|---|---|---|
| Main | `src/index.ts` | Web apps (Vite/Webpack) |
| Native | `src/index.native.ts` | React Native apps (Metro bundler) |

**Re-exports from core:** The `index.ts` re-exports 100% of core's public API — all parsers, utils, hooks, HOCs, providers, plugins, themes, accessibility, SSR, error recovery, i18n, and PDF export. Consumers only need `@content-renderer/react-and-native` to access everything.

**Build output:** Dual CJS + ESM. Native builds are handled by Metro bundler at runtime, not by `tsc`.

### `@content-renderer/react-and-native` (REDUNDANT — Should Be Removed)

This package was created as a standalone React Native package, but it is **completely redundant** because `@content-renderer/react-and-native` already has full native support:

| Feature | In `react/` | In `react-native/` | Status |
|---|---|---|---|
| Native components (8-11) | `.native.tsx` + `native/` dir | `src/components/` | **Duplicate** |
| `html-to-rn` utility | `utils/html-to-rn.ts` | `src/utils/html-to-rn.ts` | **Duplicate** |
| `syntax-highlight-rn` utility | `utils/syntax-highlight.ts` (native variant) | `src/utils/syntax-highlight-rn.ts` | **Duplicate** |
| Native theme | `themes/native/` | `src/themes/native.ts` | **Duplicate** |
| TurboModules | Not present | `src/turbo-modules.ts` | **Unique** |
| Core feature re-exports | All core features re-exported | None re-exported | **Missing** |
| Animation hooks | 9 hooks (own code) | None | **Missing** |
| Platform-aware resolution | `.native.tsx` auto-selected by Metro | No platform resolution | **Inferior** |

**唯一独特内容:** `turbo-modules.ts` — React Native New Architecture support (TurboModules, Fabric renderers, Codegen specs, bridge compatibility layer). This file should be moved into `packages/react-and-native/src/` before deleting this package.

**Build problems:** This package causes 85 TS6305 build errors because its `tsc` compilation step follows Yarn workspace symlinks into `core/` and `react/` source directories and tries to rebuild their `.d.ts` files.

---

## Feature Matrix

### Core Package Features

| Category | Features | Source Files |
|---|---|---|
| **Parsers** | HTML, JSON, XML, Markdown, CSS, PHP | `parsers/*.ts` (6 files) |
| **Extraction** | 22 extract functions (text, links, images, scripts, styles, meta, headings, tables, forms, lists, code blocks, comments, SEO, OpenGraph, TwitterCards, structured data, favicon, canonical, classes, IDs, attributes, data attributes) | `utils/extract.ts` |
| **Sanitization** | sanitizeHTML, stripTags, stripAttributes, stripScripts, stripStyles, escapeHTML, unescapeHTML, encodeEntities, decodeEntities | `utils/sanitize.ts` |
| **Formatting** | minify (HTML/CSS/JSON/XML), format (HTML/CSS/JSON/XML), prettify, convert (toJSON/toXML/toMarkdown), truncate, slugify, case converters | `utils/transform.ts` |
| **CSS Engine** | CSEngine class, matchSelector, calculateSpecificity | `utils/css-engine.ts`, `utils/css-selector.ts` |
| **Validation** | isValidHTML/JSON/XML/CSS/URL/Email/Phone, detectContentType, getContentTypeFromExtension/MIME/Header | `utils/validate.ts` |
| **Hooks** | useContentParser, useExtract, useTheme, useContentService | `hooks/*.ts` (4 files) |
| **HOCs** | withContentParser, withExtract | `hoc/*.ts` (2 files) |
| **Providers** | ContentParserProvider, useContentRendererConfig | `providers/ContentParserProvider.tsx` |
| **Plugins** | PluginManager (6 lifecycle hooks, priority, validation, events), 8 built-in: lineNumbers, sanitize, toc, metaEnricher, linkRewrite, imageProxy, emoji, headingAnchor | `plugins/*.ts` (3 files) |
| **Accessibility** | ARIA_ROLES (40+), ARIA_LANDMARK_ROLES, getAriaRole, getAriaAttributes, generateAriaLabel/Live, createAccessibleTree, validateAccessibility, getHeadingLevels, checkColorContrast, generateScreenReaderText | `accessibility/index.ts` |
| **SSR** | renderToString, renderToStaticMarkup, extractMetadataForSSR, generateHeadTags, generateStructuredData (JSON-LD), createSSRContent, isServer/isClient | `utils/ssr.ts` |
| **Error Recovery** | recoverFromHTML/JSON/Markdown/CSS/XML Error, sanitizeErrorOutput, createFallbackContent, suggestFixes | `utils/error-recovery.ts` |
| **i18n** | 42 locales, 13 RTL locales, 16 UI strings in 13 languages, isRTL, getDirection, getLocaleDirection, formatNumber, formatDate, getLocalizedText, setLocaleMessages, loadLocale, createI18nContext | `i18n/index.ts` |
| **PDF Export** | contentToPrintableHTML, generatePDFStyles, createPDFBlob, downloadPDF, previewPDF, getContentForPDF | `utils/pdf-export.ts` |
| **Themes** | lightTheme, darkTheme | `themes/*.ts` (2 files) |
| **Benchmarks** | hrtime-based timing, sample data generator | `__benchmarks__/*.ts` (2 files) |

### React Package Additional Features

| Category | Features | Source Files |
|---|---|---|
| **Components** | ContentRenderer, HTMLRenderer, CodeRenderer, JSONRenderer, PHPRenderer, MarkdownRenderer, XMLRenderer, CSSRenderer, ErrorBoundary, ContentServiceRenderer, VirtualizedHTMLRenderer | 11 base + 11 web + 11 native + 11 web-only + 11 native-only = 55+ files |
| **Animation Hooks** | useFadeIn, useSlideIn, useCollapseAnimation, useThemeTransition, useScrollAnimation, useTypewriter, animateNumber, createStaggerAnimation, getTransitionCSS | `utils/animations.ts` |
| **Syntax Highlighting** | Web: highlight.js-based / Native: custom tokenizer with light/dark themes | `utils/syntax-highlight.ts` + variants |
| **Style Parsing** | styleStringToObject, attrToReactProp, parseAttributes | `utils/style-parser.ts` |
| **HTML-to-RN** | HTML_TO_RN_MAP, styleStringToRNStyle, classToRNStyle, flattenInlineNodes | `utils/html-to-rn.ts` + variants |
| **SVG Rendering** | Web: inline SVG / Native: react-native-svg wrapper | `utils/svg-renderer.ts` + variants |

## Available API & Exported Items

### `@content-renderer/core`

The core package provides the logic for parsing, extraction, and utilities.

#### Parsers
- `HTMLParser`: Parses HTML/HTML5 strings into a node tree.
- `JSONParser`: Parses JSON and provides metadata about structure.
- `XMLParser`: Parses XML with namespace and XPath support.
- `PHPParser`: Parses PHP code for syntax and structure analysis.
- `MarkdownParser`: Parses GFM-compliant Markdown.
- `CSSParser`: Parses CSS rules and declarations.

#### Extraction Utilities
- `extractAll(content, type)`: Run all applicable extractors.
- `extractText`, `extractLinks`, `extractImages`, `extractScripts`, `extractStyles`: Basic content extraction.
- `extractMeta`, `extractSEO`, `extractOpenGraph`, `extractTwitterCards`: SEO and social metadata.
- `extractStructuredData`: Extracts JSON-LD from HTML.
- `extractHeadings`, `extractTables`, `extractForms`, `extractLists`, `extractCodeBlocks`: Structural elements.
- `extractClasses`, `extractIds`, `extractAttributes`, `extractDataAttributes`: Selective attribute extraction.

#### Sanitization & Transformation
- `sanitizeHTML(html, options)`: XSS protection with configurable allow-lists.
- `stripTags`, `stripAttributes`, `stripScripts`, `stripStyles`: Content cleaning.
- `minifyHTML`, `minifyCSS`, `minifyJSON`, `minifyXML`: Minification.
- `formatHTML`, `formatCSS`, `formatJSON`, `formatXML`: Prettification.
- `detectContentType(content)`: Auto-detection logic.

#### Hooks & HOCs
- `useContentParser(options)`: Programmatic parsing hook.
- `useExtract(options)`: Programmatic extraction hook.
- `useTheme()`: Theme management hook.
- `useContentService(config)`: Content fetching and rendering management.
- `withContentParser(Component, options)`: Higher-order component for parsing.
- `withExtract(Component, options)`: Higher-order component for extraction.

#### Advanced Features
- `PluginManager`: Lifecycle-based plugin system.
- `CSEngine`: CSS selector matching and specificity calculation.
- `Accessibility`: ARIA generation, contrast checking, and screen reader text.
- `SSR`: `renderToString`, `generateHeadTags`, `createSSRContent`.
- `Error Recovery`: `recoverFromHTMLError`, `suggestFixes`, etc.
- `i18n`: 42 locales, RTL support, localization utilities.
- `PDF Export`: `contentToPrintableHTML`, `downloadPDF`, `previewPDF`.

### `@content-renderer/react-and-native`

The UI package re-exports everything from `@content-renderer/core` and adds platform-aware components.

#### Components (Universal)
- `ContentRenderer`: The main auto-detecting entry point.
- `HTMLRenderer`: Renders HTML with component overrides.
- `MarkdownRenderer`: Renders Markdown with custom component support.
- `JSONRenderer`: Interactive JSON tree viewer.
- `CodeRenderer`: Syntax-highlighted code blocks.
- `PHPRenderer`: Dedicated PHP code renderer.
- `XMLRenderer`: Collapsible XML tree viewer.
- `CSSRenderer`: Syntax-highlighted CSS viewer.
- `DiffRenderer`: Side-by-side or unified diff viewer.
- `VirtualizedCodeRenderer`: Performance-optimized code renderer for large files.
- `ContentServiceRenderer`: Fetches and renders content from a URL.
- `ErrorBoundary`: Catches and handles rendering errors.

#### Animation Hooks
- `useFadeIn`, `useSlideIn`, `useCollapseAnimation`: Basic transitions.
- `useTypewriter`: Typing effect for text content.
- `useThemeTransition`: Smooth theme switching.
- `useScrollAnimation`: Trigger animations on scroll.

#### Platform Utilities
- `styleStringToObject` (Web): Converts CSS string to React style object.
- `styleStringToRNStyle` (Native): Converts CSS string to React Native styles.
- `HTML_TO_RN_MAP` (Native): Mapping of HTML tags to Native components.
- `highlightInWorker`: Syntax highlighting in a background thread.

---

## Build System

### Build Pipeline

```
1. packages/core (CJS)     →  tsc -p tsconfig.cjs.json
2. packages/core (ESM)     →  tsc -p tsconfig.esm.json
3. packages/react (CJS)    →  tsc -p tsconfig.cjs.json
4. packages/react (ESM)    →  tsc -p tsconfig.esm.json
5. packages/react-native   →  tsc  ← FAILS with TS6305 errors
6. apps/web-example         →  tsc && vite build  ← Skipped if react-native fails
7. apps/native-example      →  echo (no build step, Metro handles it)
```

### TypeScript Configuration

| Config | Key Settings |
|---|---|
| Root `tsconfig.json` | Project references to `packages/core` and `packages/react` |
| `packages/core/tsconfig.json` | `composite: true`, `strict: true`, no DOM lib (pure TS) |
| `packages/react-and-native/tsconfig.json` | `composite: true`, `strict: false`, DOM + DOM.Iterable lib, references `../core` |
| `packages/react-native/tsconfig.json` | `strict: true`, no composite, `preserveSymlinks: true`, no references |
| `apps/web-example/tsconfig.json` | Vite-specific, strict |
| `apps/native-example/tsconfig.json` | Expo-specific |

### Known Build Issues

1. **TS6305 (85 errors)** — `packages/react-native` tsc follows workspace symlinks into core/react source directories. Partially fixed with `preserveSymlinks: true` but root cause is the redundant package itself.
2. **TS1125 (previously)** — Hex digit character errors in `i18n/index.ts`. Fixed in earlier session.
3. **macOS compatibility** — BSD sed vs GNU sed, no `rg` available. Scripts use `python3` for text manipulation.

---

## Example Applications

### Web Example (`apps/web-example/`)

- **Framework:** Vite + React 18
- **Pages:** 21 example pages covering every feature
- **Components:** CodeBlock, ExampleLayout, Sidebar
- **Build:** `tsc && vite build`

### Native Example (`apps/native-example/`)

- **Framework:** Expo Router (~50.0.0) + React Native 0.73.6
- **Screens:** 12+ tab screens
- **Build:** No build step — Metro bundler compiles at runtime via `expo start`

---

## Key Architectural Decisions

### 1. Platform-Aware File Resolution in `react/`

Instead of separate packages for web and native, the `react` package uses React Native's Metro bundler platform file resolution:

```
ContentRenderer.tsx           ← Shared logic
ContentRenderer.web.tsx       ← Automatically picked by Webpack/Vite (or Metro web)
ContentRenderer.native.tsx    ← Automatically picked by Metro bundler
```

This is the standard pattern used by React Navigation, React Native Paper, and other cross-platform libraries.

### 2. Core Has No React Dependency

`@content-renderer/core` is pure TypeScript with zero React imports. This means it can be used in Node.js servers, CLI tools, or any JavaScript environment without pulling in React.

### 3. Dual CJS + ESM Output

Both `core` and `react` build to both CommonJS (`dist/cjs/`) and ES Modules (`dist/esm/`) to maximize compatibility with different bundlers and Node.js versions.

### 4. Plugin System with Lifecycle Hooks

The PluginManager supports 6 lifecycle hooks: `beforeParse`, `afterParse`, `beforeRender`, `afterRender`, `onError`, `onComplete`. Plugins have priority ordering and built-in validation.

### 5. Redundant `react-native` Package

The `packages/react-native/` package was created separately but is fully redundant. All its components, utilities, and themes already exist in `packages/react-and-native/` with proper platform-aware resolution. The only unique code is `turbo-modules.ts` (React Native New Architecture support). This package should be removed and its unique code merged into `react/`.

---

## Dependency Summary

### Runtime Dependencies

| Package | Dependencies |
|---|---|
| `@content-renderer/core` | `css-tree@^2.3.1`, `entities@^4.5.0`, `htmlparser2@^9.0.0` |
| `@content-renderer/react-and-native` | `@content-renderer/core@1.0.0`, `entities@^4.5.0`, `htmlparser2@^9.0.0` |
| `@content-renderer/react-and-native` | `@content-renderer/core@1.0.0`, `htmlparser2@^9.0.0`, `entities@^4.5.0` |

### Peer Dependencies

| Package | Peer Dependencies |
|---|---|
| `@content-renderer/react-and-native` | `react@>=17.0.0` (required), `react-dom@>=17.0.0` (optional), `react-native@>=0.68.0` (optional) |
| `@content-renderer/react-and-native` | `react@>=17.0.0` (required), `react-native@>=0.68.0` (required) |

---

## Content Types Supported

| Content Type | Parser | Renderer | Description |
|---|---|---|---|
| HTML | HTMLParser | HTMLRenderer | Parses HTML into element tree, renders with dangerousSetInnerHTML (web) or native views |
| Markdown | MarkdownParser | MarkdownRenderer | Supports headings, links, images, code blocks, tables, lists, blockquotes |
| JSON | JSONParser | JSONRenderer | Interactive tree view with search, collapse, copy |
| XML | XMLParser | XMLRenderer | Renders XML with syntax highlighting and collapsible nodes |
| CSS | CSSParser | CSSRenderer | Syntax-highlighted CSS with line numbers |
| PHP | PHPParser | PHPRenderer | PHP code with syntax highlighting via CodeRenderer |
| Code | detectContentType | CodeRenderer | 15+ languages: JS, TS, Python, Java, Go, Rust, SQL, YAML, etc. |
| Plain Text | — | Text/ScrollView | Falls back to plain text display |

---

## Development History

### Session 1 — Initial Implementation
- Created monorepo structure with 3 packages + 2 apps
- Implemented all core parsers (HTML, JSON, XML, Markdown, CSS, PHP)
- Created base React components with web and native variants
- Set up dual CJS + ESM build system
- Created web example (Vite) and native example (Expo)

### Session 2 — Gap Analysis & Implementation
- Identified 11 gaps in the initial implementation
- Created 14 new source files:
  - Plugin system (PluginManager + 8 built-in plugins)
  - Accessibility module (ARIA, WCAG 2.0 contrast, screen reader)
  - SSR utilities (renderToString, head tags, JSON-LD)
  - Error recovery (5 content-type-specific recovery functions)
  - i18n support (42 locales, 13 RTL, 16 UI strings)
  - PDF export (printable HTML, download, preview)
  - Animation hooks (9 hooks: fadeIn, slideIn, collapse, typewriter, etc.)
  - TurboModules (React Native New Architecture support)
  - CSS engine and selector matching
- Added 7 sub-path exports to core package
- Created 7 web example pages + 3 native example tabs
- Updated 8 documentation files

### Session 3 — Build Fixes
- Fixed TS1125 hex digit errors in i18n/index.ts
- Fixed macOS compatibility issues (BSD sed, no ripgrep)
- Created automated fix scripts
- Discovered 85 TS6305 errors from redundant `packages/react-native/`
- Added `preserveSymlinks: true` to react-native tsconfig
- Identified root cause: redundant `react-native` package

### Current Status
- `packages/core` — Builds successfully (CJS + ESM)
- `packages/react` — Builds successfully (CJS + ESM)
- `packages/react-native` — Fails with TS6305 (should be removed)
- `apps/web-example` — Builds successfully
- `apps/native-example` — No build step (Metro handles it)

---

## Recommended Next Steps

1. **Remove `packages/react-native/`** — It is fully redundant
2. **Move `turbo-modules.ts`** to `packages/react-and-native/src/turbo-modules.ts` and export from `index.ts` / `index.native.ts`
3. **Update root `package.json`** — Remove any react-native workspace references from scripts
4. **Update root `tsconfig.json`** — Remove any react-native project references
5. **Update `apps/native-example/package.json`** — Change `@content-renderer/react-and-native` dep to `@content-renderer/react-and-native`
6. **Run full build** — Verify zero errors after removal
7. **Clean up backup files** — Remove `*.backup`, `*.backup2` files from `packages/core/src/types/`
8. **Clean up scripts** — Remove `final-updated-fix.sh` after successful build
