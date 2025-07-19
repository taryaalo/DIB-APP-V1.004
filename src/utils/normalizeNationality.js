export function normalizeNationality(value) {
  if (!value) return '';
  const v = value.toString().trim().toLowerCase();
  if (v.includes('liby') || v.includes('ليبي') || v.includes('ليبيا')) {
    return 'libyan';
  }
  return 'other';
}
