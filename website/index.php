<?php
/**
 * content-renderer — Promotional Website
 * ========================================
 * A single-page promotional website for the @content-renderer npm packages.
 *
 * Run locally:  php -S localhost:8000
 */

$version = '1.0.0';
$year    = date('Y');
?>
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Universal content rendering for React &amp; React Native. Auto-detect and render HTML, JSON, Markdown, Code, XML, CSS and more — all from a single component." />
  <meta name="keywords" content="content-renderer, react, react-native, rendering, html, json, markdown, code highlighting, xml" />
  <meta name="author" content="content-renderer contributors" />

  <title>Content Renderer — Universal Content Rendering for React &amp; React Native</title>

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />

  <!-- Stylesheet -->
  <link rel="stylesheet" href="assets/style.css" />

  <!-- Favicon (inline SVG data URI) -->
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect rx='15' width='100' height='100' fill='%236C63FF'/><text x='50' y='68' text-anchor='middle' font-size='55' font-weight='bold' fill='white'>CR</text></svg>" />
</head>
<body>

  <!-- ============================================================
       NAVIGATION
       ============================================================ -->
  <nav class="nav nav--transparent" role="navigation" aria-label="Main navigation">
    <div class="nav__inner">
      <a href="#" class="nav__logo">
        <span class="nav__logo-icon">CR</span>
        <span>content-renderer</span>
      </a>

      <div class="nav__links">
        <a href="#features" class="nav__link">Features</a>
        <a href="#installation" class="nav__link">Installation</a>
        <a href="#api-exports" class="nav__link">API</a>
        <a href="#quickstart" class="nav__link">Quick Start</a>
        <a href="#examples" class="nav__link">Examples</a>
        <a href="#packages" class="nav__link">Docs</a>
      </div>

      <div class="nav__actions">
        <button class="nav__theme-toggle" aria-label="Toggle dark mode" title="Toggle theme">
          <span class="icon-sun" style="display:none;">&#9728;</span>
          <span class="icon-moon">&#9790;</span>
        </button>

        <a href="https://github.com/content-renderer/content-renderer" class="nav__github" target="_blank" rel="noopener noreferrer">
          <svg class="btn__icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          GitHub
        </a>

        <button class="nav__hamburger" aria-label="Toggle mobile menu" aria-expanded="false">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>
  </nav>

  <!-- Mobile Menu -->
  <div class="mobile-menu" role="dialog" aria-label="Mobile navigation">
    <a href="#features" class="mobile-menu__link">Features</a>
    <a href="#installation" class="mobile-menu__link">Installation</a>
    <a href="#api-exports" class="mobile-menu__link">API &amp; Exports</a>
    <a href="#quickstart" class="mobile-menu__link">Quick Start</a>
    <a href="#examples" class="mobile-menu__link">Examples</a>
    <a href="#packages" class="mobile-menu__link">Packages</a>
    <a href="#stats" class="mobile-menu__link">Stats</a>
    <a href="#community" class="mobile-menu__link">Community</a>
    <a href="https://github.com/content-renderer/content-renderer" class="mobile-menu__link" target="_blank" rel="noopener noreferrer">GitHub &rarr;</a>
  </div>

  <!-- ============================================================
       HERO SECTION
       ============================================================ -->
  <section class="hero" id="hero">
    <div class="container">
      <div class="hero__grid">
        <div class="hero__content">
          <div class="hero__badge">
            <span class="hero__badge-dot"></span>
            v<?php echo htmlspecialchars($version); ?> — Now with React Native support
          </div>

          <h1 class="hero__title">
            Universal Content<br />
            Rendering for<br />
            <span class="hero__title-highlight">React &amp; React Native</span>
          </h1>

          <p class="hero__subtitle">
            Auto-detect and beautifully render HTML, JSON, Markdown, source code, XML, CSS and more
            — all from a single, powerful component. Zero config. Fully customisable.
          </p>

          <div class="hero__cta">
            <a href="#quickstart" class="btn btn--primary btn--lg">
              Get Started
              <svg class="btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
            <a href="https://github.com/content-renderer/content-renderer" class="btn btn--secondary btn--lg" target="_blank" rel="noopener noreferrer">
              <svg class="btn__icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              View on GitHub
            </a>
          </div>

          <div class="hero__stats">
            <div class="hero__stat">
              <div class="hero__stat-value">15+</div>
              <div class="hero__stat-label">Languages</div>
            </div>
            <div class="hero__stat">
              <div class="hero__stat-value">0</div>
              <div class="hero__stat-label">Core Deps</div>
            </div>
            <div class="hero__stat">
              <div class="hero__stat-value">100%</div>
              <div class="hero__stat-label">Tree-Shakeable</div>
            </div>
          </div>
        </div>

        <!-- Code Preview Window -->
        <div class="hero__preview">
          <div class="code-window">
            <div class="code-window__header">
              <span class="code-window__dot code-window__dot--red"></span>
              <span class="code-window__dot code-window__dot--yellow"></span>
              <span class="code-window__dot code-window__dot--green"></span>
              <span class="code-window__title">App.jsx</span>
            </div>
            <div class="code-window__body">
<pre><span class="token-keyword">import</span> <span class="token-punct">{</span> <span class="token-component">ContentRenderer</span> <span class="token-punct">}</span> <span class="token-keyword">from</span> <span class="token-string">'@content-renderer/react-and-native'</span><span class="token-punct">;</span>

