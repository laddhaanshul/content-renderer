#!/usr/bin/env node
/**
 * sync-versions.js
 * ─────────────────────────────────────────────────────────
 * Synchronise all package versions inside the monorepo and
 * update the @content-renderer/core dependency inside
 * @content-renderer/react-and-native automatically.
 *
 * Usage:
 *   node scripts/sync-versions.js 1.2.0
 *   node scripts/sync-versions.js           # reads version from root package.json
 */

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function readPkg(dir) {
  return JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
}

function writePkg(dir, pkg) {
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify(pkg, null, 2) + '\n',
  );
}

const version = process.argv[2] || readPkg(ROOT).version;

if (!/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(version)) {
  console.error(`❌  Invalid version: "${version}". Use semver, e.g. 1.2.0`);
  process.exit(1);
}

console.log(`\n🔖  Syncing all packages to v${version}\n`);

const packages = [
  ROOT,
  path.join(ROOT, 'packages/core'),
  path.join(ROOT, 'packages/react-and-native'),
];

// 1. Bump every package version
for (const dir of packages) {
  const pkg = readPkg(dir);
  const prev = pkg.version;
  pkg.version = version;
  writePkg(dir, pkg);
  console.log(`  ✅  ${pkg.name}:  ${prev}  →  ${version}`);
}

// 2. Update the core pinned dependency inside react-and-native
const ranDir = path.join(ROOT, 'packages/react-and-native');
const ranPkg = readPkg(ranDir);

if (ranPkg.dependencies && '@content-renderer/core' in ranPkg.dependencies) {
  const prev = ranPkg.dependencies['@content-renderer/core'];
  ranPkg.dependencies['@content-renderer/core'] = version;
  writePkg(ranDir, ranPkg);
  console.log(`\n  🔗  react-and-native > @content-renderer/core:  ${prev}  →  ${version}`);
} else {
  console.warn('  ⚠️  @content-renderer/core dep not found in react-and-native/package.json');
}

console.log('\n✨  Done! Run `npm install` or `yarn` to update the lockfile.\n');
