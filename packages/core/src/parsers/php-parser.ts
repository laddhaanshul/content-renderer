import {
  PHPDocument,
  PHPNode,
  PHPClass,
  PHPFunction,
  PHPParameter,
  PHPProperty,
  ContentMetadata,
  ParseError,
  ParseWarning,
} from '../types';

export interface PHPParseOptions {
  extractDocBlocks?: boolean;
  includeMethodBodies?: boolean;
  trackLineNumbers?: boolean;
}

export class PHPParser {
  private options: Required<PHPParseOptions>;

  constructor(options?: PHPParseOptions) {
    this.options = {
      extractDocBlocks: options?.extractDocBlocks ?? true,
      includeMethodBodies: options?.includeMethodBodies ?? false,
      trackLineNumbers: options?.trackLineNumbers ?? true,
    };
  }

  parse(content: string, options?: PHPParseOptions): PHPDocument {
    const opts = { ...this.options, ...(options || {}) };
    const nodes: PHPNode[] = [];
    const errors: ParseError[] = [];
    const warnings: ParseWarning[] = [];
    let currentNamespace: string | undefined;
    const uses: string[] = [];
    const classes: PHPClass[] = [];
    const functions: PHPFunction[] = [];
    const variables: string[] = [];

    const lines = content.split('\n');
    let i = 0;
    let inPhpBlock = false;
    let braceDepth = 0;
    let currentDocBlock: string | undefined;
    let currentVisibility: 'public' | 'private' | 'protected' | 'static' = 'public';

    while (i < lines.length) {
      const line = lines[i];
      const lineNumber = i + 1;

      // Check for PHP opening/closing tags
      if (line.includes('<?php') || line.includes('<?=')) {
        inPhpBlock = true;
        i++;
        continue;
      }
      if (line.includes('?>')) {
        inPhpBlock = false;
        i++;
        continue;
      }

      if (!inPhpBlock) {
        // Text outside PHP tags
        nodes.push({ type: 'text', content: line, line: lineNumber });
        i++;
        continue;
      }

      const trimmed = line.trim();

      // DocBlock
      if (trimmed.startsWith('/**')) {
        const docLines: string[] = [];
        docLines.push(trimmed);
        while (i < lines.length - 1 && !trimmed.endsWith('*/')) {
          i++;
          docLines.push(lines[i].trim());
          if (lines[i].trim().endsWith('*/')) break;
        }
        currentDocBlock = docLines.join('\n');
        i++;
        continue;
      }

      // Single line comment
      if (trimmed.startsWith('//') || trimmed.startsWith('#')) {
        nodes.push({
          type: 'comment',
          content: trimmed,
          line: lineNumber,
        });
        i++;
        continue;
      }

      // Multi-line comment
      if (trimmed.startsWith('/*')) {
        const commentLines: string[] = [];
        commentLines.push(trimmed);
        while (i < lines.length - 1 && !trimmed.endsWith('*/')) {
          i++;
          commentLines.push(lines[i].trim());
          if (lines[i].trim().endsWith('*/')) break;
        }
        nodes.push({
          type: 'comment',
          content: commentLines.join('\n'),
          line: lineNumber,
        });
        i++;
        continue;
      }

      // Namespace
      const nsMatch = trimmed.match(/^namespace\s+([\w\\]+)/);
      if (nsMatch) {
        currentNamespace = nsMatch[1];
        nodes.push({
          type: 'namespace',
          name: currentNamespace,
          content: trimmed,
          line: lineNumber,
        });
        i++;
        continue;
      }

      // Use statements
      const useMatch = trimmed.match(/^use\s+([\w\\]+)(?:\s+as\s+(\w+))?/);
      if (useMatch) {
        const useStatement = useMatch[1];
        uses.push(useStatement);
        nodes.push({
          type: 'use',
          name: useStatement,
          content: trimmed,
          line: lineNumber,
        });
        i++;
        continue;
      }

      // Use function/class
      const useFuncMatch = trimmed.match(/^use\s+(function|class)\s+([\w\\]+)/);
      if (useFuncMatch) {
        const useStatement = useFuncMatch[2];
        uses.push(useStatement);
        nodes.push({
          type: 'use',
          name: useStatement,
          content: trimmed,
          line: lineNumber,
        });
        i++;
        continue;
      }

      // Include/Require
      const includeMatch = trimmed.match(/^(include|require|include_once|require_once)\s+(?:['"]([^'"]+)['"]|\$?\w+)/);
      if (includeMatch) {
        nodes.push({
          type: includeMatch[1] as 'include' | 'require',
          name: includeMatch[2],
          content: trimmed,
          line: lineNumber,
        });
        i++;
        continue;
      }

      // Class detection
      const classMatch = trimmed.match(
        /^(abstract\s+|final\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([\w,\s]+))?/
      );
      if (classMatch) {
        const isAbstract = !!classMatch[1]?.includes('abstract');
        const isFinal = !!classMatch[1]?.includes('final');
        const className = classMatch[2];
        const parentClass = classMatch[3] || undefined;
        const interfaces = classMatch[4]?.split(',').map((s) => s.trim()) || undefined;

        const phpClass: PHPClass = {
          name: className,
          namespace: currentNamespace,
          parent: parentClass,
          interfaces,
          methods: [],
          properties: [],
          constants: {},
          isAbstract,
          isFinal,
          docComment: currentDocBlock,
        };

        i++;
        braceDepth = 0;
        // Find opening brace
        while (i < lines.length && !lines[i].includes('{')) i++;
        braceDepth = 1;
        i++;

        const classBody: string[] = [];
        while (i < lines.length && braceDepth > 0) {
          const classLine = lines[i];
          classBody.push(classLine);

          for (const ch of classLine) {
            if (ch === '{') braceDepth++;
            else if (ch === '}') braceDepth--;
          }

          // Parse class members
          const classTrimmed = classLine.trim();
          if (braceDepth > 0) {
            this.parseClassMember(classTrimmed, phpClass, i + 1, currentDocBlock);
          }

          // Reset doc block
          if (classTrimmed.startsWith('/**') || classTrimmed.startsWith('//') || classTrimmed.startsWith('/*')) {
            // Don't reset - it's handled above
          } else {
            currentDocBlock = undefined;
          }

          i++;
        }

        classes.push(phpClass);
        nodes.push({
          type: 'class',
          name: className,
          content: opts.includeMethodBodies ? classBody.join('\n') : trimmed,
          line: lineNumber,
          attributes: { isAbstract, isFinal, parent: parentClass, interfaces },
        });
        currentDocBlock = undefined;
        continue;
      }

      // Function detection
      const funcMatch = trimmed.match(
        /^(?:abstract\s+|final\s+)?(?:public|private|protected)?\s*(?:static\s+)?function\s+(\w+)\s*\(([^)]*)\)(?:\s*:\s*(\??[\w|\\]+))?/
      );
      if (funcMatch) {
        const funcName = funcMatch[1];
        const paramsStr = funcMatch[2];
        const returnType = funcMatch[3];

        const parameters = this.parseParameters(paramsStr);
        const func: PHPFunction = {
          name: funcName,
          parameters,
          returnType: returnType?.replace('?', ''),
          visibility: currentVisibility,
          isStatic: trimmed.includes('static'),
          isAbstract: trimmed.includes('abstract'),
          isFinal: trimmed.includes('final'),
          docComment: currentDocBlock,
        };

        // Collect function body
        i++;
        braceDepth = 0;
        while (i < lines.length && !lines[i].includes('{')) i++;
        braceDepth = 1;
        i++;
        const bodyLines: string[] = [];
        while (i < lines.length && braceDepth > 0) {
          bodyLines.push(lines[i]);
          for (const ch of lines[i]) {
            if (ch === '{') braceDepth++;
            else if (ch === '}') braceDepth--;
          }
          i++;
        }

        if (opts.includeMethodBodies) {
          func.body = bodyLines.join('\n');
        }

        functions.push(func);
        nodes.push({
          type: 'function',
          name: funcName,
          content: opts.includeMethodBodies ? bodyLines.join('\n') : trimmed,
          line: lineNumber,
        });
        currentDocBlock = undefined;
        continue;
      }

      // Variable detection
      const varMatch = trimmed.match(/^\$(\w+)\s*=/);
      if (varMatch) {
        const varName = `$${varMatch[1]}`;
        if (!variables.includes(varName)) {
          variables.push(varName);
        }
        nodes.push({
          type: 'variable',
          name: varName,
          content: trimmed,
          line: lineNumber,
        });
      }

      // Echo
      if (trimmed.startsWith('echo ') || trimmed.startsWith('print ')) {
        nodes.push({
          type: 'echo',
          content: trimmed,
          line: lineNumber,
        });
      }

      // Control structures
      const controlMatch = trimmed.match(/^(if|else|elseif|while|for|foreach|switch|case|default|try|catch|finally|do|return|throw|break|continue|match)\b/);
      if (controlMatch) {
        nodes.push({
          type: 'control-structure',
          name: controlMatch[1],
          content: trimmed,
          line: lineNumber,
        });
      }

      // Expression (anything else that's not empty)
      if (trimmed && !varMatch && !controlMatch) {
        nodes.push({
          type: 'expression',
          content: trimmed,
          line: lineNumber,
        });
      }

      currentDocBlock = undefined;
      i++;
    }

