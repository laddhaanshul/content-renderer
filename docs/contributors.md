# Contributors Guide

Thank you for your interest in contributing to content-renderer! This guide covers everything you need to get started.

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 (or yarn / pnpm)
- **Git** for version control
- A code editor with TypeScript support (VS Code recommended)

### Development Setup

```bash
# 1. Fork and clone the repository
git clone https://github.com/your-username/content-renderer.git
cd content-renderer

# 2. Install dependencies
npm install

# 3. Build all packages
npm run build

# 4. Run tests to verify everything works
npm test

# 5. Start the web example app (optional)
npm run dev:web
```

### Project Structure Overview

```
content-renderer/
├── packages/
│   ├── core/           # Parsers, utilities, hooks, HOCs, themes (platform-agnostic)
│   ├── react/          # React DOM components
│   └── react-native/   # React Native components
├── apps/
│   ├── web-example/    # Vite + React example app
│   └── native-example/ # Expo example app
└── docs/               # Documentation
```

---

## Code Style

### TypeScript

- Strict mode is enabled in all `tsconfig.json` files
- Use explicit return types on exported functions
- Prefer `interface` over `type` for object shapes
- Use `as const` for literal types where appropriate
- No `any` types without explicit justification

```typescript
// ✅ Good
export function parseHTML(content: string): HTMLDocument { ... }

// ❌ Bad
export function parseHTML(content) { ... }
```

### Formatting

Prettier is used for code formatting. Configuration is enforced via `lint-staged`:

```bash
# Format all files
npx prettier --write "packages/**/*.{ts,tsx,json,md}"
```

### Linting

ESLint enforces code quality:

```bash
# Lint all packages
npm run lint
```

---

## Commit Conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Commits are automatically validated via husky.

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat: add XML XPath query support` |
| `fix` | Bug fix | `fix: handle unclosed tags in HTML parser` |
| `docs` | Documentation | `docs: add JSONParser API reference` |
| `style` | Code style | `style: format with prettier` |
| `refactor` | Code refactor | `refactor: simplify attribute conversion` |
| `perf` | Performance | `perf: memoize common props in ContentRenderer` |
| `test` | Tests | `test: add HTMLParser validation tests` |
| `chore` | Maintenance | `chore: update dependencies` |
| `ci` | CI/CD | `ci: add GitHub Actions workflow` |
| `build` | Build system | `build: update tsconfig for strict mode` |

### Scope

The scope should indicate which package is affected:

```
feat(core): add CSS specificity calculator
feat(react): add CodeRenderer line highlighting
feat(react-native): implement HTML-to-RN mapping
fix(core): handle malformed JSON with trailing commas
docs: update README with new examples
```

### Breaking Changes

For breaking changes, append `!` to the type and include a body with migration instructions:

```
feat(core)!: change HTMLParser constructor signature

BREAKING CHANGE: The HTMLParser constructor now requires an
options object instead of individual parameters.

Migration:
- Before: new HTMLParser(true, false, true)
- After: new HTMLParser({ lowercaseTags: true })
```

---

## Branch Naming

- `main` — Production branch, always deployable
- `develop` — Integration branch for next release
- `feature/<short-description>` — New features
- `fix/<short-description>` — Bug fixes
- `docs/<short-description>` — Documentation changes
- `chore/<short-description>` — Maintenance tasks
- `release/<version>` — Release preparation branches

```bash
# Creating a feature branch
git checkout -b feature/xml-xpath-support

# Creating a fix branch
git checkout -b fix/html-unclosed-tags
```

---

## Pull Request Process

### Before Submitting

1. **Rebase** on the target branch (`main` or `develop`)
2. **Ensure all tests pass:** `npm test`
3. **Run the linter:** `npm run lint`
4. **Type check:** `npm run typecheck`
5. **Build succeeds:** `npm run build`

### PR Template

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Refactor

## Testing
- [ ] Unit tests added/updated
- [ ] All existing tests pass
- [ ] Manual testing performed

## Screenshots (if applicable)
Add screenshots for UI changes.

## Checklist
- [ ] Code follows project conventions
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No unnecessary dependencies added
```

### Review Criteria

1. **Correctness** — Does the code do what it claims?
2. **Type Safety** — Are types used correctly and consistently?
3. **Performance** — Are there unnecessary re-renders or computations?
4. **Security** — Is there proper input sanitization?
5. **Backwards Compatibility** — Are breaking changes properly communicated?
6. **Documentation** — Are public APIs documented?

---

## Testing Guidelines

### Unit Tests

Tests use Jest with ts-jest. Each package has its own test configuration.

```bash
# Run tests for a specific package
npm run test:core
npm run test:react
npm run test:react-native

# Run in watch mode
npm run test:core -- --watch

# Run with coverage
npm run test:coverage
```

### What to Test

