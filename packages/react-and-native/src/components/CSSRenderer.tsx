// Platform-aware component: picks .web or .native implementation
// @ts-ignore
import { Platform, StyleSheet } from 'react-native';

// Web (React DOM) implementation
import WebComponent from './CSSRenderer.web';

// Native (React Native) implementation
// @ts-ignore
import NativeComponent from './CSSRenderer.native';

const isNative = typeof Platform !== 'undefined' && Platform.OS !== 'web';

const CSSRenderer = (isNative ? NativeComponent : WebComponent) as any;

export default CSSRenderer;
export { CSSRenderer };
