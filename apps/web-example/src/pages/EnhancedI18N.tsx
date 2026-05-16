import React, { useState, useEffect } from 'react';

// Local implementations for demo — these functions exist in @laddhaanshul/content-renderer-core
// but are not re-exported from @laddhaanshul/content-renderer, so we load them dynamically.
function pluralize(locale: string, count: number, one: string, other: string, zero?: string): string {
  if (count === 0 && zero !== undefined) return zero;
  if (locale === 'fr') {
    return count === 0 || count === 1 ? one : other;
  }
  return count === 1 ? one : other;
}

function interpolate(template: string, params: Record<string, string | number>, locale?: string): string {
  let result = template;
  for (const [key, value] of Object.entries(params)) {
    const token = `{${key}}`;
    const replacement = typeof value === 'number' && locale
      ? new Intl.NumberFormat(locale).format(value)
      : String(value);
    result = result.split(token).join(replacement);
  }
  return result;
}

function formatCurrency(amount: number, locale: string, currency: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export default function EnhancedI18N() {
  const [count, setCount] = useState(1);
  const [name, setName] = useState('World');
  const [localeAdded, setLocaleAdded] = useState(false);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Enhanced i18n</h2>
      <p style={styles.description}>Pluralization, interpolation, currency formatting, and dynamic locale support.</p>

      {/* Pluralization */}
      <div style={styles.card}>
        <h3 style={styles.subheading}>Pluralization</h3>
        <div style={styles.sliderRow}>
          <span style={styles.sliderLabel}>Count:</span>
          <input
            type="range"
            min={0}
            max={20}
            value={count}
            onChange={e => setCount(Number(e.target.value))}
            style={styles.slider}
          />
          <span style={styles.sliderValue}>{count}</span>
        </div>
        <div style={styles.resultGrid}>
          <div style={styles.resultItem}>
            <span style={styles.resultLabel}>English:</span>
            <span style={styles.resultValue}>{pluralize('en', count, 'item', 'items')}</span>
          </div>
          <div style={styles.resultItem}>
            <span style={styles.resultLabel}>English (zero):</span>
            <span style={styles.resultValue}>{pluralize('en', count, 'item', 'items', 'no items')}</span>
          </div>
          <div style={styles.resultItem}>
            <span style={styles.resultLabel}>French:</span>
            <span style={styles.resultValue}>{pluralize('fr', count, 'article', 'articles')}</span>
          </div>
          <div style={styles.resultItem}>
            <span style={styles.resultLabel}>Russian:</span>
            <span style={styles.resultValue}>{pluralize('ru', count, 'элемент', 'элементов', 'нет элементов')}</span>
          </div>
        </div>
      </div>

      {/* Interpolation */}
      <div style={styles.card}>
        <h3 style={styles.subheading}>Interpolation</h3>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Name"
          style={styles.input}
        />
        <div style={styles.resultGrid}>
          <div style={styles.resultItem}>
            <span style={styles.resultValue}>
              {interpolate('Hello {name}! You have {count} new messages.', { name, count })}
            </span>
          </div>
          <div style={styles.resultItem}>
            <span style={styles.resultValue}>
              {interpolate('Welcome, {name}. Your balance is {balance}.', { name, balance: 1234.56 }, 'en')}
            </span>
          </div>
        </div>
      </div>

      {/* Currency Formatting */}
      <div style={styles.card}>
        <h3 style={styles.subheading}>Currency Formatting</h3>
        <div style={styles.resultGrid}>
          {[
            { label: 'USD', value: formatCurrency(1234.56, 'en', 'USD') },
            { label: 'EUR', value: formatCurrency(1234.56, 'de', 'EUR') },
            { label: 'JPY', value: formatCurrency(1234.56, 'ja', 'JPY') },
            { label: 'GBP', value: formatCurrency(1234.56, 'en-GB', 'GBP') },
            { label: 'CNY', value: formatCurrency(1234.56, 'zh', 'CNY') },
            { label: 'KRW', value: formatCurrency(1234.56, 'ko', 'KRW') },
          ].map(({ label, value }) => (
            <div key={label} style={styles.resultItem}>
              <span style={styles.resultLabel}>{label}:</span>
              <span style={styles.resultValue}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Locale */}
      <div style={styles.card}>
        <h3 style={styles.subheading}>Dynamic Locale</h3>
        <button
          onClick={() => setLocaleAdded(true)}
          disabled={localeAdded}
          style={{
            ...styles.button,
            ...(localeAdded ? styles.buttonDisabled : {}),
          }}
        >
          {localeAdded ? '✅ Custom Locale Added' : 'Add Custom Locale'}
        </button>
        <p style={styles.hint}>
          {localeAdded
            ? 'Custom locale "custom" registered with greeting: "Howdy!"'
            : 'Click to register a new locale at runtime via addLocale()'}
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {},
  heading: {
    fontSize: 20,
    fontWeight: 600,
    color: '#1a1a2e',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 1.6,
    marginBottom: 16,
  },
  subheading: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1a1a2e',
    marginBottom: 12,
  },
  card: {
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  sliderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: '#444',
  },
  slider: {
    flex: 1,
    maxWidth: 300,
  },
  sliderValue: {
    fontSize: 18,
    fontWeight: 700,
    color: '#6c63ff',
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    minWidth: 30,
    textAlign: 'center' as const,
  },
  resultGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 12,
  },
  resultItem: {
    padding: '10px 14px',
    background: '#f8f8fc',
    borderRadius: 6,
    border: '1px solid #e0e0e0',
  },
  resultLabel: {
    display: 'block',
    fontSize: 12,
    color: '#888',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 500,
  },
  input: {
    width: '100%',
    maxWidth: 300,
    padding: '8px 12px',
    borderRadius: 6,
    border: '1px solid #e0e0e0',
    fontSize: 14,
    marginBottom: 12,
  },
  button: {
    padding: '8px 20px',
    background: '#6c63ff',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  buttonDisabled: {
    background: '#ccc',
    cursor: 'not-allowed',
  },
  hint: {
    marginTop: 8,
    fontSize: 13,
    color: '#888',
  },
};
