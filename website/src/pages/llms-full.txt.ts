import type { APIRoute } from 'astro';
import institutionsIndex from '../data/institutions-index.json';
import type { Institution } from '../types/institution';

function buildCatalogPath(inst: Institution): string {
  const raw = String(inst.shortname || '').trim().toLowerCase();
  const normalized = raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return normalized || inst.slug;
}

// Build unique path map (mirrors helpers.ts buildCatalogPathMap)
function buildCatalogPathMap(institutions: Institution[]): Record<string, string> {
  const map: Record<string, string> = {};
  const used = new Set<string>();
  for (const inst of institutions) {
    const preferred = buildCatalogPath(inst);
    const slugFallback = inst.slug;
    let key = preferred;
    if (used.has(key) && !used.has(slugFallback)) key = slugFallback;
    if (used.has(key)) {
      let index = 2;
      while (used.has(`${key}-${index}`)) index++;
      key = `${key}-${index}`;
    }
    used.add(key);
    map[inst.slug] = key;
  }
  return map;
}

export const GET: APIRoute = () => {
  const institutions = institutionsIndex.institutions as unknown as Institution[];
  const pathMap = buildCatalogPathMap(institutions);

  const lines: string[] = [
    '# Identitate.MD — Full Institution Data',
    '',
    '> Complete machine-readable dataset of all public institutions in the Identitate.MD registry.',
    '> Includes official brand colors, typography, logo asset paths, and metadata for each institution.',
    '> Data is open-source and freely usable under the project license.',
    '',
    `Total institutions: ${institutions.length}`,
    `Last updated: ${institutionsIndex.generatedAt}`,
    '',
    '---',
    '',
  ];

  for (const inst of institutions) {
    const catalogPath = pathMap[inst.slug] || inst.slug;
    const url = `https://identitate.md/catalog/${catalogPath}`;

    lines.push(`## ${inst.name}${inst.shortname ? ` (${inst.shortname})` : ''}`);
    lines.push('');
    lines.push(`- **ID:** ${inst.id}`);
    lines.push(`- **Catalog page:** ${url}`);
    lines.push(`- **Category:** ${inst.category}`);
    lines.push(`- **Quality:** ${inst.meta?.quality || 'unknown'}`);

    if (inst.description) {
      lines.push(`- **Description:** ${inst.description}`);
    }

    if (inst.location) {
      lines.push(`- **Location:** ${inst.location.city || 'Chișinău'}, ${inst.location.country_code || 'MD'}`);
    }

    if (inst.resources?.website) {
      lines.push(`- **Official website:** ${inst.resources.website}`);
    }

    if ((inst.resources as any)?.social_media?.facebook) {
      lines.push(`- **Facebook:** ${(inst.resources as any).social_media.facebook}`);
    }

    if (inst.colors && inst.colors.length > 0) {
      lines.push('- **Brand colors:**');
      for (const color of inst.colors) {
        const rgb = color.rgb ? ` / rgb(${color.rgb.join(', ')})` : '';
        const usage = color.usage ? ` [${color.usage}]` : '';
        lines.push(`  - ${color.name}: ${color.hex}${rgb}${usage}`);
      }
    }

    if (inst.typography?.primary) {
      const t = inst.typography.primary;
      lines.push(`- **Primary font:** ${t.family}${t.weights ? ` (weights: ${t.weights.join(', ')})` : ''}`);
    }

    // Logo assets
    const assetSections = [
      { key: 'horizontal', group: inst.assets?.horizontal },
      { key: 'vertical', group: inst.assets?.vertical },
      { key: 'symbol', group: inst.assets?.symbol },
    ];

    const logoLines: string[] = [];
    for (const { key, group } of assetSections) {
      if (!group) continue;
      const variants = ['color', 'white', 'black', 'monochrome', 'dark_mode'] as const;
      for (const v of variants) {
        const path = (group as any)[v];
        if (path) {
          logoLines.push(`  - ${key}/${v}: https://identitate.md${path}`);
        }
      }
    }

    if (logoLines.length > 0) {
      lines.push('- **Logo assets (SVG):**');
      lines.push(...logoLines);
    }

    if (inst.meta?.keywords && inst.meta.keywords.length > 0) {
      lines.push(`- **Keywords:** ${inst.meta.keywords.join(', ')}`);
    }

    lines.push('');
    lines.push('---');
    lines.push('');
  }

  lines.push('## Data Access');
  lines.push('');
  lines.push('- JSON API: https://identitate.md/api/institutions.json');
  lines.push('- npm package: @identitate-md/logos');
  lines.push('- CDN: https://cdn.jsdelivr.net/npm/@identitate-md/logos/logos/{id}/{layout}/{variant}.svg');
  lines.push('- MCP server: npx -y identitate-md-mcp');

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
