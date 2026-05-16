// Platform-aware component: picks .web or .native implementation
// @ts-ignore
import { Platform, StyleSheet } from 'react-native';

// Web (React DOM) implementation
import WebComponent from './ContentRenderer.web';

// Native (React Native) implementation
// @ts-ignore
import NativeComponent from './ContentRenderer.native';

const isNative = typeof Platform !== 'undefined' && Platform.OS !== 'web';

const ContentRenderer = (isNative ? NativeComponent : WebComponent) as any;

export default ContentRenderer;
export { ContentRenderer };