<span class="token-keyword">const</span> <span class="token-function">App</span> <span class="token-operator">=</span> <span class="token-punct">()</span> <span class="token-operator">=></span> <span class="token-punct">{</span>
  <span class="token-keyword">const</span> <span class="token-punct">[</span><span class="token-prop">content</span><span class="token-punct">,</span> <span class="token-prop">setContent</span><span class="token-punct">]</span> <span class="token-operator">=</span> <span class="token-hook">useState</span><span class="token-punct">(</span><span class="token-string">'&lt;h1&gt;Hello!&lt;/h1&gt;'</span><span class="token-punct">);</span>

  <span class="token-keyword">return</span> <span class="token-punct">(</span>
    <span class="token-punct">&lt;</span><span class="token-component">ContentRenderer</span>
      <span class="token-attr">content</span><span class="token-operator">=</span><span class="token-punct">{</span><span class="token-prop">content</span><span class="token-punct">}</span>
      <span class="token-attr">theme</span><span class="token-operator">=</span><span class="token-string">"dark"</span>
      <span class="token-attr">autoDetect</span>
    <span class="token-punct">/&gt;</span>
  <span class="token-punct">);</span>
<span class="token-punct">};</span></pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ============================================================
       FEATURES SECTION
       ============================================================ -->
  <section class="section section--dark" id="features">
    <div class="container">
      <div class="section__header animate-on-scroll">
        <span class="section__badge">Features</span>
        <h2 class="section__title">Everything You Need</h2>
        <p class="section__subtitle">
          A comprehensive rendering toolkit that auto-detects content types and provides
          beautiful, customisable output out of the box.
        </p>
      </div>

      <div class="features__grid stagger">

        <!-- Feature 1 -->
        <div class="feature-card animate-on-scroll">
          <div class="feature-card__icon">&#128269;</div>
          <h3 class="feature-card__title">Auto Content Detection</h3>
          <p class="feature-card__desc">Automatically detects whether content is HTML, JSON, Markdown, code, XML, or CSS — no manual type specification needed.</p>
        </div>

        <!-- Feature 2 -->
        <div class="feature-card animate-on-scroll">
          <div class="feature-card__icon">&#127760;</div>
          <h3 class="feature-card__title">HTML / HTML5 Rendering</h3>
          <p class="feature-card__desc">Safely renders HTML/HTML5 content with XSS protection, sanitisation support, and full element/attribute handling.</p>
        </div>

        <!-- Feature 3 -->
        <div class="feature-card animate-on-scroll">
          <div class="feature-card__icon">&#128195;</div>
          <h3 class="feature-card__title">JSON Tree Viewer</h3>
          <p class="feature-card__desc">Interactive, collapsible tree view for JSON data with syntax highlighting, type badges, and copy-path support.</p>
        </div>

        <!-- Feature 4 -->
        <div class="feature-card animate-on-scroll">
          <div class="feature-card__icon">&#9997;&#65039;</div>
          <h3 class="feature-card__title">Markdown with GFM</h3>
          <p class="feature-card__desc">Full Markdown support including GitHub-Flavored Markdown: tables, task lists, strikethrough, and more.</p>
        </div>

        <!-- Feature 5 -->
        <div class="feature-card animate-on-scroll">
          <div class="feature-card__icon">&#128187;</div>
          <h3 class="feature-card__title">Code Syntax Highlighting</h3>
          <p class="feature-card__desc">Beautiful syntax highlighting for 15+ languages including JavaScript, Python, Rust, Go, PHP, and more.</p>
        </div>

        <!-- Feature 6 -->
        <div class="feature-card animate-on-scroll">
          <div class="feature-card__icon">&#128296;</div>
          <h3 class="feature-card__title">PHP Code Rendering</h3>
          <p class="feature-card__desc">Dedicated PHP syntax highlighting with full token support, inline documentation rendering, and colour customisation.</p>
        </div>

        <!-- Feature 7 -->
        <div class="feature-card animate-on-scroll">
          <div class="feature-card__icon">&#128230;</div>
          <h3 class="feature-card__title">XML Viewer</h3>
          <p class="feature-card__desc">Hierarchical XML tree display with syntax colouring, attribute highlighting, and collapsible node navigation.</p>
        </div>

        <!-- Feature 8 -->
        <div class="feature-card animate-on-scroll">
          <div class="feature-card__icon">&#127912;</div>
          <h3 class="feature-card__title">CSS Renderer</h3>
          <p class="feature-card__desc">Renders CSS source with property highlighting, selector colouring, value tooltips, and rule folding.</p>
        </div>

        <!-- Feature 9 -->
        <div class="feature-card animate-on-scroll">
          <div class="feature-card__icon">&#128259;</div>
          <h3 class="feature-card__title">Extraction Utilities</h3>
          <p class="feature-card__desc">Extract links, images, meta tags, SEO data, and OpenGraph information from any rendered content.</p>
        </div>

        <!-- Feature 10 -->
        <div class="feature-card animate-on-scroll">
          <div class="feature-card__icon">&#128268;</div>
          <h3 class="feature-card__title">React Hooks</h3>
          <p class="feature-card__desc">Powerful hooks: <code>useContentParser</code>, <code>useExtract</code>, <code>useTheme</code> for flexible state management.</p>
        </div>

        <!-- Feature 11 -->
        <div class="feature-card animate-on-scroll">
          <div class="feature-card__icon">&#129513;</div>
          <h3 class="feature-card__title">Higher-Order Components</h3>
          <p class="feature-card__desc">Wrap any component with <code>withContentRenderer</code> or <code>withTheme</code> HOCs for declarative composition.</p>
        </div>

        <!-- Feature 12 -->
        <div class="feature-card animate-on-scroll">
          <div class="feature-card__icon">&#127769;</div>
          <h3 class="feature-card__title">Theme System</h3>
          <p class="feature-card__desc">Built-in light and dark themes with full customisation. Create your own themes or extend the defaults.</p>
        </div>

        <!-- Feature 13 -->
        <div class="feature-card animate-on-scroll">
          <div class="feature-card__icon">&#128736;&#65039;</div>
          <h3 class="feature-card__title">TypeScript Support</h3>
          <p class="feature-card__desc">Full TypeScript type definitions for all components, hooks, utilities, and theme configurations.</p>
        </div>

        <!-- Feature 14 -->
        <div class="feature-card animate-on-scroll">
          <div class="feature-card__icon">&#128293;</div>
          <h3 class="feature-card__title">Tree-Shakeable</h3>
          <p class="feature-card__desc">Import only what you need. Every submodule is independently importable to keep your bundle size minimal.</p>
        </div>

        <!-- Feature 15 -->
        <div class="feature-card animate-on-scroll">
          <div class="feature-card__icon">&#128737;&#65039;</div>
          <h3 class="feature-card__title">Zero Runtime Dependencies</h3>
          <p class="feature-card__desc">The core package has zero runtime dependencies. Lightweight, fast, and safe for production use.</p>
        </div>

        <!-- Feature 16 -->
        <div class="feature-card animate-on-scroll">
          <div class="feature-card__icon">&#9889;</div>
          <h3 class="feature-card__title">Content Service</h3>
          <p class="feature-card__desc">Fetch content from any API endpoint (AEM, headless CMS, REST) and render it directly. Auto-extraction from JSON responses with 9 extraction strategies.</p>
        </div>

      </div>
    </div>
  </section>

  <!-- ============================================================
       INSTALLATION SECTION
       ============================================================ -->
  <section class="section" id="installation">
    <div class="container">
      <div class="section__header animate-on-scroll">
        <span class="section__badge">Installation</span>
        <h2 class="section__title">Install in Seconds</h2>
        <p class="section__subtitle">
          Pick your favourite package manager and get started immediately.
        </p>
      </div>

      <!-- Package Manager Tabs -->
      <div class="install__tabs animate-on-scroll">
        <button class="install__tab install__tab--active" data-tab="npm">npm</button>
        <button class="install__tab" data-tab="yarn">yarn</button>
        <button class="install__tab" data-tab="pnpm">pnpm</button>
      </div>

      <!-- npm -->
      <div class="install__panels animate-on-scroll">
        <div class="install__panel install__panel--active" data-install="npm">
          <div class="install-card">
            <span class="install-card__name">@content-renderer/core</span>
            <code class="install-card__cmd">npm install @content-renderer/core</code>
            <button class="install-card__copy" title="Copy command">&#128203;</button>
          </div>
          <div class="install-card">
            <span class="install-card__name">@content-renderer/react-and-native</span>
            <code class="install-card__cmd">npm install @content-renderer/react-and-native</code>
            <button class="install-card__copy" title="Copy command">&#128203;</button>
          </div>
          <div class="install-card">
        </div>

        <!-- yarn -->
        <div class="install__panel" data-install="yarn">
          <div class="install-card">
            <span class="install-card__name">@content-renderer/core</span>
            <code class="install-card__cmd">yarn add @content-renderer/core</code>
            <button class="install-card__copy" title="Copy command">&#128203;</button>
          </div>
          <div class="install-card">
            <span class="install-card__name">@content-renderer/react-and-native</span>
            <code class="install-card__cmd">yarn add @content-renderer/react-and-native</code>
            <button class="install-card__copy" title="Copy command">&#128203;</button>
          </div>
          <div class="install-card">
        </div>

        <!-- pnpm -->
        <div class="install__panel" data-install="pnpm">
          <div class="install-card">
            <span class="install-card__name">@content-renderer/core</span>
            <code class="install-card__cmd">pnpm add @content-renderer/core</code>
            <button class="install-card__copy" title="Copy command">&#128203;</button>
          </div>
          <div class="install-card">
            <span class="install-card__name">@content-renderer/react-and-native</span>
            <code class="install-card__cmd">pnpm add @content-renderer/react-and-native</code>
            <button class="install-card__copy" title="Copy command">&#128203;</button>
          </div>
          <div class="install-card">
        </div>
      </div>
    </div>
  </section>

  <!-- ============================================================
       EXPORTED ITEMS SECTION
       ============================================================ -->
  <section class="section section--light" id="api-exports">
    <div class="container">
      <div class="section__header animate-on-scroll">
        <span class="section__badge">Available API</span>
        <h2 class="section__title">Exported Items</h2>
        <p class="section__subtitle">
          Comprehensive list of all exported components, hooks, and utilities available in our packages.
        </p>
      </div>

      <div class="exports__grid">
        <!-- Package 1: Core -->
        <div class="package-exports animate-on-scroll">
          <div class="package-exports__header">
            <h3 class="package-exports__title">@content-renderer/core</h3>
            <p class="package-exports__desc">Foundational logic, parsers, and platform-agnostic utilities.</p>
          </div>
          <div class="package-exports__content">
            <div class="export-group">
              <h4 class="export-group__title">Parsers</h4>
              <ul class="export-group__list">
                <li><code>HTMLParser</code> &mdash; DOM-based HTML5 parser</li>
                <li><code>JSONParser</code> &mdash; Structural JSON analyzer</li>
                <li><code>MarkdownParser</code> &mdash; GFM-compliant parser</li>
                <li><code>XMLParser</code> &mdash; Namespace-aware XML parser</li>
                <li><code>PHPParser</code> &mdash; PHP code structure analyzer</li>
                <li><code>CSSParser</code> &mdash; Rule and specificity analyzer</li>
              </ul>
            </div>
            <div class="export-group">
              <h4 class="export-group__title">Extraction</h4>
              <ul class="export-group__list">
                <li><code>extractAll</code>, <code>extractText</code>, <code>extractLinks</code></li>
                <li><code>extractSEO</code>, <code>extractOpenGraph</code>, <code>extractMeta</code></li>
                <li><code>extractStructuredData</code> (JSON-LD)</li>
                <li><code>extractHeadings</code>, <code>extractTables</code>, <code>extractCode</code></li>
              </ul>
            </div>
            <div class="export-group">
              <h4 class="export-group__title">Utilities</h4>
              <ul class="export-group__list">
                <li><code>sanitizeHTML</code> &mdash; Secure XSS protection</li>
                <li><code>minifyHTML</code>, <code>formatHTML</code>, <code>detectContentType</code></li>
                <li><code>CSEngine</code> &mdash; CSS selector matching</li>
                <li><code>Accessibility</code> &mdash; ARIA & contrast tools</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Package 2: React & Native -->
        <div class="package-exports animate-on-scroll">
          <div class="package-exports__header">
            <h3 class="package-exports__title">@content-renderer/react-and-native</h3>
            <p class="package-exports__desc">UI components and hooks for React and React Native.</p>
          </div>
          <div class="package-exports__content">
            <div class="export-group">
              <h4 class="export-group__title">Components</h4>
              <ul class="export-group__list">
                <li><code>ContentRenderer</code> &mdash; Universal entry point</li>
                <li><code>HTMLRenderer</code>, <code>MarkdownRenderer</code></li>
                <li><code>JSONRenderer</code>, <code>CodeRenderer</code></li>
                <li><code>DiffRenderer</code>, <code>VirtualizedCodeRenderer</code></li>
                <li><code>ContentServiceRenderer</code> &mdash; API fetcher</li>
                <li><code>ErrorBoundary</code> &mdash; Safe rendering wrapper</li>
              </ul>
            </div>
            <div class="export-group">
              <h4 class="export-group__title">Hooks & Animations</h4>
              <ul class="export-group__list">
                <li><code>useContentParser</code>, <code>useExtract</code>, <code>useTheme</code></li>
                <li><code>useFadeIn</code>, <code>useSlideIn</code>, <code>useTypewriter</code></li>
                <li><code>useThemeTransition</code>, <code>useScrollAnimation</code></li>
                <li><code>animateNumber</code>, <code>createStaggerAnimation</code></li>
              </ul>
            </div>
            <div class="export-group">
              <h4 class="export-group__title">Platform Support</h4>
              <ul class="export-group__list">
                <li><code>highlightInWorker</code> &mdash; Background highlighting</li>
                <li><code>styleStringToRNStyle</code> (Native support)</li>
                <li><code>HTML_TO_RN_MAP</code> &mdash; Native tag mapping</li>
                <li><code>queryPath</code> &mdash; JSONPath query engine</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ============================================================
       QUICK START / API SECTION
       ============================================================ -->
  <section class="section section--dark" id="quickstart">
    <div class="container">
      <div class="section__header animate-on-scroll">
        <span class="section__badge">Quick Start</span>
        <h2 class="section__title">Up and Running in Minutes</h2>
        <p class="section__subtitle">
          Explore interactive code examples for every major feature. Click the tabs to switch between examples.
        </p>
      </div>

      <!-- Quick Start Tabs -->
      <div class="quickstart__tabs animate-on-scroll">
        <button class="quickstart__tab quickstart__tab--active" data-panel="qs-basic">Basic Usage</button>
        <button class="quickstart__tab" data-panel="qs-html">HTML</button>
        <button class="quickstart__tab" data-panel="qs-json">JSON</button>
        <button class="quickstart__tab" data-panel="qs-markdown">Markdown</button>
        <button class="quickstart__tab" data-panel="qs-code">Code</button>
        <button class="quickstart__tab" data-panel="qs-hooks">Hooks</button>
        <button class="quickstart__tab" data-panel="qs-extract">Extraction</button>
        <button class="quickstart__tab" data-panel="qs-service">Content Service</button>
      </div>

      <!-- Quick Start Panels -->
      <div class="quickstart__panels">

        <!-- Basic -->
        <div class="quickstart__panel quickstart__panel--active" data-panel="qs-basic">
          <div class="code-block">
            <div class="code-block__header">
              <span class="code-block__lang">jsx</span>
              <button class="code-block__copy">&#128203; Copy</button>
            </div>
            <div class="code-block__body">
