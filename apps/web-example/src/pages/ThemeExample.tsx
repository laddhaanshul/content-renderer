import React, { useState, createContext, useContext } from 'react';
import CodeBlock from '../components/CodeBlock';

/* ---------- Simple Theme System Demo ---------- */
interface DemoTheme {
  name: string;
  colors: {
    bg: string;
    surface: string;
    text: string;
    textSecondary: string;
    primary: string;
    border: string;
    codeBg: string;
  };
  font: string;
}

const lightTheme: DemoTheme = {
  name: 'Light',
  colors: {
    bg: '#ffffff',
    surface: '#f8f8fc',
    text: '#1a1a2e',
    textSecondary: '#666680',
    primary: '#6c63ff',
    border: '#e0e0ee',
    codeBg: '#f5f5f8',
  },
  font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

const darkTheme: DemoTheme = {
  name: 'Dark',
  colors: {
    bg: '#0f0f1a',
    surface: '#1a1a2e',
    text: '#e0e0f0',
    textSecondary: '#8888aa',
    primary: '#8b85ff',
    border: '#2a2a4a',
    codeBg: '#252540',
  },
  font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

const customTheme: DemoTheme = {
  name: 'Ocean',
  colors: {
    bg: '#0a192f',
    surface: '#112240',
    text: '#ccd6f6',
    textSecondary: '#8892b0',
    primary: '#64ffda',
    border: '#233554',
    codeBg: '#0d1f3c',
  },
  font: "'JetBrains Mono', 'SF Mono', monospace",
};

const themes = { light: lightTheme, dark: darkTheme, ocean: customTheme };

const ThemeContext = createContext<DemoTheme>(lightTheme);

function useDemoTheme() {
  return useContext(ThemeContext);
}

function ThemedCard({ title, content }: { title: string; content: string }) {
  const theme = useDemoTheme();
  return (
    <div style={{
      background: theme.colors.surface,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: 12,
      padding: 20,
      transition: 'all 0.3s',
    }}>
      <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600, color: theme.colors.text }}>
        {title}
      </h3>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: theme.colors.textSecondary }}>
        {content}
      </p>
    </div>
  );
}

function ThemedCodeBlock() {
  const theme = useDemoTheme();
  return (
    <div style={{
      background: theme.colors.codeBg,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: 8,
      padding: 16,
      fontFamily: "'SF Mono', 'Fira Code', monospace",
      fontSize: 13,
      lineHeight: 1.7,
      overflow: 'auto',
    }}>
      <div><span style={{ color: theme.colors.primary }}>import</span> {'{'} HTMLRenderer {'}'} <span style={{ color: theme.colors.primary }}>from</span> <span style={{ color: '#0a8f4f' }}>'@laddhaanshul/content-renderer'</span>;</div>
      <div style={{ marginTop: 8 }}>
        <span style={{ color: theme.colors.primary }}>const</span> {'<'}<span style={{ color: theme.colors.primary }}>App</span> {'/>'} = () {'=>'} {'('}
      </div>
      <div>  {'<'}<span style={{ color: theme.colors.primary }}>HTMLRenderer</span></div>
      <div>    {'content'}={'{'}htmlString{'}'}</div>
      <div>    {'theme'}={'{'}`"${theme.name.toLowerCase()}"`{'}'}</div>
      <div>  {'/>'}</div>
      <div>{')'}</div>
    </div>
  );
}

function ThemedButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  const theme = useDemoTheme();
  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 24px',
        background: theme.colors.primary,
        color: theme.colors.bg,
        border: 'none',
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {children}
    </button>
  );
}

export default function ThemeExample() {
  const [themeName, setThemeName] = useState<'light' | 'dark' | 'ocean'>('light');
  const theme = themes[themeName];

  return (
    <ThemeContext.Provider value={theme}>
      <div style={{
        background: theme.colors.bg,
        color: theme.colors.text,
        fontFamily: theme.font,
        padding: 24,
        borderRadius: 12,
        border: `1px solid ${theme.colors.border}`,
        transition: 'all 0.3s',
      }}>
        {/* Theme selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {(Object.keys(themes) as Array<'light' | 'dark' | 'ocean'>).map(name => (
            <button
              key={name}
              onClick={() => setThemeName(name)}
              style={{
                padding: '8px 20px',
                background: themeName === name ? theme.colors.primary : theme.colors.surface,
                color: themeName === name ? theme.colors.bg : theme.colors.text,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {themes[name].name}
            </button>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: theme.colors.textSecondary }}>Current:</span>
            <span style={{
              padding: '2px 10px',
              background: theme.colors.primary + '22',
              color: theme.colors.primary,
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 700,
            }}>
              {theme.name}
            </span>
          </div>
        </div>

        {/* Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}>
          <ThemedCard
            title="Themed Cards"
            content="Components automatically adapt their colors based on the active theme. No manual styling needed."
          />
          <ThemedCard
            title="Theme Context"
            content="Use the ThemeContext and useTheme hook to access theme values anywhere in your component tree."
          />
          <ThemedCard
            title="Smooth Transitions"
            content="Theme changes are animated with CSS transitions for a polished user experience."
          />
        </div>

        {/* Code Block */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Themed Code Block</h3>
          <ThemedCodeBlock />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <ThemedButton onClick={() => alert('Clicked!')}>Primary Action</ThemedButton>
          <ThemedButton onClick={() => setThemeName(themeName === 'light' ? 'dark' : 'light')}>
            Toggle Light/Dark
          </ThemedButton>
        </div>

        {/* Color Palette */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Color Palette</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(theme.colors).map(([key, value]) => (
              <div key={key} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  background: value,
                  border: `1px solid ${theme.colors.border}`,
                }} />
                <span style={{ fontSize: 10, color: theme.colors.textSecondary }}>{key}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Usage */}
      <div style={{ marginTop: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#1a1a2e' }}>Usage</h3>
        <CodeBlock
          language="tsx"
          title="Theme API"
          code={`import { lightTheme, darkTheme, useTheme, ThemeContext } from '@laddhaanshul/content-renderer-core';

function App() {
  const [theme, setTheme] = useState(lightTheme);

  return (
    <ThemeContext.Provider value={theme}>
      <MyContent />
      <button onClick={() => setTheme(
        theme === lightTheme ? darkTheme : lightTheme
      )}>
        Toggle Theme
      </button>
    </ThemeContext.Provider>
  );
}

function MyContent() {
  const { colors, fonts } = useTheme();

  return (
    <div style={{
      background: colors.background,
      color: colors.text,
      fontFamily: fonts.body,
    }}>
      {/* themed content */}
    </div>
  );
}`}
        />
      </div>
    </ThemeContext.Provider>
  );
}
