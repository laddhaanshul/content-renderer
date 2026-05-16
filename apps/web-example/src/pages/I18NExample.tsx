import React, { useState } from 'react';
import { SUPPORTED_LOCALES, isRTL, getDirection, formatNumber, formatDate, getLocalizedText } from '@laddhaanshul/content-renderer';

export default function I18NExample() {
  const [locale, setLocale] = useState('en');
  const direction = getDirection(locale);
  const rtl = isRTL(locale);

  return (
    <div style={{ padding: 24, direction }}>
      <h2>Internationalization (i18n)</h2>
      <p>Built-in i18n support with 40+ locales, RTL language detection, locale-aware number/date formatting.</p>
      <h3>Locale: {locale} {rtl ? '(RTL)' : '(LTR)'}</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {SUPPORTED_LOCALES.slice(0, 20).map((loc) => (
          <button key={loc} onClick={() => setLocale(loc)}
            style={{ padding: '4px 12px', background: loc === locale ? '#2563eb' : '#e5e7eb',
              color: loc === locale ? '#fff' : '#000', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            {loc}
          </button>
        ))}
      </div>
      <ul>
        <li>Number: {formatNumber(1234567.89, locale)}</li>
        <li>Date: {formatDate(new Date(), locale)}</li>
        <li>Copy: {getLocalizedText('copy', locale)}</li>
        <li>Search: {getLocalizedText('search', locale)}</li>
        <li>Loading: {getLocalizedText('loading', locale)}</li>
      </ul>
    </div>
  );
}
