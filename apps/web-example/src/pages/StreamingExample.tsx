import React, { useState, useCallback } from 'react';
import { StreamingContentRenderer } from '@laddhaanshul/content-renderer';
import ExampleLayout from '../components/ExampleLayout';

const SAMPLE_HTML = `
  <div style="padding: 20px; font-family: system-ui;">
    <h1 style="color: #6c63ff; font-size: 2.5rem; margin-bottom: 1rem;">Streaming Content Demo</h1>
    <p style="font-size: 1.1rem; line-height: 1.6; color: #444;">
      This content is being streamed chunk by chunk. Observe how the 
      <strong>StreamingContentRenderer</strong> updates the UI in real-time.
    </p>
    
    <div style="background: #f8f9fa; border-left: 4px solid #6c63ff; padding: 1.5rem; margin: 2rem 0; border-radius: 0 8px 8px 0;">
      <h3 style="margin-top: 0; color: #1a1a2e;">Dynamic Incremental Parsing</h3>
      <p style="margin-bottom: 0;">Each chunk is parsed and appended to the existing DOM structure without re-rendering everything from scratch.</p>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin: 2rem 0;">
      <thead>
        <tr style="background: #6c63ff; color: white;">
          <th style="padding: 12px; text-align: left;">Feature</th>
          <th style="padding: 12px; text-align: left;">Benefit</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 12px;">Low Latency</td>
          <td style="padding: 12px;">Users see content immediately as it arrives.</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 12px;">Memory Efficient</td>
          <td style="padding: 12px;">Process large documents in small, manageable pieces.</td>
        </tr>
      </tbody>
    </table>

    <div style="display: flex; gap: 20px; margin-top: 2rem;">
      <div style="flex: 1; background: #fff0f6; padding: 1.5rem; border-radius: 12px;">
        <h4 style="color: #d63384; margin-top: 0;">Perfect for AI</h4>
        <p style="font-size: 0.9rem;">Ideal for rendering LLM responses as they are generated token by token.</p>
      </div>
      <div style="flex: 1; background: #e7f5ff; padding: 1.5rem; border-radius: 12px;">
        <h4 style="color: #007bff; margin-top: 0;">Cross-Platform</h4>
        <p style="font-size: 0.9rem;">Works identically on Web and React Native.</p>
      </div>
    </div>
  </div>
`;

function createMockStream(content: string, chunkSize: number, delay: number) {
  const parts: string[] = [];
  for (let i = 0; i < content.length; i += chunkSize) {
    parts.push(content.slice(i, i + chunkSize));
  }

  let index = 0;
  return {
    getReader() {
      return {
        async read() {
          if (index >= parts.length) {
            return { done: true, value: undefined };
          }
          await new Promise(r => setTimeout(r, delay));
          const value = parts[index++];
          return { done: false, value };
        },
        releaseLock() {}
      };
    },
    cancel() { return Promise.resolve(); }
  };
}

function createMockASTStream(delay: number = 300) {
  const nodes = [
    { type: 'element', tagName: 'h1', children: [{ type: 'text', content: 'Web AST Streaming' }] },
    { type: 'element', tagName: 'p', children: [{ type: 'text', content: 'This content arrives as pre-parsed nodes, bypassing HTML parsing.' }] },
    { type: 'element', tagName: 'div', attributes: { style: 'background-color: #f0f9ff; padding: 12px; border-radius: 8px; border-left-width: 4px; border-left-color: #0ea5e9;' }, children: [
        { type: 'element', tagName: 'strong', children: [{ type: 'text', content: 'Efficiency:' }] },
        { type: 'text', content: ' Direct rendering from AST is faster.' }
    ]},
    { type: 'element', tagName: 'ul', children: [
        { type: 'element', tagName: 'li', children: [{ type: 'text', content: 'Smooth incremental updates' }] },
        { type: 'element', tagName: 'li', children: [{ type: 'text', content: 'Low memory overhead' }] },
        { type: 'element', tagName: 'li', children: [{ type: 'text', content: 'Consistent cross-platform logic' }] },
    ]}
  ];

  let index = 0;
  return {
    getReader() {
      return {
        async read() {
          if (index >= nodes.length) {
            return { done: true, value: undefined };
          }
          await new Promise(r => setTimeout(r, delay));
          const value = nodes[index++];
          return { done: false, value };
        },
        releaseLock() {}
      };
    },
    cancel() { return Promise.resolve(); }
  };
}

export default function StreamingExample() {
  const [stream, setStream] = useState<any>(null);
  const [astStream, setAstStream] = useState<any>(null);
  const [key, setKey] = useState(0);

  const handleStartStream = useCallback(() => {
    console.log('[StreamingExample] Starting HTML stream...');
    const newKey = Date.now();
    setKey(newKey);
    setAstStream(null);
    setStream(createMockStream(SAMPLE_HTML, 50, 50));
  }, []);

  const handleStartASTStream = useCallback(() => {
    console.log('[StreamingExample] Starting AST stream...');
    const newKey = Date.now();
    setKey(newKey);
    setStream(null);
    setAstStream(createMockASTStream(200));
  }, []);

  return (
    <ExampleLayout title="Streaming Content">
      <div style={styles.container}>
        <div style={styles.toolbar}>
          <button style={styles.button} onClick={handleStartStream}>
            Start HTML Stream
          </button>
          <button style={{ ...styles.button, backgroundColor: '#0ea5e9' }} onClick={handleStartASTStream}>
            Start AST Stream
          </button>
        </div>

        <div style={styles.renderArea}>
          <StreamingContentRenderer
            key={key}
            stream={stream}
            astStream={astStream}
            fallback={<div style={styles.fallback}>Click the button above to start streaming content...</div>}
          />
        </div>
      </div>
    </ExampleLayout>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', gap: 20 },
  toolbar: { display: 'flex', gap: 12 },
  button: {
    padding: '10px 20px',
    backgroundColor: '#6c63ff',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600,
  },
  renderArea: {
    minHeight: 400,
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    backgroundColor: 'white',
    padding: 20,
    overflow: 'auto',
  },
  fallback: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    color: '#999',
    fontStyle: 'italic',
  }
};
