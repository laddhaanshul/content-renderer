import React from 'react';

export interface SVGRendererProps {
  src?: string;
  width?: number | string;
  height?: number | string;
  alt?: string;
  style?: React.CSSProperties;
  className?: string;
  testId?: string;
  children?: React.ReactNode;
}

/**
 * SVGRenderer — renders SVG content on web.
 * Falls back to dangerouslySetInnerHTML for raw SVG strings,
 * or renders children as inline SVG elements.
 */
export const SVGRenderer: React.FC<SVGRendererProps> = ({
  src, width = '100%', height = 'auto', alt, style, className, testId, children,
}) => {
  if (children) {
    return (
      <svg
        data-testid={testId || 'svg-renderer'}
        className={className}
        style={{ width, height, ...style }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {children}
      </svg>
    );
  }

  if (src) {
    return (
      <img
        data-testid={testId || 'svg-renderer'}
        className={className}
        src={src}
        alt={alt || 'SVG image'}
        width={typeof width === 'number' ? width : undefined}
        height={typeof height === 'number' ? height : undefined}
        style={{ width, height, ...style }}
      />
    );
  }

  return null;
};

SVGRenderer.displayName = 'SVGRenderer';
export default SVGRenderer;
