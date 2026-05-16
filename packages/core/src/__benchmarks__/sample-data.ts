// ==========================================
// Benchmark Sample Data
// Provides sample content strings of varying sizes for benchmarking parsers, extractors, and renderers.
// ==========================================

export interface SampleContent {
  type: 'html' | 'json' | 'xml' | 'markdown' | 'css' | 'php';
  size: 'small' | 'medium' | 'large';
  content: string;
  byteSize: number;
}

// ==========================================
// HTML Sample Data
// ==========================================

const smallHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sample Page</title>
  <style>body { font-family: sans-serif; margin: 1rem; }</style>
</head>
<body>
  <h1>Hello World</h1>
  <p>This is a <strong>sample</strong> paragraph with <a href="https://example.com">a link</a>.</p>
  <img src="https://example.com/image.png" alt="Example image" width="200" height="150">
  <ul>
    <li>Item one</li>
    <li>Item two</li>
    <li>Item three</li>
  </ul>
</body>
</html>`;

function generateMediumHTML(): string {
  const sections: string[] = [];
  sections.push(smallHTML.replace('</body>', '').replace('</html>', ''));

  for (let i = 0; i < 8; i++) {
    sections.push(`
  <section id="section-${i}" class="content-section">
    <h2>Section ${i + 1}: Feature Overview</h2>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
    incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
    exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
    <div class="card" data-index="${i}">
      <h3>Card Title ${i}</h3>
      <p>This card contains some <em>important</em> information about the topic at hand.
      You can find more details at <a href="https://example.com/detail/${i}">this link</a>.</p>
      <img src="https://example.com/img/${i}.jpg" alt="Image ${i}" loading="lazy">
    </div>
    <table class="data-table">
      <thead>
        <tr><th>Name</th><th>Value</th><th>Status</th></tr>
      </thead>
      <tbody>
        <tr><td>Item A</td><td>100</td><td>Active</td></tr>
        <tr><td>Item B</td><td>200</td><td>Inactive</td></tr>
        <tr><td>Item C</td><td>300</td><td>Pending</td></tr>
      </tbody>
    </table>
    <form action="/submit" method="POST">
      <input type="text" name="field1" placeholder="Enter text" required>
      <input type="email" name="email" placeholder="Email address" required>
      <select name="category">
        <option value="a">Category A</option>
        <option value="b">Category B</option>
      </select>
      <button type="submit">Submit</button>
    </form>
  </section>`);
  }

  sections.push('</body></html>');
  return sections.join('\n');
}

function generateLargeHTML(): string {
  const base = generateMediumHTML().replace('</body></html>', '');

  // Add 80 more sections
  const extraSections: string[] = [];
  for (let i = 0; i < 80; i++) {
    extraSections.push(`
  <article class="blog-post" id="post-${i}" data-category="${['tech', 'science', 'design', 'business'][i % 4]}">
    <header>
      <h2>Blog Post ${i + 1}: Deep Dive into ${['Performance', 'Architecture', 'Security', 'UX Design'][i % 4]}</h2>
      <time datetime="2024-${String((i % 12) + 1).padStart(2, '0')}-15">January ${15 + (i % 14)}, 2024</time>
      <address>By <a href="/author/${i % 5}">Author ${i % 5}</a></address>
    </header>
    <div class="post-content">
      <p>In this article, we explore the fundamentals of building scalable web applications.
      The key concepts include <strong>component architecture</strong>, <strong>state management</strong>,
      and <strong>performance optimization</strong>.</p>
      <blockquote cite="https://example.com/quote-${i}">
        "The best way to predict the future is to invent it." - Alan Kay
      </blockquote>
      <h3>Key Takeaways</h3>
      <ol>
        <li>Understanding the problem domain is crucial</li>
        <li>Start with simple solutions and iterate</li>
        <li>Measure everything, optimize selectively</li>
        <li>Write tests for critical paths</li>
        <li>Document architectural decisions</li>
      </ol>
      <pre><code class="language-javascript">function processData(items) {
  return items
    .filter(item => item.active)
    .map(item => ({
      ...item,
      processed: true,
      timestamp: Date.now()
    }))
    .sort((a, b) => a.priority - b.priority);
}</code></pre>
      <figure>
        <img src="https://example.com/diagram-${i}.svg" alt="Architecture diagram ${i}" width="600">
        <figcaption>Figure ${i + 1}: System architecture overview</figcaption>
      </figure>
      <aside class="callout" role="complementary">
        <p><strong>Note:</strong> This article assumes familiarity with modern JavaScript
        and basic web development concepts.</p>
      </aside>
      <nav class="related-links">
        <h4>Related Articles</h4>
        <ul>
          <li><a href="/article/${i * 3}">Getting Started Guide</a></li>
          <li><a href="/article/${i * 3 + 1}">Advanced Patterns</a></li>
          <li><a href="/article/${i * 3 + 2}">Best Practices</a></li>
        </ul>
      </nav>
    </div>
    <footer class="post-footer">
      <div class="tags">
        <span class="tag">javascript</span>
        <span class="tag">webdev</span>
        <span class="tag">performance</span>
      </div>
    </footer>
  </article>`);
  }

  return base + extraSections.join('\n') + '\n</body></html>';
}

// ==========================================
// JSON Sample Data
// ==========================================

const smallJSON = JSON.stringify({
  name: "content-renderer",
  version: "1.0.0",
  description: "A powerful content rendering library",
  main: "dist/index.js",
  license: "MIT",
  dependencies: {
    "htmlparser2": "^9.0.0",
    "react": "^18.0.0"
  },
  scripts: {
    build: "tsc",
    test: "jest",
    lint: "eslint src/"
  }
}, null, 2);

function generateMediumJSON(): string {
  const data: any = {
    metadata: {
      title: "Sample API Response",
      version: "2.1.0",
      timestamp: new Date().toISOString(),
      requestId: "req-" + Math.random().toString(36).substring(2, 10)
    },
    users: [],
    pagination: {
      page: 1,
      perPage: 10,
      total: 50,
      totalPages: 5
    },
    settings: {
      theme: "dark",
      language: "en-US",
      notifications: {
        email: true,
        push: false,
        sms: false
      },
      features: {
        betaAccess: true,
        analytics: true,
        exportData: false
      }
    }
  };

  for (let i = 0; i < 10; i++) {
    data.users.push({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: ['admin', 'editor', 'viewer'][i % 3],
      active: i % 2 === 0,
      profile: {
        avatar: `https://example.com/avatars/${i}.png`,
        bio: `This is the biography for user ${i + 1}. They have been a member since 2023.`,
        location: ["New York", "London", "Tokyo", "Berlin", "Sydney"][i % 5],
        website: `https://user${i + 1}.example.com`
      },
      stats: {
        posts: Math.floor(Math.random() * 100),
        followers: Math.floor(Math.random() * 10000),
        following: Math.floor(Math.random() * 500)
      },
      tags: ["developer", "designer", "writer"].slice(0, (i % 3) + 1),
      createdAt: new Date(2023, i, 15).toISOString(),
      updatedAt: new Date(2024, i, 20).toISOString()
    });
  }

  return JSON.stringify(data, null, 2);
}

