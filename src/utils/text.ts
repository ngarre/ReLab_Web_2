// Normaliza texto para búsquedas:
// - pasa a minúsculas
// - elimina tildes
// - quita espacios extra
export function normalizeText(text: string): string {
  return text
    .trim() // Elimina espacios en blanco al inicio y al final
    .toLowerCase() // Convierte todo el texto a minúsculas
    .normalize("NFD") // Descompone caracteres acentuados en sus componentes base
    .replace(/[\u0300-\u036f]/g, ""); // Elimina los caracteres de acento
}