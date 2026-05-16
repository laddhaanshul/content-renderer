<?php
$version = '1.0.0';
$year = date('Y');
$github = 'https://github.com/laddhaanshul/content-renderer';
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<meta name="description" content="Universal content rendering for React &amp; React Native. Auto-detect HTML, JSON, Markdown, XML, CSS and more from a single component."/>
<title>Content Renderer — Universal Rendering for React &amp; React Native</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="assets/style.css"/>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect rx='18' width='100' height='100' fill='%237C3AED'/><text x='50' y='68' text-anchor='middle' font-size='52' font-weight='800' fill='white'>CR</text></svg>"/>
</head>
<body>
<div class="mesh"></div>

<!-- NAV -->
<nav class="nav" id="nav">
  <div class="nav-i">
    <a href="#" class="logo">
      <div class="logo-box">CR</div>
      <span>content-renderer</span>
    </a>
    <div class="nav-links">
      <a href="#features" class="nl">Features</a>
      <a href="#packages" class="nl">Packages</a>
      <a href="#comparison" class="nl">Compare</a>
      <a href="#api" class="nl">API</a>
      <a href="#install" class="nl">Install</a>
    </div>
    <div class="nav-actions">
      <a href="<?php echo $github; ?>" class="nav-btn" target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
        GitHub
      </a>
    </div>
  </div>
</nav>

<!-- HERO -->
<section class="hero" id="hero">
  <div class="wrap hero-grid">
    <div class="hero-content">
      <div class="eyebrow">
        <span class="eyebrow-dot"></span>
        v<?php echo htmlspecialchars($version); ?> &mdash; Ultimate Parsing Engine
      </div>
      <h1 class="hero-title">
        Render anything.<br/>
        <span class="g1">Anywhere.</span>
      </h1>
      <p class="hero-sub">
        The most powerful universal content rendering engine for React &amp; React Native. 
        Drop in HTML, Markdown, JSON, CSS, XML, or PHP—and watch it render beautifully. 
        Zero config, completely typesafe, and blazing fast.
      </p>
      
      <div class="hero-cta">
        <a href="#quickstart" class="btn-main">
          Get Started
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>
        <a href="<?php echo $github; ?>" class="btn-out" target="_blank" rel="noopener">
          View Documentation
        </a>
      </div>

      <div class="hstats">
        <div class="hstat"><div class="hstat-val g1">6+</div><div class="hstat-lbl">Parsers</div></div>
        <div class="hstat"><div class="hstat-val g2">0</div><div class="hstat-lbl">Dependencies</div></div>
        <div class="hstat"><div class="hstat-val g3">100%</div><div class="hstat-lbl">TypeScript</div></div>
      </div>
      
      <div class="trust">
        <span class="tbadge"><div class="tbadge-dot" style="background:#06B6D4"></div> React Native Ready</span>
        <span class="tbadge"><div class="tbadge-dot" style="background:#10B981"></div> Next.js Compatible</span>
        <span class="tbadge"><div class="tbadge-dot" style="background:#F59E0B"></div> Tree-Shakeable</span>
      </div>
    </div>

    <div class="hero-right">
      <div class="cwin">
        <div class="cwin-bar">
          <span class="dot dr"></span><span class="dot dy"></span><span class="dot dg"></span>
          <div class="ctab"><span class="on">App.tsx</span><span>package.json</span></div>
        </div>
        <div class="cwin-body">
<pre><span class="kw">import</span> <span class="punc">{</span> <span class="comp">ContentRenderer</span> <span class="punc">}</span> <span class="kw">from</span>
  <span class="str">'@laddhaanshul/content-renderer'</span><span class="punc">;</span>

