// Learn more https://docs.expo.dev/guides/monorepos/
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages and in what order
//    Project root first, then workspace root (so local overrides take precedence)
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Ensure packages installed only at workspace root (e.g. expo-linking,
//    react-native-reanimated) are found when required from deep in node_modules
config.resolver.extraNodeModules = {
  ...new Proxy(
    {},
    {
      get: (target, name) => {
        if (typeof name !== 'string') return target[name];
        return (
          target[name] ||
          path.join(workspaceRoot, 'node_modules', name)
        );
      },
    }
  ),
  'react': path.resolve(projectRoot, 'node_modules/react'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
};

// 4. Ensure we can resolve .native.ts/.native.tsx files properly
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// 5. Source extensions — list base extensions only; Metro handles the
//    .native.* suffix automatically via the platforms array above
config.resolver.sourceExts = [
  'js',
  'jsx',
  'ts',
  'tsx',
  'json',
  'cjs',
  'mjs',
];

module.exports = config;