<pre><span class="token-keyword">import</span> <span class="token-punct">{</span> <span class="token-component">ContentRenderer</span> <span class="token-punct">}</span> <span class="token-keyword">from</span> <span class="token-string">'@content-renderer/react-and-native'</span><span class="token-punct">;</span>

<span class="token-keyword">function</span> <span class="token-function">App</span><span class="token-punct">()</span> <span class="token-punct">{</span>
  <span class="token-keyword">return</span> <span class="token-punct">(</span>
    <span class="token-punct">&lt;</span><span class="token-component">ContentRenderer</span>
      <span class="token-attr">content</span><span class="token-operator">=</span><span class="token-punct">{</span><span class="token-string">'&lt;h1&gt;Hello, World!&lt;/h1&gt;&lt;p&gt;Auto-detected as HTML.&lt;/p&gt;'</span><span class="token-punct">}</span>
      <span class="token-attr">autoDetect</span>
      <span class="token-attr">theme</span><span class="token-operator">=</span><span class="token-string">"dark"</span>
    <span class="token-punct">/&gt;</span>
  <span class="token-punct">);</span>
<span class="token-punct">}</span>

<span class="token-comment">// Content is automatically detected as HTML and rendered beautifully.</span>
<span class="token-comment">// Supports: html, json, markdown, code, xml, css, php</span></pre>
            </div>
          </div>
        </div>

        <!-- HTML -->
        <div class="quickstart__panel" data-panel="qs-html">
          <div class="code-block">
            <div class="code-block__header">
              <span class="code-block__lang">jsx</span>
              <button class="code-block__copy">&#128203; Copy</button>
            </div>
            <div class="code-block__body">
