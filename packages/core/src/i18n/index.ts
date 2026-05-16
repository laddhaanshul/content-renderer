// ==========================================
// Internationalization (i18n) Module
// RTL support, locale formatting, and UI string translations
// ==========================================

// ==========================================
// Types
// ==========================================

export interface I18nOptions {
  defaultLocale?: string;
  fallbackLocale?: string;
  supportedLocales?: string[];
}

export interface I18nContext {
  locale: string;
  direction: 'ltr' | 'rtl';
  setLocale: (locale: string) => void;
  t: (key: string, params?: Record<string, string>) => string;
  formatNumber: (num: number, options?: Intl.NumberFormatOptions) => string;
  formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
}

// ==========================================
// Supported Locales & RTL Detection
// ==========================================

/** All supported locale codes */
export const SUPPORTED_LOCALES: string[] = [
  'en', 'es', 'fr', 'de', 'ja', 'zh', 'ko', 'ar', 'hi', 'pt',
  'it', 'nl', 'ru', 'pl', 'tr', 'vi', 'th', 'sv', 'da', 'fi',
  'nb', 'el', 'cs', 'ro', 'hu', 'uk', 'id', 'ms', 'he', 'fa',
  'ur', 'bn', 'ta', 'te', 'ml', 'kn', 'gu', 'mr', 'pa', 'or',
];

/** RTL (right-to-left) locale codes */
export const RTL_LOCALES: string[] = [
  'ar',   // Arabic
  'he',   // Hebrew
  'fa',   // Persian (Farsi)
  'ur',   // Urdu
  'ku',   // Kurdish
  'ps',   // Pashto
  'yi',   // Yiddish
  'ug',   // Uyghur
  'ckb',  // Central Kurdish (Sorani)
  'sd',   // Sindhi
  'dv',   // Divehi
  'ha',   // Hausa
  'aze',  // Azerbaijani
];

// ==========================================
// Built-in UI Translations
// ==========================================

/**
 * Built-in translations for renderer UI strings.
 * Keys are translation keys, outer keys are locale codes.
 * At least 10 languages are included: en, es, fr, de, ja, zh, ko, ar, hi, pt.
 */
