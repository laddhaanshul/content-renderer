// ─── Platform-Aware Component Exports ───────────────────────────────────────
// Each component auto-selects web (.web.tsx) or native (.native.tsx) variant

export { ContentRenderer } from './ContentRenderer';
export { HTMLRenderer } from './HTMLRenderer';
export { CodeRenderer } from './CodeRenderer';
export { JSONRenderer } from './JSONRenderer';
export { PHPRenderer } from './PHPRenderer';
export { MarkdownRenderer } from './MarkdownRenderer';
export { XMLRenderer } from './XMLRenderer';
export { CSSRenderer } from './CSSRenderer';
export { ErrorBoundary } from './ErrorBoundary';
export { ContentServiceRenderer } from './ContentServiceRenderer';

// ─── Default Exports ────────────────────────────────────────────────────────
export { default } from './ContentRenderer';

export { default as SVGRenderer } from './SVGRenderer';