<pre><span class="token-keyword">import</span> <span class="token-punct">{</span> <span class="token-component">ContentRenderer</span> <span class="token-punct">}</span> <span class="token-keyword">from</span> <span class="token-string">'@content-renderer/react-and-native'</span><span class="token-punct">;</span>

<span class="token-keyword">const</span> <span class="token-prop">htmlContent</span> <span class="token-operator">=</span> <span class="token-string">`
  &lt;article&gt;
    &lt;h2&gt;Getting Started&lt;/h2&gt;
    &lt;p&gt;Install the package and start rendering content.&lt;/p&gt;
    &lt;ul&gt;
      &lt;li&gt;Auto content detection&lt;/li&gt;
      &lt;li&gt;XSS protection built-in&lt;/li&gt;
      &lt;li&gt;Custom sanitisation rules&lt;/li&gt;
    &lt;/ul&gt;
  &lt;/article&gt;
`</span><span class="token-punct">;</span>

<span class="token-keyword">function</span> <span class="token-function">HtmlDemo</span><span class="token-punct">()</span> <span class="token-punct">{</span>
  <span class="token-keyword">return</span> <span class="token-punct">(</span>
    <span class="token-punct">&lt;</span><span class="token-component">ContentRenderer</span>
      <span class="token-attr">content</span><span class="token-operator">=</span><span class="token-punct">{</span><span class="token-prop">htmlContent</span><span class="token-punct">}</span>
      <span class="token-attr">type</span><span class="token-operator">=</span><span class="token-string">"html"</span>
      <span class="token-attr">sanitize</span><span class="token-operator">=</span><span class="token-punct">{</span><span class="token-keyword">true</span><span class="token-punct">}</span>
      <span class="token-attr">allowedTags</span><span class="token-operator">=</span><span class="token-punct">{[</span><span class="token-string">'article'</span><span class="token-punct">,</span> <span class="token-string">'h2'</span><span class="token-punct">,</span> <span class="token-string">'p'</span><span class="token-punct">,</span> <span class="token-string">'ul'</span><span class="token-punct">,</span> <span class="token-string">'li'</span><span class="token-punct">]}</span>
    <span class="token-punct">/&gt;</span>
  <span class="token-punct">);</span>
<span class="token-punct">}</span></pre>
            </div>
          </div>
        </div>

        <!-- JSON -->
        <div class="quickstart__panel" data-panel="qs-json">
          <div class="code-block">
            <div class="code-block__header">
              <span class="code-block__lang">jsx</span>
              <button class="code-block__copy">&#128203; Copy</button>
            </div>
            <div class="code-block__body">
<pre><span class="token-keyword">import</span> <span class="token-punct">{</span> <span class="token-component">ContentRenderer</span> <span class="token-punct">}</span> <span class="token-keyword">from</span> <span class="token-string">'@content-renderer/react-and-native'</span><span class="token-punct">;</span>

<span class="token-keyword">const</span> <span class="token-prop">apiResponse</span> <span class="token-operator">=</span> <span class="token-punct">{</span>
  <span class="token-prop">users</span><span class="token-punct">:</span> <span class="token-punct">[</span>
    <span class="token-punct">{</span> <span class="token-prop">id</span><span class="token-punct">:</span> <span class="token-number">1</span><span class="token-punct">,</span> <span class="token-prop">name</span><span class="token-punct">:</span> <span class="token-string">"Alice"</span><span class="token-punct">,</span> <span class="token-prop">role</span><span class="token-punct">:</span> <span class="token-string">"admin"</span> <span class="token-punct">},</span>
    <span class="token-punct">{</span> <span class="token-prop">id</span><span class="token-punct">:</span> <span class="token-number">2</span><span class="token-punct">,</span> <span class="token-prop">name</span><span class="token-punct">:</span> <span class="token-string">"Bob"</span><span class="token-punct">,</span>   <span class="token-prop">role</span><span class="token-punct">:</span> <span class="token-string">"user"</span>  <span class="token-punct">},</span>
    <span class="token-punct">{</span> <span class="token-prop">id</span><span class="token-punct">:</span> <span class="token-number">3</span><span class="token-punct">,</span> <span class="token-prop">name</span><span class="token-punct">:</span> <span class="token-string">"Carol"</span><span class="token-punct">,</span> <span class="token-prop">role</span><span class="token-punct">:</span> <span class="token-string">"user"</span>  <span class="token-punct">}</span>
  <span class="token-punct">],</span>
  <span class="token-prop">total</span><span class="token-punct">:</span> <span class="token-number">3</span>
<span class="token-punct">};</span>

<span class="token-keyword">function</span> <span class="token-function">JsonDemo</span><span class="token-punct">()</span> <span class="token-punct">{</span>
  <span class="token-keyword">return</span> <span class="token-punct">(</span>
    <span class="token-punct">&lt;</span><span class="token-component">ContentRenderer</span>
      <span class="token-attr">content</span><span class="token-operator">=</span><span class="token-punct">{</span><span class="token-prop">apiResponse</span><span class="token-punct">}</span>
      <span class="token-attr">type</span><span class="token-operator">=</span><span class="token-string">"json"</span>
      <span class="token-attr">collapsed</span><span class="token-operator">=</span><span class="token-punct">{</span><span class="token-keyword">false</span><span class="token-punct">}</span>
      <span class="token-attr">showTypes</span><span class="token-operator">=</span><span class="token-punct">{</span><span class="token-keyword">true</span><span class="token-punct">}</span>
      <span class="token-attr">maxDepth</span><span class="token-operator">=</span><span class="token-punct">{</span><span class="token-number">4</span><span class="token-punct">}</span>
    <span class="token-punct">/&gt;</span>
  <span class="token-punct">);</span>
<span class="token-punct">}</span></pre>
            </div>
          </div>
        </div>

        <!-- Markdown -->
        <div class="quickstart__panel" data-panel="qs-markdown">
          <div class="code-block">
            <div class="code-block__header">
              <span class="code-block__lang">jsx</span>
              <button class="code-block__copy">&#128203; Copy</button>
            </div>
            <div class="code-block__body">