function generateLargeJSON(): string {
  const data: any = {
    metadata: {
      title: "Enterprise Dataset",
      version: "3.0.0",
      exportedAt: new Date().toISOString(),
      source: "production-db",
      totalRecords: 200
    },
    departments: [],
    analytics: {
      totalRevenue: 2500000,
      activeCustomers: 15000,
      churnRate: 0.032,
      npsScore: 72,
      metricsByMonth: []
    },
    configuration: {
      features: {},
      integrations: [],
      policies: {}
    }
  };

  // Features
  for (let i = 0; i < 30; i++) {
    data.configuration.features[`feature_${i}`] = {
      enabled: i % 3 !== 0,
      rolloutPercentage: [10, 25, 50, 75, 100][i % 5],
      description: `Feature flag ${i} description`,
      targetAudience: ["all", "beta", "enterprise", "internal"][i % 4],
      dependencies: i > 0 ? [`feature_${i - 1}`] : []
    };
  }

  // Departments
  const deptNames = ["Engineering", "Marketing", "Sales", "Support", "HR", "Finance", "Legal", "Operations"];
  for (let d = 0; d < deptNames.length; d++) {
    const dept: any = {
      id: d + 1,
      name: deptNames[d],
      head: { name: `Head ${d + 1}`, email: `head${d + 1}@company.com` },
      employees: [],
      budget: Math.floor(Math.random() * 500000) + 100000
    };

    for (let e = 0; e < 25; e++) {
      dept.employees.push({
        id: d * 25 + e + 1,
        firstName: `First${e}`,
        lastName: `Last${e}`,
        email: `emp${d * 25 + e + 1}@company.com`,
        position: ["Junior", "Mid", "Senior", "Lead", "Manager"][e % 5],
        salary: Math.floor(Math.random() * 80000) + 40000,
        startDate: new Date(2018 + (e % 6), e % 12, 1).toISOString(),
        skills: ["JavaScript", "Python", "Go", "Rust", "Java"].slice(0, (e % 3) + 2),
        projects: Array.from({ length: (e % 4) + 1 }, (_, p) => ({
          id: `proj-${d}-${e}-${p}`,
          name: `Project ${d}-${e}-${p}`,
          status: ["active", "completed", "on-hold"][p % 3],
          hoursLogged: Math.floor(Math.random() * 2000)
        }))
      });
    }

    data.departments.push(dept);
  }

  // Analytics monthly data
  for (let m = 0; m < 24; m++) {
    data.analytics.metricsByMonth.push({
      month: `2022-${String((m % 12) + 1).padStart(2, '0')}`,
      year: m < 12 ? 2022 : 2023,
      revenue: Math.floor(Math.random() * 300000) + 100000,
      newCustomers: Math.floor(Math.random() * 2000) + 500,
      churned: Math.floor(Math.random() * 100),
      supportTickets: Math.floor(Math.random() * 500) + 100,
      avgResponseTime: Math.floor(Math.random() * 24) + 1
    });
  }

  return JSON.stringify(data, null, 2);
}

// ==========================================
// XML Sample Data
// ==========================================

