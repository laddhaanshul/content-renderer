import React, { useState, useEffect, useCallback, ComponentType } from 'react';
import CodeBlock from '../components/CodeBlock';

/* ========== HOC Implementations (Demo) ========== */

// withContentParser HOC
function withContentParser<P extends object>(
  WrappedComponent: ComponentType<P & {
    parsedContent: any;
    isParsing: boolean;
    parseError: string | null;
    parseContent: (content: string, type: string) => void;
  }>
) {
  return function EnhancedComponent(props: P) {
    const [parsedContent, setParsedContent] = useState<any>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [parseError, setParseError] = useState<string | null>(null);

    const parseContent = useCallback((content: string, type: string) => {
      setIsParsing(true);
      setParseError(null);

      setTimeout(() => {
        try {
          let parsed: any;
          switch (type) {
            case 'json':
              parsed = JSON.parse(content);
              break;
            case 'html':
              parsed = {
                text: content.replace(/<[^>]+>/g, '').trim(),
                tags: content.match(/<([a-zA-Z][a-zA-Z0-9]*)/g)?.map(t => t.slice(1)) || [],
              };
              break;
            default:
              parsed = { raw: content };
          }
          setParsedContent(parsed);
          setIsParsing(false);
        } catch (err) {
          setParseError((err as Error).message);
          setIsParsing(false);
        }
      }, 300);
    }, []);

    return (
      <WrappedComponent
        {...props}
        parsedContent={parsedContent}
        isParsing={isParsing}
        parseError={parseError}
        parseContent={parseContent}
      />
    );
  };
}

// withExtract HOC
function withExtract<P extends object>(
  WrappedComponent: ComponentType<P & {
    extractedData: any;
    isExtracting: boolean;
    extractError: string | null;
    extractData: (content: string) => void;
  }>
) {
  return function EnhancedComponent(props: P) {
    const [extractedData, setExtractedData] = useState<any>(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractError, setExtractError] = useState<string | null>(null);

    const extractData = useCallback((content: string) => {
      setIsExtracting(true);
      setExtractError(null);

      setTimeout(() => {
        try {
          const links = content.match(/<a\s[^>]*href="([^"]*)"[^>]*>/gi) || [];
          const images = content.match(/<img\s[^>]*src="([^"]*)"[^>]*>/gi) || [];
          const headings = content.match(/<h([1-6])[^>]*>.*?<\/h[1-6]>/gi) || [];

          setExtractedData({
            links: links,
            images: images,
            headings: headings,
            stats: {
              totalLinks: links.length,
              totalImages: images.length,
              totalHeadings: headings.length,
              contentLength: content.length,
            },
          });
          setIsExtracting(false);
        } catch (err) {
          setExtractError((err as Error).message);
          setIsExtracting(false);
        }
      }, 200);
    }, []);

    return (
      <WrappedComponent
        {...props}
        extractedData={extractedData}
        isExtracting={isExtracting}
        extractError={extractError}
        extractData={extractData}
      />
    );
  };
}

/* ========== Wrapped Components ========== */

interface ParsedContentCardProps {
  title?: string;
  parsedContent: any;
  isParsing: boolean;
  parseError: string | null;
  parseContent: (content: string, type: string) => void;
}

const ParsedContentCard = withContentParser(function ParsedContentCard({
  title = 'Parsed Content',
  parsedContent,
  isParsing,
  parseError,
  parseContent,
}: ParsedContentCardProps) {
  const [input, setInput] = useState('');
  const [type, setType] = useState('json');

  useEffect(() => {
    // Auto-parse initial JSON
    const initial = JSON.stringify({ message: 'Hello from HOC!', count: 42, active: true }, null, 2);
    setInput(initial);
    parseContent(initial, 'json');
  }, []);

  return (
    <div style={styles.card}>
      <h4 style={styles.cardTitle}>{title}</h4>

      <div style={styles.cardControls}>
        <select value={type} onChange={(e) => setType(e.target.value)} style={styles.select}>
          <option value="json">JSON</option>
          <option value="html">HTML</option>
          <option value="text">Text</option>
        </select>
        <button onClick={() => parseContent(input, type)} style={styles.btn}>
          {isParsing ? 'Parsing...' : 'Parse'}
        </button>
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={styles.textarea}
        rows={4}
      />

      {parseError && <div style={styles.error}>Error: {parseError}</div>}

      {isParsing && (
        <div style={styles.loading}>
          <div style={styles.spinner} /> Parsing...
        </div>
      )}

      {parsedContent && !isParsing && (
        <div style={styles.resultBox}>
          <pre style={styles.pre}>{JSON.stringify(parsedContent, null, 2)}</pre>
        </div>
      )}

      <div style={styles.hocBadge}>withContentParser</div>
    </div>
  );
});