<span class="com">// Auto-detects & safely renders ANY content type!</span>
<span class="kw">export default function</span> <span class="fn">App</span><span class="punc">() {</span>
  <span class="kw">const</span> <span class="prop">content</span> <span class="punc">=</span> <span class="str">`
    &lt;h1&gt;HTML Content&lt;/h1&gt;
    &lt;p&gt;Now beautifully rendered!&lt;/p&gt;
  `</span><span class="punc">;</span>

  <span class="kw">return</span> <span class="punc">(</span>
    <span class="punc">&lt;</span><span class="comp">ContentRenderer</span>
      <span class="attr">content</span><span class="punc">={</span><span class="prop">content</span><span class="punc">}</span>
      <span class="attr">theme</span><span class="punc">=</span><span class="str">"dark"</span>
      <span class="attr">autoDetect</span>
    <span class="punc">/&gt;</span>
  <span class="punc">);</span>
<span class="punc">}</span></pre>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- EVERYTHING YOU NEED (FEATURES) -->
<section class="section section--gray" id="features">
  <div class="wrap">
    <div class="sh anim">
      <span class="sbadge">Everything you need</span>
      <h2 class="stitle">A Complete Rendering Ecosystem</h2>
      <p class="ssub">Built from the ground up for performance, security, and developer experience. Stop wrestling with different libraries for different content types.</p>
    </div>

    <div class="feat-mega">
      <!-- High level benefits -->
      <div class="why-grid" style="margin-bottom: 20px;">
        <div class="why-card anim">
          <div class="why-icon">🚀</div>
          <h3 class="why-title">Auto-Detection Engine</h3>
          <p class="why-desc">Pass a string of HTML, a JSON object, or a block of Markdown. The engine instantly detects the format and applies the correct parser and rendering pipeline automatically.</p>
        </div>
        <div class="why-card anim">
          <div class="why-icon">🛡️</div>
          <h3 class="why-title">Secure & XSS Safe</h3>
          <p class="why-desc">Built-in HTML sanitization protects your application against Cross-Site Scripting (XSS) attacks out of the box. Render user-generated content with complete confidence.</p>
        </div>
      </div>

      <!-- Specific format capabilities -->
      <div class="feat-row">
        <div class="fcard anim">
          <div class="fcard-icon">🌐</div>
          <h3 class="fcard-title">HTML5 DOM</h3>
          <p class="fcard-desc">Complete HTML5 rendering with robust styling, custom element mapping, and safe attribute handling.</p>
        </div>
        <div class="fcard cyan anim">
          <div class="fcard-icon">📋</div>
          <h3 class="fcard-title">JSON Tree</h3>
          <p class="fcard-desc">Interactive, collapsible object viewer with syntax highlights, type badging, and copy-path utilities.</p>
        </div>
        <div class="fcard green anim">
          <div class="fcard-icon">📝</div>
          <h3 class="fcard-title">Markdown (GFM)</h3>
          <p class="fcard-desc">Full Markdown parser supporting GitHub-Flavored Markdown: tables, task lists, and code blocks.</p>
        </div>
        <div class="fcard orange anim">
          <div class="fcard-icon">💻</div>
          <h3 class="fcard-title">Source Code</h3>
          <p class="fcard-desc">Syntax highlighting for 15+ languages including JS, Python, Rust, Go, CSS, PHP, and more.</p>
        </div>
        <div class="fcard pink anim">
          <div class="fcard-icon">📦</div>
          <h3 class="fcard-title">XML Parser</h3>
          <p class="fcard-desc">Namespace-aware XML parsing with hierarchical tree rendering and attribute mapping.</p>
        </div>
        <div class="fcard anim">
          <div class="fcard-icon">🔗</div>
          <h3 class="fcard-title">Data Extraction</h3>
          <p class="fcard-desc">Easily extract plain text, links, image metadata, and OpenGraph tags from any rendered content.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- PACKAGES IN DEPTH -->
