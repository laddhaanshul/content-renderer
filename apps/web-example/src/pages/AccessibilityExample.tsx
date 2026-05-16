import React from 'react';

export default function AccessibilityExample() {
  return (
    <div style={{ padding: 24 }}>
      <h2>Accessibility (a11y)</h2>
      <p>Built-in accessibility support ensures your rendered content is usable by everyone, including screen reader users and keyboard navigators.</p>
      <h3>Features</h3>
      <ul>
        <li>Automatic ARIA role detection for HTML elements</li>
        <li>Keyboard navigation support for interactive content</li>
        <li>Screen reader text generation for icons and images</li>
        <li>Color contrast checking against WCAG 2.1 guidelines</li>
        <li>Heading level validation for document structure</li>
        <li>Accessible tree generation for complex content</li>
      </ul>
      <h3>Usage</h3>
      <pre>{`import {
  validateAccessibility,
  getAriaRole,
  checkColorContrast,
} from '@content-renderer/core';

const issues = validateAccessibility(html, {
  checkContrast: true,
  checkHeadingOrder: true,
});

const role = getAriaRole('nav'); // 'navigation'

const result = checkColorContrast('#333', '#fff');
// { ratio: 12.63, aa: true, aaa: true }`}</pre>
    </div>
  );
}
