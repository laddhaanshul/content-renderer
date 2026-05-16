import React, { useState, useMemo } from 'react';
import CodeBlock from '../components/CodeBlock';

const basicJSON = JSON.stringify({
  name: 'Content Renderer',
  version: '1.0.0',
  description: 'A universal content rendering library',
  features: ['HTML', 'JSON', 'Markdown', 'XML', 'PHP', 'CSS'],
  license: 'MIT',
}, null, 2);

const nestedJSON = JSON.stringify({
  user: {
    id: 1,
    name: 'Alice Johnson',
    email: 'alice@example.com',
    profile: {
      avatar: 'https://example.com/avatar.jpg',
      bio: 'Full-stack developer',
      settings: {
        theme: 'dark',
        language: 'en',
        notifications: {
          email: true,
          push: false,
          sms: false,
        },
      },
    },
    posts: [
      { id: 101, title: 'First Post', likes: 42 },
      { id: 102, title: 'Second Post', likes: 17 },
    ],
  },
}, null, 2);

const largeJSON = JSON.stringify(Object.fromEntries(
  Array.from({ length: 50 }, (_, i) => [`item_${i}`, {
    id: i,
    value: Math.random().toFixed(4),
    active: i % 3 === 0,
    tags: ['tag-a', 'tag-b', 'tag-c'],
    metadata: { created: new Date().toISOString(), updated: new Date().toISOString() },
  }])
), null, 2);

type Sample = { label: string; code: string };

const samples: Record<string, Sample> = {
  basic: { label: 'Basic', code: basicJSON },
  nested: { label: 'Nested', code: nestedJSON },
  large: { label: 'Large (50 items)', code: largeJSON },
};

/* ---------- Simple JSON Tree Renderer ---------- */
function JsonTreeNode({
  keyName,
  value,
  depth = 0,
  sortKeys,
  searchTerm,
}: {
  keyName: string;
  value: unknown;
  depth?: number;
  sortKeys: boolean;
  searchTerm: string;
}) {
  const [open, setOpen] = useState(depth < 2);
  const indent = depth * 20;

  if (value === null) {
    return (
      <div style={{ paddingLeft: indent }}>
        <span style={styles.key}>{keyName}</span>
        <span style={styles.nullVal}>: null</span>
      </div>
    );
  }

  if (typeof value === 'boolean') {
    return (
      <div style={{ paddingLeft: indent }}>
        <span style={styles.key}>{keyName}</span>
        <span style={styles.boolVal}>: {String(value)}</span>
      </div>
    );
  }

  if (typeof value === 'number') {
    const highlighted =
      searchTerm && String(value).toLowerCase().includes(searchTerm.toLowerCase());
    return (
      <div style={{ paddingLeft: indent, background: highlighted ? '#fff3cd' : undefined }}>
        <span style={styles.key}>{keyName}</span>
        <span style={styles.numVal}>: {value}</span>
      </div>
    );
  }

  if (typeof value === 'string') {
    const highlighted =
      searchTerm && value.toLowerCase().includes(searchTerm.toLowerCase());
    return (
      <div style={{ paddingLeft: indent, background: highlighted ? '#fff3cd' : undefined }}>
        <span style={styles.key}>{keyName}</span>
        <span style={styles.strVal}>: &quot;{value}&quot;</span>
      </div>
    );
  }

  if (Array.isArray(value)) {
    return (
      <div style={{ paddingLeft: indent }}>
        <button onClick={() => setOpen(!open)} style={styles.toggle}>
          {open ? '▾' : '▸'} <span style={styles.key}>{keyName}</span>
          <span style={styles.bracket}> [{value.length}]</span>
        </button>
        {open &&
          value.map((item, i) => (
            <JsonTreeNode
              key={i}
              keyName={String(i)}
              value={item}
              depth={depth + 1}
              sortKeys={sortKeys}
              searchTerm={searchTerm}
            />
          ))}
        {open && <div style={{ paddingLeft: (depth + 1) * 20 }}>]</div>}
      </div>
    );
  }

  if (typeof value === 'object') {
    let entries = Object.entries(value as Record<string, unknown>);
    if (sortKeys) entries.sort(([a], [b]) => a.localeCompare(b));

    const filtered = searchTerm
      ? entries.filter(([k, v]) =>
          k.toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(v).toLowerCase().includes(searchTerm.toLowerCase())
        )
      : entries;

    return (
      <div style={{ paddingLeft: indent }}>
        <button onClick={() => setOpen(!open)} style={styles.toggle}>
          {open ? '▾' : '▸'} <span style={styles.key}>{keyName}</span>
          <span style={styles.bracket}> {'{'}</span>
          <span style={styles.bracket}>{entries.length}</span>
          <span style={styles.bracket}>{'}'}</span>
        </button>
        {open &&
          filtered.map(([k, v]) => (
            <JsonTreeNode
              key={k}
              keyName={k}
              value={v}
              depth={depth + 1}
              sortKeys={sortKeys}
              searchTerm={searchTerm}
            />
          ))}
        {open && <div style={{ paddingLeft: (depth + 1) * 20 }}>{'}'}</div>}
      </div>
    );
  }

  return null;
}