<section class="section" id="packages">
  <div class="wrap">
    <div class="sh anim">
      <span class="sbadge">Packages</span>
      <h2 class="stitle">Two Modular Packages</h2>
      <p class="ssub">Use our core logic anywhere, or drop in the UI components for instant results. Designed to be lightweight and strictly typed.</p>
    </div>

    <div class="pkg-deep">
      
      <!-- Core Package -->
      <div class="pkg-box anim">
        <div class="pkg-top">
          <div class="pkg-glow"></div>
          <div class="pkg-npm">@laddhaanshul/content-renderer-core</div>
          <h3 class="pkg-name-big">The Engine</h3>
          <p class="pkg-tagline">Pure parsing, transformation, and extraction logic. Zero DOM dependencies.</p>
          <div class="pkg-meta">
            <span class="pmeta">0 Dependencies</span>
            <span class="pmeta">ESM/CJS</span>
            <span class="pmeta">Browser & Node</span>
          </div>
        </div>
        <div class="pkg-body">
          <div class="pkg-section">
            <div class="pkg-section-title">What it includes</div>
            <div class="pkg-items">
              <div class="pkg-item">
                <div class="pkg-item-ic">✓</div>
                <div class="pkg-item-body"><strong>AST Parsers</strong> HTML, Markdown, JSON, XML, CSS, PHP</div>
              </div>
              <div class="pkg-item">
                <div class="pkg-item-ic">✓</div>
                <div class="pkg-item-body"><strong>Extractors</strong> Link, text, image, and metadata extraction</div>
              </div>
              <div class="pkg-item">
                <div class="pkg-item-ic">✓</div>
                <div class="pkg-item-body"><strong>Sanitizer</strong> XSS prevention and HTML cleanup</div>
              </div>
            </div>
          </div>
          <div class="pkg-sizes">
            <div class="psize"><div class="psize-val g1">12kb</div><div class="psize-lbl">Gzipped</div></div>
            <div class="psize"><div class="psize-val g1">Yes</div><div class="psize-lbl">Tree-Shakeable</div></div>
          </div>
        </div>
      </div>

      <!-- React & Native Package -->
      <div class="pkg-box pkg-box--cyan anim">
        <div class="pkg-top">
          <div class="pkg-glow"></div>
          <div class="pkg-npm">@laddhaanshul/content-renderer</div>
          <h3 class="pkg-name-big">The UI Layer</h3>
          <p class="pkg-tagline">Universal React components. Write once, render anywhere.</p>
          <div class="pkg-meta">
            <span class="pmeta">React 17+</span>
            <span class="pmeta">React Native</span>
            <span class="pmeta">Next.js Ready</span>
          </div>
        </div>
        <div class="pkg-body">
          <div class="pkg-section">
            <div class="pkg-section-title">What it includes</div>
            <div class="pkg-items">
              <div class="pkg-item">
                <div class="pkg-item-ic">✓</div>
                <div class="pkg-item-body"><strong>Components</strong> &lt;ContentRenderer /&gt;, &lt;HTMLRenderer /&gt; + more</div>
              </div>
              <div class="pkg-item">
                <div class="pkg-item-ic">✓</div>
                <div class="pkg-item-body"><strong>Hooks</strong> useContentParser, useExtract, useTheme</div>
              </div>
              <div class="pkg-item">
                <div class="pkg-item-ic">✓</div>
                <div class="pkg-item-body"><strong>Themes</strong> Built-in light/dark mode and style customization</div>
              </div>
            </div>
          </div>
          <div class="pkg-sizes">
            <div class="psize"><div class="psize-val g2">34kb</div><div class="psize-lbl">Gzipped</div></div>
            <div class="psize"><div class="psize-val g2">Full</div><div class="psize-lbl">A11y Support</div></div>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- COMPARISON / BENEFITS -->
<section class="section section--gray" id="comparison">
  <div class="wrap">
    <div class="sh anim">
      <span class="sbadge">Why choose us?</span>
      <h2 class="stitle">Head-to-Head Comparison</h2>
      <p class="ssub">See how Content Renderer replaces a dozen fragmented libraries with a single, unified solution.</p>
    </div>

    <div class="comp-wrap anim">
      <table class="comp-table">
        <thead>
          <tr>
            <th>Feature</th>
            <th class="hl">Content Renderer</th>
            <th>react-native-render-html</th>
            <th>react-markdown</th>
            <th>react-json-view</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>React Web Support</td>
            <td class="hl"><span class="chk">✓</span></td>
            <td><span class="cross">✗</span></td>
            <td><span class="chk">✓</span></td>
            <td><span class="chk">✓</span></td>
          </tr>
          <tr>
            <td>React Native Support</td>
            <td class="hl"><span class="chk">✓</span></td>
            <td><span class="chk">✓</span></td>
            <td><span class="part">Needs plugins</span></td>
            <td><span class="cross">✗</span></td>
          </tr>
          <tr>
            <td>Auto Format Detection</td>
            <td class="hl"><span class="chk">✓</span></td>
            <td><span class="cross">✗</span></td>
            <td><span class="cross">✗</span></td>
            <td><span class="cross">✗</span></td>
          </tr>
          <tr>
            <td>HTML Parsing</td>
            <td class="hl"><span class="chk">✓</span></td>
            <td><span class="chk">✓</span></td>
            <td><span class="part">Limited (rehype)</span></td>
            <td><span class="cross">✗</span></td>
          </tr>
          <tr>
            <td>Markdown / GFM</td>
            <td class="hl"><span class="chk">✓</span></td>
            <td><span class="cross">✗</span></td>
            <td><span class="chk">✓</span></td>
            <td><span class="cross">✗</span></td>
          </tr>
          <tr>
            <td>JSON Tree Rendering</td>
            <td class="hl"><span class="chk">✓</span></td>
            <td><span class="cross">✗</span></td>
            <td><span class="cross">✗</span></td>
            <td><span class="chk">✓</span></td>
          </tr>
          <tr>
            <td>Zero Core Dependencies</td>
            <td class="hl"><span class="chk">✓</span></td>
            <td><span class="cross">✗</span> (many deps)</td>
            <td><span class="cross">✗</span> (remark/rehype)</td>
            <td><span class="cross">✗</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</section>