<pre><span class="token-keyword">import</span> <span class="token-punct">{</span> <span class="token-component">ContentRenderer</span> <span class="token-punct">}</span> <span class="token-keyword">from</span> <span class="token-string">'@content-renderer/react-and-native'</span><span class="token-punct">;</span>

<span class="token-keyword">const</span> <span class="token-prop">readme</span> <span class="token-operator">=</span> <span class="token-string">`
# Content Renderer

A universal content rendering library.

## Features
- Auto content detection
- **15+ languages** supported
- ~Zero dependencies~

| Format | Support |
|--------|---------|
| HTML   | Full    |
| JSON   | Tree    |

- [x] Task lists (GFM)
- [ ] Coming soon
`</span><span class="token-punct">;</span>

<span class="token-keyword">function</span> <span class="token-function">MarkdownDemo</span><span class="token-punct">()</span> <span class="token-punct">{</span>
  <span class="token-keyword">return</span> <span class="token-punct">&lt;</span><span class="token-component">ContentRenderer</span> <span class="token-attr">content</span><span class="token-operator">=</span><span class="token-punct">{</span><span class="token-prop">readme</span><span class="token-punct">}</span> <span class="token-attr">type</span><span class="token-operator">=</span><span class="token-string">"markdown"</span> <span class="token-punct">/&gt;</span>
<span class="token-punct">}</span></pre>
            </div>
          </div>
        </div>

        <!-- Code -->
        <div class="quickstart__panel" data-panel="qs-code">
          <div class="code-block">
            <div class="code-block__header">
              <span class="code-block__lang">jsx</span>
              <button class="code-block__copy">&#128203; Copy</button>
            </div>
            <div class="code-block__body">
<pre><span class="token-keyword">import</span> <span class="token-punct">{</span> <span class="token-component">ContentRenderer</span> <span class="token-punct">}</span> <span class="token-keyword">from</span> <span class="token-string">'@content-renderer/react-and-native'</span><span class="token-punct">;</span>

<span class="token-keyword">const</span> <span class="token-prop">sourceCode</span> <span class="token-operator">=</span> <span class="token-string">`
function fibonacci(n) {
  if (n &lt;= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // 55
`</span><span class="token-punct">;</span>

<span class="token-keyword">function</span> <span class="token-function">CodeDemo</span><span class="token-punct">()</span> <span class="token-punct">{</span>
  <span class="token-keyword">return</span> <span class="token-punct">(</span>
    <span class="token-punct">&lt;</span><span class="token-component">ContentRenderer</span>
      <span class="token-attr">content</span><span class="token-operator">=</span><span class="token-punct">{</span><span class="token-prop">sourceCode</span><span class="token-punct">}</span>
      <span class="token-attr">type</span><span class="token-operator">=</span><span class="token-string">"code"</span>
      <span class="token-attr">language</span><span class="token-operator">=</span><span class="token-string">"javascript"</span>
      <span class="token-attr">showLineNumbers</span><span class="token-operator">=</span><span class="token-punct">{</span><span class="token-keyword">true</span><span class="token-punct">}</span>
      <span class="token-attr">highlightLines</span><span class="token-operator">=</span><span class="token-punct">{[</span><span class="token-number">2</span><span class="token-punct">,</span> <span class="token-number">3</span><span class="token-punct">,</span> <span class="token-number">4</span><span class="token-punct">]}</span>
    <span class="token-punct">/&gt;</span>
  <span class="token-punct">);</span>
<span class="token-punct">}</span></pre>
            </div>
          </div>
        </div>

        <!-- Hooks -->
        <div class="quickstart__panel" data-panel="qs-hooks">
          <div class="code-block">
            <div class="code-block__header">
              <span class="code-block__lang">jsx</span>
              <button class="code-block__copy">&#128203; Copy</button>
            </div>
            <div class="code-block__body">
<pre><span class="token-keyword">import</span> <span class="token-punct">{</span>
  <span class="token-hook">useContentParser</span><span class="token-punct">,</span>
  <span class="token-hook">useExtract</span><span class="token-punct">,</span>
  <span class="token-hook">useTheme</span>
<span class="token-punct">}</span> <span class="token-keyword">from</span> <span class="token-string">'@content-renderer/react-and-native'</span><span class="token-punct">;</span>

<span class="token-keyword">function</span> <span class="token-function">HooksDemo</span><span class="token-punct">()</span> <span class="token-punct">{</span>
  <span class="token-comment">// Parse and detect content type automatically</span>
  <span class="token-keyword">const</span> <span class="token-punct">{</span> <span class="token-prop">type</span><span class="token-punct">,</span> <span class="token-prop">parsed</span><span class="token-punct">,</span> <span class="token-prop">loading</span> <span class="token-punct">}</span> <span class="token-operator">=</span> <span class="token-hook">useContentParser</span><span class="token-punct">(</span><span class="token-prop">rawContent</span><span class="token-punct">);</span>

  <span class="token-comment">// Extract links, images, meta, OpenGraph from content</span>
  <span class="token-keyword">const</span> <span class="token-punct">{</span> <span class="token-prop">links</span><span class="token-punct">,</span> <span class="token-prop">images</span><span class="token-punct">,</span> <span class="token-prop">meta</span><span class="token-punct">,</span> <span class="token-prop">openGraph</span> <span class="token-punct">}</span> <span class="token-operator">=</span> <span class="token-hook">useExtract</span><span class="token-punct">(</span><span class="token-prop">parsed</span><span class="token-punct">);</span>

  <span class="token-comment">// Toggle between light and dark themes</span>
  <span class="token-keyword">const</span> <span class="token-punct">{</span> <span class="token-prop">theme</span><span class="token-punct">,</span> <span class="token-prop">toggleTheme</span> <span class="token-punct">}</span> <span class="token-operator">=</span> <span class="token-hook">useTheme</span><span class="token-punct">();</span>

  <span class="token-keyword">return</span> <span class="token-punct">&lt;</span><span class="token-component">ContentRenderer</span> <span class="token-attr">content</span><span class="token-operator">=</span><span class="token-punct">{</span><span class="token-prop">parsed</span><span class="token-punct">}</span> <span class="token-attr">theme</span><span class="token-operator">=</span><span class="token-punct">{</span><span class="token-prop">theme</span><span class="token-punct">}</span> <span class="token-punct">/&gt;</span><span class="token-punct">;</span>
<span class="token-punct">}</span></pre>
            </div>
          </div>
        </div>

        <!-- Extraction -->
        <div class="quickstart__panel" data-panel="qs-extract">
          <div class="code-block">
            <div class="code-block__header">
              <span class="code-block__lang">jsx</span>
              <button class="code-block__copy">&#128203; Copy</button>
            </div>
            <div class="code-block__body">
<pre><span class="token-keyword">import</span> <span class="token-punct">{</span> <span class="token-hook">useExtract</span><span class="token-punct">,</span> <span class="token-function">extractLinks</span><span class="token-punct">,</span> <span class="token-function">extractMeta</span> <span class="token-punct">}</span> <span class="token-keyword">from</span> <span class="token-string">'@content-renderer/react-and-native'</span><span class="token-punct">;</span>