const smallXML = `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <book id="1">
    <title>The Great Gatsby</title>
    <author>F. Scott Fitzgerald</author>
    <year>1925</year>
    <price>10.99</price>
  </book>
  <book id="2">
    <title>To Kill a Mockingbird</title>
    <author>Harper Lee</author>
    <year>1960</year>
    <price>12.99</price>
  </book>
</catalog>`;

function generateMediumXML(): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<library name="City Library">\n`;
  xml += `  <metadata>\n    <lastUpdated>2024-01-15</lastUpdated>\n    <totalBooks>25</totalBooks>\n  </metadata>\n`;

  for (let i = 0; i < 25; i++) {
    xml += `  <book id="bk-${String(i + 1).padStart(4, '0')}" category="${['fiction', 'non-fiction', 'science', 'history'][i % 4]}">
    <title>Book Title ${i + 1}</title>
    <author>
      <firstName>Author${i}</firstName>
      <lastName>LastName${i}</lastName>
      <born>19${50 + (i % 40)}</born>
    </author>
    <publisher>Publishing House ${i % 5}</publisher>
    <year>${1950 + i * 3}</year>
    <isbn>978-${String(i).padStart(3, '0')}-${String(i * 7 % 10000).padStart(4, '0')}-${String(i * 13 % 10000).padStart(4, '0')}-${String(i % 10)}</isbn>
    <price>${(9.99 + i * 0.5).toFixed(2)}</price>
    <pages>${200 + i * 15}</pages>
    <language>en</language>
    <available>${i % 3 !== 0 ? 'true' : 'false'}</available>
    <rating>${(3 + (i % 3)).toFixed(1)}</rating>
  </book>\n`;
  }

  xml += `</library>`;
  return xml;
}

function generateLargeXML(): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<!-- Enterprise Product Catalog -->\n`;
  xml += `<store name="MegaStore" xmlns="http://example.com/store" xmlns:media="http://example.com/media">\n`;

  // Store info
  xml += `  <storeInfo>
    <name>MegaStore Online</name>
    <founded>2010-06-15</founded>
    <currency>USD</currency>
    <locales>
      <locale code="en-US" default="true"/>
      <locale code="es-ES"/>
      <locale code="fr-FR"/>
      <locale code="de-DE"/>
      <locale code="ja-JP"/>
    </locales>
  </storeInfo>\n`;

  // Categories
  xml += `  <categories>\n`;
  const categories = ["Electronics", "Clothing", "Home & Garden", "Sports", "Books", "Toys", "Food", "Health"];
  for (let c = 0; c < categories.length; c++) {
    xml += `    <category id="cat-${c}" name="${categories[c]}">\n`;
    // Products per category
    for (let p = 0; p < 15; p++) {
      const pid = c * 15 + p + 1;
      xml += `      <product id="prod-${String(pid).padStart(5, '0')}">
        <sku>SKU-${String(pid).padStart(8, '0')}</sku>
        <name>Product ${pid}: ${['Premium', 'Standard', 'Basic', 'Deluxe'][p % 4]} ${categories[c]} Item</name>
        <description>A detailed description of product ${pid} in the ${categories[c]} category with various features and benefits.</description>
        <price currency="USD">${(5.99 + pid * 0.37).toFixed(2)}</price>
        <salePrice>${(4.99 + pid * 0.25).toFixed(2)}</salePrice>
        <stock>${Math.floor(Math.random() * 500)}</stock>
        <rating>${(3.0 + (pid % 21) * 0.1).toFixed(1)}</rating>
        <reviewCount>${Math.floor(Math.random() * 200)}</reviewCount>
        <brand>Brand ${(pid % 10) + 1}</brand>
        <media:image src="https://example.com/products/${pid}.jpg" width="400" height="400"/>
        <media:image src="https://example.com/products/${pid}-thumb.jpg" width="100" height="100"/>
        <attributes>
          <attribute name="color" value="${['Red', 'Blue', 'Green', 'Black', 'White'][pid % 5]}"/>
          <attribute name="size" value="${['S', 'M', 'L', 'XL'][pid % 4]}"/>
          <attribute name="weight" value="${(0.5 + (pid % 20) * 0.1).toFixed(1)}kg"/>
        </attributes>
        <shipping>
          <weight>${(0.1 + (pid % 50) * 0.05).toFixed(2)}kg</weight>
          <dimensions width="20" height="15" depth="10"/>
          <freeShipping>${pid % 4 === 0 ? 'true' : 'false'}</freeShipping>
        </shipping>
        <tags>${['popular', 'new', 'sale', 'featured'].slice(0, (pid % 3) + 1).map(t => `<tag>${t}</tag>`).join('')}</tags>
      </product>\n`;
    }
    xml += `    </category>\n`;
  }
  xml += `  </categories>\n</store>`;

  return xml;
}

// ==========================================
// Markdown Sample Data
// ==========================================

const smallMarkdown = `# Getting Started

Welcome to **content-renderer**! This library helps you render various content types.

## Features

- Parse HTML, JSON, XML, Markdown, CSS, and PHP
- Extract structured data from content
- Theme support with light and dark modes
- React components for web and native

## Installation

\`\`\`bash
npm install @content-renderer/core
\`\`\`

## Quick Example

\`\`\`typescript
import { HTMLParser } from '@content-renderer/core';

const parser = new HTMLParser();
const doc = parser.parse('<h1>Hello</h1>');
\`\`\`

> **Tip:** Check out the [documentation](https://example.com/docs) for more details.

## License

MIT
`;