export const UI_STRINGS: Record<string, Record<string, string>> = {
  en: {
    copy: 'Copy',
    copied: 'Copied!',
    expand: 'Expand',
    collapse: 'Collapse',
    search: 'Search',
    loading: 'Loading...',
    error: 'An error occurred',
    retry: 'Retry',
    line: 'Line',
    noResults: 'No results found',
    showMore: 'Show more',
    showLess: 'Show less',
    darkMode: 'Dark mode',
    lightMode: 'Light mode',
    tableOfContents: 'Table of Contents',
    footnote: 'Footnote',
    backToTop: 'Back to top',
  },
  es: {
    copy: 'Copiar',
    copied: '¡Copiado!',
    expand: 'Expandir',
    collapse: 'Colapsar',
    search: 'Buscar',
    loading: 'Cargando...',
    error: 'Ocurrió un error',
    retry: 'Reintentar',
    line: 'Línea',
    noResults: 'No se encontraron resultados',
    showMore: 'Mostrar más',
    showLess: 'Mostrar menos',
    darkMode: 'Modo oscuro',
    lightMode: 'Modo claro',
    tableOfContents: 'Tabla de contenidos',
    footnote: 'Nota al pie',
    backToTop: 'Volver arriba',
  },
  fr: {
    copy: 'Copier',
    copied: 'Copié !',
    expand: 'Développer',
    collapse: 'Réduire',
    search: 'Rechercher',
    loading: 'Chargement...',
    error: 'Une erreur est survenue',
    retry: 'Réessayer',
    line: 'Ligne',
    noResults: 'Aucun résultat trouvé',
    showMore: 'Voir plus',
    showLess: 'Voir moins',
    darkMode: 'Mode sombre',
    lightMode: 'Mode clair',
    tableOfContents: 'Table des matières',
    footnote: 'Note de bas de page',
    backToTop: 'Retour en haut',
  },
  de: {
    copy: 'Kopieren',
    copied: 'Kopiert!',
    expand: 'Erweitern',
    collapse: 'Einklappen',
    search: 'Suchen',
    loading: 'Laden...',
    error: 'Ein Fehler ist aufgetreten',
    retry: 'Erneut versuchen',
    line: 'Zeile',
    noResults: 'Keine Ergebnisse gefunden',
    showMore: 'Mehr anzeigen',
    showLess: 'Weniger anzeigen',
    darkMode: 'Dunkler Modus',
    lightMode: 'Heller Modus',
    tableOfContents: 'Inhaltsverzeichnis',
    footnote: 'Fußnote',
    backToTop: 'Nach oben',
  },
  ja: {
    copy: 'コピー',
    copied: 'コピーしました！',
    expand: '展開',
    collapse: '折りたたむ',
    search: '検索',
    loading: '読み込み中...',
    error: 'エラーが発生しました',
    retry: '再試行',
    line: '行',
    noResults: '結果が見つかりません',
    showMore: 'もっと見る',
    showLess: '閉じる',
    darkMode: 'ダークモード',
    lightMode: 'ライトモード',
    tableOfContents: '目次',
    footnote: '脚注',
    backToTop: 'トップに戻る',
  },
  zh: {
    copy: '复制',
    copied: '已复制！',
    expand: '展开',
    collapse: '收起',
    search: '搜索',
    loading: '加载中...',
    error: '发生错误',
    retry: '重试',
    line: '行',
    noResults: '未找到结果',
    showMore: '显示更多',
    showLess: '显示更少',
    darkMode: '深色模式',
    lightMode: '浅色模式',
    tableOfContents: '目录',
    footnote: '脚注',
    backToTop: '回到顶部',
  },
  ko: {
    copy: '복사',
    copied: '복사됨!',
    expand: '펼치기',
    collapse: '접기',
    search: '검색',
    loading: '로딩 중...',
    error: '오류가 발생했습니다',
    retry: '다시 시도',
    line: '줄',
    noResults: '결과를 찾을 수 없습니다',
    showMore: '더 보기',
    showLess: '접기',
    darkMode: '다크 모드',
    lightMode: '라이트 모드',
    tableOfContents: '목차',
    footnote: '각주',
    backToTop: '맨 위로',
  },
  ar: {
    copy: 'نسخ',
    copied: 'تم النسخ!',
    expand: 'توسيع',
    collapse: 'طي',
    search: 'بحث',
    loading: 'جارٍ التحميل...',
    error: 'حدث خطأ',
    retry: 'إعادة المحاولة',
    line: 'سطر',
    noResults: 'لم يتم العثور على نتائج',
    showMore: 'عرض المزيد',
    showLess: 'عرض أقل',
    darkMode: 'الوضع الداكن',
    lightMode: 'الوضع الفاتح',
    tableOfContents: 'جدول المحتويات',
    footnote: 'حاشية سفلية',
    backToTop: 'العودة إلى الأعلى',
  },
  hi: {
    copy: 'कॉपी करें',
    copied: 'कॉपी हो गया!',
    expand: 'विस्तृत करें',
    collapse: 'संकुचित करें',
    search: 'खोजें',
    loading: 'लोड हो रहा है...',
    error: 'एक त्रुटि हुई',
    retry: 'पुनः प्रयास करें',
    line: 'पंक्ति',
    noResults: 'कोई परिणाम नहीं मिला',
    showMore: 'और दिखाएँ',
    showLess: 'कम दिखाएँ',
    darkMode: 'डार्क मोड',
    lightMode: 'लाइट मोड',
    tableOfContents: 'विषय सूची',
    footnote: 'पाद टिप्पणी',
    backToTop: 'शीर्ष पर वापस',
  },
  pt: {
    copy: 'Copiar',
    copied: 'Copiado!',
    expand: 'Expandir',
    collapse: 'Recolher',
    search: 'Pesquisar',
    loading: 'Carregando...',
    error: 'Ocorreu um erro',
    retry: 'Tentar novamente',
    line: 'Linha',
    noResults: 'Nenhum resultado encontrado',
    showMore: 'Mostrar mais',
    showLess: 'Mostrar menos',
    darkMode: 'Modo escuro',
    lightMode: 'Modo claro',
    tableOfContents: 'Índice',
    footnote: 'Nota de rodapé',
    backToTop: 'Voltar ao topo',
  },
  // Bonus languages for broader coverage
  it: {
    copy: 'Copia',
    copied: 'Copiato!',
    expand: 'Espandi',
    collapse: 'Comprimi',
    search: 'Cerca',
    loading: 'Caricamento...',
    error: 'Si è verificato un errore',
    retry: 'Riprova',
    line: 'Riga',
    noResults: 'Nessun risultato trovato',
    showMore: 'Mostra di più',
    showLess: 'Mostra meno',
    darkMode: 'Modalità scura',
    lightMode: 'Modalità chiara',
    tableOfContents: 'Indice',
    footnote: 'Nota a piè di pagina',
    backToTop: 'Torna in alto',
  },
  nl: {
    copy: 'Kopiëren',
    copied: 'Gekopieerd!',
    expand: 'Uitvouwen',
    collapse: 'Invouwen',
    search: 'Zoeken',
    loading: 'Laden...',
    error: 'Er is een fout opgetreden',
    retry: 'Opnieuw proberen',
    line: 'Regel',
    noResults: 'Geen resultaten gevonden',
    showMore: 'Meer weergeven',
    showLess: 'Minder weergeven',
    darkMode: 'Donkere modus',
    lightMode: 'Lichte modus',
    tableOfContents: 'Inhoudsopgave',
    footnote: 'Voetnoot',
    backToTop: 'Terug naar boven',
  },
  ru: {
    copy: 'Копировать',
    copied: 'Скопировано!',
    expand: 'Развернуть',
    collapse: 'Свернуть',
    search: 'Поиск',
    loading: 'Загрузка...',
    error: 'Произошла ошибка',
    retry: 'Повторить',
    line: 'Строка',
    noResults: 'Результаты не найдены',
    showMore: 'Показать больше',
    showLess: 'Показать меньше',
    darkMode: 'Тёмная тема',
    lightMode: 'Светлая тема',
    tableOfContents: 'Содержание',
    footnote: 'Сноска',
    backToTop: 'Наверх',
  },
};

