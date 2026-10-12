import legacyMapRaw from '@/data/legacyIdMap.json';

const LEGACY_ID_MAP: Record<string, string> = legacyMapRaw as Record<string, string>;

/**
 * Resolves any legacy product ID (e.g., 'g1-1', 'g1-1001', '1001', or old slug)
 * to the canonical product ID ('g1-p0001' .. 'g1-p1053').
 * If the ID is already canonical or not found, returns the ID as-is.
 */
export function resolveLegacyId(id: string): string {
  if (!id) return id;
  const cleaned = id.trim();
  if (LEGACY_ID_MAP[cleaned]) {
    return LEGACY_ID_MAP[cleaned];
  }
  if (LEGACY_ID_MAP[cleaned.toLowerCase()]) {
    return LEGACY_ID_MAP[cleaned.toLowerCase()];
  }
  return cleaned;
}

export { LEGACY_ID_MAP };
