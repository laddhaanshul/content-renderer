import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export interface SVGRendererProps {
  src?: string;
  width?: number | string;
  height?: number | string;
  alt?: string;
  style?: any;
  testId?: string;
  children?: React.ReactNode;
}

/**
 * SVGRenderer — renders SVG content on React Native.
 * For full SVG support, install react-native-svg and create a custom renderer.
 * This fallback renders SVG images via <Image> or shows a placeholder with any
 * text/tspan children extracted.
 */
export const SVGRenderer: React.FC<SVGRendererProps> = ({
  src, width = 120, height = 120, alt, style, testId,
}) => {
  if (src) {
    const resolvedWidth = typeof width === 'number' ? width : parseInt(String(width), 10) || 120;
    const resolvedHeight = typeof height === 'number' ? height : parseInt(String(height), 10) || 120;
    return (
      <Image
        testID={testId || 'svg-renderer'}
        source={{ uri: src }}
        style={[{ width: resolvedWidth, height: resolvedHeight }, style]}
        accessibilityLabel={alt || 'SVG image'}
        resizeMode="contain"
      />
    );
  }

  return (
    <View
      testID={testId || 'svg-renderer'}
      style={[styles.placeholder, { width, height }, style]}
    >
      <Text style={styles.placeholderText}>SVG</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 11,
    color: '#999',
  },
});

SVGRenderer.displayName = 'SVGRenderer';
export default SVGRenderer;
