import React, { useState } from 'react';
import CodeBlock from '../components/CodeBlock';

const samples: Record<string, { label: string; code: string; language: string }> = {
  js: {
    label: 'JavaScript',
    language: 'javascript',
    code: `// Content Renderer - Main Entry
import { HTMLParser, JSONParser, MarkdownParser } from '@laddhaanshul/content-renderer-core';

class ContentRenderer {
  #parsers = new Map();
  #cache = new Map();

  constructor() {
    this.#parsers.set('html', new HTMLParser());
    this.#parsers.set('json', new JSONParser());
    this.#parsers.set('markdown', new MarkdownParser());
  }

  async render(content, type = 'auto') {
    const contentType = type === 'auto'
      ? this.detectType(content)
      : type;

    const parser = this.#parsers.get(contentType);
    if (!parser) throw new Error(\`No parser for: \${contentType}\`);

    const cacheKey = this.getCacheKey(content, contentType);
    if (this.#cache.has(cacheKey)) {
      return this.#cache.get(cacheKey);
    }

    const result = await parser.parse(content);
    this.#cache.set(cacheKey, result);
    return result;
  }

  detectType(content) {
    if (content.trim().startsWith('<') || content.trim().startsWith('<!DOCTYPE')) return 'html';
    if (content.trim().startsWith('{') || content.trim().startsWith('[')) return 'json';
    return 'text';
  }

  getCacheKey(content, type) {
    return \`\${type}:\${content.length}\`;
  }
}

export default ContentRenderer;`,
  },
  python: {
    label: 'Python',
    language: 'python',
    code: `"""Content Renderer - Python SDK"""
from typing import Optional, Dict, Any
from dataclasses import dataclass, field
from enum import Enum


class ContentType(Enum):
    HTML = "html"
    JSON = "json"
    MARKDOWN = "markdown"
    XML = "xml"
    CSS = "css"
    TEXT = "text"


@dataclass
class ParsedContent:
    type: ContentType
    content: str
    data: Any = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    errors: list = field(default_factory=list)


class ContentParser:
    """Base parser with template method pattern."""

    def parse(self, content: str) -> ParsedContent:
        self._validate(content)
        data = self._parse(content)
        metadata = self._extract_metadata(content)
        return ParsedContent(
            type=self.content_type,
            content=content,
            data=data,
            metadata=metadata,
        )

    def _validate(self, content: str) -> None:
        if not content or not content.strip():
            raise ValueError("Content cannot be empty")

    def _parse(self, content: str) -> Any:
        raise NotImplementedError

    def _extract_metadata(self, content: str) -> Dict[str, Any]:
        return {"length": len(content), "lines": content.count("\\n") + 1}


class HTMLParser(ContentParser):
    content_type = ContentType.HTML

    def _parse(self, content: str) -> dict:
        # Extract tags and structure
        tags = self._extract_tags(content)
        return {
            "doctype": self._extract_doctype(content),
            "tags": tags,
            "text": self._extract_text(content),
        }

    @staticmethod
    def _extract_tags(html: str) -> list[str]:
        import re
        return re.findall(r"<([a-z][a-z0-9]*)", html, re.IGNORECASE)

    @staticmethod
    def _extract_doctype(html: str) -> Optional[str]:
        import re
        match = re.search(r"<!DOCTYPE\\s+(\\w+)", html, re.IGNORECASE)
        return match.group(1) if match else None

    @staticmethod
    def _extract_text(html: str) -> str:
        import re
        return re.sub(r"<[^>]+>", "", html).strip()


# Usage example
if __name__ == "__main__":
    parser = HTMLParser()
    result = parser.parse("<h1>Hello</h1><p>World</p>")
    print(f"Type: {result.type.value}")
    print(f"Tags: {result.data['tags']}")`,
  },
  html: {
    label: 'HTML',
    language: 'html',
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Content Renderer Demo</title>
  <style>
    body { font-family: system-ui, sans-serif; }
    .container { max-width: 800px; margin: 0 auto; padding: 2rem; }
    .card { border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Content Renderer</h1>
      <p>Render anything, anywhere.</p>
    </header>
    <main>
      <section class="card">
        <h2>Features</h2>
        <ul>
          <li>HTML parsing and rendering</li>
          <li>JSON tree visualization</li>
          <li>Markdown with GFM support</li>
          <li>XML document parsing</li>
          <li>PHP syntax highlighting</li>
        </ul>
      </section>
    </main>
  </div>
  <script>
    console.log('Content Renderer loaded');
  </script>
</body>
</html>`,
  },
  css: {
    label: 'CSS',
    language: 'css',
    code: `/* Content Renderer Theme System */
:root {
  --cr-primary: #6c63ff;
  --cr-primary-light: #8b85ff;
  --cr-bg: #ffffff;
  --cr-surface: #f8f8fc;
  --cr-text: #1a1a2e;
  --cr-text-secondary: #666680;
  --cr-border: #e0e0ee;
  --cr-radius: 8px;
  --cr-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

[data-theme="dark"] {
  --cr-primary: #8b85ff;
  --cr-bg: #0f0f1a;
  --cr-surface: #1a1a2e;
  --cr-text: #e0e0f0;
  --cr-text-secondary: #8888aa;
  --cr-border: #2a2a4a;
  --cr-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.cr-container {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  color: var(--cr-text);
  background: var(--cr-bg);
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.6;
}

.cr-code-block {
  background: var(--cr-surface);
  border: 1px solid var(--cr-border);
  border-radius: var(--cr-radius);
  padding: 1rem;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 0.875rem;
  overflow-x: auto;
}

.cr-code-block::before {
  content: attr(data-lang);
  display: block;
  font-size: 0.75rem;
  color: var(--cr-text-secondary);
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

@keyframes cr-fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}`,
  },
  php: {
    label: 'PHP',
    language: 'php',
    code: `<?php
/**
 * ContentRenderer - PHP SDK
 * 
 * @package ContentRenderer
 * @version 1.0.0
 * @license MIT
 */

namespace ContentRenderer\\Parsers;

class HTMLParser implements ParserInterface
{
    private array $config;
    private bool $sanitize;

    public function __construct(array $config = [])
    {
        $this->config = array_merge([
            'strip_tags' => ['script', 'style'],
            'allowed_attributes' => ['class', 'id', 'href', 'src'],
        ], $config);
        $this->sanitize = true;
    }

    public function parse(string $content): ParsedContent
    {
        $startTime = microtime(true);
        
        if ($this->sanitize) {
            $content = $this->sanitize($content);
        }

        $document = new \\DOMDocument();
        libxml_use_internal_errors(true);
        $document->loadHTML($content, LIBXML_HTML_NOIMPLIED);
        libxml_clear_errors();

        return new ParsedContent(
            type: 'html',
            content: $content,
            data: [
                'title' => $this->extractTitle($document),
                'headings' => $this->extractHeadings($document),
                'links' => $this->extractLinks($document),
                'images' => $this->extractImages($document),
            ],
            metadata: [
                'parse_time' => microtime(true) - $startTime,
                'size' => strlen($content),
            ]
        );
    }

    private function sanitize(string $html): string
    {
        foreach ($this->config['strip_tags'] as $tag) {
            $html = preg_replace(
                '/<\\\\s*' . preg_quote($tag, '/') . '[^>]*>.*?<\\\\s*\\\\/\\\\s*' . preg_quote($tag, '/') . '>/si',
                '',
                $html
            );
        }
        return trim($html);
    }

    private function extractTitle(\\DOMDocument $doc): ?string
    {
        $titles = $doc->getElementsByTagName('title');
        return $titles->length > 0 ? $titles->item(0)->textContent : null;
    }
}`,
  },
};

const themes: Record<string, { bg: string; text: string; keyword: string; string: string; comment: string; number: string; lineBg: string }> = {
  light: {
    bg: '#fafafa',
    text: '#333',
    keyword: '#d73a49',
    string: '#032f62',
    comment: '#6a737d',
    number: '#005cc5',
    lineBg: '#f0f0f0',
  },
  dark: {
    bg: '#1e1e2e',
    text: '#cdd6f4',
    keyword: '#cba6f7',
    string: '#a6e3a1',
    comment: '#6c7086',
    number: '#fab387',
    lineBg: '#313244',
  },
  monokai: {
    bg: '#272822',
    text: '#f8f8f2',
    keyword: '#f92672',
    string: '#e6db74',
    comment: '#75715e',
    number: '#ae81ff',
    lineBg: '#3e3d32',
  },
  dracula: {
    bg: '#282a36',
    text: '#f8f8f2',
    keyword: '#ff79c6',
    string: '#f1fa8c',
    comment: '#6272a4',
    number: '#bd93f9',
    lineBg: '#44475a',
  },
};

export default function CodeExample() {
  const [activeSample, setActiveSample] = useState('js');
  const [theme, setTheme] = useState('dark');
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [fontSize, setFontSize] = useState(13);
  const [highlightLines, setHighlightLines] = useState('');

  const sample = samples[activeSample];
  const currentTheme = themes[theme];
  const lines = sample.code.split('\n');
  const highlighted = highlightLines
    .split(',')
    .map(s => parseInt(s.trim(), 10))
    .filter(n => !isNaN(n));

  const handleCopy = () => {
    navigator.clipboard.writeText(sample.code);
  };

  return (
    <div>
      {/* Controls */}
      <div style={styles.toolbar}>
        <div style={styles.row}>
          <div style={styles.sampleButtons}>
            {Object.entries(samples).map(([key, { label }]) => (
              <button
                key={key}
                onClick={() => setActiveSample(key)}
                style={{
                  ...styles.sampleBtn,
                  ...(activeSample === key ? styles.sampleBtnActive : {}),
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div style={styles.controls}>
          <div style={styles.controlGroup}>
            <label style={styles.label}>Theme:</label>
            {Object.keys(themes).map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                style={{
                  ...styles.themeBtn,
                  ...(theme === t ? styles.themeBtnActive : {}),
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <label style={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={showLineNumbers}
              onChange={(e) => setShowLineNumbers(e.target.checked)}
            />
            Line Numbers
          </label>
          <label style={styles.toggleLabel}>
            <span>Size:</span>
            <input
              type="range"
              min={10}
              max={20}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              style={styles.range}
            />
            {fontSize}px
          </label>
          <input
            type="text"
            placeholder="Highlight lines (e.g. 1,3,5-7)"
            value={highlightLines}
            onChange={(e) => setHighlightLines(e.target.value)}
            style={styles.highlightInput}
          />
        </div>
      </div>

      {/* Code Block */}
      <div style={styles.section}>
        <div style={styles.codeHeader}>
          <span style={styles.langLabel}>{sample.language.toUpperCase()}</span>
          <button onClick={handleCopy} style={styles.copyBtn}>
            Copy
          </button>
        </div>
        <div
          style={{
            ...styles.codeContainer,
            background: currentTheme.bg,
            fontSize,
          }}
        >
          <pre style={{ margin: 0, padding: 16, overflow: 'auto', display: 'flex' }}>
            {showLineNumbers && (
              <div
                style={{
                  ...styles.lineNumbers,
                  color: currentTheme.text + '55',
                  lineHeight: fontSize * 1.7 + 'px',
                }}
              >
                {lines.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      ...(highlighted.includes(i + 1)
                        ? { background: currentTheme.keyword + '33', color: currentTheme.text }
                        : {}),
                    }}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            )}
            <code
              style={{
                fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace",
                color: currentTheme.text,
                lineHeight: fontSize * 1.7 + 'px',
                whiteSpace: 'pre',
                flex: 1,
              }}
            >
              {lines.map((line, i) => (
                <div
                  key={i}
                  style={{
                    ...(highlighted.includes(i + 1)
                      ? { background: currentTheme.keyword + '22', margin: '0 -16px', padding: '0 16px' }
                      : {}),
                  }}
                >
                  {highlightLine(line, currentTheme)}
                </div>
              ))}
            </code>
          </pre>
        </div>
      </div>

      {/* Usage */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Usage</h3>
        <CodeBlock
          language="tsx"
          title="Component"
          code={`import { CodeRenderer } from '@laddhaanshul/content-renderer';

function MyComponent() {
  return (
    <CodeRenderer
      content={codeString}
      language="${sample.language}"
      showLineNumbers={${showLineNumbers}}
      theme="${theme}"
      highlightLines={[1, 2, 3]}
      fontSize={${fontSize}}
      wrapLines={false}
    />
  );
}`}
        />
      </div>
    </div>
  );
}

function highlightLine(
  line: string,
  t: { keyword: string; string: string; comment: string; number: string; text: string }
): React.ReactNode {
  // Simple syntax highlighting
  let result: React.ReactNode[] = [];
  let remaining = line;
  let key = 0;

  // Comments
  const commentMatch = remaining.match(/^(.*?)(\/\/.*$|\/\*.*?\*\/|#.*$)/);
  if (commentMatch) {
    if (commentMatch[1]) {
      result.push(<span key={key++}>{highlightTokens(commentMatch[1], t)}</span>);
    }
    result.push(<span key={key++} style={{ color: t.comment }}>{commentMatch[2]}</span>);
    return <>{result}</>;
  }

  // Strings
  const stringMatch = remaining.match(/^([^"'`]*)(["'`])((?:[^"'`\\]|\\.)*?)\2/);
  if (stringMatch && stringMatch.index === 0) {
    result.push(<span key={key++}>{highlightTokens(stringMatch[1], t)}</span>);
    result.push(<span key={key++} style={{ color: t.string }}>{stringMatch[2]}{stringMatch[3]}{stringMatch[2]}</span>);
    result.push(<span key={key++}>{highlightLine(remaining.slice(stringMatch[0].length), t)}</span>);
    return <>{result}</>;
  }

  return highlightTokens(remaining, t);
}

function highlightTokens(text: string, t: { keyword: string; number: string; text: string }): React.ReactNode {
  const keywords = /\b(import|export|default|from|const|let|var|function|class|return|if|else|for|while|new|this|async|await|throw|try|catch|typeof|instanceof|extends|implements|interface|type|enum|def|self|print|True|False|None|public|private|protected|namespace|use)\b/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = keywords.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{colorNumbers(text.slice(lastIndex, match.index), t)}</span>);
    }
    parts.push(<span key={key++} style={{ color: t.keyword }}>{match[0]}</span>);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(<span key={key++}>{colorNumbers(text.slice(lastIndex), t)}</span>);
  }

  return parts.length > 0 ? <>{parts}</> : <>{text}</>;
}

function colorNumbers(text: string, t: { number: string; text: string }): React.ReactNode {
  const nums = /\b(\d+\.?\d*)\b/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = nums.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>);
    }
    parts.push(<span key={key++} style={{ color: t.number }}>{match[0]}</span>);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(<span key={key++}>{text.slice(lastIndex)}</span>);
  }

  return parts.length > 0 ? <>{parts}</> : <>{text}</>;
}

