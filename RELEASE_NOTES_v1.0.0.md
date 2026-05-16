# 🎉 Content Renderer v1.0.0

We are incredibly excited to announce the `1.0.0` release of **Content Renderer**! 

After extensive development, we have built the ultimate, platform-agnostic content rendering engine designed specifically for modern **React** and **React Native** applications.

Whether you're building a web dashboard or a cross-platform mobile app, Content Renderer eliminates the need for fragmented libraries by providing a single, unified solution to parse and render almost any text format.

## 🌟 Key Features

*   **Universal Auto-Detection:** Pass a string of HTML, a JSON object, Markdown text, XML, or even PHP/CSS. The engine instantly detects the format and applies the correct parsing pipeline automatically.
*   **Write Once, Render Anywhere:** Fully compatible with React DOM (Web, Next.js) and React Native (iOS, Android). The UI components auto-select the correct platform implementation at bundle time.
*   **Zero Core Dependencies:** The `@laddhaanshul/content-renderer-core` engine is written from scratch in pure TypeScript. It has **0 dependencies**, making it incredibly lightweight (12kb gzipped).
*   **Built-in Security:** Includes robust XSS sanitization out of the box. Render user-generated HTML/Markdown with complete peace of mind.
*   **Six Parsers in One:**
    *   **HTML5 DOM:** Full tree rendering with custom element mapping and style parsing.
    *   **Markdown (GFM):** Supports GitHub-Flavored Markdown, tables, task lists, and code blocks.
    *   **JSON Tree:** Interactive, collapsible object viewer with syntax highlights.
    *   **Source Code:** Syntax highlighting for 15+ languages.
    *   **XML:** Namespace-aware parsing and hierarchical tree rendering.
    *   **PHP & CSS:** Dedicated parsers for code snippets and stylesheet trees.

## 📦 Modular Packages

We’ve split the architecture into two lightweight packages so you only bundle what you need:

### 1. `@laddhaanshul/content-renderer-core`
The pure parsing, transformation, extraction, and sanitization engine. Completely decoupled from the DOM.
```bash
npm install @laddhaanshul/content-renderer-core
```

### 2. `@laddhaanshul/content-renderer`
The universal UI layer containing all the React and React Native components (`<ContentRenderer />`, `<HTMLRenderer />`, etc.).
```bash
npm install @laddhaanshul/content-renderer
```

## 🌍 Getting Started

Check out our completely redesigned official documentation and promotional website to see live examples, API references, and quick-start guides:

**[https://content-renderer.anshulladdha.in/](https://content-renderer.anshulladdha.in/)**

## 🤝 Open Source
Content Renderer is fully open-source and MIT licensed. We welcome contributions, bug reports, and feature requests on our GitHub repository:

**[https://github.com/laddhaanshul/content-renderer](https://github.com/laddhaanshul/content-renderer)**

---

*Thank you to everyone who contributed to this initial release. Happy rendering!* 🚀