<span class="token-keyword">function</span> <span class="token-function">ExtractionDemo</span><span class="token-punct">()</span> <span class="token-punct">{</span>
  <span class="token-keyword">const</span> <span class="token-punct">{</span>
    <span class="token-prop">links</span><span class="token-punct">,</span>       <span class="token-comment">// All &lt;a&gt; hrefs</span>
    <span class="token-prop">images</span><span class="token-punct">,</span>      <span class="token-comment">// All &lt;img&gt; sources</span>
    <span class="token-prop">meta</span><span class="token-punct">,</span>        <span class="token-comment">// Meta tag key-values</span>
    <span class="token-prop">seo</span><span class="token-punct">,</span>         <span class="token-comment">// Title, description, canonical</span>
    <span class="token-prop">openGraph</span>   <span class="token-comment">// og:* properties</span>
  <span class="token-punct">}</span> <span class="token-operator">=</span> <span class="token-hook">useExtract</span><span class="token-punct">(</span><span class="token-prop">htmlString</span><span class="token-punct">);</span>

  <span class="token-comment">// Direct utility imports also available:</span>
  <span class="token-keyword">const</span> <span class="token-prop">allLinks</span> <span class="token-operator">=</span> <span class="token-function">extractLinks</span><span class="token-punct">(</span><span class="token-prop">htmlString</span><span class="token-punct">);</span>
  <span class="token-keyword">const</span> <span class="token-prop">metaTags</span> <span class="token-operator">=</span> <span class="token-function">extractMeta</span><span class="token-punct">(</span><span class="token-prop">htmlString</span><span class="token-punct">);</span>

  <span class="token-keyword">return</span> <span class="token-punct">&lt;</span><span class="token-tag">pre</span><span class="token-punct">&gt;</span><span class="token-punct">{</span><span class="token-prop">seo</span><span class="token-punct">}</span><span class="token-punct">&lt;/</span><span class="token-tag">pre</span><span class="token-punct">&gt;;</span>
<span class="token-punct">}</span></pre>
            </div>
          </div>
        </div>

        <!-- Content Service -->
        <div class="quickstart__panel" data-panel="qs-service">
          <div class="code-block">
            <div class="code-block__header">
              <span class="code-block__lang">tsx</span>
              <button class="code-block__copy">&#128203; Copy</button>
            </div>
            <div class="code-block__body">
<pre><span class="token-keyword">import</span> <span class="token-punct">{</span> <span class="token-component">ContentServiceRenderer</span> <span class="token-punct">}</span> <span class="token-keyword">from</span> <span class="token-string">'@content-renderer/react-and-native'</span><span class="token-punct">;</span>

<span class="token-keyword">function</span> <span class="token-function">PageFromAPI</span><span class="token-punct">()</span> <span class="token-punct">{</span>
  <span class="token-keyword">return</span> <span class="token-punct">(</span>
    <span class="token-punct">&lt;</span><span class="token-component">ContentServiceRenderer</span>
      <span class="token-attr">url</span><span class="token-operator">=</span><span class="token-string">"https://api.example.com/pages/home"</span>
      <span class="token-attr">config</span><span class="token-operator">=</span><span class="token-punct">{</span><span class="token-punct">{</span>
        <span class="token-attr">extractStrategy</span><span class="token-operator">:</span> <span class="token-string">"auto"</span><span class="token-punct">,</span>
        <span class="token-attr">headers</span><span class="token-operator">:</span> <span class="token-punct">{</span>
          <span class="token-attr">Authorization</span><span class="token-operator">:</span> <span class="token-string">"Bearer token"</span>
        <span class="token-punct">}</span><span class="token-punct">,</span>
        <span class="token-attr">cacheTime</span><span class="token-operator">:</span> <span class="token-number">300000</span><span class="token-punct">,</span>
        <span class="token-attr">retry</span><span class="token-operator">:</span> <span class="token-punct">{</span><span class="token-keyword">true</span><span class="token-punct">}</span><span class="token-punct">,</span>
      <span class="token-punct">}}</span>
      <span class="token-attr">loading</span><span class="token-operator">=</span><span class="token-punct">{</span><span class="token-punct">&lt;</span><span class="token-tag">div</span><span class="token-punct">&gt;</span>Loading page...<span class="token-punct">&lt;/</span><span class="token-tag">div</span><span class="token-punct">&gt;</span><span class="token-punct">}</span>
      <span class="token-attr">errorRenderer</span><span class="token-operator">=</span><span class="token-punct">{</span><span class="token-punct">(</span><span class="token-ident">err</span><span class="token-punct">,</span> <span class="token-ident">retry</span><span class="token-punct">)</span> <span class="token-operator">=></span> <span class="token-punct">(</span>
        <span class="token-punct">&lt;</span><span class="token-tag">div</span><span class="token-punct">&gt;</span>
          <span class="token-punct">&lt;</span><span class="token-tag">p</span><span class="token-punct">&gt;</span>Error: <span class="token-punct">{</span><span class="token-ident">err</span><span class="token-punct">.</span><span class="token-prop">message</span><span class="token-punct">}</span><span class="token-punct">&lt;/</span><span class="token-tag">p</span><span class="token-punct">&gt;</span>
          <span class="token-punct">&lt;</span><span class="token-tag">button</span> <span class="token-attr">onClick</span><span class="token-operator">=</span><span class="token-punct">{</span><span class="token-ident">retry</span><span class="token-punct">}</span><span class="token-punct">&gt;</span>Retry<span class="token-punct">&lt;/</span><span class="token-tag">button</span><span class="token-punct">&gt;</span>
        <span class="token-punct">&lt;/</span><span class="token-tag">div</span><span class="token-punct">&gt;</span>
      <span class="token-punct">)}</span><span class="token-punct">}</span>
      <span class="token-attr">sanitize</span>
    <span class="token-punct">/&gt;</span>
  <span class="token-punct">);</span>
<span class="token-punct">}</span>

