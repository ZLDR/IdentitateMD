/**
 * Canonical catalog-path resolution for IdentitateMD.
 * Shared by pages, generated docs, and build scripts.
 */

/**
 * @typedef {{ slug: string, shortname?: string | undefined }} CatalogPathSource
 */

function normalizeCatalogKey(value) {
  const raw = String(value || '').trim().toLowerCase();
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Returns the preferred catalog key for an institution-like record.
 * Falls back to slug when shortname is empty or collapses away.
 *
 * @param {CatalogPathSource} inst
 * @returns {string}
 */
export function getPreferredCatalogKey(inst) {
  return normalizeCatalogKey(inst.shortname) || inst.slug;
}

/**
 * Builds a unique slug -> catalog path map.
 * Preserves the preferred shortname when possible, then falls back to slug,
 * then appends numeric suffixes only when both collide.
 *
 * @param {CatalogPathSource[]} institutions
 * @returns {Record<string, string>}
 */
export function buildCatalogPathMap(institutions) {
  const map = {};
  const used = new Set();

  for (const inst of institutions) {
    const preferred = getPreferredCatalogKey(inst);
    const slugFallback = inst.slug;
    let key = preferred;

    if (used.has(key) && !used.has(slugFallback)) {
      key = slugFallback;
    }

    if (used.has(key)) {
      const base = key;
      let index = 2;
      while (used.has(`${base}-${index}`)) index += 1;
      key = `${base}-${index}`;
    }

    used.add(key);
    map[inst.slug] = key;
  }

  return map;
}
