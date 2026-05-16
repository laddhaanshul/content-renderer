import React from 'react';

interface ExampleLayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function ExampleLayout({ title, children }: ExampleLayoutProps) {
  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <h1 style={styles.heading}>{title} Renderer</h1>
        <p style={styles.description}>
          Interactive examples demonstrating the{' '}
          <code style={styles.code}>{title}</code> rendering capabilities of
          @laddhaanshul/content-renderer.
        </p>
      </header>
      <main style={styles.content}>{children}</main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    flex: 1,
    overflowY: 'auto' as const,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: '24px 32px 16px',
    borderBottom: '1px solid #e0e0e0',
    background: '#ffffff',
  },
  heading: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1a1a2e',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 1.5,
  },
  code: {
    background: '#f0f0f8',
    padding: '2px 6px',
    borderRadius: 4,
    fontSize: 13,
    color: '#6c63ff',
    fontFamily: "'SF Mono', 'Fira Code', monospace",
  },
  content: {
    flex: 1,
    padding: 24,
  },
};