function generateMediumMarkdown(): string {
  let md = smallMarkdown;

  md += `\n---\n\n## API Reference\n\n`;
  const parsers = ['HTMLParser', 'JSONParser', 'XMLParser', 'MarkdownParser', 'CSSParser', 'PHPParser'];
  for (const parser of parsers) {
    md += `### ${parser}\n\n`;
    md += `The \`${parser}\` class provides parsing capabilities for ${parser.replace('Parser', '')} content.\n\n`;
    md += `| Method | Description | Returns |\n`;
    md += `|--------|-------------|--------|\n`;
    md += `| \`parse()\` | Parse content string | ParsedDocument |\n`;
    md += `| \`validate()\` | Validate content | ValidationResult |\n`;
    md += `| \`serialize()\` | Serialize back to string | string |\n\n`;
  }

  md += `## Advanced Usage\n\n`;
  md += `### Custom Renderers\n\n`;
  md += `You can provide custom renderers for specific content types:\n\n`;
  md += `\`\`\`typescript\nconst customRenderers = {\n  h1: (props) => <CustomHeading level={1} {...props} />,\n  code: (props) => <SyntaxHighlighter {...props} />,\n};\n\`\`\`\n\n`;

  md += `### Data Extraction\n\n`;
  md += `Extract structured data from any content:\n\n`;
  md += `\`\`\`typescript\nimport { extractAll } from '@content-renderer/core';\n\nconst data = extractAll(htmlContent, 'html');\nconsole.log(data.links);\nconsole.log(data.images);\nconsole.log(data.headings);\n\`\`\`\n\n`;

  md += `## Contributing\n\n`;
  md += `1. Fork the repository\n`;
  md += `2. Create your feature branch (\`git checkout -b feature/amazing\`)\n`;
  md += `3. Commit your changes (\`git commit -m 'Add amazing feature'\`)\n`;
  md += `4. Push to the branch (\`git push origin feature/amazing\`)\n`;
  md += `5. Open a Pull Request\n`;

  return md;
}

function generateLargeMarkdown(): string {
  let md = generateMediumMarkdown();

  // Add extensive documentation sections
  md += `\n---\n\n# Comprehensive Guide\n\n`;

  const chapters = [
    { title: "Architecture Overview", content: "The content-renderer library follows a modular architecture..." },
    { title: "Parser Internals", content: "Each parser operates independently and produces a unified output format..." },
    { title: "Performance Optimization", content: "Performance is critical for content rendering. Here are some strategies..." },
    { title: "Security Considerations", content: "When rendering user-generated content, security is paramount..." },
    { title: "Testing Strategies", content: "A robust testing strategy ensures reliability across content types..." },
    { title: "Error Handling", content: "Graceful error handling is built into every component..." },
    { title: "Accessibility", content: "All renderers produce accessible output by default..." },
    { title: "Internationalization", content: "The library supports multiple languages and character encodings..." },
    { title: "Plugin System", content: "Extend functionality through the plugin system..." },
    { title: "Migration Guide", content: "Upgrading from v1 to v2 involves several breaking changes..." },
  ];

  for (const chapter of chapters) {
    md += `## ${chapter.title}\n\n`;
    md += `${chapter.content}\n\n`;

    for (let s = 0; s < 3; s++) {
      md += `### Subsection ${s + 1}\n\n`;
      md += `Detailed content for subsection ${s + 1} of ${chapter.title}. `;
      md += `This includes explanations of key concepts, code examples, and best practices.\n\n`;

      md += `Here's a code example:\n\n`;
      md += `\`\`\`typescript\n// Example ${s + 1} for ${chapter.title}\n`;
      md += `function example${s + 1}() {\n`;
      md += `  const result = performOperation();\n`;
      md += `  if (result.success) {\n`;
      md += `    return result.data;\n`;
      md += `  }\n`;
      md += `  throw new Error(result.error);\n`;
      md += `}\n\`\`\`\n\n`;

      md += `> **Note:** Always handle edge cases in production code.\n\n`;

      md += `| Parameter | Type | Required | Default | Description |\n`;
      md += `|-----------|------|----------|---------|-------------|\n`;
      md += `| \`option\` | \`string\` | Yes | - | The option to configure |\n`;
      md += `| \`enabled\` | \`boolean\` | No | \`true\` | Enable the feature |\n`;
      md += `| \`callback\` | \`Function\` | No | - | Called on completion |\n\n`;

      md += `- Point one for subsection ${s + 1}\n`;
      md += `- Point two for subsection ${s + 1}\n`;
      md += `- Point three for subsection ${s + 1}\n\n`;
    }
  }

  // Add a large table
  md += `## Feature Matrix\n\n`;
  md += `| Feature | HTML | JSON | XML | Markdown | CSS | PHP |\n`;
  md += `|---------|------|------|-----|----------|-----|-----|\n`;
  const features = ["Parse", "Validate", "Serialize", "Extract", "Transform", "Minify", "Format", "Sanitize"];
  for (const feature of features) {
    md += `| ${feature} | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |\n`;
  }

  return md;
}

