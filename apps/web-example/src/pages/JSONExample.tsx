import React, { useState } from 'react';
import { JSONRenderer, updateNestedValue } from '@laddhaanshul/content-renderer';
import CodeBlock from '../components/CodeBlock';

const nestedJSON = {
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
};

export default function JSONExample() {
  const [jsonValue, setJsonValue] = useState(nestedJSON);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKeys, setSortKeys] = useState(false);
  const [readonly, setReadonly] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const handleEdit = (path: string, newValue: unknown) => {
    console.log(`Edited ${path}:`, newValue);
    const updated = updateNestedValue(jsonValue, path, newValue);
    setJsonValue(updated);
  };

  return (
    <div>
      <div style={styles.toolbar}>
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
          <label style={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={readonly}
              onChange={(e) => setReadonly(e.target.checked)}
            />
            Read Only
          </label>
          <select 
            value={theme} 
            onChange={(e) => setTheme(e.target.value as any)}
            style={styles.select}
          >
            <option value="light">Light Theme</option>
            <option value="dark">Dark Theme</option>
          </select>
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
          {!readonly && "💡 Interactive Mode: Click on values to edit them! (Check console for logs)"}
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Interactive JSON Tree</h3>
        <JSONRenderer
          json={jsonValue}
          theme={theme}
          searchable
          sortKeys={sortKeys}
          readonly={readonly}
          onEdit={handleEdit}
          defaultCollapseDepth={2}
          showTypes
        />
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Usage</h3>
        <CodeBlock
          language="tsx"
          code={`import { JSONRenderer } from '@laddhaanshul/content-renderer';

<JSONRenderer
  json={data}
  readonly={false} // Enable interactive editing
  onEdit={(path, newValue) => handleUpdate(path, newValue)}
  searchable
  sortKeys
  theme="light"
/>`}
        />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  toolbar: {
    padding: 16,
    background: '#fff',
    borderRadius: 8,
    border: '1px solid #e0e0e0',
    marginBottom: 20,
  },
  controls: {
    display: 'flex',
    gap: 16,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  searchInput: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: 6,
    fontSize: 13,
    width: 200,
  },
  toggleLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    cursor: 'pointer',
  },
  select: {
    padding: '6px 10px',
    borderRadius: 6,
    border: '1px solid #ddd',
    fontSize: 13,
  },
  section: { marginBottom: 32 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 16,
  },
};