// ==========================================
// Locale Message Registry
// ==========================================

/** Custom locale messages registry (extensible at runtime) */
const localeMessageRegistry: Record<string, Record<string, string>> = {};

// Deep-merge built-in strings into the registry
for (const [locale, strings] of Object.entries(UI_STRINGS)) {
  localeMessageRegistry[locale] = { ...strings };
}

// ==========================================
// Core Functions
// ==========================================

/**
 * Check if a locale is right-to-left (RTL).
 */
export function isRTL(locale: string): boolean {
  const normalized = normalizeLocale(locale);
  return RTL_LOCALES.includes(normalized);
}

/**
 * Get the text direction for a locale.
 */
export function getDirection(locale: string): 'ltr' | 'rtl' {
  return isRTL(locale) ? 'rtl' : 'ltr';
}

/**
 * Get the text direction for a locale, with 'auto' support for unknown locales.
 */
export function getLocaleDirection(locale: string): 'ltr' | 'rtl' | 'auto' {
  const normalized = normalizeLocale(locale);
  if (RTL_LOCALES.includes(normalized)) return 'rtl';
  if (SUPPORTED_LOCALES.includes(normalized)) return 'ltr';
  return 'auto';
}

/**
 * Format a number according to locale conventions.
 */
export function formatNumber(
  num: number,
  locale: string,
  options?: Intl.NumberFormatOptions
): string {
  const normalized = normalizeLocale(locale);
  try {
    return new Intl.NumberFormat(normalized, options).format(num);
  } catch {
    // Fallback to 'en' if locale is not supported
    try {
      return new Intl.NumberFormat('en', options).format(num);
    } catch {
      return String(num);
    }
  }
}

/**
 * Format a date according to locale conventions.
 */
export function formatDate(
  date: Date | string | number,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const normalized = normalizeLocale(locale);
  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return String(date);
  }

  try {
    return new Intl.DateTimeFormat(normalized, options).format(dateObj);
  } catch {
    try {
      return new Intl.DateTimeFormat('en', options).format(dateObj);
    } catch {
      return dateObj.toISOString();
    }
  }
}

/**
 * Get a localized text string by key, with optional parameter interpolation.
 * Falls back to the fallback locale, then to English, then to the key itself.
 */
export function getLocalizedText(
  key: string,
  locale: string,
  params?: Record<string, string>
): string {
  const normalized = normalizeLocale(locale);
  const fallback = 'en';

  // Look up the text in priority order
  let text =
    localeMessageRegistry[normalized]?.[key] ||
    localeMessageRegistry[fallback]?.[key] ||
    key;

  // Interpolate parameters: {paramName}
  if (params) {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramValue);
    }
  }

  return text;
}

/**
 * Set or merge locale messages for a given locale.
 * This allows users to add or override translations at runtime.
 */
export function setLocaleMessages(
  locale: string,
  messages: Record<string, string>
): void {
  const normalized = normalizeLocale(locale);
  if (!localeMessageRegistry[normalized]) {
    localeMessageRegistry[normalized] = {};
  }
  Object.assign(localeMessageRegistry[normalized], messages);
}

/**
 * Load all registered messages for a locale.
 */
export function loadLocale(locale: string): Record<string, string> {
  const normalized = normalizeLocale(locale);
  return { ...(localeMessageRegistry[normalized] || {}) };
}

/**
 * Create an i18n context with current locale state and bound helper methods.
 */
