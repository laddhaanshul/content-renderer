// ==========================================
// Benchmarking Suite
// Measures parsing, extraction, and rendering performance
// using high-resolution timers (process.hrtime.bigint / performance.now).
// ==========================================

import { HTMLParser } from '../parsers/html-parser';
import { JSONParser } from '../parsers/json-parser';
import { XMLParser } from '../parsers/xml-parser';
import { MarkdownParser } from '../parsers/markdown-parser';
import { CSSParser } from '../parsers/css-parser';
import { PHPParser } from '../parsers/php-parser';
import { extractAll } from '../utils/extract';
import { getSampleContent, type SampleContent } from './sample-data';
import type { ContentType } from '../types';

// ==========================================
// Types
// ==========================================

export interface BenchmarkResult {
  name: string;
  operationsPerSecond: number;
  averageTime: number;
  medianTime: number;
  p95Time: number;
  p99Time: number;
  memoryDelta: number;
  iterations: number;
}

export interface BenchmarkSuiteResult {
  timestamp: string;
  environment: {
    node: string;
    platform: string;
    cpuCores: number;
    memory: string;
  };
  results: BenchmarkResult[];
  summary: {
    totalBenchmarks: number;
    fastest: string;
    slowest: string;
    averageOpsPerSecond: number;
  };
}

export interface ComparisonResult {
  contentRenderer: BenchmarkResult[];
  competitors: {
    name: string;
    results: BenchmarkResult[];
  }[];
}

// ==========================================
// Timing Helpers
// ==========================================

function hrToMs(hr: bigint): number {
  return Number(hr) / 1_000_000;
}

function getHighResTime(): bigint {
  if (typeof process !== 'undefined' && process.hrtime && typeof process.hrtime.bigint === 'function') {
    return process.hrtime.bigint();
  }
  // Fallback for browser or environments without hrtime
  return BigInt(Math.round(performance.now() * 1_000_000));
}

function getMemoryDelta(): number {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    return process.memoryUsage().heapUsed;
  }
  return 0;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
}

function median(sorted: number[]): number {
  return percentile(sorted, 50);
}

// ==========================================
// Core Benchmark Function
// ==========================================

const DEFAULT_ITERATIONS = 100;
const WARMUP_ITERATIONS = 5;

function runBenchmark(
  name: string,
  fn: () => void,
  iterations: number = DEFAULT_ITERATIONS
): BenchmarkResult {
  const times: number[] = [];
  const memBefore = getMemoryDelta();

  // Warmup
  for (let i = 0; i < WARMUP_ITERATIONS; i++) {
    fn();
  }

  // Timed runs
  for (let i = 0; i < iterations; i++) {
    const start = getHighResTime();
    fn();
    const end = getHighResTime();
    times.push(hrToMs(end - start));
  }

  const memAfter = getMemoryDelta();
  times.sort((a, b) => a - b);

  const totalMs = times.reduce((sum, t) => sum + t, 0);
  const avg = totalMs / times.length;
  const ops = avg > 0 ? 1000 / avg : 0;

  return {
    name,
    operationsPerSecond: Math.round(ops),
    averageTime: parseFloat(avg.toFixed(4)),
    medianTime: parseFloat(median(times).toFixed(4)),
    p95Time: parseFloat(percentile(times, 95).toFixed(4)),
    p99Time: parseFloat(percentile(times, 99).toFixed(4)),
    memoryDelta: memAfter - memBefore,
    iterations: times.length,
  };
}

// ==========================================
// Benchmark: Parse
// ==========================================

export function benchmarkParse(
  parser: string,
  content: string,
  iterations?: number
): BenchmarkResult {
  const parsers: Record<string, () => void> = {
    'HTML': () => new HTMLParser().parse(content),
    'JSON': () => new JSONParser().parse(content),
    'XML': () => new XMLParser().parse(content),
    'Markdown': () => new MarkdownParser().parse(content),
    'CSS': () => new CSSParser().parse(content),
    'PHP': () => new PHPParser().parse(content),
  };

  const parseFn = parsers[parser];
  if (!parseFn) {
    throw new Error(`Unknown parser: ${parser}. Available: ${Object.keys(parsers).join(', ')}`);
  }

  return runBenchmark(
    `parse(${parser}) [${content.length} bytes]`,
    parseFn,
    iterations
  );
}

// ==========================================
// Benchmark: Extract
// ==========================================

export function benchmarkExtract(
  extractor: string,
  content: string,
  iterations?: number
): BenchmarkResult {
  const extractors: Record<string, () => void> = {
    'HTML': () => extractAll(content, 'html'),
    'JSON': () => extractAll(content, 'json'),
    'XML': () => extractAll(content, 'xml'),
    'Markdown': () => extractAll(content, 'markdown'),
    'CSS': () => extractAll(content, 'css'),
    'PHP': () => extractAll(content, 'php'),
  };

  const extractFn = extractors[extractor];
  if (!extractFn) {
    throw new Error(`Unknown extractor: ${extractor}. Available: ${Object.keys(extractors).join(', ')}`);
  }

  return runBenchmark(
    `extract(${extractor}) [${content.length} bytes]`,
    extractFn,
    iterations
  );
}