const styles: Record<string, React.CSSProperties> = {
  toolbar: {
    marginBottom: 20,
    padding: 16,
    background: '#fff',
    borderRadius: 8,
    border: '1px solid #e0e0e0',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 12,
  },
  row: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap' as const,
  },
  sampleButtons: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap' as const,
  },
  sampleBtn: {
    padding: '6px 14px',
    background: '#f5f5f8',
    border: '1px solid #e0e0e0',
    borderRadius: 6,
    fontSize: 13,
    cursor: 'pointer',
    color: '#555',
  },
  sampleBtnActive: {
    background: '#6c63ff',
    color: '#fff',
    borderColor: '#6c63ff',
    fontWeight: 600,
  },
  controls: {
    display: 'flex',
    gap: 16,
    alignItems: 'center',
    flexWrap: 'wrap' as const,
  },
  controlGroup: {
    display: 'flex',
    gap: 4,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#888',
    fontWeight: 600,
    marginRight: 4,
  },
  themeBtn: {
    padding: '3px 10px',
    background: '#f5f5f8',
    border: '1px solid #e0e0e0',
    borderRadius: 4,
    fontSize: 12,
    cursor: 'pointer',
    color: '#555',
  },
  themeBtnActive: {
    background: '#6c63ff',
    color: '#fff',
    borderColor: '#6c63ff',
  },
  toggleLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: '#555',
  },
  range: {
    width: 80,
    cursor: 'pointer',
  },
  highlightInput: {
    padding: '4px 10px',
    border: '1px solid #ddd',
    borderRadius: 4,
    fontSize: 12,
    width: 180,
    outline: 'none',
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 12,
    color: '#1a1a2e',
  },
  codeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 14px',
    background: '#f7f7fa',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottom: '1px solid #e0e0e0',
  },
  langLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#666',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  copyBtn: {
    background: 'transparent',
    border: '1px solid #d0d0d0',
    borderRadius: 4,
    padding: '2px 10px',
    fontSize: 11,
    color: '#666',
    cursor: 'pointer',
  },
  codeContainer: {
    border: '1px solid #e0e0e0',
    borderTop: 'none',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    overflow: 'hidden',
  },
  lineNumbers: {
    textAlign: 'right' as const,
    paddingRight: 16,
    paddingLeft: 16,
    borderRight: '1px solid #33333322',
    userSelect: 'none' as const,
    minWidth: 48,
    fontSize: 'inherit',
  },
};
