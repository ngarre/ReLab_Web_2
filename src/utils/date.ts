// Función reutilizable para formatear fechas en español.
// Recibe:
// - rawDate: la fecha en bruto, que puede venir como string, null o undefined
// - options: opciones de formato para toLocaleDateString
// - fallback: texto que se devolverá si no hay fecha válida de entrada
export function formatSpanishDate(
  rawDate?: string | null,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  },
  fallback = 'No disponible'
): string { // La función devuelve un string
  
  // Si no hay fecha, o la fecha es una cadena vacía o con solo espacios,
  // devuelvo el texto de reserva
  if (!rawDate || !rawDate.trim()) {
    return fallback;
  }

  // Elimino espacios al principio y al final de la fecha recibida
  const normalizedDate = rawDate.trim();

  // Si la fecha incluye "T", asumo que viene en formato ISO con hora
  // (por ejemplo: 2026-04-12T10:30:00)
  // En ese caso me quedo solo con la parte anterior a la T: 2026-04-12
  // Si no incluye "T", dejo la fecha tal cual
  const isoDate = normalizedDate.includes('T')
    ? normalizedDate.split('T')[0]
    : normalizedDate;

  // Compruebo si la fecha tiene exactamente formato yyyy-MM-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    // Parto la fecha por guiones y convierto año, mes y día a números
    const [year, month, day] = isoDate.split('-').map(Number);

    // Creo un objeto Date.
    // Ojo: en JavaScript los meses van de 0 a 11,
    // por eso resto 1 al mes
    const parsed = new Date(year, month - 1, day);

    // Devuelvo la fecha formateada en español con las opciones recibidas
    return parsed.toLocaleDateString('es-ES', options);
  }

  // Si no era yyyy-MM-dd, intento interpretar la fecha directamente
  const parsed = new Date(normalizedDate);

  // Si la fecha creada es válida, la formateo en español
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString('es-ES', options);
  }

  // Si no he podido interpretarla como fecha válida,
  // devuelvo el texto original ya limpio
  return normalizedDate;
}