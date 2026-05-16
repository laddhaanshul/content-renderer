/**
 * PHPRenderer – renders PHP source code with PHP-specific syntax highlighting.
 *
 * A thin wrapper around CodeRenderer that defaults to PHP language detection
 * and provides PHP-aware defaults.
 */

import React from 'react';
import CodeRenderer from './CodeRenderer';
import type { NativeTheme } from '../themes/native';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PHPRendererProps {
  /** PHP source code */
  code: string;
  /** Language hint */
  language?: string;
  /** File name */
  fileName?: string;
  /** Theme */
  theme?: any;
  /** Additional props */
  [key: string]: any;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const PHPRenderer: React.FC<PHPRendererProps> = ({
  code,
  language = 'php',
  fileName: fileNameProp = 'code.php',
  ...rest
}) => {
  return (
    <CodeRenderer
      code={code}
      language={language}
      fileName={fileNameProp}
      {...rest}
    />
  );
};

PHPRenderer.displayName = 'PHPRenderer';

export default PHPRenderer;