export function createI18nContext(options?: I18nOptions): I18nContext {
  const defaultLocale = options?.defaultLocale || 'en';
  const fallbackLocale = options?.fallbackLocale || 'en';

  let currentLocale = defaultLocale;

  const context: I18nContext = {
    get locale(): string {
      return currentLocale;
    },

    get direction(): 'ltr' | 'rtl' {
      return getDirection(currentLocale);
    },

    setLocale(locale: string): void {
      const normalized = normalizeLocale(locale);
      const supported = options?.supportedLocales || SUPPORTED_LOCALES;
      if (supported.includes(normalized)) {
        currentLocale = normalized;
      } else {
        // If not supported, try base language code
        const baseCode = normalized.split('-')[0];
        if (supported.includes(baseCode)) {
          currentLocale = baseCode;
        }
        // Otherwise keep the current locale (don't change)
      }
    },

    t(key: string, params?: Record<string, string>): string {
      // Try current locale, then fallback, then key
      let text =
        localeMessageRegistry[currentLocale]?.[key] ||
        localeMessageRegistry[fallbackLocale]?.[key] ||
        key;

      if (params) {
        for (const [paramKey, paramValue] of Object.entries(params)) {
          text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramValue);
        }
      }

      return text;
    },

    formatNumber(num: number, formatOptions?: Intl.NumberFormatOptions): string {
      return formatNumber(num, currentLocale, formatOptions);
    },

    formatDate(date: Date | string | number, formatOptions?: Intl.DateTimeFormatOptions): string {
      return formatDate(date, currentLocale, formatOptions);
    },
  };

  return context;
}

// ==========================================
// Helper Functions
// ==========================================

/**
 * Normalize a locale string to a standard format.
 * Handles variants like 'en-US', 'en_US', 'EN', etc.
 */
function normalizeLocale(locale: string): string {
  if (!locale) return 'en';

  // Convert underscores to hyphens, lowercase the language code
  let normalized = locale.replace(/_/g, '-').toLowerCase();

  // Extract just the language code (e.g., 'en-US' -> 'en')
  const parts = normalized.split('-');
  if (parts.length > 1) {
    // Keep language code lowercase, uppercase region code
    normalized = parts[0];
  }

  return normalized;
}

// ==========================================
// Enhanced i18n Functions
// ==========================================

/** Structured translation data for file-based loading */
export interface TranslationData {
  locale: string;
  messages: Record<string, string>;
  plurals?: Record<string, Record<string, string>>;
}

/** Add a new locale with messages and register it */
export function addLocale(locale: string, messages: Record<string, string>): void {
  const normalized = normalizeLocale(locale);
  setLocaleMessages(locale, messages);
  if (!SUPPORTED_LOCALES.includes(normalized)) {
    (SUPPORTED_LOCALES as string[]).push(normalized);
  }
}

/** Pluralize a word based on count using CLDR-inspired rules */
export function pluralize(locale: string, count: number, one: string, other: string, zero?: string): string {
  if (count === 0 && zero) return zero;
  if (count === 1) return one;
  return other.replace('{count}', String(count));
}

/** Interpolate template variables: {var}, {var:upper}, {var:lower}, {var:capitalize} */
export function interpolate(template: string, params: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(new RegExp('\\{' + key + '\\}', 'g'), value);
    result = result.replace(new RegExp('\\{' + key + ':upper\\}', 'g'), value.toUpperCase());
    result = result.replace(new RegExp('\\{' + key + ':lower\\}', 'g'), value.toLowerCase());
    result = result.replace(new RegExp('\\{' + key + ':capitalize\\}', 'g'),
      value.charAt(0).toUpperCase() + value.slice(1));
  }
  return result;
}

/** Load translations from a TranslationData object (simulates file loading) */
export function loadTranslationsFromFile(data: TranslationData): Record<string, string> {
  setLocaleMessages(data.locale, data.messages);
  return loadLocale(data.locale);
}

/** Get all translations for a specific key across all loaded locales */
export function getTranslationsForKey(key: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const locale of SUPPORTED_LOCALES) {
    const msgs = localeMessageRegistry[locale];
    if (msgs && msgs[key]) {
      result[locale] = msgs[key];
    }
  }
  return result;
}

/** Format a number as currency string for the given locale */
export function formatCurrency(
  amount: number,
  locale: string,
  currencyCode?: string,
  options?: Intl.NumberFormatOptions
): string {
  const normalized = normalizeLocale(locale);
  const code = currencyCode || 'USD';
  try {
    return new Intl.NumberFormat(normalized, {
      style: 'currency',
      currency: code,
      ...options,
    }).format(amount);
  } catch {
    try {
      return new Intl.NumberFormat('en', {
        style: 'currency',
        currency: code,
        ...options,
      }).format(amount);
    } catch {
      return code + ' ' + amount.toFixed(2);
    }
  }
}
