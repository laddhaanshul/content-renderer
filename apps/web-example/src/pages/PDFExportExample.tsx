import React, { useState } from 'react';
import { contentToPrintableHTML, generatePDFStyles, previewPDF, downloadPDF, generatePageCSS, splitContentForPages } from '@laddhaanshul/content-renderer';

export default function PDFExportExample() {
  const [content] = useState('# Sample Document\n\nThis is a **sample document** demonstrating PDF export.\n\n## Features\n\n- Clean typography with configurable fonts\n- Page breaks for long documents\n- Code block rendering\n- Table formatting\n\n> Exported using ContentRenderer PDF export.');

  return (
    <div style={{ padding: 24 }}>
      <h2>PDF Export</h2>
      <p>Convert any rendered content to print-ready HTML for PDF generation. Supports A4, Letter, Legal, and A3 page sizes.</p>
      <h3>Features</h3>
      <ul>
        <li><strong>contentToPrintableHTML</strong> - Full document with @page CSS</li>
        <li><strong>generatePDFStyles</strong> - Complete print stylesheet</li>
        <li><strong>previewPDF</strong> - Open preview in new tab</li>
        <li><strong>downloadPDF</strong> - Trigger file download</li>
        <li><strong>contentToCanvasHTML</strong> - html2canvas-ready output</li>
        <li><strong>splitContentForPages</strong> - Multi-page splitting</li>
      </ul>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button onClick={() => previewPDF(content, { title: 'Sample PDF', pageSize: 'A4' })}
          style={{ padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
          Preview PDF
        </button>
        <button onClick={() => downloadPDF(content, 'sample.html', { title: 'Sample' })}
          style={{ padding: '10px 20px', background: '#059669', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
          Download HTML
        </button>
      </div>
      <p>Content splits into {splitContentForPages(contentToPrintableHTML(content)).length} page(s)</p>
    </div>
  );
}