<!-- INSTALL & QUICKSTART -->
<section class="section" id="install">
  <div class="wrap">
    <div class="sh anim">
      <span class="sbadge">Get Started</span>
      <h2 class="stitle">Ready to render?</h2>
      <p class="ssub">Install the UI layer via your favorite package manager.</p>
    </div>

    <div class="install-tabs anim">
      <button class="itab on" data-target="npm">npm</button>
      <button class="itab" data-target="yarn">yarn</button>
      <button class="itab" data-target="pnpm">pnpm</button>
    </div>

    <div class="ipanel on anim" id="npm">
      <div class="icmd">
        <span class="iname">Install UI Package</span>
        <code class="icode">npm install @laddhaanshul/content-renderer</code>
        <button class="icopy">Copy</button>
      </div>
      <div class="icmd">
        <span class="iname">Install Core Only</span>
        <code class="icode">npm install @laddhaanshul/content-renderer-core</code>
        <button class="icopy">Copy</button>
      </div>
    </div>
    
    <div class="ipanel anim" id="yarn">
      <div class="icmd">
        <span class="iname">Install UI Package</span>
        <code class="icode">yarn add @laddhaanshul/content-renderer</code>
        <button class="icopy">Copy</button>
      </div>
      <div class="icmd">
        <span class="iname">Install Core Only</span>
        <code class="icode">yarn add @laddhaanshul/content-renderer-core</code>
        <button class="icopy">Copy</button>
      </div>
    </div>

    <div class="ipanel anim" id="pnpm">
      <div class="icmd">
        <span class="iname">Install UI Package</span>
        <code class="icode">pnpm add @laddhaanshul/content-renderer</code>
        <button class="icopy">Copy</button>
      </div>
      <div class="icmd">
        <span class="iname">Install Core Only</span>
        <code class="icode">pnpm add @laddhaanshul/content-renderer-core</code>
        <button class="icopy">Copy</button>
      </div>
    </div>

  </div>
</section>

<!-- FOOTER -->
<footer class="footer">
  <div class="wrap">
    <div class="ft-grid">
      <div class="ft-brand">
        <div class="logo">
          <div class="logo-box">CR</div>
          <span>content-renderer</span>
        </div>
        <p>The universal content rendering engine for modern React and React Native applications.</p>
        <div class="npm-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm18.666 6.664h-2.666V10h-1.334v4H1.334v-5.332h21.332v5.33z"/></svg>
          MIT Licensed
        </div>
      </div>
      <div class="ft-col">
        <h4>Packages</h4>
        <a href="https://www.npmjs.com/package/@laddhaanshul/content-renderer-core" target="_blank">Core Engine</a>
        <a href="https://www.npmjs.com/package/@laddhaanshul/content-renderer" target="_blank">React & Native UI</a>
      </div>
      <div class="ft-col">
        <h4>Resources</h4>
        <a href="<?php echo $github; ?>" target="_blank">Documentation</a>
        <a href="<?php echo $github; ?>/tree/main/apps/web-example" target="_blank">Web Example</a>
        <a href="<?php echo $github; ?>/tree/main/apps/native-example" target="_blank">Native Example</a>
      </div>
      <div class="ft-col">
        <h4>Community</h4>
        <a href="<?php echo $github; ?>/issues" target="_blank">Report an Issue</a>
        <a href="<?php echo $github; ?>/pulls" target="_blank">Contribute</a>
      </div>
    </div>
    
    <div class="ft-bottom">
      <div class="ft-copy">&copy; <?php echo $year; ?> Content Renderer. All rights reserved.</div>
      <div class="ft-links">
        <a href="<?php echo $github; ?>" target="_blank">GitHub</a>
      </div>
    </div>
  </div>
</footer>

<script>
// Scroll nav
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if(window.scrollY > 30) nav.classList.add('up');
  else nav.classList.remove('up');
}, {passive:true});

// Tabs
document.querySelectorAll('.itab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.itab').forEach(b => b.classList.remove('on'));
    document.querySelectorAll('.ipanel').forEach(p => p.classList.remove('on'));
    btn.classList.add('on');
    document.getElementById(btn.dataset.target).classList.add('on');
  });
});

// Copy
document.querySelectorAll('.icopy').forEach(btn => {
  btn.addEventListener('click', () => {
    const code = btn.previousElementSibling.innerText;
    navigator.clipboard.writeText(code);
    btn.innerText = "Copied!";
    setTimeout(() => btn.innerText = "Copy", 2000);
  });
});

// Anims
const obs = new IntersectionObserver((es) => {
  es.forEach(e => {
    if(e.isIntersecting){
      e.target.classList.add('vis');
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.anim').forEach(el => obs.observe(el));
</script>
</body>
</html>
