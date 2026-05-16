<?php
/**
 * ContentRenderer  - Promotional Landing Page
 * Universal content rendering for React and React Native
 */

$packages = [
    [
        'name' => '@laddhaanshul/content-renderer-core',
        'version' => '1.0.0',
        'desc' => 'Core parsing, utilities, hooks, plugins, themes, accessibility, SSR, i18n, error recovery, benchmarks & PDF export.',
        'exports' => ['/parsers', '/utils', '/hooks', '/plugins', '/themes', '/types'],
        'deps' => ['htmlparser2 ^9.0.0', 'entities ^4.5.0', 'css-tree ^2.3.1'],
        'peers' => [],
        'icon' => '&#9881;'
    ],
    [
        'name' => '@laddhaanshul/content-renderer',
        'version' => '1.0.0',
        'desc' => 'React + React Native components for all content types with animation hooks and unified web/native support.',
        'exports' => ['/parsers', '/hooks', '/themes', '/utils', '/native'],
        'deps' => ['@laddhaanshul/content-renderer-core 1.0.0', 'entities ^4.5.0', 'htmlparser2 ^9.0.0'],
        'peers' => ['react >=17.0.0', 'react-dom >=17.0.0', 'react-native >=0.68.0'],
        'icon' => '&#9883;'
    ],
    [
        'name' => '@laddhaanshul/content-renderer',
        'version' => '1.0.0',
        'desc' => 'Dedicated React Native components for HTML, PHP, JSON, XML, Markdown & code with native primitives.',
        'exports' => [],
        'deps' => ['@laddhaanshul/content-renderer-core 1.0.0', 'htmlparser2 ^9.0.0', 'entities ^4.5.0'],
        'peers' => ['react >=17.0.0', 'react-native >=0.68.0'],
        'icon' => '&#9743;'
    ]
];

$features = [
    ['icon' => '&#127912;', 'title' => 'Auto Content Detection', 'desc' => 'Automatically detects HTML, HTML5, JSON, XML, PHP, Markdown, CSS, JavaScript, TypeScript, YAML, and plain text from content strings with zero config.'],
    ['icon' => '&#128196;', 'title' => 'HTML/HTML5 Rendering', 'desc' => 'Full DOM support with custom component overrides, XSS sanitization, SVG support, inline style parsing, event handlers, and scoped CSS injection.'],
    ['icon' => '&#127919;', 'title' => 'CSS Engine', 'desc' => 'Full CSS parsing with selector matching (type, class, ID, attribute, pseudo-class, combinators), specificity calculation, CSS variables, calc(), @media queries, and scoped injection.'],
    ['icon' => '&#128221;', 'title' => 'Enhanced Markdown', 'desc' => 'Full GFM plus reference links, footnotes, definition lists, math blocks, emoji shortcodes (30+), subscript/superscript, highlight syntax, and autolinks.'],
    ['icon' => '&#128187;', 'title' => 'Code Syntax Highlighting', 'desc' => '15+ language support with line numbers, line highlighting, copy button, dark/light themes, and customizable font sizes.'],
    ['icon' => '&#128203;', 'title' => 'JSON Interactive Viewer', 'desc' => 'Collapsible tree view with search/filter, data type badges, copy-to-clipboard, sort keys, JSONPath querying, and dark/light themes.'],
    ['icon' => '&#128206;', 'title' => 'SVG Renderer (Native)', 'desc' => '21 SVG elements supported on React Native with zero external dependencies: paths, shapes, text, ViewBox transforms, and gradients.'],
    ['icon' => '&#128241;', 'title' => 'Virtualized Rendering', 'desc' => 'FlatList-based virtualization on native and CSS content-visibility containment on web for efficient rendering of large documents.'],
    ['icon' => '&#128274;', 'title' => 'XSS Sanitization', 'desc' => 'Built-in XSS protection with configurable allowed tags, attributes, and strip rules. Protects all rendered HTML content by default.'],
    ['icon' => '&#127760;', 'title' => 'i18n & RTL Support', 'desc' => '42 supported locales, 13 RTL locales, locale-aware number/date formatting, localized UI strings in 13 languages, and automatic direction detection.'],
    ['icon' => '&#127917;', 'title' => 'Animation Hooks', 'desc' => 'useFadeIn, useSlideIn, useCollapseAnimation, useThemeTransition, useScrollAnimation, useTypewriter, and more CSS-based animations.'],
    ['icon' => '&#128196;', 'title' => 'PDF Export', 'desc' => 'Export rendered content to PDF with full styling, page breaks, and print-optimized layouts via browser print API.'],
    ['icon' => '&#128295;', 'title' => 'Plugin System', 'desc' => 'PluginManager with lifecycle hooks (beforeParse, afterParse, beforeRender, afterRender, transformNode, extractData) and 8 built-in plugins.'],
    ['icon' => '&#9854;', 'title' => 'Accessibility (WCAG 2.0)', 'desc' => 'ARIA role mapping, attribute generation, color contrast checking, document outline validation, and screen reader text generation.'],
    ['icon' => '&#128640;', 'title' => 'SSR / Next.js', 'desc' => 'renderToString, renderToStaticMarkup, extractMetadataForSSR, generateHeadTags, generateStructuredData (JSON-LD), and environment detection.'],
    ['icon' => '&#128736;', 'title' => 'Error Recovery', 'desc' => 'Intelligent fallback strategies for HTML, JSON, Markdown, CSS, and XML errors with human-readable fix suggestions and recovery attempts.'],
    ['icon' => '&#127973;', 'title' => 'Content Service', 'desc' => 'Fetch content from APIs (AEM, headless CMS, REST) with auto-detection, 9 extraction strategies, caching, retry, and polling.'],
    ['icon' => '&#9889;', 'title' => 'Real-Time Streaming', 'desc' => 'Render HTML or AST chunks dynamically in real-time. Ideal for generative AI, LLM text streams, or progressive page loads.'],
    ['icon' => '&#128230;', 'title' => 'Tree-Shaking Exports', 'desc' => 'Sub-path exports for parsers, utils, hooks, plugins, themes, and types. Import only what you need to keep bundles minimal.'],
    ['icon' => '&#128270;', 'title' => 'Content Extraction', 'desc' => 'Extract links, images, scripts, styles, meta tags, headings, tables, forms, lists, code blocks, SEO, OpenGraph, Twitter Cards, and more.']
];

$plugins = [
    ['name' => 'lineNumbers', 'hook' => 'afterParse', 'desc' => 'Adds line numbers to code blocks'],
    ['name' => 'sanitize', 'hook' => 'beforeRender', 'desc' => 'Applies HTML sanitization'],
    ['name' => 'toc', 'hook' => 'extractData', 'desc' => 'Generates table of contents'],
    ['name' => 'metaEnricher', 'hook' => 'afterParse', 'desc' => 'Enriches metadata with SEO data'],
    ['name' => 'linkRewrite', 'hook' => 'transformNode', 'desc' => 'Rewrites link URLs via mapping'],
    ['name' => 'imageProxy', 'hook' => 'transformNode', 'desc' => 'Proxies images through CDN'],
    ['name' => 'emoji', 'hook' => 'afterParse', 'desc' => 'Converts emoji shortcodes to Unicode'],
    ['name' => 'headingAnchor', 'hook' => 'transformNode', 'desc' => 'Adds anchor IDs to headings']
];