// ==========================================
// CSS Sample Data
// ==========================================

const smallCSS = `/* Base styles */
:root {
  --primary: #3b82f6;
  --secondary: #8b5cf6;
  --background: #ffffff;
  --text: #1f2937;
  --border: #e5e7eb;
  --radius: 8px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: var(--text);
  background: var(--background);
}

h1, h2, h3 {
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 0.5em;
}

a {
  color: var(--primary);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

code {
  font-family: 'Fira Code', monospace;
  background: #f3f4f6;
  padding: 0.125em 0.25em;
  border-radius: 4px;
  font-size: 0.875em;
}`;

function generateMediumCSS(): string {
  let css = smallCSS;
  css += `\n\n/* Layout */\n`;
  css += `.container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }\n`;
  css += `.grid { display: grid; gap: 1.5rem; }\n`;
  css += `.grid-2 { grid-template-columns: repeat(2, 1fr); }\n`;
  css += `.grid-3 { grid-template-columns: repeat(3, 1fr); }\n`;
  css += `.flex { display: flex; }\n`;
  css += `.flex-col { flex-direction: column; }\n`;
  css += `.items-center { align-items: center; }\n`;
  css += `.justify-between { justify-content: space-between; }\n`;
  css += `.gap-1 { gap: 0.25rem; }\n`;
  css += `.gap-2 { gap: 0.5rem; }\n`;
  css += `.gap-4 { gap: 1rem; }\n`;

  css += `\n/* Components */\n`;
  const components = ['button', 'card', 'input', 'modal', 'alert', 'badge', 'tooltip', 'dropdown', 'tab', 'accordion'];
  for (let i = 0; i < components.length; i++) {
    const c = components[i];
    css += `\n.${c} {\n  padding: 0.5rem 1rem;\n  border-radius: var(--radius);\n  border: 1px solid var(--border);\n  background: var(--background);\n  transition: all 0.2s ease;\n}\n`;
    css += `.${c}:hover {\n  border-color: var(--primary);\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n}\n`;
    css += `.${c}--primary {\n  background: var(--primary);\n  color: white;\n  border-color: var(--primary);\n}\n`;
    css += `.${c}--secondary {\n  background: var(--secondary);\n  color: white;\n  border-color: var(--secondary);\n}\n`;
    css += `.${c}--sm { padding: 0.25rem 0.5rem; font-size: 0.875rem; }\n`;
    css += `.${c}--lg { padding: 0.75rem 1.5rem; font-size: 1.125rem; }\n`;
  }

  css += `\n/* Animations */\n`;
  css += `@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }\n`;
  css += `@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }\n`;
  css += `@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }\n`;
  css += `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }\n`;
  css += `.animate-fade { animation: fadeIn 0.3s ease-out; }\n`;
  css += `.animate-slide { animation: slideUp 0.4s ease-out; }\n`;
  css += `.animate-pulse { animation: pulse 2s infinite; }\n`;
  css += `.animate-spin { animation: spin 1s linear infinite; }\n`;

  css += `\n/* Responsive */\n`;
  css += `@media (max-width: 768px) {\n`;
  css += `  .grid-3 { grid-template-columns: 1fr; }\n`;
  css += `  .grid-2 { grid-template-columns: 1fr; }\n`;
  css += `  .hide-mobile { display: none; }\n`;
  css += `}\n`;
  css += `@media (min-width: 769px) {\n`;
  css += `  .hide-desktop { display: none; }\n`;
  css += `}\n`;

  return css;
}

