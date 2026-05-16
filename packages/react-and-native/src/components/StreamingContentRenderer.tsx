import React from 'react';
import { Platform } from 'react-native';
import WebRenderer from './StreamingContentRenderer.web';
import NativeRenderer from './StreamingContentRenderer.native';

/**
 * Universal Streaming Content Renderer
 * Automatically selects Web or Native implementation.
 */
const StreamingContentRenderer: React.FC<any> = (props) => {
  const isWeb = Platform.OS === 'web';
  const Renderer = isWeb ? WebRenderer : NativeRenderer;
  
  if (!Renderer) {
    return null;
  }
  
  return <Renderer {...props} />;
};

export default StreamingContentRenderer;
export { StreamingContentRenderer };
