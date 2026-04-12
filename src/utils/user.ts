export function normalizeAccountType(tipoUsuario?: string | null): string {
  return (tipoUsuario ?? '').trim().toLowerCase();
}

export function isCentroPublico(tipoUsuario?: string | null): boolean {
  const normalizedType = normalizeAccountType(tipoUsuario);
  return normalizedType === 'centro_publico' || normalizedType === 'centro público';
}

export function getAccountTypeLabel(tipoUsuario?: string | null): string {
  const normalizedType = normalizeAccountType(tipoUsuario);

  if (normalizedType === 'empresa') {
    return 'EMPRESA';
  }

  if (isCentroPublico(tipoUsuario)) {
    return 'CENTRO PÚBLICO';
  }

  return 'PARTICULAR';
}