// ==========================================
// Benchmark: Render (Serialization)
// ==========================================

export function benchmarkRender(
  component: string,
  content: string,
  iterations?: number
): BenchmarkResult {
  const renderers: Record<string, () => void> = {
    'HTML': () => {
      const doc = new HTMLParser().parse(content);
      new HTMLParser().serialize(doc);
    },
    'JSON': () => {
      const doc = new JSONParser().parse(content);
      new JSONParser().format(doc.root);
    },
    'XML': () => {
      const doc = new XMLParser().parse(content);
      new XMLParser().serialize(doc);
    },
    'Markdown': () => {
      const parser = new MarkdownParser();
      parser.parse(content);
      parser.extractTableOfContents(content);
    },
    'CSS': () => {
      const doc = new CSSParser().parse(content);
      new CSSParser().serialize(doc);
    },
    'PHP': () => {
      const parser = new PHPParser();
      const doc = parser.parse(content);
      parser.validate(content);
      void doc.classes;
    },
  };

  const renderFn = renderers[component];
  if (!renderFn) {
    throw new Error(`Unknown renderer: ${component}. Available: ${Object.keys(renderers).join(', ')}`);
  }

  return runBenchmark(
    `render(${component}) [${content.length} bytes]`,
    renderFn,
    iterations
  );
}

// ==========================================
// Full Benchmark Suite
// ==========================================

export function benchmarkSuite(): BenchmarkSuiteResult {
  const results: BenchmarkResult[] = [];
  const sizes: SampleContent['size'][] = ['small', 'medium'];
  const types: Array<{ parser: string; contentType: ContentType }> = [
    { parser: 'HTML', contentType: 'html' },
    { parser: 'JSON', contentType: 'json' },
    { parser: 'XML', contentType: 'xml' },
    { parser: 'Markdown', contentType: 'markdown' },
    { parser: 'CSS', contentType: 'css' },
    { parser: 'PHP', contentType: 'php' },
  ];

  // Run parse benchmarks
  for (const { parser, contentType } of types) {
    for (const size of sizes) {
      const sample = getSampleContent(contentType as SampleContent['type'], size);
      const iter = size === 'large' ? 20 : size === 'medium' ? 50 : 100;
      results.push(benchmarkParse(parser, sample.content, iter));
    }
  }

  // Run extraction benchmarks
  for (const { parser, contentType } of types) {
    for (const size of sizes) {
      const sample = getSampleContent(contentType as SampleContent['type'], size);
      const iter = size === 'large' ? 20 : size === 'medium' ? 50 : 100;
      results.push(benchmarkExtract(parser, sample.content, iter));
    }
  }

  // Run render benchmarks
  for (const { parser, contentType } of types) {
    for (const size of sizes) {
      const sample = getSampleContent(contentType as SampleContent['type'], size);
      const iter = size === 'large' ? 20 : size === 'medium' ? 50 : 100;
      results.push(benchmarkRender(parser, sample.content, iter));
    }
  }

  // Calculate summary
  const fastest = results.reduce((min, r) =>
    r.averageTime < min.averageTime ? r : min
  , results[0]);

  const slowest = results.reduce((max, r) =>
    r.averageTime > max.averageTime ? r : max
  , results[0]);

  const avgOps = results.reduce((sum, r) => sum + r.operationsPerSecond, 0) / results.length;

  return {
    timestamp: new Date().toISOString(),
    environment: getEnvironmentInfo(),
    results,
    summary: {
      totalBenchmarks: results.length,
      fastest: fastest.name,
      slowest: slowest.name,
      averageOpsPerSecond: Math.round(avgOps),
    },
  };
}

// ==========================================
// Competitor Comparison
// ==========================================

