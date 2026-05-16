import React from 'react';

export default function ErrorRecoveryExample() {
  return (
    <div style={{ padding: 24 }}>
      <h2>Error Recovery</h2>
      <p>Graceful error recovery ensures your application never crashes due to malformed content. The renderer automatically detects and recovers from common content errors.</p>
      <h3>Supported Recovery</h3>
      <ul>
        <li><strong>HTML</strong> - Unclosed tags, mismatched nesting, invalid entities</li>
        <li><strong>JSON</strong> - Trailing commas, unquoted keys, single quotes</li>
        <li><strong>Markdown</strong> - Broken links, malformed lists, unclosed code blocks</li>
        <li><strong>CSS</strong> - Missing semicolons, invalid selectors</li>
        <li><strong>XML</strong> - Unclosed tags, invalid characters</li>
      </ul>
      <h3>Usage</h3>
      <pre>{`import {
  recoverFromHTMLError,
  recoverFromJSONError,
  suggestFixes,
} from '@content-renderer/core';

const result = recoverFromHTMLError(brokenHTML);
// { content: string, errors: string[], fixed: boolean }

const suggestions = suggestFixes(content, 'json');
// ["Remove trailing comma on line 5"]`}</pre>
    </div>
  );
}
