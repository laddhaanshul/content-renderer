import React, { useState } from 'react';
import CodeBlock from '../components/CodeBlock';

const samples: Record<string, { label: string; code: string }> = {
  basic: {
    label: 'Basic XML',
    code: `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <book id="bk101">
    <author>Gambardella, Matthew</author>
    <title>XML Developer's Guide</title>
    <genre>Computer</genre>
    <price>44.95</price>
    <publish_date>2000-10-01</publish_date>
    <description>An in-depth look at creating applications with XML.</description>
  </book>
  <book id="bk102">
    <author>Ralls, Kim</author>
    <title>Midnight Rain</title>
    <genre>Fantasy</genre>
    <price>5.95</price>
    <publish_date>2000-12-16</publish_date>
    <description>A former architect battles corporate zombies.</description>
  </book>
  <book id="bk103">
    <author>Corets, Eva</author>
    <title>Maeve Ascendant</title>
    <genre>Fantasy</genre>
    <price>5.95</price>
    <publish_date>2000-11-17</publish_date>
    <description>After the collapse of a nanotechnology society, the survivors begin again.</description>
  </book>
</catalog>`,
  },
  namespaces: {
    label: 'Namespaces',
    code: `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
               xmlns:m="http://www.example.com/api">
  <soap:Header>
    <m:Authentication>
      <m:ApiKey>abc123def456</m:ApiKey>
      <m:Timestamp>2024-01-15T10:30:00Z</m:Timestamp>
    </m:Authentication>
  </soap:Header>
  <soap:Body>
    <m:GetUserRequest>
      <m:UserId>12345</m:UserId>
      <m:IncludeProfile>true</m:IncludeProfile>
    </m:GetUserRequest>
  </soap:Body>
</soap:Envelope>`,
  },
  attributes: {
    label: 'Attributes & Config',
    code: `<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <database driver="postgresql" host="localhost" port="5432">
    <credentials user="admin" password="secret" />
    <pool minSize="5" maxSize="20" timeout="30000" />
  </database>
  
  <cache type="redis" host="localhost" port="6379" ttl="3600">
    <prefix>app:</prefix>
    <serializer>json</serializer>
  </cache>
  
  <logging level="info" format="json">
    <handler type="console" enabled="true" />
    <handler type="file" enabled="true" path="/var/log/app.log" maxsize="50MB" />
  </logging>
  
  <server host="0.0.0.0" port="8080" workers="4">
    <ssl enabled="true" cert="/path/to/cert.pem" key="/path/to/key.pem" />
    <cors origins="*" methods="GET,POST,PUT,DELETE" maxAge="86400" />
  </server>
</configuration>`,
  },
};