function generateLargeCSS(): string {
  let css = generateMediumCSS();

  // Generate a comprehensive design system
  css += `\n\n/* ============================================ */\n`;
  css += `/* Design System - Comprehensive Styles     */\n`;
  css += `/* ============================================ */\n\n`;

  // Color system
  css += `/* Color Tokens */\n`;
  const colorNames = ['red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'];
  for (const color of colorNames) {
    for (const shade of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]) {
      css += `--color-${color}-${shade}: hsl(var(--${color}-${shade}));\n`;
    }
  }

  // Spacing scale
  css += `\n/* Spacing Scale */\n`;
  for (let i = 0; i <= 96; i += 0.5) {
    css += `.p-${i === Math.floor(i) ? i : i.toFixed(1)} { padding: ${i * 0.25}rem; }\n`;
    if (i <= 12) {
      css += `.m-${i === Math.floor(i) ? i : i.toFixed(1)} { margin: ${i * 0.25}rem; }\n`;
    }
  }

  // Typography
  css += `\n/* Typography Scale */\n`;
  const fontSizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl'];
  for (const size of fontSizes) {
    css += `.text-${size} { font-size: var(--font-size-${size}); line-height: var(--line-height-${size}); }\n`;
  }

  // Shadow scale
  css += `\n/* Shadow Scale */\n`;
  for (let s = 0; s <= 8; s++) {
    css += `.shadow-${s} { box-shadow: var(--shadow-${s}); }\n`;
  }

  // More component variants
  css += `\n/* Form Elements */\n`;
  const formElements = ['input', 'textarea', 'select', 'checkbox', 'radio', 'switch', 'range', 'datepicker', 'colorpicker'];
  for (const el of formElements) {
    css += `.${el}-base { border: 1px solid var(--border); border-radius: var(--radius); padding: 0.5rem; }\n`;
    css += `.${el}-base:focus { outline: 2px solid var(--primary); outline-offset: 2px; }\n`;
    css += `.${el}-error { border-color: var(--color-red-500); }\n`;
    css += `.${el}-disabled { opacity: 0.5; cursor: not-allowed; }\n`;
  }

  // More keyframes
  css += `\n/* Extended Animations */\n`;
  const animations = [
    { name: 'bounce', frames: '0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); }' },
    { name: 'shake', frames: '0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); }' },
    { name: 'zoomIn', frames: 'from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; }' },
    { name: 'rotateIn', frames: 'from { transform: rotate(-180deg); opacity: 0; } to { transform: rotate(0); opacity: 1; }' },
    { name: 'flipX', frames: 'from { transform: perspective(400px) rotateX(90deg); } to { transform: perspective(400px) rotateX(0); }' },
  ];
  for (const anim of animations) {
    css += `@keyframes ${anim.name} { ${anim.frames} }\n`;
    css += `.animate-${anim.name.toLowerCase()} { animation: ${anim.name} 0.5s ease-out; }\n`;
  }

  // Print styles
  css += `\n/* Print Styles */\n`;
  css += `@media print {\n`;
  css += `  body { font-size: 12pt; color: #000; background: #fff; }\n`;
  css += `  a { color: #000; text-decoration: underline; }\n`;
  css += `  .no-print { display: none !important; }\n`;
  css += `  img { max-width: 100%; page-break-inside: avoid; }\n`;
  css += `  h1, h2, h3 { page-break-after: avoid; }\n`;
  css += `  table { page-break-inside: avoid; }\n`;
  css += `}\n`;

  // More responsive breakpoints
  css += `\n/* Extended Responsive */\n`;
  const breakpoints = [
    { name: 'sm', query: 'min-width: 640px' },
    { name: 'md', query: 'min-width: 768px' },
    { name: 'lg', query: 'min-width: 1024px' },
    { name: 'xl', query: 'min-width: 1280px' },
    { name: '2xl', query: 'min-width: 1536px' },
  ];
  for (const bp of breakpoints) {
    css += `@media (${bp.query}) {\n`;
    css += `  .container { max-width: ${parseInt(bp.query.match(/\d+/)![0]) - 32}px; }\n`;
    css += `}\n`;
  }

  return css;
}

// ==========================================
// PHP Sample Data
// ==========================================

const smallPHP = `<?php
/**
 * Sample PHP Controller
 */

namespace App\\Controllers;

class UserController {
    private $userService;

    public function __construct(UserService $userService) {
        $this->userService = $userService;
    }

    public function index(): array {
        return $this->userService->getAllUsers();
    }

    public function show(int $id): ?array {
        return $this->userService->findUser($id);
    }
}`;

function generateMediumPHP(): string {
  let php = smallPHP;

  php += `\n\nnamespace App\\Services;\n\n`;

  php += `class UserService {\n`;
  php += `    private $db;\n`;
  php += `    private $cache;\n\n`;

  php += `    public function __construct(Database $db, Cache $cache) {\n`;
  php += `        $this->db = $db;\n`;
  php += `        $this->cache = $cache;\n`;
  php += `    }\n\n`;

  php += `    public function getAllUsers(): array {\n`;
  php += `        $cacheKey = 'users_all';\n`;
  php += `        $cached = $this->cache->get($cacheKey);\n\n`;
  php += `        if ($cached !== null) {\n`;
  php += `            return $cached;\n`;
  php += `        }\n\n`;
  php += `        $query = "SELECT * FROM users WHERE active = 1 ORDER BY created_at DESC";\n`;
  php += `        $results = $this->db->query($query)->fetchAll();\n\n`;
  php += `        $this->cache->set($cacheKey, $results, 3600);\n`;
  php += `        return $results;\n`;
  php += `    }\n\n`;

  php += `    public function findUser(int $id): ?array {\n`;
  php += `        $stmt = $this->db->prepare("SELECT * FROM users WHERE id = :id");\n`;
  php += `        $stmt->execute([':id' => $id]);\n`;
  php += `        return $stmt->fetch() ?: null;\n`;
  php += `    }\n\n`;

  php += `    public function createUser(array $data): array {\n`;
  php += `        $validator = new UserValidator();\n`;
  php += `        $errors = $validator->validate($data);\n\n`;
  php += `        if (!empty($errors)) {\n`;
  php += `            throw new ValidationException('Invalid user data', $errors);\n`;
  php += `        }\n\n`;
  php += `        $hashedPassword = password_hash($data['password'], PASSWORD_BCRYPT);\n`;
  php += `        $query = "INSERT INTO users (name, email, password) VALUES (:name, :email, :password)";\n`;
  php += `        $this->db->prepare($query)->execute([\n`;
  php += `            ':name' => $data['name'],\n`;
  php += `            ':email' => $data['email'],\n`;
  php += `            ':password' => $hashedPassword,\n`;
  php += `        ]);\n\n`;
  php += `        return ['id' => $this->db->lastInsertId()];\n`;
  php += `    }\n\n`;

  php += `    public function updateUser(int $id, array $data): bool {\n`;
  php += `        $allowedFields = ['name', 'email', 'bio'];\n`;
  php += `        $updates = array_intersect_key($data, array_flip($allowedFields));\n\n`;
  php += `        if (empty($updates)) {\n`;
  php += `            return false;\n`;
  php += `        }\n\n`;
  php += `        $setClauses = array_map(fn($k) => "$k = :$k", array_keys($updates));\n`;
  php += `        $query = "UPDATE users SET " . implode(', ', $setClauses) . " WHERE id = :id";\n`;
  php += `        $updates[':id'] = $id;\n\n`;
  php += `        $this->cache->delete('users_all');\n`;
  php += `        return $this->db->prepare($query)->execute($updates) > 0;\n`;
  php += `    }\n\n`;

  php += `    public function deleteUser(int $id): bool {\n`;
  php += `        $this->cache->delete('users_all');\n`;
  php += `        return $this->db->prepare("DELETE FROM users WHERE id = :id")->execute([':id' => $id]) > 0;\n`;
  php += `    }\n\n`;

  php += `    public function searchUsers(string $query, int $limit = 20, int $offset = 0): array {\n`;
  php += `        $stmt = $this->db->prepare(\n`;
  php += `            "SELECT * FROM users WHERE name LIKE :q OR email LIKE :q LIMIT :limit OFFSET :offset"\n`;
  php += `        );\n`;
  php += `        $stmt->execute([\n`;
  php += `            ':q' => "%$query%",\n`;
  php += `            ':limit' => $limit,\n`;
  php += `            ':offset' => $offset,\n`;
  php += `        ]);\n`;
  php += `        return $stmt->fetchAll();\n`;
  php += `    }\n`;
  php += `}\n`;

  return php;
}

