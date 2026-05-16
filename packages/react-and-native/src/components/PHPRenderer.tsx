// Platform-aware component: picks .web or .native implementation
// @ts-ignore
import { Platform, StyleSheet } from 'react-native';

// Web (React DOM) implementation
import WebComponent from './PHPRenderer.web';

// Native (React Native) implementation
// @ts-ignore
import NativeComponent from './PHPRenderer.native';

const isNative = typeof Platform !== 'undefined' && Platform.OS !== 'web';

const PHPRenderer = (isNative ? NativeComponent : WebComponent) as any;

export default PHPRenderer;
export { PHPRenderer };
