import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ExampleLayout from './components/ExampleLayout';
import HTMLExample from './pages/HTMLExample';
import JSONExample from './pages/JSONExample';
import MarkdownExample from './pages/MarkdownExample';
import CodeExample from './pages/CodeExample';
import PHPExample from './pages/PHPExample';
import XMLExample from './pages/XMLExample';
import CSSExample from './pages/CSSExample';
import AutoDetectExample from './pages/AutoDetectExample';
import ExtractionExample from './pages/ExtractionExample';
import ThemeExample from './pages/ThemeExample';
import HooksExample from './pages/HooksExample';
import HOCExample from './pages/HOCExample';
import ContentServiceExample from './pages/ContentServiceExample';
import VirtualizedExample from './pages/VirtualizedExample';
import PluginExample from './pages/PluginExample';
import AccessibilityExample from './pages/AccessibilityExample';
import SSRExample from './pages/SSRExample';
import ErrorRecoveryExample from './pages/ErrorRecoveryExample';
import I18NExample from './pages/I18NExample';
import AnimationExample from './pages/AnimationExample';
import PDFExportExample from './pages/PDFExportExample';
import DiffView from './pages/DiffView';
import JSONPathQuery from './pages/JSONPathQuery';
import ThemesShowcase from './pages/ThemesShowcase';
import SanitizeDemo from './pages/SanitizeDemo';
import LanguageSupport from './pages/LanguageSupport';
import EnhancedI18N from './pages/EnhancedI18N';
import StreamingExample from './pages/StreamingExample';

const pages: Record<string, { label: string; component: React.FC }> = {
  html: { label: 'HTML', component: HTMLExample },
  json: { label: 'JSON', component: JSONExample },
  markdown: { label: 'Markdown', component: MarkdownExample },
  code: { label: 'Code', component: CodeExample },
  php: { label: 'PHP', component: PHPExample },
  xml: { label: 'XML', component: XMLExample },
  css: { label: 'CSS', component: CSSExample },
  'auto-detect': { label: 'Auto-Detect', component: AutoDetectExample },
  extraction: { label: 'Extraction', component: ExtractionExample },
  streaming: { label: 'Streaming (New)', component: StreamingExample },
  theme: { label: 'Theme', component: ThemeExample },
  hooks: { label: 'Hooks', component: HooksExample },
  hoc: { label: 'HOC', component: HOCExample },
  'content-service': { label: 'Content Service', component: ContentServiceExample },
  'virtualized': { label: 'Virtualized HTML', component: VirtualizedExample },
  plugins: { label: 'Advanced Plugins', component: PluginExample },
  accessibility: { label: 'Accessibility', component: AccessibilityExample },
  ssr: { label: 'SSR', component: SSRExample },
  'error-recovery': { label: 'Error Recovery', component: ErrorRecoveryExample },
  i18n: { label: 'i18n', component: I18NExample },
  animations: { label: 'Animations', component: AnimationExample },
  'pdf-export': { label: 'PDF Export', component: PDFExportExample },
  diff: { label: 'Diff View', component: DiffView },
  jsonpath: { label: 'JSONPath', component: JSONPathQuery },
  themes: { label: 'Syntax Themes', component: ThemesShowcase },
  sanitize: { label: 'Sanitization', component: SanitizeDemo },
  languages: { label: 'Languages', component: LanguageSupport },
  'i18n-enhanced': { label: 'Enhanced i18n', component: EnhancedI18N },
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('html');

  const PageComponent = pages[currentPage]?.component ?? HTMLExample;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        pages={Object.fromEntries(
          Object.entries(pages).map(([key, val]) => [key, val.label])
        )}
      />
      <ExampleLayout title={pages[currentPage]?.label ?? 'HTML'}>
        <PageComponent />
      </ExampleLayout>
    </div>
  );
}