function generateLargePHP(): string {
  let php = generateMediumPHP();

  // Add many more classes
  const classes = [
    { name: 'AuthController', namespace: 'Controllers', methods: ['login', 'logout', 'register', 'forgotPassword', 'resetPassword', 'verifyEmail'] },
    { name: 'PostController', namespace: 'Controllers', methods: ['index', 'show', 'create', 'update', 'delete', 'publish', 'archive'] },
    { name: 'CommentController', namespace: 'Controllers', methods: ['store', 'update', 'delete', 'approve', 'reject'] },
    { name: 'FileService', namespace: 'Services', methods: ['upload', 'download', 'delete', 'resize', 'optimize', 'getMetadata'] },
    { name: 'EmailService', namespace: 'Services', methods: ['send', 'sendBulk', 'queue', 'renderTemplate', 'validateAddress'] },
    { name: 'PaymentService', namespace: 'Services', methods: ['process', 'refund', 'getReceipt', 'calculateTax', 'applyCoupon'] },
    { name: 'AnalyticsService', namespace: 'Services', methods: ['trackEvent', 'getPageViews', 'getMetrics', 'generateReport', 'exportCSV'] },
    { name: 'NotificationService', namespace: 'Services', methods: ['send', 'markRead', 'getUnread', 'subscribe', 'unsubscribe'] },
    { name: 'SearchService', namespace: 'Services', methods: ['index', 'search', 'reindex', 'suggest', 'getFacets'] },
    { name: 'Middleware', namespace: 'Http', methods: ['handle', 'terminate', 'before', 'after'] },
  ];

  for (const cls of classes) {
    php += `\n\nnamespace App\\${cls.namespace};\n\n`;
    php += `/**\n * ${cls.name} - handles ${cls.name.replace('Service', '').replace('Controller', '')} operations\n */\nclass ${cls.name} {\n`;

    // Properties
    const deps = ['db', 'cache', 'logger', 'config', 'eventBus'];
    for (let d = 0; d < Math.min(3, deps.length); d++) {
      php += `    private $${deps[d]};\n`;
    }
    php += `\n`;

    // Constructor
    php += `    public function __construct(`;
    const constructorParams = deps.slice(0, Math.min(3, deps.length));
    php += constructorParams.map(d => `${d === 'db' ? 'Database' : d === 'cache' ? 'Cache' : ucfirst(d)} $${d}`).join(', ');
    php += `) {\n`;
    for (const d of constructorParams) {
      php += `        $this->${d} = $${d};\n`;
    }
    php += `    }\n\n`;

    // Methods
    for (const method of cls.methods) {
      php += `    public function ${method}(...$args) {\n`;
      php += `        // Implementation for ${method}\n`;
      php += `        $result = $this->perform${ucfirst(method)}($args);\n`;
      php += `        return $result;\n`;
      php += `    }\n\n`;

      php += `    private function perform${ucfirst(method)}(array $args): mixed {\n`;
      php += `        try {\n`;
      php += `            $this->logger->info("Executing ${method}", ['args' => $args]);\n`;
      php += `            // Business logic here\n`;
      php += `            return true;\n`;
      php += `        } catch (\\Exception $e) {\n`;
      php += `            $this->logger->error("${method} failed: " . $e->getMessage());\n`;
      php += `            throw $e;\n`;
      php += `        }\n`;
      php += `    }\n\n`;
    }

    php += `}\n`;
  }

  // Add traits
  php += `\n\nnamespace App\\Traits;\n\n`;
  php += `trait Timestampable {\n    public function setCreatedAt(): void {\n        $this->createdAt = new \\DateTime();\n    }\n    public function setUpdatedAt(): void {\n        $this->updatedAt = new \\DateTime();\n    }\n}\n\n`;
  php += `trait SoftDeletes {\n    public function softDelete(): void {\n        $this->deletedAt = new \\DateTime();\n    }\n    public function restore(): void {\n        $this->deletedAt = null;\n    }\n    public function isDeleted(): bool {\n        return $this->deletedAt !== null;\n    }\n}\n`;

  // Add interfaces
  php += `\n\nnamespace App\\Interfaces;\n\n`;
  php += `interface RepositoryInterface {\n    public function find(int $id): ?array;\n    public function findAll(): array;\n    public function create(array $data): array;\n    public function update(int $id, array $data): bool;\n    public function delete(int $id): bool;\n}\n\n`;
  php += `interface CacheInterface {\n    public function get(string $key): mixed;\n    public function set(string $key, mixed $value, int $ttl = 3600): bool;\n    public function delete(string $key): bool;\n    public function clear(): bool;\n}\n`;

  return php;
}

function ucfirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ==========================================
// Exported Sample Data
// ==========================================

let _cachedMediumHTML: string | null = null;
let _cachedLargeHTML: string | null = null;
let _cachedMediumJSON: string | null = null;
let _cachedLargeJSON: string | null = null;
let _cachedMediumXML: string | null = null;
let _cachedLargeXML: string | null = null;
let _cachedMediumMarkdown: string | null = null;
let _cachedLargeMarkdown: string | null = null;
let _cachedMediumCSS: string | null = null;
let _cachedLargeCSS: string | null = null;
let _cachedMediumPHP: string | null = null;
let _cachedLargePHP: string | null = null;

export function getSampleContent(type: SampleContent['type'], size: SampleContent['size']): SampleContent {
  let content: string;

  switch (type) {
    case 'html':
      content = getHTMLSample(size);
      break;
    case 'json':
      content = getJSONSample(size);
      break;
    case 'xml':
      content = getXMLSample(size);
      break;
    case 'markdown':
      content = getMarkdownSample(size);
      break;
    case 'css':
      content = getCSSSample(size);
      break;
    case 'php':
      content = getPHPSample(size);
      break;
    default:
      throw new Error(`Unknown content type: ${type}`);
  }

  return {
    type,
    size,
    content,
    byteSize: Buffer.byteLength(content, 'utf-8'),
  };
}

function getHTMLSample(size: SampleContent['size']): string {
  switch (size) {
    case 'small': return smallHTML;
    case 'medium': return _cachedMediumHTML || (_cachedMediumHTML = generateMediumHTML());
    case 'large': return _cachedLargeHTML || (_cachedLargeHTML = generateLargeHTML());
  }
}

function getJSONSample(size: SampleContent['size']): string {
  switch (size) {
    case 'small': return smallJSON;
    case 'medium': return _cachedMediumJSON || (_cachedMediumJSON = generateMediumJSON());
    case 'large': return _cachedLargeJSON || (_cachedLargeJSON = generateLargeJSON());
  }
}

function getXMLSample(size: SampleContent['size']): string {
  switch (size) {
    case 'small': return smallXML;
    case 'medium': return _cachedMediumXML || (_cachedMediumXML = generateMediumXML());
    case 'large': return _cachedLargeXML || (_cachedLargeXML = generateLargeXML());
  }
}

function getMarkdownSample(size: SampleContent['size']): string {
  switch (size) {
    case 'small': return smallMarkdown;
    case 'medium': return _cachedMediumMarkdown || (_cachedMediumMarkdown = generateMediumMarkdown());
    case 'large': return _cachedLargeMarkdown || (_cachedLargeMarkdown = generateLargeMarkdown());
  }
}

function getCSSSample(size: SampleContent['size']): string {
  switch (size) {
    case 'small': return smallCSS;
    case 'medium': return _cachedMediumCSS || (_cachedMediumCSS = generateMediumCSS());
    case 'large': return _cachedLargeCSS || (_cachedLargeCSS = generateLargeCSS());
  }
}

function getPHPSample(size: SampleContent['size']): string {
  switch (size) {
    case 'small': return smallPHP;
    case 'medium': return _cachedMediumPHP || (_cachedMediumPHP = generateMediumPHP());
    case 'large': return _cachedLargePHP || (_cachedLargePHP = generateLargePHP());
  }
}

/**
 * Get all sample content for a given size category.
 */
export function getAllSamples(size: SampleContent['size']): SampleContent[] {
  const types: SampleContent['type'][] = ['html', 'json', 'xml', 'markdown', 'css', 'php'];
  return types.map((type) => getSampleContent(type, size));
}

/**
 * Get a comprehensive set of samples across all types and sizes for full benchmark runs.
 */
export function getFullBenchmarkSuite(): SampleContent[] {
  const samples: SampleContent[] = [];
  const types: SampleContent['type'][] = ['html', 'json', 'xml', 'markdown', 'css', 'php'];
  const sizes: SampleContent['size'][] = ['small', 'medium', 'large'];

  for (const type of types) {
    for (const size of sizes) {
      samples.push(getSampleContent(type, size));
    }
  }

  return samples;
}