$components = [
    ['name' => 'ContentRenderer', 'desc' => 'Universal auto-detection renderer'],
    ['name' => 'HTMLRenderer', 'desc' => 'Full HTML/HTML5 with CSS engine'],
    ['name' => 'MarkdownRenderer', 'desc' => 'GFM + extended syntax support'],
    ['name' => 'JSONRenderer', 'desc' => 'Interactive tree viewer'],
    ['name' => 'CodeRenderer', 'desc' => 'Syntax-highlighted code blocks'],
    ['name' => 'PHPRenderer', 'desc' => 'PHP code with PHPDoc extraction'],
    ['name' => 'XMLRenderer', 'desc' => 'Collapsible XML tree viewer'],
    ['name' => 'CSSRenderer', 'desc' => 'CSS syntax highlighting'],
    ['name' => 'DiffRenderer', 'desc' => 'Side-by-side diff viewer'],
    ['name' => 'SVGRenderer', 'desc' => '21 SVG elements on native'],
    ['name' => 'ContentServiceRenderer', 'desc' => 'API content fetch & render'],
    ['name' => 'VirtualizedHTMLRenderer', 'desc' => 'Large document virtualization'],
    ['name' => 'StreamingContentRenderer', 'desc' => 'Real-time incremental chunk rendering'],
];

