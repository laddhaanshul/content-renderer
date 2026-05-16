// Platform-aware component: picks .web or .native implementation
// @ts-ignore
import { Platform } from 'react-native';

// Web (React DOM) implementation
import WebComponent from './ContentServiceRenderer.web';

// Native (React Native) implementation
// @ts-ignore
import NativeComponent from './ContentServiceRenderer.native';

const isNative = typeof Platform !== 'undefined' && Platform.OS !== 'web';

const ContentServiceRenderer = (isNative ? NativeComponent : WebComponent) as any;

export default ContentServiceRenderer;
export { ContentServiceRenderer };
