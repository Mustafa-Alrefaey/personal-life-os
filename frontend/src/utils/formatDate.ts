/**
 * Format a date value as dd/mm/yyyy.
 * Accepts a Date object, ISO string, or any value parseable by `new Date()`.
 */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB'); // always dd/mm/yyyy
}

/**
 * Format a date as a long human-readable string, e.g. "Monday, 1 January 2024".
 * Respects the given locale but always puts day before month (en-GB for English).
 */
export function formatDateLong(value: string | Date, locale: string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  // Map 'en' → 'en-GB' so day comes before month; keep others (e.g. 'ar') as-is
  const resolvedLocale = locale === 'en' ? 'en-GB' : locale;
  return date.toLocaleDateString(resolvedLocale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
