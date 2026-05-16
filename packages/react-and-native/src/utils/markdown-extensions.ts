import type { MarkdownNode } from '@content-renderer/core';

export interface MarkdownExtension {
  name: string;
  /** Hook called on each node during parsing; return modified node or null to remove. */
  transform?: (node: MarkdownNode) => MarkdownNode | null;
  /** Hook called after full parsing; return modified nodes array. */
  postProcess?: (nodes: MarkdownNode[]) => MarkdownNode[];
}

/**
 * Apply a list of markdown extensions to parsed AST nodes.
 * Each extension can transform individual nodes or post-process the full tree.
 */
export function applyMarkdownExtensions(
  nodes: MarkdownNode[],
  extensions: MarkdownExtension[],
): MarkdownNode[] {
  if (!extensions || extensions.length === 0) return nodes;

  let result = [...nodes];

  for (const ext of extensions) {
    if (ext.transform) {
      result = result
        .map(node => ext.transform!(node))
        .filter((node): node is MarkdownNode => node !== null);
    }
  }

  for (const ext of extensions) {
    if (ext.postProcess) {
      result = ext.postProcess(result);
    }
  }

  return result;
}