/* ---------- Main Component ---------- */
export default function JSONExample() {
  const [activeSample, setActiveSample] = useState('basic');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKeys, setSortKeys] = useState(false);
  const [copied, setCopied] = useState(false);

  const sample = samples[activeSample];
  const parsed = useMemo(() => {
    try {
      return JSON.parse(sample.code);
    } catch {
      return null;
    }
  }, [sample]);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(parsed, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          <input
            type="text"
            placeholder="Search keys/values..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <label style={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={sortKeys}
              onChange={(e) => setSortKeys(e.target.checked)}
            />
            Sort Keys
          </label>
          <button onClick={handleCopy} style={styles.copyBtn}>
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* JSON Tree */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Rendered JSON Tree</h3>
        <div style={styles.tree}>
          {parsed && (
            <JsonTreeNode
              keyName="root"
              value={parsed}
              depth={0}
              sortKeys={sortKeys}
              searchTerm={searchTerm}
            />
          )}
        </div>
      </div>

      {/* Raw */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Raw JSON</h3>
        <CodeBlock code={sample.code} language="json" />
      </div>

      {/* Usage */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Usage</h3>
        <CodeBlock
          language="tsx"
          title="Component"
          code={`import { JSONRenderer } from '@content-renderer/react-and-native';

function MyComponent() {
  return (
    <JSONRenderer
      content={jsonString}
      collapsible
      maxCollapsedDepth={2}
      sortKeys={${sortKeys}}
      copyToClipboard
      highlightMatches={['Alice']}
      showDataTypes
    />
  );
}`}
        />
      </div>
    </div>
  );
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
    gap: 12,
    alignItems: 'center',
    flexWrap: 'wrap' as const,
  },
  searchInput: {
    padding: '6px 12px',
    border: '1px solid #ddd',
    borderRadius: 6,
    fontSize: 13,
    width: 220,
    outline: 'none',
  },
  toggleLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: '#555',
    cursor: 'pointer',
  },
  copyBtn: {
    padding: '6px 14px',
    background: '#e8e8f0',
    border: '1px solid #d0d0d0',
    borderRadius: 6,
    fontSize: 13,
    cursor: 'pointer',
    color: '#555',
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 12,
    color: '#1a1a2e',
  },
  tree: {
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    padding: 16,
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    fontSize: 13,
    lineHeight: 1.8,
    maxHeight: 500,
    overflow: 'auto',
  },
  key: { color: '#6c63ff', fontWeight: 600 },
  strVal: { color: '#0a8f4f' },
  numVal: { color: '#b45309' },
  boolVal: { color: '#2563eb' },
  nullVal: { color: '#9ca3af' },
  bracket: { color: '#888', fontWeight: 400 },
  toggle: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    padding: 0,
    color: '#333',
  },
};
