export function formatSpanishDate(
  rawDate?: string | null,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  },
  fallback = 'No disponible'
): string {
  if (!rawDate || !rawDate.trim()) {
    return fallback;
  }

  const normalizedDate = rawDate.trim();
  const isoDate = normalizedDate.includes('T')
    ? normalizedDate.split('T')[0]
    : normalizedDate;

  if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    const [year, month, day] = isoDate.split('-').map(Number);
    const parsed = new Date(year, month - 1, day);

    return parsed.toLocaleDateString('es-ES', options);
  }

  const parsed = new Date(normalizedDate);

  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString('es-ES', options);
  }

  return normalizedDate;
}