import React, { useState } from 'react';
import CodeBlock from '../components/CodeBlock';

const samples: Record<string, { label: string; code: string }> = {
  basic: {
    label: 'Basic PHP',
    code: `<?php
// Basic PHP example
$name = "Content Renderer";
$version = "1.0.0";

echo "Hello from " . $name . " v" . $version;

$features = [
    "HTML Parsing",
    "JSON Rendering",
    "Markdown Support",
    "XML Processing",
    "CSS Parsing",
    "PHP Highlighting",
];

foreach ($features as $feature) {
    echo "- " . $feature . "\\n";
}

function greet(string $name): string {
    return "Welcome to " . $name . "!";
}

echo greet($name);
?>`,
  },
  oop: {
    label: 'OOP PHP',
    code: `<?php
namespace App\\Renderers;

/**
 * Abstract base renderer
 */
abstract class BaseRenderer
{
    protected string $content = '';
    protected array $options = [];
    
    abstract public function render(): string;
    
    public function setContent(string $content): self
    {
        $this->content = $content;
        return $this;
    }
    
    public function setOptions(array $options): self
    {
        $this->options = array_merge($this->options, $options);
        return $this;
    }
    
    protected function sanitize(string $html): string
    {
        return htmlspecialchars($html, ENT_QUOTES, 'UTF-8');
    }
}

/**
 * HTML Renderer implementation
 */
class HTMLRenderer extends BaseRenderer
{
    private bool $stripScripts = true;
    
    public function __construct(array $options = [])
    {
        parent::__construct();
        $this->setOptions($options);
    }
    
    public function render(): string
    {
        $html = $this->content;
        
        if ($this->stripScripts) {
            $html = preg_replace(
                '/<script[^>]*>.*?<\\/script>/si',
                '',
                $html
            );
        }
        
        return $this->sanitize($html);
    }
    
    public function setStripScripts(bool $value): self
    {
        $this->stripScripts = $value;
        return $this;
    }
}

// Usage
$renderer = new HTMLRenderer(['strict' => true]);
echo $renderer
    ->setContent('<h1>Hello</h1><script>alert("xss")</script>')
    ->setStripScripts(true)
    ->render();
?>`,
  },
  closures: {
    label: 'Closures & Arrays',
    code: `<?php
// Closures and array functions

$users = [
    ['name' => 'Alice', 'age' => 30, 'role' => 'admin'],
    ['name' => 'Bob', 'age' => 25, 'role' => 'user'],
    ['name' => 'Charlie', 'age' => 35, 'role' => 'admin'],
    ['name' => 'Diana', 'age' => 28, 'role' => 'user'],
];

// Filter admins
$admins = array_filter($users, fn($u) => $u['role'] === 'admin');

// Map to names only
$names = array_map(fn($u) => $u['name'], $users);

// Custom sort by age
usort($users, fn($a, $b) => $b['age'] <=> $a['age']);

// Reduce to average age
$avgAge = array_reduce(
    $users,
    fn($carry, $u) => $carry + $u['age'],
    0
) / count($users);

// Higher-order function
function pipeline(callable ...$fns): callable
{
    return fn($value) => array_reduce(
        $fns,
        fn($acc, $fn) => $fn($acc),
        $value
    );
}

$transform = pipeline(
    fn($s) => trim($s),
    fn($s) => strtolower($s),
    fn($s) => ucfirst($s),
);

echo $transform("  HELLO WORLD  "); // "Hello world"
?>`,
  },
};

const themes: Record<string, { bg: string; text: string; keyword: string; string: string; comment: string; variable: string; number: string; tag: string }> = {
  light: {
    bg: '#fafafa',
    text: '#333',
    keyword: '#d73a49',
    string: '#032f62',
    comment: '#6a737d',
    variable: '#e36209',
    number: '#005cc5',
    tag: '#22863a',
  },
  dark: {
    bg: '#1e1e2e',
    text: '#cdd6f4',
    keyword: '#cba6f7',
    string: '#a6e3a1',
    comment: '#6c7086',
    variable: '#fab387',
    number: '#89b4fa',
    tag: '#a6e3a1',
  },
  monokai: {
    bg: '#272822',
    text: '#f8f8f2',
    keyword: '#f92672',
    string: '#e6db74',
    comment: '#75715e',
    variable: '#fd971f',
    number: '#ae81ff',
    tag: '#a6e22e',
  },
};