    const metadata: ContentMetadata = {
      size: content.length,
      lineCount: lines.length,
      language: 'php',
    };

    return {
      nodes,
      metadata,
      namespace: currentNamespace,
      uses,
      classes,
      functions,
      variables,
    };
  }

  private parseClassMember(
    trimmed: string,
    phpClass: PHPClass,
    lineNumber: number,
    docComment: string | undefined
  ): void {
    // Check for property
    const propMatch = trimmed.match(
      /^(?:abstract\s+|final\s+)?(public|private|protected)\s+(static\s+)?(?:\??[\w|\\]+)\s+\$(\w+)(?:\s*=\s*(.+))?/
    );
    if (propMatch) {
      const property: PHPProperty = {
        name: `$${propMatch[3]}`,
        type: undefined,
        defaultValue: propMatch[4]?.trim().replace(/;$/, ''),
        visibility: propMatch[1] as 'public' | 'private' | 'protected',
        isStatic: !!propMatch[2],
        docComment: docComment || undefined,
      };
      phpClass.properties.push(property);
      return;
    }

    // Check for method
    const methodMatch = trimmed.match(
      /^(?:abstract\s+|final\s+)?(public|private|protected)\s+(static\s+)?(?:\??[\w|\\]+)\s+(\w+)\s*\(([^)]*)\)(?:\s*:\s*(\??[\w|\\]+))?/
    );
    if (methodMatch) {
      const method: PHPFunction = {
        name: methodMatch[3],
        parameters: this.parseParameters(methodMatch[4]),
        returnType: methodMatch[5]?.replace('?', ''),
        visibility: methodMatch[1] as 'public' | 'private' | 'protected' | 'static',
        isStatic: !!methodMatch[2],
        isAbstract: trimmed.includes('abstract'),
        isFinal: trimmed.includes('final'),
        docComment: docComment || undefined,
      };
      phpClass.methods.push(method);
      return;
    }

    // Check for constant
    const constMatch = trimmed.match(/^(?:public|private|protected)\s+const\s+(\w+)\s*=\s*(.+);/);
    if (constMatch) {
      phpClass.constants[constMatch[1]] = constMatch[2].trim().replace(/;$/, '');
      return;
    }
  }

  private parseParameters(paramsStr: string): PHPParameter[] {
    if (!paramsStr.trim()) return [];

    const params: PHPParameter[] = [];
    // Split by comma but be aware of nested parentheses (for default values)
    let depth = 0;
    let current = '';
    for (const ch of paramsStr) {
      if (ch === '(' || ch === '[') depth++;
      else if (ch === ')' || ch === ']') depth--;
      else if (ch === ',' && depth === 0) {
        params.push(this.parseSingleParameter(current.trim()));
        current = '';
        continue;
      }
      current += ch;
    }
    if (current.trim()) {
      params.push(this.parseSingleParameter(current.trim()));
    }
    return params;
  }

  private parseSingleParameter(param: string): PHPParameter {
    const result: PHPParameter = {
      name: '',
      isNullable: false,
      isPassedByReference: false,
      hasTypeDeclaration: false,
    };

    let remaining = param;

    // Check for reference (&)
    result.isPassedByReference = remaining.includes('&');
    remaining = remaining.replace('&', '').trim();

    // Check for variadic (...)
    if (remaining.startsWith('...')) {
      remaining = remaining.slice(3);
    }

    // Check for type
    const typeMatch = remaining.match(/^(\??[\w|\\]+)\s+/);
    if (typeMatch) {
      result.type = typeMatch[1];
      result.hasTypeDeclaration = true;
      result.isNullable = result.type.startsWith('?');
      remaining = remaining.slice(typeMatch[0].length);
    }

    // Check for name
    const nameMatch = remaining.match(/^\$(\w+)/);
    if (nameMatch) {
      result.name = `$${nameMatch[1]}`;
      remaining = remaining.slice(nameMatch[0].length);
    }

    // Check for default value
    const defaultMatch = remaining.match(/=\s*(.+)/);
    if (defaultMatch) {
      result.defaultValue = defaultMatch[1].trim().replace(/;$/, '');
    }

    if (!result.name) {
      result.name = remaining.trim();
    }

    return result;
  }

  validate(content: string): { valid: boolean; errors: ParseError[]; warnings: ParseWarning[] } {
    const errors: ParseError[] = [];
    const warnings: ParseWarning[] = [];

    if (!content.trim()) {
      errors.push({ message: 'Empty content', severity: 'error', code: 'EMPTY_CONTENT' });
      return { valid: false, errors, warnings };
    }

    // Check for PHP tags
    const hasOpenTag = content.includes('<?php') || content.includes('<?=');
    if (!hasOpenTag) {
      warnings.push({
        message: 'No PHP opening tag found',
        severity: 'warning',
        code: 'MISSING_OPEN_TAG',
      });
    }

    // Check balanced braces
    let inPhpBlock = false;
    let inString = false;
    let stringChar = '';
    let braceCount = 0;
    let maxBraceDepth = 0;

    for (let i = 0; i < content.length; i++) {
      const ch = content[i];

      if (ch === '"' || ch === "'") {
        if (!inString) {
          inString = true;
          stringChar = ch;
        } else if (ch === stringChar && content[i - 1] !== '\\') {
          inString = false;
        }
        continue;
      }

      if (inString) continue;

      if (content.slice(i, i + 5) === '<?php') {
        inPhpBlock = true;
        i += 4;
        continue;
      }
      if (content.slice(i, i + 3) === '<?=' ) {
        inPhpBlock = true;
        i += 2;
        continue;
      }
      if (content.slice(i, i + 2) === '?>') {
        inPhpBlock = false;
        i++;
        continue;
      }

      if (!inPhpBlock) continue;

      if (content[i] === '/' && content[i + 1] === '/') {
        const nl = content.indexOf('\n', i);
        i = nl !== -1 ? nl : content.length;
        continue;
      }
      if (content[i] === '#') {
        const nl = content.indexOf('\n', i);
        i = nl !== -1 ? nl : content.length;
        continue;
      }
      if (content[i] === '/' && content[i + 1] === '*') {
        const end = content.indexOf('*/', i + 2);
        i = end !== -1 ? end + 1 : content.length;
        continue;
      }

      if (ch === '{') {
        braceCount++;
        maxBraceDepth = Math.max(maxBraceDepth, braceCount);
      } else if (ch === '}') {
        braceCount--;
        if (braceCount < 0) {
          errors.push({
            message: 'Unmatched closing brace',
            severity: 'error',
            code: 'UNMATCHED_BRACE',
          });
          braceCount = 0;
        }
      }
    }

    if (braceCount > 0) {
      errors.push({
        message: `${braceCount} unclosed brace(s)`,
        severity: 'error',
        code: 'UNCLOSED_BRACES',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  extractClasses(content: string): PHPClass[] {
    const doc = this.parse(content);
    return doc.classes;
  }

  extractFunctions(content: string): PHPFunction[] {
    const doc = this.parse(content);
    return doc.functions;
  }

  extractVariables(content: string): string[] {
    const doc = this.parse(content);
    return doc.variables;
  }
}

export default PHPParser;