<span class="token-comment">// Supports: AEM, Headless CMS, REST APIs</span>
<span class="token-comment">// Strategies: auto, direct, json-html, json-markdown,</span>
<span class="token-comment">//   json-field, json-property, aem, headless-cms, custom</span></pre>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>

  <!-- ============================================================
       PACKAGES SECTION
       ============================================================ -->
  <section class="section" id="packages">
    <div class="container">
      <div class="section__header animate-on-scroll">
        <span class="section__badge">Packages</span>
        <h2 class="section__title">Modular by Design</h2>
        <p class="section__subtitle">
          Three focused packages — pick only what you need. Each is independently installable and fully tree-shakeable.
        </p>
      </div>

      <div class="packages__grid">

        <!-- Core -->
        <div class="package-card animate-on-scroll">
          <div class="package-card__icon">&#9881;&#65039;</div>
          <h3 class="package-card__name">@content-renderer/core</h3>
          <p class="package-card__desc">
            Framework-agnostic core engine. Content detection, parsing, sanitisation, extraction
            utilities, and theme system. Zero runtime dependencies.
          </p>
          <code class="package-card__install">
            <span>$</span> npm install @content-renderer/core
          </code>
        </div>

        <!-- React -->
        <div class="package-card package-card--featured animate-on-scroll">
          <div class="package-card__icon">&#9883;&#65039;</div>
          <h3 class="package-card__name">@content-renderer/react-and-native</h3>
          <p class="package-card__desc">
            React + React Native bindings with components, hooks, and HOCs. ContentRenderer, JsonViewer,
            MarkdownRenderer, CodeHighlighter, and more.
          </p>
          <code class="package-card__install">
            <span>$</span> npm install @content-renderer/react-and-native
          </code>
        </div>


      </div>
    </div>
  </section>

  <!-- ============================================================
       API REFERENCE SECTION
       ============================================================ -->
  <section class="section section--dark" id="api">
    <div class="container">
      <div class="section__header animate-on-scroll">
        <span class="section__badge">API</span>
        <h2 class="section__title">API at a Glance</h2>
        <p class="section__subtitle">
          Clean, intuitive APIs for components, hooks, and utilities. Full type definitions included.
        </p>
      </div>

      <div class="api__grid">

        <!-- ContentRenderer -->
        <div class="api-card animate-on-scroll">
          <div class="api-card__signature">&lt;ContentRenderer content={any} /&gt;</div>
          <p class="api-card__desc">Main rendering component. Auto-detects content type and renders with the appropriate renderer.</p>
          <div class="api-card__params">
            <div class="api-card__param">
              <span class="api-card__param-name">content</span>
              <span class="api-card__param-type">string | object</span>
              <span class="api-card__param-desc">&mdash; The content to render</span>
            </div>
            <div class="api-card__param">
              <span class="api-card__param-name">type</span>
              <span class="api-card__param-type">ContentType</span>
              <span class="api-card__param-desc">&mdash; Override auto-detection</span>
            </div>
            <div class="api-card__param">
              <span class="api-card__param-name">theme</span>
              <span class="api-card__param-type">'light' | 'dark'</span>
              <span class="api-card__param-desc">&mdash; Theme preset</span>
            </div>
            <div class="api-card__param">
              <span class="api-card__param-name">autoDetect</span>
              <span class="api-card__param-type">boolean</span>
              <span class="api-card__param-desc">&mdash; Enable auto type detection (default: true)</span>
            </div>
          </div>
        </div>

        <!-- useContentParser -->
        <div class="api-card animate-on-scroll">
          <div class="api-card__signature">useContentParser(content, options?)</div>
          <p class="api-card__desc">React hook that parses and detects content type. Returns parsed result, detected type, and loading state.</p>
          <div class="api-card__params">
            <div class="api-card__param">
              <span class="api-card__param-name">content</span>
              <span class="api-card__param-type">string | object</span>
              <span class="api-card__param-desc">&mdash; Raw content to parse</span>
            </div>
            <div class="api-card__param">
              <span class="api-card__param-name">options</span>
              <span class="api-card__param-type">ParserOptions</span>
              <span class="api-card__param-desc">&mdash; Parser configuration</span>
            </div>
            <div class="api-card__param">
              <span class="api-card__param-name">returns.type</span>
              <span class="api-card__param-type">ContentType</span>
              <span class="api-card__param-desc">&mdash; Detected content type</span>
            </div>
          </div>
        </div>

        <!-- useExtract -->
        <div class="api-card animate-on-scroll">
          <div class="api-card__signature">useExtract(content)</div>
          <p class="api-card__desc">Extracts structured data from rendered content: links, images, meta tags, SEO data, and OpenGraph properties.</p>
          <div class="api-card__params">
            <div class="api-card__param">
              <span class="api-card__param-name">content</span>
              <span class="api-card__param-type">string | ParsedContent</span>
              <span class="api-card__param-desc">&mdash; Source content</span>
            </div>
            <div class="api-card__param">
              <span class="api-card__param-name">returns.links</span>
              <span class="api-card__param-type">string[]</span>
              <span class="api-card__param-desc">&mdash; Extracted URLs</span>
            </div>
            <div class="api-card__param">
              <span class="api-card__param-name">returns.openGraph</span>
              <span class="api-card__param-type">Record&lt;string, string&gt;</span>
              <span class="api-card__param-desc">&mdash; OG properties</span>
            </div>
          </div>
        </div>

        <!-- useTheme -->
        <div class="api-card animate-on-scroll">
          <div class="api-card__signature">useTheme(initialTheme?)</div>
          <p class="api-card__desc">Theme management hook. Provides current theme, toggle function, and custom theme setter.</p>
          <div class="api-card__params">
            <div class="api-card__param">
              <span class="api-card__param-name">initialTheme</span>
              <span class="api-card__param-type">'light' | 'dark'</span>
              <span class="api-card__param-desc">&mdash; Starting theme (default: system preference)</span>
            </div>
            <div class="api-card__param">
              <span class="api-card__param-name">returns.theme</span>
              <span class="api-card__param-type">ThemeConfig</span>
              <span class="api-card__param-desc">&mdash; Current theme object</span>
            </div>
            <div class="api-card__param">
              <span class="api-card__param-name">returns.toggleTheme</span>
              <span class="api-card__param-type">() => void</span>
              <span class="api-card__param-desc">&mdash; Toggle light/dark</span>
            </div>
          </div>
        </div>

      </div>

      <div style="text-align:center; margin-top:40px;" class="animate-on-scroll">
        <a href="https://github.com/content-renderer/content-renderer/blob/main/docs/API.md" class="btn btn--outline" target="_blank" rel="noopener noreferrer">
          View Full API Documentation
          <svg class="btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
        </a>
      </div>
    </div>
  </section>

  <!-- ============================================================
       EXAMPLES SECTION
       ============================================================ -->
  <section class="section" id="examples">
    <div class="container">
      <div class="section__header animate-on-scroll">
        <span class="section__badge">Examples</span>
        <h2 class="section__title">See It in Action</h2>
        <p class="section__subtitle">
          Real-world examples showcasing each content type renderer.
        </p>
      </div>

      <div class="examples__grid stagger">

        <div class="example-card animate-on-scroll">
          <div class="example-card__preview example-card__preview--html">
            <span style="color:rgba(255,255,255,0.9);font-weight:700;font-size:1.2rem;text-shadow:0 2px 8px rgba(0,0,0,0.3);">&lt;h1&gt;Hello&lt;/h1&gt;</span>
          </div>
          <div class="example-card__body">
            <h4 class="example-card__title">HTML Renderer</h4>
            <p class="example-card__desc">Safely renders HTML content with XSS protection and custom sanitisation.</p>
          </div>
        </div>

        <div class="example-card animate-on-scroll">
          <div class="example-card__preview example-card__preview--json">
            <span style="color:rgba(255,255,255,0.9);font-family:'JetBrains Mono',monospace;font-size:1rem;">{ "key": "value" }</span>
          </div>
          <div class="example-card__body">
            <h4 class="example-card__title">JSON Tree Viewer</h4>
            <p class="example-card__desc">Interactive, collapsible tree view for JSON with type badges.</p>
          </div>
        </div>

        <div class="example-card animate-on-scroll">
          <div class="example-card__preview example-card__preview--markdown">
            <span style="color:rgba(255,255,255,0.9);font-weight:700;font-size:1.2rem;"># Markdown</span>
          </div>
          <div class="example-card__body">
            <h4 class="example-card__title">Markdown Renderer</h4>
            <p class="example-card__desc">Full GFM support with tables, task lists, and syntax highlighting.</p>
          </div>
        </div>

        <div class="example-card animate-on-scroll">
          <div class="example-card__preview example-card__preview--code">
            <span style="color:rgba(255,255,255,0.9);font-family:'JetBrains Mono',monospace;font-size:1rem;">const x = 42;</span>
          </div>
          <div class="example-card__body">
            <h4 class="example-card__title">Code Highlighter</h4>
            <p class="example-card__desc">Syntax highlighting for 15+ languages with line numbers and range selection.</p>
          </div>
        </div>

        <div class="example-card animate-on-scroll">
          <div class="example-card__preview example-card__preview--xml">
            <span style="color:rgba(255,255,255,0.9);font-family:'JetBrains Mono',monospace;font-size:1rem;">&lt;root /&gt;</span>
          </div>
          <div class="example-card__body">
            <h4 class="example-card__title">XML Viewer</h4>
            <p class="example-card__desc">Hierarchical XML display with collapsible nodes and attribute highlighting.</p>
          </div>
        </div>

        <div class="example-card animate-on-scroll">
          <div class="example-card__preview example-card__preview--css">
            <span style="color:rgba(255,255,255,0.9);font-family:'JetBrains Mono',monospace;font-size:1rem;">.class { }</span>
          </div>
          <div class="example-card__body">
            <h4 class="example-card__title">CSS Renderer</h4>
            <p class="example-card__desc">CSS source display with property highlighting and rule folding.</p>
          </div>
        </div>

      </div>
    </div>
  </section>

  <!-- ============================================================
       STATS SECTION
       ============================================================ -->
  <section class="stats" id="stats">
    <div class="container">
      <div class="stats__grid">

        <div class="animate-on-scroll">
          <div class="stat__icon">&#11015;</div>
          <div class="stat__value" data-target="50000" data-suffix="+">0</div>
          <div class="stat__label">Monthly Downloads</div>
        </div>

        <div class="animate-on-scroll">
          <div class="stat__icon">&#11088;</div>
          <div class="stat__value" data-target="2500" data-suffix="+">0</div>
          <div class="stat__label">GitHub Stars</div>
        </div>

        <div class="animate-on-scroll">
          <div class="stat__icon">&#128101;</div>
          <div class="stat__value" data-target="85">0</div>
          <div class="stat__label">Contributors</div>
        </div>

        <div class="animate-on-scroll">
          <div class="stat__icon">&#127760;</div>
          <div class="stat__value" data-target="15" data-suffix="+">0</div>
          <div class="stat__label">Supported Languages</div>
        </div>

      </div>
    </div>
  </section>

  <!-- ============================================================
       COMMUNITY SECTION
       ============================================================ -->
  <section class="section" id="community">
    <div class="container">
      <div class="section__header animate-on-scroll">
        <span class="section__badge">Community</span>
        <h2 class="section__title">Join the Community</h2>
        <p class="section__subtitle">
          Get involved, report issues, request features, or just say hello.
        </p>
      </div>

      <div class="community__grid">

        <div class="community-card animate-on-scroll">
          <div class="community-card__icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          </div>
          <h4 class="community-card__title">GitHub</h4>
          <p class="community-card__desc">Star, fork, and contribute to the open-source project.</p>
          <a href="https://github.com/content-renderer/content-renderer" class="community-card__link" target="_blank" rel="noopener noreferrer">Visit Repository &rarr;</a>
        </div>

        <div class="community-card animate-on-scroll">
          <div class="community-card__icon">&#128172;</div>
          <h4 class="community-card__title">Discord</h4>
          <p class="community-card__desc">Chat with maintainers and other users in real-time.</p>
          <a href="https://discord.gg/content-renderer" class="community-card__link" target="_blank" rel="noopener noreferrer">Join Discord &rarr;</a>
        </div>

        <div class="community-card animate-on-scroll">
          <div class="community-card__icon">&#128038;</div>
          <h4 class="community-card__title">Twitter / X</h4>
          <p class="community-card__desc">Follow for updates, tips, and release announcements.</p>
          <a href="https://twitter.com/contentrenderer" class="community-card__link" target="_blank" rel="noopener noreferrer">Follow Us &rarr;</a>
        </div>

      </div>
    </div>
  </section>

  <!-- ============================================================
       FOOTER
       ============================================================ -->
  <footer class="footer">
    <div class="container">
      <div class="footer__grid">

        <div>
          <div class="nav__logo" style="margin-bottom:0;">
            <span class="nav__logo-icon">CR</span>
            <span>content-renderer</span>
          </div>
          <p class="footer__brand-desc">
            Universal content rendering for React and React Native. Auto-detect, parse, and render
            HTML, JSON, Markdown, code, XML, CSS and more.
          </p>
        </div>

        <div>
          <h5 class="footer__heading">Packages</h5>
          <div class="footer__links">
            <a href="https://www.npmjs.com/package/@content-renderer/core" class="footer__link" target="_blank" rel="noopener noreferrer">Core</a>
            <a href="https://www.npmjs.com/package/@content-renderer/react-and-native" class="footer__link" target="_blank" rel="noopener noreferrer">React</a>
          </div>
        </div>

        <div>
          <h5 class="footer__heading">Resources</h5>
          <div class="footer__links">
            <a href="https://github.com/content-renderer/content-renderer/blob/main/docs/API.md" class="footer__link" target="_blank" rel="noopener noreferrer">API Docs</a>
            <a href="#examples" class="footer__link">Examples</a>
            <a href="https://github.com/content-renderer/content-renderer/blob/main/CHANGELOG.md" class="footer__link" target="_blank" rel="noopener noreferrer">Changelog</a>
            <a href="https://github.com/content-renderer/content-renderer/blob/main/CONTRIBUTING.md" class="footer__link" target="_blank" rel="noopener noreferrer">Contributing</a>
          </div>
        </div>

        <div>
          <h5 class="footer__heading">Community</h5>
          <div class="footer__links">
            <a href="https://github.com/content-renderer/content-renderer" class="footer__link" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://discord.gg/content-renderer" class="footer__link" target="_blank" rel="noopener noreferrer">Discord</a>
            <a href="https://twitter.com/contentrenderer" class="footer__link" target="_blank" rel="noopener noreferrer">Twitter / X</a>
            <a href="https://github.com/content-renderer/content-renderer/issues" class="footer__link" target="_blank" rel="noopener noreferrer">Issues</a>
          </div>
        </div>

      </div>

      <div class="footer__bottom">
        <p class="footer__copyright">&copy; <?php echo $year; ?> content-renderer contributors. All rights reserved.</p>
        <p class="footer__license">Released under the MIT License. v<?php echo htmlspecialchars($version); ?></p>
      </div>
    </div>
  </footer>

  <!-- Back to Top -->
  <button class="back-to-top" aria-label="Back to top" title="Back to top">&#8593;</button>

  <!-- Toast Notification -->
  <div class="toast" role="status" aria-live="polite"></div>

  <!-- Scripts -->
  <script src="assets/script.js"></script>
</body>
</html>
