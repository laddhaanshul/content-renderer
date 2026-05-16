// Platform-aware component: picks .web or .native implementation
// @ts-ignore
import { Platform, StyleSheet } from 'react-native';
import { applyMarkdownExtensions } from '../utils/markdown-extensions';

// Web (React DOM) implementation
import WebComponent from './MarkdownRenderer.web';

// Native (React Native) implementation
// @ts-ignore
import NativeComponent from './MarkdownRenderer.native';

const isNative = typeof Platform !== 'undefined' && Platform.OS !== 'web';

const MarkdownRenderer = isNative ? NativeComponent : WebComponent;

export default MarkdownRenderer;
export { MarkdownRenderer };