$parsers = [
    ['name' => 'HTMLParser', 'features' => 'Full DOM, query selectors, serialization, validation'],
    ['name' => 'JSONParser', 'features' => 'JSONPath, diff, schema inference, flatten/unflatten'],
    ['name' => 'XMLParser', 'features' => 'XPath queries, namespaces, toObject conversion'],
    ['name' => 'MarkdownParser', 'features' => 'GFM, frontmatter, TOC, link/image extraction'],
    ['name' => 'PHPParser', 'features' => 'Class/function/variable extraction, PHPDoc'],
    ['name' => 'CSSParser', 'features' => 'Specificity, media queries, keyframes, variables'],
    ['name' => 'CSEngine', 'features' => 'Cascade, CSS vars, calc(), @media evaluation'],
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ContentRenderer  - Universal Content Rendering for React & React Native</title>
    <meta name="description" content="Parse and render HTML, PHP, JSON, XML, Markdown, CSS, and source code as React components with zero-config auto-detection.">
    <meta name="keywords" content="react, react-native, content-renderer, html, markdown, json, parser, code-highlighting, php, xml, css">
    <style>
        :root {
            --primary: #6366f1;
            --primary-dark: #4f46e5;
            --primary-light: #818cf8;
            --accent: #06b6d4;
            --accent2: #8b5cf6;
            --bg-dark: #0f172a;
            --bg-darker: #020617;
            --bg-card: #1e293b;
            --bg-card-hover: #334155;
            --text: #f1f5f9;
            --text-muted: #94a3b8;
            --text-bright: #ffffff;
            --border: #334155;
            --success: #22c55e;
            --warning: #f59e0b;
            --gradient-1: linear-gradient(135deg, #6366f1, #06b6d4);
            --gradient-2: linear-gradient(135deg, #8b5cf6, #ec4899);
            --gradient-3: linear-gradient(135deg, #06b6d4, #22c55e);
            --gradient-hero: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        html { scroll-behavior: smooth; }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: var(--bg-dark);
            color: var(--text);
            line-height: 1.6;
            overflow-x: hidden;
        }

        /* === NAVBAR === */
        .navbar {
            position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
            background: rgba(15, 23, 42, 0.85);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(99, 102, 241, 0.15);
            padding: 0 2rem;
            transition: all 0.3s ease;
        }
        .navbar.scrolled { background: rgba(15, 23, 42, 0.95); box-shadow: 0 4px 30px rgba(0,0,0,0.3); }
        .navbar-inner {
            max-width: 1280px; margin: 0 auto;
            display: flex; align-items: center; justify-content: space-between;
            height: 64px;
        }
        .logo {
            font-size: 1.3rem; font-weight: 700;
            background: var(--gradient-1); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            display: flex; align-items: center; gap: 0.5rem;
        }
        .logo span { font-size: 1.5rem; }
        .nav-links { display: flex; gap: 2rem; list-style: none; }
        .nav-links a {
            color: var(--text-muted); text-decoration: none; font-size: 0.9rem;
            font-weight: 500; transition: color 0.2s;
        }
        .nav-links a:hover { color: var(--text-bright); }
        .nav-cta {
            background: var(--gradient-1); color: white; border: none;
            padding: 0.5rem 1.25rem; border-radius: 8px; font-weight: 600;
            font-size: 0.85rem; cursor: pointer; text-decoration: none;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .nav-cta:hover { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(99,102,241,0.4); }
        .mobile-toggle { display: none; background: none; border: none; color: var(--text); font-size: 1.5rem; cursor: pointer; }

        /* === HERO === */
        .hero {
            min-height: 100vh; display: flex; align-items: center; justify-content: center;
            background: var(--gradient-hero); position: relative; overflow: hidden; padding: 6rem 2rem 4rem;
        }
        .hero::before {
            content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
            background: radial-gradient(circle at 30% 50%, rgba(99,102,241,0.08) 0%, transparent 50%),
                        radial-gradient(circle at 70% 50%, rgba(6,182,212,0.06) 0%, transparent 50%);
            animation: heroGlow 8s ease-in-out infinite alternate;
        }
        @keyframes heroGlow { 0% { transform: translate(0, 0); } 100% { transform: translate(-5%, 5%); } }
        .hero-grid {
            position: absolute; inset: 0;
            background-image: linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px);
            background-size: 60px 60px;
            mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
        }
        .hero-content { position: relative; z-index: 1; text-align: center; max-width: 900px; }
        .hero-badge {
            display: inline-flex; align-items: center; gap: 0.5rem;
            background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.25);
            padding: 0.4rem 1rem; border-radius: 100px; font-size: 0.8rem;
            color: var(--primary-light); margin-bottom: 2rem;
        }
        .hero-badge .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--success); animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .hero h1 {
            font-size: clamp(2.5rem, 6vw, 4.5rem); font-weight: 800;
            line-height: 1.1; margin-bottom: 1.5rem;
        }
        .hero h1 .gradient {
            background: var(--gradient-1); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .hero p {
            font-size: clamp(1rem, 2vw, 1.25rem); color: var(--text-muted);
            max-width: 700px; margin: 0 auto 2.5rem; line-height: 1.7;
        }
        .hero-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
        .btn-primary {
            background: var(--gradient-1); color: white; border: none;
            padding: 0.85rem 2rem; border-radius: 12px; font-weight: 600;
            font-size: 1rem; cursor: pointer; text-decoration: none;
            transition: transform 0.2s, box-shadow 0.2s;
            display: inline-flex; align-items: center; gap: 0.5rem;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(99,102,241,0.4); }
        .btn-outline {
            background: transparent; color: var(--text); border: 1px solid var(--border);
            padding: 0.85rem 2rem; border-radius: 12px; font-weight: 600;
            font-size: 1rem; cursor: pointer; text-decoration: none;
            transition: all 0.2s; display: inline-flex; align-items: center; gap: 0.5rem;
        }
        .btn-outline:hover { border-color: var(--primary-light); background: rgba(99,102,241,0.05); }
        .hero-stats {
            display: flex; justify-content: center; gap: 3rem; margin-top: 4rem;
            padding-top: 3rem; border-top: 1px solid rgba(99,102,241,0.1);
        }
        .stat { text-align: center; }
        .stat-num {
            font-size: 2rem; font-weight: 700;
            background: var(--gradient-1); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .stat-label { font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem; }

        /* === SECTIONS === */
        section { padding: 6rem 2rem; max-width: 1280px; margin: 0 auto; }
        .section-label {
            display: inline-flex; align-items: center; gap: 0.5rem;
            font-size: 0.8rem; font-weight: 600; text-transform: uppercase;
            letter-spacing: 0.1em; color: var(--primary-light); margin-bottom: 1rem;
        }
        .section-label::before { content: ''; width: 20px; height: 2px; background: var(--primary); }
        .section-title {
            font-size: clamp(2rem, 4vw, 3rem); font-weight: 700;
            margin-bottom: 1rem; line-height: 1.2;
        }
        .section-desc {
            font-size: 1.1rem; color: var(--text-muted); max-width: 650px;
            margin-bottom: 3rem; line-height: 1.7;
        }
        .text-center { text-align: center; }
        .mx-auto { margin-left: auto; margin-right: auto; }

        /* === FEATURES GRID === */
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.25rem;
        }
        .feature-card {
            background: var(--bg-card); border: 1px solid var(--border);
            border-radius: 16px; padding: 1.75rem;
            transition: all 0.3s ease; position: relative; overflow: hidden;
        }
        .feature-card:hover {
            border-color: rgba(99,102,241,0.3);
            transform: translateY(-3px);
            box-shadow: 0 8px 30px rgba(0,0,0,0.3);
        }
        .feature-card::before {
            content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
            background: var(--gradient-1); opacity: 0; transition: opacity 0.3s;
        }
        .feature-card:hover::before { opacity: 1; }
        .feature-icon {
            font-size: 1.8rem; margin-bottom: 1rem;
            width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;
            background: rgba(99,102,241,0.1); border-radius: 12px;
        }
        .feature-card h3 { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-bright); }
        .feature-card p { font-size: 0.9rem; color: var(--text-muted); line-height: 1.6; }

        /* === PACKAGES === */
        .packages-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 1.5rem; }
        .package-card {
            background: var(--bg-card); border: 1px solid var(--border);
            border-radius: 20px; padding: 2rem; position: relative; overflow: hidden;
            transition: all 0.3s;
        }
        .package-card:hover { border-color: rgba(99,102,241,0.3); transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.3); }
        .package-card.featured { border-color: var(--primary); }
        .package-card.featured::before {
            content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
            background: var(--gradient-1);
        }
        .pkg-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.25rem; }
        .pkg-icon {
            width: 50px; height: 50px; border-radius: 14px;
            background: rgba(99,102,241,0.1); display: flex; align-items: center; justify-content: center;
            font-size: 1.5rem;
        }
        .pkg-name { font-size: 1.15rem; font-weight: 700; color: var(--text-bright); }
        .pkg-version {
            display: inline-block; font-size: 0.7rem; font-weight: 600;
            background: rgba(99,102,241,0.15); color: var(--primary-light);
            padding: 0.15rem 0.5rem; border-radius: 6px; margin-top: 0.25rem;
        }
        .pkg-desc { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.25rem; line-height: 1.6; }
        .pkg-section { margin-bottom: 1rem; }
        .pkg-section-title { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); margin-bottom: 0.5rem; font-weight: 600; }
        .pkg-tags { display: flex; flex-wrap: wrap; gap: 0.4rem; }
        .pkg-tag {
            font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 6px;
            background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.15);
            color: var(--primary-light);
        }

        /* === CODE BLOCKS === */
        .code-section { background: var(--bg-darker); border-radius: 24px; padding: 3rem; margin-top: 2rem; }
        .code-tabs { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .code-tab {
            padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.8rem;
            background: transparent; border: 1px solid var(--border); color: var(--text-muted);
            cursor: pointer; transition: all 0.2s; font-family: inherit;
        }
        .code-tab.active { background: var(--primary); border-color: var(--primary); color: white; }
        .code-tab:hover:not(.active) { border-color: var(--primary-light); color: var(--text); }
        .code-block {
            background: #0d1117; border: 1px solid var(--border); border-radius: 12px;
            overflow: hidden; position: relative;
        }
        .code-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 0.75rem 1.25rem; background: rgba(255,255,255,0.03);
            border-bottom: 1px solid var(--border); font-size: 0.8rem; color: var(--text-muted);
        }
        .code-dots { display: flex; gap: 6px; }
        .code-dots span { width: 10px; height: 10px; border-radius: 50%; }
        .code-dots span:nth-child(1) { background: #ef4444; }
        .code-dots span:nth-child(2) { background: #f59e0b; }
        .code-dots span:nth-child(3) { background: #22c55e; }
        .code-copy {
            background: rgba(255,255,255,0.05); border: 1px solid var(--border);
            color: var(--text-muted); padding: 0.25rem 0.75rem; border-radius: 6px;
            font-size: 0.75rem; cursor: pointer; transition: all 0.2s; font-family: inherit;
        }
        .code-copy:hover { color: var(--text); border-color: var(--primary-light); }
        .code-body { padding: 1.25rem; overflow-x: auto; }
        .code-body pre { font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 0.85rem; line-height: 1.7; color: #e6edf3; }
        .code-body .comment { color: #8b949e; }
        .code-body .keyword { color: #ff7b72; }
        .code-body .string { color: #a5d6ff; }
        .code-body .func { color: #d2a8ff; }
        .code-body .type { color: #79c0ff; }
        .code-body .tag { color: #7ee787; }
        .code-body .attr { color: #79c0ff; }
        .code-body .prop { color: #ffa657; }

        /* === PLUGIN TABLE === */
        .plugin-table-wrap { overflow-x: auto; }
        .plugin-table {
            width: 100%; border-collapse: collapse;
            background: var(--bg-card); border-radius: 12px; overflow: hidden;
        }
        .plugin-table th {
            text-align: left; padding: 1rem 1.25rem; font-size: 0.75rem;
            text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted);
            background: rgba(99,102,241,0.05); border-bottom: 1px solid var(--border);
        }
        .plugin-table td {
            padding: 0.85rem 1.25rem; border-bottom: 1px solid rgba(51,65,85,0.5);
            font-size: 0.9rem;
        }
        .plugin-table tr:last-child td { border-bottom: none; }
        .plugin-table tr:hover td { background: rgba(99,102,241,0.03); }
        .hook-badge {
            display: inline-block; font-size: 0.7rem; font-weight: 600;
            padding: 0.15rem 0.5rem; border-radius: 4px;
            background: rgba(6,182,212,0.1); color: var(--accent); border: 1px solid rgba(6,182,212,0.2);
        }

        /* === COMPONENTS GRID === */
        .comp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 0.75rem; }
        .comp-item {
            display: flex; align-items: center; gap: 0.75rem;
            background: var(--bg-card); border: 1px solid var(--border);
            padding: 1rem 1.25rem; border-radius: 12px;
            transition: all 0.2s;
        }
        .comp-item:hover { border-color: rgba(99,102,241,0.3); transform: translateX(4px); }
        .comp-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--primary); flex-shrink: 0; }
        .comp-name { font-weight: 600; font-size: 0.9rem; color: var(--text-bright); }
        .comp-desc { font-size: 0.8rem; color: var(--text-muted); }

        /* === ARCHITECTURE === */
        .arch-section { background: var(--bg-darker); border-radius: 24px; padding: 3rem; }
        .arch-diagram {
            display: flex; flex-direction: column; align-items: center; gap: 1.5rem;
            padding: 2rem 0;
        }
        .arch-layer {
            display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;
        }
        .arch-box {
            background: var(--bg-card); border: 1px solid var(--border);
            padding: 1rem 1.5rem; border-radius: 12px; text-align: center;
            min-width: 140px; transition: all 0.3s;
        }
        .arch-box:hover { border-color: var(--primary); transform: translateY(-2px); }
        .arch-box.wide { min-width: 300px; background: rgba(99,102,241,0.08); border-color: rgba(99,102,241,0.25); }
        .arch-box h4 { font-size: 0.85rem; font-weight: 700; margin-bottom: 0.25rem; }
        .arch-box p { font-size: 0.75rem; color: var(--text-muted); }
        .arch-arrow { font-size: 1.5rem; color: var(--primary-light); }

        /* === FOOTER === */
        .footer {
            border-top: 1px solid var(--border); padding: 4rem 2rem 2rem;
            background: var(--bg-darker);
        }
        .footer-inner { max-width: 1280px; margin: 0 auto; }
        .footer-top { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 3rem; margin-bottom: 3rem; }
        .footer-brand .logo { font-size: 1.5rem; margin-bottom: 1rem; }
        .footer-brand p { color: var(--text-muted); font-size: 0.9rem; line-height: 1.7; max-width: 350px; }
        .footer-col h4 { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); margin-bottom: 1rem; }
        .footer-col a { display: block; color: var(--text); text-decoration: none; font-size: 0.9rem; padding: 0.3rem 0; transition: color 0.2s; }
        .footer-col a:hover { color: var(--primary-light); }
        .footer-bottom {
            display: flex; align-items: center; justify-content: space-between;
            padding-top: 2rem; border-top: 1px solid var(--border);
            font-size: 0.85rem; color: var(--text-muted);
        }
        .footer-bottom a { color: var(--primary-light); text-decoration: none; }

        /* === RESPONSIVE === */
        @media (max-width: 768px) {
            .nav-links { display: none; }
            .mobile-toggle { display: block; }
            .hero-stats { flex-direction: column; gap: 1.5rem; }
            .packages-grid { grid-template-columns: 1fr; }
            .features-grid { grid-template-columns: 1fr; }
            .footer-top { grid-template-columns: 1fr 1fr; gap: 2rem; }
            .code-section { padding: 1.5rem; }
            .arch-section { padding: 1.5rem; }
            .hero-actions { flex-direction: column; align-items: center; }
            section { padding: 4rem 1.25rem; }
        }

        /* === ANIMATIONS === */
        .fade-up { opacity: 0; transform: translateY(30px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .fade-up.visible { opacity: 1; transform: translateY(0); }
        .stagger-1 { transition-delay: 0.05s; }
        .stagger-2 { transition-delay: 0.1s; }
        .stagger-3 { transition-delay: 0.15s; }
        .stagger-4 { transition-delay: 0.2s; }
        .stagger-5 { transition-delay: 0.25s; }
        .stagger-6 { transition-delay: 0.3s; }

        /* === SCROLLBAR === */
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: var(--bg-dark); }
        ::-webkit-scrollbar-thumb { background: var(--bg-card-hover); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--primary); }

        /* Floating particles */
        .particles { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
        .particle {
            position: absolute; width: 4px; height: 4px; border-radius: 50%;
            background: rgba(99,102,241,0.3);
            animation: float 15s infinite linear;
        }
        @keyframes float {
            0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(-100px) rotate(720deg); opacity: 0; }
        }

        .highlight-strip {
            height: 4px; width: 80px; border-radius: 2px;
            background: var(--gradient-1); margin-bottom: 2rem;
        }
        .highlight-strip.center { margin-left: auto; margin-right: auto; }
    </style>
</head>
<body>

<!-- NAVBAR -->
<nav class="navbar" id="navbar">
    <div class="navbar-inner">
        <div class="logo">
            <span>&#9670;</span> ContentRenderer 
        </div>
        <ul class="nav-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#packages">Packages</a></li>
            <li><a href="#code">Quick Start</a></li>
            <li><a href="#components">Components</a></li>
            <li><a href="#plugins">Plugins</a></li>
            <li><a href="#architecture">Architecture</a></li>
        </ul>
        <a href="#install" class="nav-cta">Install Now</a>
        <button class="mobile-toggle" onclick="document.querySelector('.nav-links').classList.toggle('show')" aria-label="Toggle menu">&#9776;</button>
    </div>
</nav>

<!-- HERO -->
<section class="hero">
    <div class="hero-grid"></div>
    <div class="particles" id="particles"></div>
    <div class="hero-content">
        <div class="hero-badge">
            <span class="dot"></span> v1.0.0 &mdash; MIT License &mdash; Zero External Runtime Dependencies
        </div>
        <h1>
            Universal Content<br>
            <span class="gradient">Rendering Library</span>
        </h1>
        <p>
            Parse and render HTML, PHP, JSON, XML, Markdown, CSS, and source code as React components with
            zero-config auto-detection. One unified API for web and React Native.
        </p>
        <div class="hero-actions">
            <a href="#install" class="btn-primary">
                &#9889; Get Started
            </a>
            <a href="#features" class="btn-outline">
                Explore Features &#8595;
            </a>
        </div>
        <div class="hero-stats">
            <div class="stat">
                <div class="stat-num">7</div>
                <div class="stat-label">Content Parsers</div>
            </div>
            <div class="stat">
                <div class="stat-num">12+</div>
                <div class="stat-label">React Components</div>
            </div>
            <div class="stat">
                <div class="stat-num">8</div>
                <div class="stat-label">Built-in Plugins</div>
            </div>
            <div class="stat">
                <div class="stat-num">42</div>
                <div class="stat-label">i18n Locales</div>
            </div>
            <div class="stat">
                <div class="stat-num">15+</div>
                <div class="stat-label">Code Languages</div>
            </div>
            <div class="stat">
                <div class="stat-num">18+</div>
                <div class="stat-label">Feature Modules</div>
            </div>
        </div>
    </div>
</section>

<!-- FEATURES -->
<section id="features">
    <div class="text-center">
        <div class="section-label" style="justify-content:center;">Features</div>
        <div class="highlight-strip center"></div>
        <h2 class="section-title">Everything You Need for<br>Content Rendering</h2>
        <p class="section-desc mx-auto">
            A comprehensive toolkit that handles every aspect of content parsing, rendering, and manipulation
            across web and mobile platforms.
        </p>
    </div>
    <div class="features-grid">
        <?php foreach ($features as $i => $f): ?>
        <div class="feature-card fade-up stagger-<?php echo ($i % 6) + 1; ?>">
            <div class="feature-icon"><?= $f['icon'] ?></div>
            <h3><?= htmlspecialchars($f['title']) ?></h3>
            <p><?= htmlspecialchars($f['desc']) ?></p>
        </div>
        <?php endforeach; ?>
    </div>
</section>

<!-- PACKAGES -->
<section id="packages">
    <div class="section-label">Packages</div>
    <div class="highlight-strip"></div>
    <h2 class="section-title">Three Packages, One Ecosystem</h2>
    <p class="section-desc">
        Install only what you need. Each package is independently versioned with sub-path exports for optimized tree-shaking.
    </p>
    <div class="packages-grid">
        <?php foreach ($packages as $i => $pkg): ?>
        <div class="package-card <?= $i === 1 ? 'featured' : '' ?> fade-up">
            <div class="pkg-header">
                <div class="pkg-icon"><?= $pkg['icon'] ?></div>
                <div>
                    <div class="pkg-name"><?= htmlspecialchars($pkg['name']) ?></div>
                    <div class="pkg-version">v<?= $pkg['version'] ?></div>
                </div>
            </div>
            <p class="pkg-desc"><?= htmlspecialchars($pkg['desc']) ?></p>

            <?php if (!empty($pkg['exports'])): ?>
            <div class="pkg-section">
                <div class="pkg-section-title">Sub-path Exports</div>
                <div class="pkg-tags">
                    <?php foreach ($pkg['exports'] as $exp): ?>
                    <span class="pkg-tag"><?= htmlspecialchars($exp) ?></span>
                    <?php endforeach; ?>
                </div>
            </div>
            <?php endif; ?>

            <div class="pkg-section">
                <div class="pkg-section-title">Dependencies</div>
                <div class="pkg-tags">
                    <?php foreach ($pkg['deps'] as $dep): ?>
                    <span class="pkg-tag"><?= htmlspecialchars($dep) ?></span>
                    <?php endforeach; ?>
                </div>
            </div>

            <?php if (!empty($pkg['peers'])): ?>
            <div class="pkg-section">
                <div class="pkg-section-title">Peer Dependencies</div>
                <div class="pkg-tags">
                    <?php foreach ($pkg['peers'] as $peer): ?>
                    <span class="pkg-tag"><?= htmlspecialchars($peer) ?></span>
                    <?php endforeach; ?>
                </div>
            </div>
            <?php endif; ?>
        </div>
        <?php endforeach; ?>
    </div>
</section>

<!-- INSTALL & CODE -->
<section id="install">
    <div class="section-label">Getting Started</div>
    <div class="highlight-strip"></div>
    <h2 class="section-title">Install in Seconds</h2>
    <p class="section-desc">
        Add ContentRenderer to your project with your preferred package manager. No complex configuration required.
    </p>
    <div class="code-section">
        <div class="code-tabs" id="installTabs">
            <button class="code-tab active" data-tab="npm">npm</button>
            <button class="code-tab" data-tab="yarn">yarn</button>
            <button class="code-tab" data-tab="pnpm">pnpm</button>
        </div>
        <div class="code-block">
            <div class="code-header">
                <div class="code-dots"><span></span><span></span><span></span></div>
                <span>Terminal</span>
                <button class="code-copy" onclick="copyCode(this)">Copy</button>
            </div>
            <div class="code-body" id="installCode">
<pre><span class="comment"># Install core package (parsers, utilities, hooks)</span>
npm install @laddhaanshul/content-renderer-core

<span class="comment"># Install React + React Native package</span>
npm install @laddhaanshul/content-renderer
            </div>
        </div>
    </div>
</section>

<!-- CODE EXAMPLES -->
<section id="code">
    <div class="section-label">Code Examples</div>
    <div class="highlight-strip"></div>
    <h2 class="section-title">Simple API, Powerful Results</h2>
    <p class="section-desc">
        Zero-config auto-detection means you can start rendering content immediately with just a single component.
    </p>
    <div class="code-section">
        <div class="code-tabs" id="exampleTabs">
            <button class="code-tab active" data-tab="auto">Auto-Detection</button>
            <button class="code-tab" data-tab="html">HTML Renderer</button>
            <button class="code-tab" data-tab="markdown">Markdown</button>
            <button class="code-tab" data-tab="json">JSON Viewer</button>
            <button class="code-tab" data-tab="code">Code Highlight</button>
            <button class="code-tab" data-tab="css">CSS Engine</button>
        </div>
        <div class="code-block">
            <div class="code-header">
                <div class="code-dots"><span></span><span></span><span></span></div>
                <span id="exampleFile">App.tsx</span>
                <button class="code-copy" onclick="copyCode(this)">Copy</button>
            </div>
            <div class="code-body" id="exampleCode">
<pre><span class="keyword">import</span> { <span class="func">ContentRenderer</span> } <span class="keyword">from</span> <span class="string">'@laddhaanshul/content-renderer'</span>;

<span class="keyword">function</span> <span class="func">App</span>() {
  <span class="keyword">const</span> content = <span class="string">'&lt;h1&gt;Hello World&lt;/h1&gt;&lt;p&gt;This is &lt;strong&gt;HTML&lt;/strong&gt; content.&lt;/p&gt;'</span>;
  <span class="keyword">return</span> &lt;<span class="tag">ContentRenderer</span> <span class="attr">content</span>={content} /&gt;;
}</pre>
            </div>
        </div>
    </div>
</section>

<!-- COMPONENTS -->
<section id="components">
    <div class="text-center">
        <div class="section-label" style="justify-content:center;">Components</div>
        <div class="highlight-strip center"></div>
        <h2 class="section-title">12+ Ready-to-Use Components</h2>
        <p class="section-desc mx-auto">
            Every component works on both web and React Native with platform-appropriate rendering.
            Each accepts extensive props for customization.
        </p>
    </div>
    <div class="comp-grid">
        <?php foreach ($components as $comp): ?>
        <div class="comp-item fade-up">
            <div class="comp-dot"></div>
            <div>
                <div class="comp-name"><?= htmlspecialchars($comp['name']) ?></div>
                <div class="comp-desc"><?= htmlspecialchars($comp['desc']) ?></div>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
</section>

<!-- PARSERS -->
<section id="parsers">
    <div class="section-label">Parsers</div>
    <div class="highlight-strip"></div>
    <h2 class="section-title">7 Powerful Parsers</h2>
    <p class="section-desc">
        Each parser provides comprehensive methods for parsing, validating, querying, and transforming content.
    </p>
    <div class="code-section">
        <div class="plugin-table-wrap">
            <table class="plugin-table">
                <thead>
                    <tr>
                        <th>Parser</th>
                        <th>Key Capabilities</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($parsers as $p): ?>
                    <tr>
                        <td style="font-weight:600; color:var(--text-bright);"><?= htmlspecialchars($p['name']) ?></td>
                        <td style="color:var(--text-muted);"><?= htmlspecialchars($p['features']) ?></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</section>

<!-- PLUGINS -->
<section id="plugins">
    <div class="section-label">Plugin System</div>
    <div class="highlight-strip"></div>
    <h2 class="section-title">Extensible Plugin Architecture</h2>
    <p class="section-desc">
        The PluginManager provides priority-based plugin hooks for every stage of the content rendering pipeline.
        Register custom plugins or use 8 production-ready built-in plugins.
    </p>
    <div class="code-section">
        <div class="plugin-table-wrap">
            <table class="plugin-table">
                <thead>
                    <tr>
                        <th>Plugin</th>
                        <th>Hook</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($plugins as $pl): ?>
                    <tr>
                        <td style="font-weight:600; color:var(--text-bright);"><?= htmlspecialchars($pl['name']) ?></td>
                        <td><span class="hook-badge"><?= htmlspecialchars($pl['hook']) ?></span></td>
                        <td style="color:var(--text-muted);"><?= htmlspecialchars($pl['desc']) ?></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>

        <div style="margin-top: 2rem;">
            <div class="code-block">
                <div class="code-header">
                    <div class="code-dots"><span></span><span></span><span></span></div>
                    <span>Plugin Registration</span>
                    <button class="code-copy" onclick="copyCode(this)">Copy</button>
                </div>
                <div class="code-body">
<pre><span class="keyword">import</span> { <span class="func">PluginManager</span>, <span class="prop">builtInPlugins</span> } <span class="keyword">from</span> <span class="string">'@laddhaanshul/content-renderer-core'</span>;

<span class="keyword">const</span> manager = <span class="keyword">new</span> <span class="func">PluginManager</span>();
manager.<span class="func">use</span>(<span class="prop">builtInPlugins</span>.<span class="func">lineNumbers</span>());
manager.<span class="func">use</span>(<span class="prop">builtInPlugins</span>.<span class="func">sanitize</span>({ <span class="prop">allowedTags</span>: [<span class="string">'p'</span>, <span class="string">'a'</span>, <span class="string">'img'</span>, <span class="string">'h1'</span>, <span class="string">'h2'</span>] }));
manager.<span class="func">use</span>(<span class="prop">builtInPlugins</span>.<span class="func">toc</span>());
manager.<span class="func">use</span>(<span class="prop">builtInPlugins</span>.<span class="func">headingAnchor</span>());

<span class="comment">// Register a custom plugin with priority ordering</span>
manager.<span class="func">register</span>({
  <span class="prop">name</span>: <span class="string">'my-plugin'</span>,
  <span class="prop">version</span>: <span class="string">'1.0.0'</span>,
  <span class="prop">priority</span>: <span class="type">50</span>,
  <span class="func">beforeParse</span>(content: <span class="type">string</span>): <span class="type">string</span> {
    <span class="keyword">return</span> content.<span class="func">replace</span>(<span class="string">/\r\n/g</span>, <span class="string">'\n'</span>);
  },
  <span class="func">transformNode</span>(node: <span class="type">HTMLNode</span>): <span class="type">HTMLNode</span> {
    <span class="keyword">return</span> node; <span class="comment">// Modify nodes before rendering</span>
  },
});</pre>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- ARCHITECTURE -->
<section id="architecture">
    <div class="section-label">Architecture</div>
    <div class="highlight-strip"></div>
    <h2 class="section-title">Clean Monorepo Architecture</h2>
    <p class="section-desc">
        Built as a Yarn Workspaces monorepo with clear separation between core logic and platform-specific rendering.
    </p>
    <div class="arch-section">
        <div class="arch-diagram">
            <div class="arch-layer">
                <div class="arch-box wide">
                    <h4>Your Application</h4>
                    <p>Web App (Next.js / Vite) &bull; React Native App (Expo / Bare)</p>
                </div>
            </div>
            <div class="arch-arrow">&#8595;</div>
            <div class="arch-layer">
                <div class="arch-box">
                    <h4>@laddhaanshul/content-renderer</h4>
                    <p>12+ Components, Animation Hooks, Themes</p>
                </div>
                <div class="arch-box">
                    <h4>@laddhaanshul/content-renderer</h4>
                    <p>Native Components, TurboModules, Fabric</p>
                </div>
            </div>
            <div class="arch-arrow">&#8595;</div>
            <div class="arch-layer">
                <div class="arch-box wide" style="min-width: 500px;">
                    <h4>@laddhaanshul/content-renderer-core</h4>
                    <p>7 Parsers &bull; CSEngine &bull; Plugins &bull; Hooks &bull; HOCs &bull; Provider &bull; i18n &bull; Accessibility &bull; SSR &bull; Error Recovery &bull; PDF Export &bull; Benchmarks &bull; Sanitization &bull; Extraction &bull; Validation &bull; Transform</p>
                </div>
            </div>
            <div class="arch-arrow">&#8595;</div>
            <div class="arch-layer">
                <div class="arch-box">
                    <h4>htmlparser2</h4>
                    <p>Fast HTML/XML Parsing</p>
                </div>
                <div class="arch-box">
                    <h4>css-tree</h4>
                    <p>CSS AST Parsing</p>
                </div>
                <div class="arch-box">
                    <h4>entities</h4>
                    <p>Entity Encode/Decode</p>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- EXTRACTION & UTILITIES -->
<section id="utilities">
    <div class="text-center">
        <div class="section-label" style="justify-content:center;">Utilities</div>
        <div class="highlight-strip center"></div>
        <h2 class="section-title">Built-in Utility Modules</h2>
        <p class="section-desc mx-auto">
            Comprehensive utility functions for content extraction, sanitization, transformation, validation, and more.
        </p>
    </div>
    <div class="features-grid" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
        <div class="feature-card fade-up">
            <div class="feature-icon" style="font-size:1.3rem;">&#128269;</div>
            <h3>Content Extraction</h3>
            <p>Extract links, images, scripts, styles, meta, headings, tables, forms, lists, code blocks, comments, SEO, OpenGraph, Twitter Cards, and structured data (JSON-LD).</p>
        </div>
        <div class="feature-card fade-up">
            <div class="feature-icon" style="font-size:1.3rem;">&#128737;</div>
            <h3>Sanitization</h3>
            <p>sanitizeHTML, stripTags, stripAttributes, stripScripts, stripStyles, escapeHTML, unescapeHTML, encodeEntities, and decodeEntities with configurable options.</p>
        </div>
        <div class="feature-card fade-up">
            <div class="feature-icon" style="font-size:1.3rem;">&#128259;</div>
            <h3>Transform</h3>
            <p>minify/format HTML/CSS/JSON/XML, convert between formats (JSON, XML, Markdown, HTML), string utilities (slugify, camelCase, kebabCase, snakeCase, pascalCase, titleCase).</p>
        </div>
        <div class="feature-card fade-up">
            <div class="feature-icon" style="font-size:1.3rem;">&#9989;</div>
            <h3>Validation</h3>
            <p>isValidHTML, isValidJSON, isValidXML, isValidCSS, isValidURL, isValidEmail, isValidPhoneNumber, content type detection from extension, MIME type, and file header.</p>
        </div>
        <div class="feature-card fade-up">
            <div class="feature-icon" style="font-size:1.3rem;">&#128202;</div>
            <h3>Benchmarks</h3>
            <p>benchmarkParse, benchmarkExtract, benchmarkRender, benchmarkSuite, compareWithCompetitors, and formatBenchmarkResults for performance measurement.</p>
        </div>
        <div class="feature-card fade-up">
            <div class="feature-icon" style="font-size:1.3rem;">&#128640;</div>
            <h3>Error Recovery</h3>
            <p>recoverFromHTMLError, recoverFromJSONError, recoverFromMarkdownError, recoverFromCSSError, recoverFromXMLError, suggestFixes, and createFallbackContent.</p>
        </div>
    </div>
</section>

<!-- CTA -->
<section style="text-align:center; padding: 8rem 2rem;">
    <div class="fade-up">
        <h2 class="section-title" style="margin-bottom:1.5rem;">Ready to Build?</h2>
        <p class="section-desc mx-auto" style="margin-bottom:2.5rem;">
            Start rendering content in your React or React Native app today. One package, every content type, zero configuration.
        </p>
        <div style="display:flex; gap:1rem; justify-content:center; flex-wrap:wrap;">
            <a href="#install" class="btn-primary" style="font-size:1.1rem; padding:1rem 2.5rem;">
                &#9889; Install ContentRenderer
            </a>
            <a href="https://github.com/laddhaanshul/content-renderer" class="btn-outline" style="font-size:1.1rem; padding:1rem 2.5rem;" target="_blank" rel="noopener">
                &#128187; View on GitHub
            </a>
        </div>
    </div>
</section>

<!-- FOOTER -->
<footer class="footer">
    <div class="footer-inner">
        <div class="footer-top">
            <div class="footer-brand">
                <div class="logo"><span>&#9670;</span> ContentRenderer </div>
                <p>Universal content rendering for React and React Native. Parse and render HTML, PHP, JSON, XML, Markdown, CSS, and source code as React components with zero-config auto-detection.</p>
            </div>
            <div class="footer-col">
                <h4>Packages</h4>
                <a href="#packages">@laddhaanshul/content-renderer-core</a>
                <a href="#packages">@laddhaanshul/content-renderer</a>
                <a href="#packages">@laddhaanshul/content-renderer</a>
            </div>
            <div class="footer-col">
                <h4>Features</h4>
                <a href="#features">Parsers</a>
                <a href="#components">Components</a>
                <a href="#plugins">Plugin System</a>
                <a href="#utilities">Utilities</a>
            </div>
            <div class="footer-col">
                <h4>Resources</h4>
                <a href="#code">Quick Start</a>
                <a href="#architecture">Architecture</a>
                <a href="https://github.com/laddhaanshul/content-renderer" target="_blank" rel="noopener">GitHub</a>
                <a href="#">MIT License</a>
            </div>
        </div>
        <div class="footer-bottom">
            <span>&copy; <?= date('Y') ?> ContentRenderer Team. All rights reserved.</span>
            <span>Built with &#10084; for React & React Native</span>
        </div>
    </div>
</footer>

<script>
// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// Particles
const particlesEl = document.getElementById('particles');
for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDelay = Math.random() * 15 + 's';
    p.style.animationDuration = (10 + Math.random() * 15) + 's';
    p.style.width = p.style.height = (2 + Math.random() * 4) + 'px';
    particlesEl.appendChild(p);
}

// Scroll animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// Tab switching - Install
document.querySelectorAll('#installTabs .code-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('#installTabs .code-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const mgr = tab.dataset.tab;
        const codeEl = document.getElementById('installCode');
        const codes = {
            npm: `<span class="comment"># Install core package (parsers, utilities, hooks)</span>\nnpm install @laddhaanshul/content-renderer-core\n\n<span class="comment"># Install React + React Native package</span>\nnpm install @laddhaanshul/content-renderer\n\n<span class="comment"># Install dedicated React Native package</span>\nnpm install @laddhaanshul/content-renderer`,
            yarn: `<span class="comment"># Install core package (parsers, utilities, hooks)</span>\nyarn add @laddhaanshul/content-renderer-core\n\n<span class="comment"># Install React + React Native package</span>\nyarn add @laddhaanshul/content-renderer\n\n<span class="comment"># Install dedicated React Native package</span>\nyarn add @laddhaanshul/content-renderer`,
            pnpm: `<span class="comment"># Install core package (parsers, utilities, hooks)</span>\npnpm add @laddhaanshul/content-renderer-core\n\n<span class="comment"># Install React + React Native package</span>\npnpm add @laddhaanshul/content-renderer\n\n<span class="comment"># Install dedicated React Native package</span>\npnpm add @laddhaanshul/content-renderer`
        };
        codeEl.querySelector('pre').innerHTML = codes[mgr] || codes.npm;
    });
});

// Tab switching - Examples
const examples = {
    auto: {
        file: 'App.tsx',
        code: `<span class="keyword">import</span> { <span class="func">ContentRenderer</span> } <span class="keyword">from</span> <span class="string">'@laddhaanshul/content-renderer'</span>;\n\n<span class="keyword">function</span> <span class="func">App</span>() {\n  <span class="keyword">const</span> content = <span class="string">'&lt;h1&gt;Hello World&lt;/h1&gt;&lt;p&gt;This is &lt;strong&gt;HTML&lt;/strong&gt; content.&lt;/p&gt;'</span>;\n  <span class="keyword">return</span> &lt;<span class="tag">ContentRenderer</span> <span class="attr">content</span>={content} /&gt;;\n}`
    },
    html: {
        file: 'HTMLExample.tsx',
        code: `<span class="keyword">import</span> { <span class="func">HTMLRenderer</span> } <span class="keyword">from</span> <span class="string">'@laddhaanshul/content-renderer'</span>;\n\n<span class="keyword">function</span> <span class="func">App</span>() {\n  <span class="keyword">return</span> (\n    &lt;<span class="tag">HTMLRenderer</span>\n      <span class="attr">html</span>=<span class="string">"&lt;h1&gt;Title&lt;/h1&gt;&lt;p&gt;Paragraph with a &lt;a href='/link'&gt;link&lt;/a&gt;&lt;/p&gt;"</span>\n      <span class="attr">sanitize</span>={<span class="type">true</span>}\n      <span class="attr">enableStyles</span>={<span class="type">true</span>}\n      <span class="attr">scopeStyles</span>={<span class="type">true</span>}\n      <span class="attr">onLinkClick</span>={(<span class="attr">href</span>, <span class="attr">event</span>) =&gt; {\n        <span class="attr">event</span>.<span class="func">preventDefault</span>();\n        <span class="attr">console</span>.<span class="func">log</span>(<span class="string">'Link clicked:'</span>, <span class="attr">href</span>);\n      }}\n      <span class="attr">components</span>={{\n        <span class="attr">h1</span>: ({ <span class="attr">children</span> }) =&gt; &lt;<span class="tag">h1</span> <span class="attr">style</span>={{ <span class="attr">color</span>: <span class="string">'blue'</span> }}&gt;{<span class="attr">children</span>}&lt;/<span class="tag">h1</span>&gt;,\n      }}\n    /&gt;\n  );\n}`
    },
    markdown: {
        file: 'MarkdownExample.tsx',
        code: `<span class="keyword">import</span> { <span class="func">MarkdownRenderer</span> } <span class="keyword">from</span> <span class="string">'@laddhaanshul/content-renderer'</span>;\n\n<span class="keyword">function</span> <span class="func">App</span>() {\n  <span class="keyword">return</span> (\n    &lt;<span class="tag">MarkdownRenderer</span>\n      <span class="attr">content</span>={<span class="string">\`# Getting Started\n\nThis is **bold** and this is *italic*.\n\n| Feature | Status |\n|---------|--------|\n| HTML    | Done   |\n| JSON    | Done   |\n\n\`\`\`typescript\nconst greeting: string = "Hello, World!";\n\`\`\`\`</span>}\n      <span class="attr">linkHandler</span>={(<span class="attr">href</span>) =&gt; <span class="attr">console</span>.<span class="func">log</span>(<span class="string">'Navigate to:'</span>, <span class="attr">href</span>)}\n      <span class="attr">imageHandler</span>={(<span class="attr">src</span>) =&gt; <span class="string">\`/cdn\${src}\`</span>}\n    /&gt;\n  );\n}`
    },
    json: {
        file: 'JSONExample.tsx',
        code: `<span class="keyword">import</span> { <span class="func">JSONRenderer</span> } <span class="keyword">from</span> <span class="string">'@laddhaanshul/content-renderer'</span>;\n\n<span class="keyword">function</span> <span class="func">App</span>() {\n  <span class="keyword">const</span> data = JSON.<span class="func">stringify</span>({\n    <span class="attr">name</span>: <span class="string">'John Doe'</span>,\n    <span class="attr">hobbies</span>: [<span class="string">'reading'</span>, <span class="string">'coding'</span>],\n    <span class="attr">address</span>: { <span class="attr">city</span>: <span class="string">'New York'</span> }\n  }, <span class="type">null</span>, <span class="type">2</span>);\n\n  <span class="keyword">return</span> (\n    &lt;<span class="tag">JSONRenderer</span>\n      <span class="attr">json</span>={data}\n      <span class="attr">theme</span>=<span class="string">"dark"</span>\n      <span class="attr">searchable</span>\n      <span class="attr">sortKeys</span>\n      <span class="attr">defaultCollapseDepth</span>={<span class="type">1</span>}\n      <span class="attr">showCopyButton</span>\n      <span class="attr">showTypes</span>\n    /&gt;\n  );\n}`
    },
    code: {
        file: 'CodeExample.tsx',
        code: `<span class="keyword">import</span> { <span class="func">CodeRenderer</span> } <span class="keyword">from</span> <span class="string">'@laddhaanshul/content-renderer'</span>;\n\n<span class="keyword">function</span> <span class="func">App</span>() {\n  <span class="keyword">return</span> (\n    &lt;<span class="tag">CodeRenderer</span>\n      <span class="attr">code</span>={<span class="string">\`function fibonacci(n: number): number {\n  if (n &lt;= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\`</span>}\n      <span class="attr">language</span>=<span class="string">"typescript"</span>\n      <span class="attr">showLineNumbers</span>\n      <span class="attr">highlightLines</span>={[<span class="type">1</span>, <span class="type">3</span>]}\n      <span class="attr">theme</span>=<span class="string">"monokai"</span>\n      <span class="attr">fontSize</span>={<span class="type">14</span>}\n      <span class="attr">showCopyButton</span>\n    /&gt;\n  );\n}`
    },
    css: {
        file: 'CSSEngineExample.tsx',
        code: `<span class="keyword">import</span> { <span class="func">HTMLRenderer</span> } <span class="keyword">from</span> <span class="string">'@laddhaanshul/content-renderer'</span>;\n\n<span class="comment">// CSS from &lt;style&gt; tags is automatically parsed and applied</span>\n<span class="comment">// Supports CSS variables, calc(), @media queries, specificity cascade</span>\n\n<span class="keyword">function</span> <span class="func">App</span>() {\n  <span class="keyword">return</span> (\n    &lt;<span class="tag">HTMLRenderer</span>\n      <span class="attr">html</span>={<span class="string">\`&lt;style&gt;\n  :root { --primary: #2563eb; --spacing: 16px; }\n  .card { padding: var(--spacing); color: var(--primary); }\n  .title { font-size: calc(16px + 4px); }\n  @media (max-width: 768px) {\n    .card { padding: 8px; }\n  }\n&lt;/style&gt;\n&lt;div class="card"&gt;&lt;h2 class="title"&gt;Hello&lt;/h2&gt;&lt;/div&gt;\`</span>}\n      <span class="attr">enableStyles</span>={<span class="type">true</span>}\n      <span class="attr">scopeStyles</span>={<span class="type">true</span>}\n    /&gt;\n  );\n}`
    }
};

document.querySelectorAll('#exampleTabs .code-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('#exampleTabs .code-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const ex = examples[tab.dataset.tab];
        if (ex) {
            document.getElementById('exampleFile').textContent = ex.file;
            document.getElementById('exampleCode').querySelector('pre').innerHTML = ex.code;
        }
    });
});

// Copy code
function copyCode(btn) {
    const pre = btn.closest('.code-block').querySelector('pre');
    const text = pre.textContent || pre.innerText;
    navigator.clipboard.writeText(text).then(() => {
        const orig = btn.textContent;
        btn.textContent = 'Copied!';
        btn.style.color = '#22c55e';
        btn.style.borderColor = '#22c55e';
        setTimeout(() => {
            btn.textContent = orig;
            btn.style.color = '';
            btn.style.borderColor = '';
        }, 2000);
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
</script>
</body>
</html>