- **Parsers:** Valid and invalid inputs, edge cases, malformed content
- **Extraction:** Various HTML/Markdown/CSS structures
- **Sanitization:** XSS attempts, dangerous attributes, malicious URLs
- **Validation:** Boundary cases, empty strings, malformed content
- **Components:** Rendering output, prop handling, error states
- **Hooks:** State management, error handling, cleanup

### Test Structure

```typescript
// packages/core/src/__tests__/parsers/html-parser.test.ts

import { HTMLParser } from '../../parsers/html-parser';

describe('HTMLParser', () => {
  const parser = new HTMLParser();

  describe('parse', () => {
    it('should parse a simple HTML document', () => {
      const doc = parser.parse('<html><body><h1>Hello</h1></body></html>');
      expect(doc.body).toBeDefined();
    });

    it('should extract metadata from head', () => {
      const doc = parser.parse('<html><head><title>Test</title></head></html>');
      expect(doc.metadata.title).toBe('Test');
    });

    it('should handle unclosed tags gracefully', () => {
      const doc = parser.parse('<div><span>text');
      expect(doc.nodes.length).toBeGreaterThan(0);
    });
  });

  describe('validate', () => {
    it('should return valid for well-formed HTML', () => {
      const result = parser.validate('<div><p>Hello</p></div>');
      expect(result.valid).toBe(true);
    });

    it('should detect unclosed tags', () => {
      const result = parser.validate('<div><span>');
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });
  });
});
```

### Integration Tests

The web example app serves as an integration testbed. Run it locally to visually verify changes.

---

## Documentation Guidelines

### When to Write Docs

- All public APIs must be documented
- New features require README updates
- Breaking changes require migration guides
- Architecture decisions should be recorded in `docs/context.md`

### Documentation Style

- Use clear, concise language
- Include code examples for every public API
- Use proper Markdown formatting (tables, code blocks, links)
- Maintain consistent terminology throughout

### Files to Update

- `packages/core/README.md` — Core API changes
- `packages/react-and-native/README.md` — React component changes
- `packages/react-native/README.md` — React Native changes
- `docs/skills.md` — New parsing/extraction skills
- `docs/context.md` — Architecture decisions

---

## Architecture Decisions

### Adding a New Parser

1. Create `packages/core/src/parsers/your-parser.ts` implementing a `parse()` method
2. Add the parser to `packages/core/src/parsers/index.ts`
3. Export from `packages/core/src/index.ts`
4. Add content type to `ContentType` in `types/index.ts`
5. Add detection heuristics to `detectContentType()` in `utils/transform.ts`
6. Create renderer components in both `react` and `react-native` packages
7. Add the type case to `ContentRenderer`'s switch statement
8. Write comprehensive tests

### Adding a New Utility

1. Create the function in `packages/core/src/utils/your-util.ts`
2. Export from `packages/core/src/utils/index.ts`
3. Export from `packages/core/src/index.ts`
4. Add JSDoc comments with `@param`, `@returns`, and examples
5. Write tests

### Parser Design Philosophy

- Parsers should be synchronous and stateless (create new instances for different options)
- All parsers return a typed document object
- Parsers should be tolerant of malformed input (parse what they can, report errors)
- Each parser includes a `validate()` method for checking without parsing
- Parsers should handle edge cases (empty input, null bytes, BOM, mixed encodings)

### Renderer Design Philosophy

- Renderers are React components that accept a content string
- All renderers support `theme`, `className`, `style`, `testID`, and `fallback` props
- Error states are handled gracefully with fallback components
- Components are memoized to prevent unnecessary re-renders
- Accessibility is supported via `accessible` and `accessibilityLabel` props

---

## Common Patterns

### Content Type Detection

Always use `detectContentType()` for auto-detection rather than manual type checking. The function applies heuristics in the correct priority order.

### Error Handling Pattern

```typescript
try {
  const result = parser.parse(content);
  if (result.errors.length > 0) {
    // Handle parse errors
  }
} catch (error) {
  // Handle unexpected errors
}
```

### Plugin Pattern

```typescript
const plugin: ContentRendererPlugin = {
  name: 'my-plugin',
  version: '1.0.0',
  beforeParse: (content) => preprocess(content),
  afterParse: (parsed) => enrich(parsed),
};
```

---

## Release Process

1. Ensure all tests pass: `npm test`
2. Update `CHANGELOG.md` with all changes since last release
3. Bump version: `npm run version:patch|minor|major`
4. Build all packages: `npm run build:all`
5. Push with tags: `git push --follow-tags`
6. Verify the publish works in a clean project

---

## Getting Help

- Open a [GitHub Discussion](https://github.com/user/content-renderer/discussions) for questions
- Open a [GitHub Issue](https://github.com/user/content-renderer/issues) for bugs
- Check existing issues and documentation before creating a new one