interface ExtractedContentCardProps {
  title?: string;
  extractedData: any;
  isExtracting: boolean;
  extractError: string | null;
  extractData: (content: string) => void;
}

const ExtractedContentCard = withExtract(function ExtractedContentCard({
  title = 'Extracted Data',
  extractedData,
  isExtracting,
  extractError,
  extractData,
}: ExtractedContentCardProps) {
  const [input, setInput] = useState(`<h1>Blog Post</h1>
<p>Read more <a href="https://example.com">here</a>.</p>
<img src="https://picsum.photos/seed/hoc/400/200" alt="Photo" />
<h2>Introduction</h2>
<p>Content with <a href="/about">another link</a>.</p>`);

  useEffect(() => {
    extractData(input);
  }, []);

  return (
    <div style={styles.card}>
      <h4 style={styles.cardTitle}>{title}</h4>

      <div style={styles.cardControls}>
        <button onClick={() => extractData(input)} style={styles.btn}>
          {isExtracting ? 'Extracting...' : 'Extract'}
        </button>
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={styles.textarea}
        rows={4}
      />

      {extractError && <div style={styles.error}>Error: {extractError}</div>}

      {isExtracting && (
        <div style={styles.loading}>
          <div style={styles.spinner} /> Extracting...
        </div>
      )}

      {extractedData && !isExtracting && (
        <div style={styles.resultBox}>
          {extractedData.stats && (
            <div style={styles.statsGrid}>
              {Object.entries(extractedData.stats).map(([key, value]) => (
                <div key={key} style={styles.statItem}>
                  <span style={styles.statValue}>{String(value)}</span>
                  <span style={styles.statLabel}>{key.replace('total', '').replace(/([A-Z])/g, ' $1').trim()}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
            {['links', 'images', 'headings'].map(section => (
              extractedData[section]?.length > 0 && (
                <div key={section}>
                  <div style={styles.sectionLabel}>
                    {section} ({extractedData[section].length})
                  </div>
                  {extractedData[section].slice(0, 3).map((item: string, i: number) => (
                    <div key={i} style={styles.listItem}>
                      <code style={styles.mono}>{item.length > 70 ? item.slice(0, 70) + '...' : item}</code>
                    </div>
                  ))}
                </div>
              )
            ))}
          </div>
        </div>
      )}

      <div style={styles.hocBadge}>withExtract</div>
    </div>
  );
});

/* ========== Main Component ========== */
export default function HOCExample() {
  return (
    <div>
      {/* Info */}
      <div style={styles.info}>
        <div style={styles.infoIcon}>📐</div>
        <div>
          <div style={styles.infoTitle}>Higher-Order Components (HOCs)</div>
          <div style={styles.infoText}>
            HOCs wrap your components to inject parsing and extraction capabilities as props.
            This pattern is useful for class components or when you prefer prop injection over hooks.
          </div>
        </div>
      </div>

      {/* Wrapped Components */}
      <div style={styles.grid}>
        {/* @ts-expect-error HOC injects parsedContent, isParsing, parseError, parseContent */}
        <ParsedContentCard />
        {/* @ts-expect-error HOC injects extractedData, isExtracting, extractError, extractData */}
        <ExtractedContentCard />
      </div>

      {/* Injection Diagram */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>How HOCs Work</h3>
        <div style={styles.diagram}>
          <div style={styles.diagramBox}>
            <div style={{ ...styles.diagramNode, background: '#6c63ff22', borderColor: '#6c63ff' }}>
              <strong>withContentParser</strong>
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Adds parsing logic</div>
            </div>
            <div style={styles.diagramArrow}>↓ wraps</div>
            <div style={{ ...styles.diagramNode, background: '#e8e8f0', borderColor: '#ccc' }}>
              <strong>YourComponent</strong>
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Receives injected props</div>
            </div>
          </div>
          <div style={styles.diagramBox}>
            <div style={{ ...styles.diagramNode, background: '#10b98122', borderColor: '#10b981' }}>
              <strong>withExtract</strong>
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Adds extraction logic</div>
            </div>
            <div style={styles.diagramArrow}>↓ wraps</div>
            <div style={{ ...styles.diagramNode, background: '#e8e8f0', borderColor: '#ccc' }}>
              <strong>YourComponent</strong>
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Receives injected props</div>
            </div>
          </div>
        </div>
      </div>

      {/* Usage */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Usage</h3>
        <CodeBlock
          language="tsx"
          title="HOC API"
          code={`import { withContentParser, withExtract } from '@content-renderer/core';

// Wrap your component with parsing capabilities
const MyParsedView = withContentParser(
  function MyParsedView({ parsedContent, isParsing, parseContent }) {
    return (
      <div>
        <button onClick={() => parseContent(content, 'json')}>
          Parse JSON
        </button>
        {isParsing && <span>Loading...</span>}
        {parsedContent && <pre>{JSON.stringify(parsedContent, null, 2)}</pre>}
      </div>
    );
  }
);

// Wrap your component with extraction capabilities
const MyExtractedView = withExtract(
  function MyExtractedView({ extractedData, isExtracting, extractData }) {
    return (
      <div>
        <button onClick={() => extractData(htmlContent)}>
          Extract
        </button>
        {extractedData && (
          <ul>
            {extractedData.links.map((link, i) => (
              <li key={i}>{link.href}</li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);

// Compose both HOCs
const MyEnhancedView = withContentParser(
  withExtract(function MyView(props) {
    // Has both parsedContent and extractedData props
    return <div>...</div>;
  })
);`}
        />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  info: {
    display: 'flex',
    gap: 12,
    padding: 16,
    background: '#f0fdf4',
    borderRadius: 8,
    border: '1px solid #bbf7d0',
    marginBottom: 20,
  },
  infoIcon: { fontSize: 24 },
  infoTitle: { fontSize: 15, fontWeight: 600, color: '#1a1a2e', marginBottom: 2 },
  infoText: { fontSize: 13, color: '#555', lineHeight: 1.5 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: 16,
    marginBottom: 24,
  },
  card: {
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: 12,
    padding: 20,
    position: 'relative' as const,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 12,
    color: '#1a1a2e',
  },
  cardControls: {
    display: 'flex',
    gap: 8,
    marginBottom: 12,
  },
  select: {
    padding: '6px 12px',
    border: '1px solid #ddd',
    borderRadius: 6,
    fontSize: 13,
    outline: 'none',
  },
  btn: {
    padding: '6px 16px',
    background: '#6c63ff',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  textarea: {
    width: '100%',
    padding: 10,
    border: '1px solid #ddd',
    borderRadius: 6,
    fontSize: 12,
    fontFamily: "'SF Mono', monospace",
    resize: 'vertical' as const,
    lineHeight: 1.6,
    outline: 'none',
    marginBottom: 12,
  },
  error: {
    padding: '6px 10px',
    background: '#fef2f2',
    color: '#dc2626',
    borderRadius: 6,
    fontSize: 12,
    marginBottom: 8,
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    background: '#f0f0f8',
    borderRadius: 6,
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  spinner: {
    width: 14,
    height: 14,
    border: '2px solid #e0e0e0',
    borderTopColor: '#6c63ff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  resultBox: {
    background: '#f8f8fc',
    borderRadius: 8,
    padding: 12,
    border: '1px solid #e8e8f0',
  },
  pre: {
    margin: 0,
    fontFamily: "'SF Mono', monospace",
    fontSize: 12,
    lineHeight: 1.6,
    overflow: 'auto',
    maxHeight: 200,
  },
  hocBadge: {
    position: 'absolute' as const,
    top: 12,
    right: 12,
    padding: '2px 10px',
    background: '#6c63ff18',
    color: '#6c63ff',
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 8,
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '8px 12px',
    background: '#fff',
    borderRadius: 6,
    border: '1px solid #eee',
  },
  statValue: { fontSize: 20, fontWeight: 700, color: '#6c63ff' },
  statLabel: { fontSize: 11, color: '#888', textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#666',
    marginBottom: 4,
    textTransform: 'capitalize' as const,
  },
  listItem: {
    padding: '4px 8px',
    background: '#fff',
    borderRadius: 4,
    border: '1px solid #eee',
    marginBottom: 2,
  },
  mono: { fontFamily: "'SF Mono', monospace", fontSize: 11, color: '#6c63ff' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#1a1a2e' },
  diagram: {
    display: 'flex',
    gap: 24,
    justifyContent: 'center',
    padding: 24,
    background: '#fff',
    borderRadius: 8,
    border: '1px solid #e0e0e0',
  },
  diagramBox: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 8,
  },
  diagramNode: {
    padding: '12px 20px',
    borderRadius: 8,
    border: '2px solid',
    textAlign: 'center' as const,
    minWidth: 160,
  },
  diagramArrow: {
    fontSize: 18,
    color: '#888',
  },
};
