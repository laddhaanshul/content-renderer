import React from 'react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  pages: Record<string, string>;
}

export default function Sidebar({ currentPage, onNavigate, pages }: SidebarProps) {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>
        <span style={styles.logoIcon}>&#9672;</span>
        <span style={styles.logoText}>Content Renderer</span>
      </div>
      <nav style={styles.nav}>
        <div style={styles.sectionLabel}>Examples</div>
        {Object.entries(pages).map(([key, label]) => (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            style={{
              ...styles.navItem,
              ...(currentPage === key ? styles.navItemActive : {}),
            }}
          >
            {label}
          </button>
        ))}
      </nav>
      <div style={styles.footer}>
        <span style={styles.version}>v1.0.0</span>
      </div>
    </aside>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 220,
    background: '#1a1a2e',
    color: '#e0e0e0',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    borderRight: '1px solid #2a2a4a',
    position: 'sticky' as const,
    top: 0,
    height: '100vh',
    overflowY: 'auto' as const,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '20px 16px 12px',
    borderBottom: '1px solid #2a2a4a',
  },
  logoIcon: {
    fontSize: 22,
    color: '#6c63ff',
  },
  logoText: {
    fontSize: 15,
    fontWeight: 700,
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  nav: {
    flex: 1,
    padding: '12px 8px',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    color: '#888',
    padding: '8px 12px 4px',
    letterSpacing: 0.5,
  },
  navItem: {
    display: 'block',
    width: '100%',
    textAlign: 'left' as const,
    background: 'transparent',
    border: 'none',
    color: '#b0b0cc',
    fontSize: 14,
    padding: '8px 12px',
    borderRadius: 6,
    cursor: 'pointer',
    transition: 'all 0.15s',
    marginBottom: 2,
  },
  navItemActive: {
    background: '#6c63ff22',
    color: '#6c63ff',
    fontWeight: 600,
  },
  footer: {
    padding: '12px 16px',
    borderTop: '1px solid #2a2a4a',
  },
  version: {
    fontSize: 12,
    color: '#666',
  },
};