/* Simple collapsible tree node */
function XMLNode({
  tag,
  attributes,
  children,
  text,
  depth,
  defaultOpen = true,
}: {
  tag: string;
  attributes?: Record<string, string>;
  children?: { tag: string; attributes?: Record<string, string>; children?: any[]; text?: string }[];
  text?: string;
  depth: number;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(depth < 3);

  const indent = depth * 24;
  const attrStr = attributes
    ? ' ' + Object.entries(attributes).map(([k, v]) => `${k}="${v}"`).join(' ')
    : '';
  const hasChildren = children && children.length > 0;

  return (
    <div>
      <div style={{ paddingLeft: indent, lineHeight: 1.8, fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: 13 }}>
        {hasChildren ? (
          <button onClick={() => setOpen(!open)} style={styles.toggle}>
            {open ? '▾' : '▸'}
          </button>
        ) : (
          <span style={{ display: 'inline-block', width: 16 }} />
        )}
        <span style={{ color: '#6c63ff' }}>&lt;{tag}</span>
        {attrStr.split(' ').filter(Boolean).map((attr, i) => {
          const [k, ...vParts] = attr.split('=');
          const v = vParts.join('=');
          return (
            <span key={i}>
              {' '}
              <span style={{ color: '#2563eb' }}>{k}</span>
              <span style={{ color: '#888' }}>=</span>
              <span style={{ color: '#0a8f4f' }}>{v}</span>
            </span>
          );
        })}
        {hasChildren ? (
          <span style={{ color: '#6c63ff' }}>{'>'}</span>
        ) : (
          <>
            {text ? (
              <React.Fragment>
                <span style={{ color: '#6c63ff' }}>{'>'}</span>
                <span style={{ color: '#333' }}>{text}</span>
                <span style={{ color: '#6c63ff' }}>{'</'}{tag}{'>'}</span>
              </React.Fragment>
            ) : (
              <span style={{ color: '#6c63ff' }}>{' />'}</span>
            )}
          </>
        )}
      </div>
      {open && hasChildren && (
        <>
          {children.map((child: any, i: number) => (
            <XMLNode key={i} {...child} depth={depth + 1} />
          ))}
          <div style={{ paddingLeft: indent, lineHeight: 1.8, fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: 13 }}>
            <span style={{ display: 'inline-block', width: 16 }} />
            <span style={{ color: '#6c63ff' }}>&lt;/{tag}&gt;</span>
          </div>
        </>
      )}
    </div>
  );
}

function parseSimpleXML(xml: string) {
  // Very simple regex-based XML parser for demo purposes
  const result: any = { tag: 'root', children: [], attributes: {} };
  // Remove XML declaration
  xml = xml.replace(/<\?[^?]*\?>/g, '').trim();

  // Remove comments
  xml = xml.replace(/<!--[\s\S]*?-->/g, '');

  function parseNode(str: string): any[] {
    const nodes: any[] = [];
    const regex = /<(\w+)((?:\s+\w+="[^"]*")*)\s*(\/?)>([^<]*)<\/\1>|<(\w+)((?:\s+\w+="[^"]*")*)\s*\/>/g;
    let match;

    while ((match = regex.exec(str)) !== null) {
      const [, tag1, attrs1, selfClose1, text1, tag2, attrs2] = match;
      const tag = tag1 || tag2;
      const attrsStr = attrs1 || attrs2 || '';

      const attrs: Record<string, string> = {};
      const attrRegex = /(\w+)="([^"]*)"/g;
      let attrMatch;
      while ((attrMatch = attrRegex.exec(attrsStr)) !== null) {
        attrs[attrMatch[1]] = attrMatch[2];
      }

      if (selfClose1 || tag2) {
        nodes.push({ tag, attributes: attrs, children: [], text: text1?.trim() || undefined });
      } else {
        // Find closing tag
        const openTag = `<${tag}${attrsStr}>`;
        const closeTag = `</${tag}>`;
        const startIdx = str.indexOf(openTag, match.index);
        const contentStart = startIdx + openTag.length;
        const closeIdx = str.indexOf(closeTag, contentStart);
        const content = str.slice(contentStart, closeIdx);

        const childNodes = parseNode(content);
        const textContent = content.replace(/<[^>]+>/g, '').trim();

        nodes.push({
          tag,
          attributes: attrs,
          children: childNodes,
          text: textContent || undefined,
        });
      }
    }

    return nodes;
  }

  // Get root element
  const rootMatch = xml.match(/^<(\w+)((?:\s+\w+="[^"]*")*)\s*>/);
  if (rootMatch) {
    const rootTag = rootMatch[1];
    const rootAttrsStr = rootMatch[2];
    const attrs: Record<string, string> = {};
    const attrRegex = /(\w+)="([^"]*)"/g;
    let attrMatch;
    while ((attrMatch = attrRegex.exec(rootAttrsStr || '')) !== null) {
      attrs[attrMatch[1]] = attrMatch[2];
    }

    const openTag = `<${rootTag}${rootAttrsStr}>`;
    const closeTag = `</${rootTag}>`;
    const content = xml.slice(xml.indexOf(openTag) + openTag.length, xml.lastIndexOf(closeTag));

    return { tag: rootTag, attributes: attrs, children: parseNode(content) };
  }

  return result;
}

export default function XMLExample() {
  const [activeSample, setActiveSample] = useState('basic');

  const sample = samples[activeSample];
  const parsed = parseSimpleXML(sample.code);

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
      </div>

      {/* Tree View */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Collapsible Tree View</h3>
        <div style={styles.tree}>
          <XMLNode
            tag={parsed.tag}
            attributes={parsed.attributes}
            children={parsed.children}
            depth={0}
          />
        </div>
      </div>

      {/* Raw */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Raw XML</h3>
        <CodeBlock code={sample.code} language="xml" />
      </div>

      {/* Usage */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Usage</h3>
        <CodeBlock
          language="tsx"
          title="Component"
          code={`import { XMLParser, XMLNode } from '@laddhaanshul/content-renderer-core';

function MyComponent() {
  const parser = new XMLParser();
  const result = parser.parse(xmlString);

  return (
    <div>
      {result.root.children.map((node, i) => (
        <XMLNode key={i} node={node} collapsible />
      ))}
    </div>
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
    gap: 6,
    marginBottom: 20,
    padding: 16,
    background: '#fff',
    borderRadius: 8,
    border: '1px solid #e0e0e0',
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
    maxHeight: 500,
    overflow: 'auto',
  },
  toggle: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    padding: 0,
    marginRight: 4,
  },
};
