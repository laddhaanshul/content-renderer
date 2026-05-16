import React from 'react';

export default function VirtualizedExample() {
  return (
    <div style={{ padding: 24 }}>
      <h2>Virtualized Rendering</h2>
      <p>Virtualized rendering efficiently handles large lists and documents by only rendering items that are currently visible in the viewport. This dramatically improves performance when displaying thousands of lines of code or large HTML documents.</p>
      <h3>Key Features</h3>
      <ul>
        <li>Windowed rendering - only visible items are mounted in the DOM</li>
        <li>Dynamic row heights support for code with variable line lengths</li>
        <li>Infinite scroll with on-demand content loading</li>
        <li>Smooth scrolling performance even with 100,000+ items</li>
      </ul>
      <h3>Usage</h3>
      <pre>{`import { VirtualizedCodeRenderer } from '@content-renderer/react-and-native';

<VirtualizedCodeRenderer
  code={largeCodeString}
  language="javascript"
  rowHeight={20}
  overscanCount={10}
/>`}</pre>
    </div>
  );
}