export function compareWithCompetitors(): ComparisonResult {
  // Run content-renderer benchmarks
  const sampleHTML = getSampleContent('html', 'medium');
  const sampleJSON = getSampleContent('json', 'medium');
  const sampleMD = getSampleContent('markdown', 'medium');

  const contentRendererResults: BenchmarkResult[] = [
    benchmarkParse('HTML', sampleHTML.content, 50),
    benchmarkParse('JSON', sampleJSON.content, 50),
    benchmarkParse('Markdown', sampleMD.content, 50),
    benchmarkExtract('HTML', sampleHTML.content, 50),
    benchmarkRender('HTML', sampleHTML.content, 50),
  ];

  // Simulate competitor benchmarks with realistic approximations
  // (In a real setup, you'd import and run the competitor libraries directly)
  const competitorHTMLParser = simulateCompetitorBenchmark(
    'competitor-html-parse',
    () => {
      // Simulate a basic regex-based HTML parsing approach
      const tags: string[] = [];
      const regex = /<([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(sampleHTML.content)) !== null) {
        tags.push(match[1]);
      }
      return tags;
    },
    50
  );

  const competitorJSONParser = simulateCompetitorBenchmark(
    'competitor-json-parse',
    () => {
      // JSON.parse is the baseline everyone uses
      JSON.parse(sampleJSON.content);
    },
    50
  );

  const competitorMarkdownParser = simulateCompetitorBenchmark(
    'competitor-markdown-parse',
    () => {
      // Simple regex-based markdown parsing
      const lines = sampleMD.content.split('\n');
      const headings: string[] = [];
      for (const line of lines) {
        const match = line.match(/^(#{1,6})\s+(.+)$/);
        if (match) headings.push(match[2]);
      }
      return headings;
    },
    50
  );

  const competitorHTMLExtract = simulateCompetitorBenchmark(
    'competitor-html-extract',
    () => {
      // Regex-based extraction
      const links: string[] = [];
      const regex = /<a\s+[^>]*href=["']([^"']*)["'][^>]*>/gi;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(sampleHTML.content)) !== null) {
        links.push(match[1]);
      }
      return links;
    },
    50
  );

  const competitorHTMLRender = simulateCompetitorBenchmark(
    'competitor-html-serialize',
    () => {
      // Simple string template approach
      const cleaned = sampleHTML.content
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
      return cleaned;
    },
    50
  );

  return {
    contentRenderer: contentRendererResults,
    competitors: [
      {
        name: 'regex-parser',
        results: [
          competitorHTMLParser,
          competitorJSONParser,
          competitorMarkdownParser,
          competitorHTMLExtract,
          competitorHTMLRender,
        ],
      },
    ],
  };
}

function simulateCompetitorBenchmark(
  name: string,
  fn: () => void,
  iterations: number
): BenchmarkResult {
  return runBenchmark(name, fn, iterations);
}

// ==========================================
// Environment Info
// ==========================================

function getEnvironmentInfo(): BenchmarkSuiteResult['environment'] {
  const os = typeof process !== 'undefined' && process.platform
    ? process.platform
    : (typeof navigator !== 'undefined' ? navigator.platform : 'unknown');

  const cpuCores = typeof process !== 'undefined' && process.env
    ? (parseInt(process.env.NUM_CPUS || '', 10) || require('os').cpus().length)
    : (typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 1 : 1);

  const memory = typeof process !== 'undefined' && typeof process.memoryUsage === 'function'
    ? `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
    : 'unknown';

  return {
    node: typeof process !== 'undefined' && process.version
      ? process.version
      : (typeof navigator !== 'undefined' ? navigator.userAgent : 'browser'),
    platform: os,
    cpuCores,
    memory,
  };
}

// ==========================================
// Format Results
// ==========================================

export function formatBenchmarkResults(results: BenchmarkSuiteResult): string {
  const lines: string[] = [];

  lines.push('╔══════════════════════════════════════════════════════════════╗');
  lines.push('║         Content Renderer - Performance Benchmark            ║');
  lines.push('╚══════════════════════════════════════════════════════════════╝');
  lines.push('');
  lines.push(`Timestamp: ${results.timestamp}`);
  lines.push(`Environment: ${results.environment.node} | ${results.environment.platform} | ${results.environment.cpuCores} cores | ${results.environment.memory}`);
  lines.push('');
  lines.push('─'.repeat(100));
  lines.push(
    padRight('Benchmark', 50) +
    padRight('ops/sec', 12) +
    padRight('avg (ms)', 12) +
    padRight('p50 (ms)', 12) +
    padRight('p95 (ms)', 12) +
    padRight('p99 (ms)', 12)
  );
  lines.push('─'.repeat(100));

  for (const result of results.results) {
    lines.push(
      padRight(result.name, 50) +
      padLeft(formatNumber(result.operationsPerSecond), 11) + ' ' +
      padLeft(result.averageTime.toFixed(3), 10) + ' ' +
      padLeft(result.medianTime.toFixed(3), 10) + ' ' +
      padLeft(result.p95Time.toFixed(3), 10) + ' ' +
      padLeft(result.p99Time.toFixed(3), 10) + ' '
    );
  }

  lines.push('─'.repeat(100));
  lines.push('');
  lines.push(`Total Benchmarks: ${results.summary.totalBenchmarks}`);
  lines.push(`Fastest: ${results.summary.fastest}`);
  lines.push(`Slowest: ${results.summary.slowest}`);
  lines.push(`Average ops/sec: ${formatNumber(results.summary.averageOpsPerSecond)}`);
  lines.push('');

  return lines.join('\n');
}

function padRight(str: string, len: number): string {
  return str.length > len ? str.slice(0, len - 3) + '...' : str.padEnd(len);
}

function padLeft(str: string, len: number): string {
  return str.length > len ? str.slice(0, len - 3) + '...' : str.padStart(len);
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}
