# Content Renderer - Project Context

## Project Overview

Content Renderer is a universal content rendering library for React and React Native.
It provides parsers for HTML, JSON, XML, Markdown, CSS, and PHP content, along with
React components for rendering, theming, accessibility, i18n, and more.

## Package Structure

```
content-renderer/
  packages/
    core/           # Core parsing, utilities, plugin system, SSR, error recovery
    react-and-native/ # Unified React & React Native components
  apps/
    web-example/    # Vite + React example app
    native-example/  # Expo + React Native example app
  docs/             # Documentation
```

## Feature Matrix

| Feature | Status |
|---------|--------|
| HTML Parser | Complete |
| JSON Parser | Complete |
| XML Parser | Complete |
| Markdown Parser | Complete |
| CSS Parser | Complete |
| PHP Parser | Complete |
| Data Extraction | Complete |
| Sanitization | Complete |
| Theme Support | Complete |
| Plugin System | Complete |
| Accessibility | Complete |
| SSR / Next.js | Complete |
| Error Recovery | Complete |
| i18n / RTL | Complete |
| PDF Export | Complete |
| Animations | Complete |
| Benchmarks | Complete |
| React Native TurboModules | Complete |

## Plugin Architecture

The plugin system supports:
- **Prioritized hook execution** (CRITICAL > HIGH > NORMAL > LOW > LAST)
- **6 lifecycle hooks**: beforeParse, afterParse, beforeRender, afterRender, transformNode, extractData
- **Inter-plugin communication** via shared data bags
- **Async init/destroy lifecycle**
- **Event system** for monitoring plugin activity
- **Timeout protection** per hook

### Built-in Plugins

1. **sanitize** (CRITICAL) - Removes dangerous HTML tags and attributes
2. **heading-anchor** (HIGH) - Adds IDs to headings for navigation
3. **line-numbers** (NORMAL) - Adds line numbers to code blocks
4. **toc** (NORMAL) - Generates table of contents from headings
5. **meta-enricher** (LOW) - Adds word count, reading time, fingerprint
6. **link-rewrite** (NORMAL) - Rewrites URLs with base URL
7. **image-proxy** (NORMAL) - Proxies images through a service
8. **emoji** (LOW) - Converts :shortcode: to Unicode emoji

## Platform Support Matrix

| Platform | Web | React Native |
|----------|-----|-------------|
| HTML Renderer | Yes | Yes (htmlparser2) |
| Markdown Renderer | Yes | Yes |
| JSON Viewer | Yes | Yes |
| XML Viewer | Yes | Yes |
| CSS Renderer | Yes | Yes |
| PHP Renderer | Yes | Yes |
| Code Highlighting | Yes | Limited |
| Themes | Yes | Yes |
| SSR | Yes | N/A |
| PDF Export | Yes | N/A |
| TurboModules | N/A | Yes |

## Build System

- TypeScript 5 with strict mode
- Vite for web bundling
- Expo for React Native
- Jest for testing
- ESLint for linting

## Testing Strategy

- Unit tests for all parsers
- Integration tests for React components
- Native tests for React Native components
- Benchmark suite for performance regression

## Sub-Path Exports

```typescript
// Core
import { HTMLParser, PluginManager } from '@laddhaanshul/content-renderer-core';
import { PluginManager, PluginPriority } from '@laddhaanshul/content-renderer-core';

// React & Native
import { HTMLRenderer, ContentRenderer } from '@laddhaanshul/content-renderer';
import { useFadeIn, useSlideIn } from '@laddhaanshul/content-renderer';
```

## Version History

- **1.0.0** - Initial release with full parser suite, React components, plugin system