export default function PHPExample() {
  const [activeSample, setActiveSample] = useState('basic');
  const [theme, setTheme] = useState('dark');
  const [showLineNumbers, setShowLineNumbers] = useState(true);

  const sample = samples[activeSample];
  const t = themes[theme];
  const lines = sample.code.split('\n');

  return (
    <div>
      {/* Controls */}
      <div style={styles.toolbar}>
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
        <div style={styles.controls}>
          <div style={styles.controlGroup}>
            <span style={styles.label}>Theme:</span>
            {Object.keys(themes).map(name => (
              <button
                key={name}
                onClick={() => setTheme(name)}
                style={{
                  ...styles.themeBtn,
                  ...(theme === name ? styles.themeBtnActive : {}),
                }}
              >
                {name}
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
        </div>
      </div>

      {/* Rendered */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Rendered PHP</h3>
        <div style={styles.codeHeader}>
          <span style={styles.langLabel}>PHP</span>
        </div>
        <div style={{ ...styles.codeContainer, background: t.bg }}>
          <pre style={{ margin: 0, padding: 16, overflow: 'auto', display: 'flex' }}>
            {showLineNumbers && (
              <div style={{ ...styles.lineNumbers, color: t.text + '44' }}>
                {lines.map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
            )}
            <code
              style={{
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                color: t.text,
                lineHeight: 1.7,
                fontSize: 13,
                whiteSpace: 'pre',
                flex: 1,
              }}
            >
              {lines.map((line, i) => (
                <div key={i}>
                  {highlightPHP(line, t)}
                </div>
              ))}
            </code>
          </pre>
        </div>
      </div>

      {/* Source */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Raw Source</h3>
        <CodeBlock code={sample.code} language="php" />
      </div>

      {/* Usage */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Usage</h3>
        <CodeBlock
          language="tsx"
          title="Component"
          code={`import { PHPRenderer } from '@laddhaanshul/content-renderer';

function MyComponent() {
  return (
    <PHPRenderer
      content={phpCode}
      showLineNumbers={${showLineNumbers}}
      theme="${theme}"
      highlightPHP
      fontSize={13}
    />
  );
}`}
        />
      </div>
    </div>
  );
}

function highlightPHP(
  line: string,
  t: { keyword: string; string: string; comment: string; variable: string; number: string; tag: string; text: string }
): React.ReactNode {
  // Comments
  if (line.trimStart().startsWith('//') || line.trimStart().startsWith('#')) {
    return <span style={{ color: t.comment }}>{line}</span>;
  }

  let result: React.ReactNode[] = [];
  let rest = line;
  let key = 0;

  // PHP tags
  if (rest.includes('<?php')) {
    const idx = rest.indexOf('<?php');
    result.push(<span key={key++}>{rest.slice(0, idx)}</span>);
    result.push(<span key={key++} style={{ color: t.tag }}>{'<?php'}</span>);
    rest = rest.slice(idx + 5);
  }

  if (rest.includes('?>')) {
    const idx = rest.indexOf('?>');
    result.push(<span key={key++}>{highlightPHPTokens(rest.slice(0, idx), t)}</span>);
    result.push(<span key={key++} style={{ color: t.tag }}>{'?>'}</span>);
    rest = rest.slice(idx + 2);
  }

  if (rest) {
    result.push(<span key={key++}>{highlightPHPTokens(rest, t)}</span>);
  }

  return <>{result}</>;
}

function highlightPHPTokens(text: string, t: { keyword: string; string: string; variable: string; number: string; text: string }): React.ReactNode {
  const keywords = /\b(function|class|abstract|extends|implements|public|private|protected|static|final|return|if|else|elseif|foreach|for|while|do|switch|case|break|continue|new|echo|print|use|namespace|self|parent|array|null|true|false|fn|callable|string|int|float|bool|void|mixed)\b/gi;
  const variables = /\$[a-zA-Z_]\w*/g;
  const numbers = /\b(\d+\.?\d*)\b/g;

  let result = text;
  const parts: React.ReactNode[] = [];
  let key = 0;

  // Split by strings first
  const stringParts = result.split(/(["'])(?:(?=(\\?))\2.)*?\1/);
  stringParts.forEach((part, idx) => {
    if (idx % 2 === 1) {
      parts.push(<span key={key++} style={{ color: t.string }}>{part}</span>);
    } else {
      // Within non-string parts, highlight keywords, vars, numbers
      const tokenParts: React.ReactNode[] = [];
      let lastIdx = 0;

      const allMatches: { index: number; length: number; type: string }[] = [];
      let m;
      const kwRegex = new RegExp(keywords.source, keywords.flags);
      while ((m = kwRegex.exec(part)) !== null) {
        allMatches.push({ index: m.index, length: m[0].length, type: 'keyword' });
      }
      const varRegex = new RegExp(variables.source, variables.flags);
      while ((m = varRegex.exec(part)) !== null) {
        allMatches.push({ index: m.index, length: m[0].length, type: 'variable' });
      }
      const numRegex = new RegExp(numbers.source, numbers.flags);
      while ((m = numRegex.exec(part)) !== null) {
        allMatches.push({ index: m.index, length: m[0].length, type: 'number' });
      }

      allMatches.sort((a, b) => a.index - b.index);

      allMatches.forEach(match => {
        if (match.index > lastIdx) {
          tokenParts.push(<span key={key++}>{part.slice(lastIdx, match.index)}</span>);
        }
        const color = match.type === 'keyword' ? t.keyword
          : match.type === 'variable' ? t.variable
          : t.number;
        tokenParts.push(
          <span key={key++} style={{ color }}>{part.slice(match.index, match.index + match.length)}</span>
        );
        lastIdx = match.index + match.length;
      });

      if (lastIdx < part.length) {
        tokenParts.push(<span key={key++}>{part.slice(lastIdx)}</span>);
      }

      parts.push(<>{tokenParts}</>);
    }
  });

  return <>{parts}</>;
}

const styles: Record<string, React.CSSProperties> = {
  toolbar: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 12,
    marginBottom: 20,
    padding: 16,
    background: '#fff',
    borderRadius: 8,
    border: '1px solid #e0e0e0',
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
    cursor: 'pointer',
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
    lineHeight: 1.7,
    fontSize: 13,
  },
};
