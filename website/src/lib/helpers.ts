/**
 * IdentitateRO — Funcții helper
 */

import type { Institution, LogoLayout, LogoColorVariant, LogoAssetGroup } from '../types/institution';
import { LOGO_LAYOUT_LABELS, LOGO_VARIANT_LABELS } from './labels';
import { resolveAssetPath } from './cdn-helpers';

// ─── Tipuri helper ───────────────────────────────

export interface DownloadableAsset {
  /** Eticheta afișată (ex: "Orizontal — Color") */
  label: string;
  /** Format fișier */
  format: 'svg' | 'png';
  /** Cale relativă față de /public */
  path: string;
  /** Layout-ul logo-ului */
  layout: LogoLayout;
  /** Varianta cromatică */
  variant: LogoColorVariant | 'png' | 'custom';
  /** Dimensiuni (doar PNG) */
  width?: number;
  height?: number;
}

export interface LogoVariantView {
  key: string;
  label: string;
  path: string;
  preview: 'checkerboard' | 'dark';
}

type InstitutionPathFields = Pick<Institution, 'slug' | 'shortname'>;

// ─── Funcții ─────────────────────────────────────

/**
 * Returnează calea către logo-ul principal (pentru preview).
 * Folosim direct assets.main (shortcut pentru DX).
 */
export function getPrimaryLogoPath(inst: Institution): string | null {
  const main = inst.assets.main;
  
  if (!main) return null;
  
  // Priority: color → dark_mode → black → white → monochrome → png
  // Rezolvă AssetUrls la string folosind CDN sau local
  if (main.color) return resolveAssetPath(main.color, true);
  if (main.dark_mode) return resolveAssetPath(main.dark_mode, true);
  if (main.black) return resolveAssetPath(main.black, true);
  if (main.white) return resolveAssetPath(main.white, true);
  if (main.monochrome) return resolveAssetPath(main.monochrome, true);
  if (main.png) return resolveAssetPath(main.png.path, true);
  
  return null;
}

/**
 * Verifică dacă instituția are cel puțin un SVG.
 */
export function hasSvg(inst: Institution): boolean {
  const { main, horizontal, vertical, symbol } = inst.assets;
  const groups = [main, horizontal, vertical, symbol].filter(Boolean);
  
  return groups.some(group => 
    group && (group.color || group.dark_mode || group.white || group.black || group.monochrome)
  );
}

/**
 * Extrage toate asset-urile descărcabile din structura de logo-uri.
 * Returnează o listă plată cu etichetă, format și cale.
 */
export function getAllDownloadableAssets(inst: Institution): DownloadableAsset[] {
  const assets: DownloadableAsset[] = [];
  const { main, horizontal, vertical, symbol } = inst.assets;
  
  // Process each layout type
  const layouts: Array<{ key: string; group: typeof main; layout: LogoLayout }> = [];
  
  if (horizontal) layouts.push({ key: 'horizontal', group: horizontal, layout: 'horizontal' });
  if (vertical) layouts.push({ key: 'vertical', group: vertical, layout: 'vertical' });
  if (symbol) layouts.push({ key: 'symbol', group: symbol, layout: 'symbol' });
  
  for (const { key, group, layout } of layouts) {
    if (!group) continue;
    
    const layoutLabel = LOGO_LAYOUT_LABELS[key] || key;
    
    // SVG variants
    const variants: Array<{ variant: LogoColorVariant; asset: typeof group.color }> = [
      { variant: 'color', asset: group.color },
      { variant: 'dark_mode', asset: group.dark_mode },
      { variant: 'white', asset: group.white },
      { variant: 'black', asset: group.black },
      { variant: 'monochrome', asset: group.monochrome },
    ];
    
    for (const { variant, asset } of variants) {
      if (!asset) continue;
      const path = resolveAssetPath(asset, true);
      if (!path) continue;
      const variantLabel = LOGO_VARIANT_LABELS[variant] || variant;
      assets.push({
        label: `${layoutLabel} — ${variantLabel}`,
        format: 'svg',
        path,
        layout,
        variant,
      });
    }

    // Custom alternatives
    for (const alt of group.alternatives || []) {
      const altPath = resolveAssetPath(alt.path, true);
      if (!altPath) continue;
      assets.push({
        label: `${layoutLabel} — ${alt.label}`,
        format: 'svg',
        path: altPath,
        layout,
        variant: 'custom',
      });
    }
    
    // PNG
    if (group.png) {
      const pngPath = resolveAssetPath(group.png.path, true);
      if (pngPath) {
        assets.push({
          label: `${layoutLabel} — PNG`,
          format: 'png',
          path: pngPath,
          layout,
          variant: 'png',
          width: group.png.width,
          height: group.png.height,
        });
      }
    }
  }
  
  return assets;
}

/**
 * Extrage variantele disponibile dintr-un grup de asset-uri logo.
 * Returnează un array de [variantKey, resolvedPath] pentru afișare.
 */
export function getLogoVariants(group: LogoAssetGroup | undefined): LogoVariantView[] {
  if (!group) return [];
  
  const variantKeys: Array<{ key: string; asset: typeof group.color }> = [
    { key: 'color', asset: group.color },
    { key: 'dark_mode', asset: group.dark_mode },
    { key: 'white', asset: group.white },
    { key: 'black', asset: group.black },
    { key: 'monochrome', asset: group.monochrome },
  ];
  
  const baseVariants: LogoVariantView[] = variantKeys
    .filter(({ asset }) => asset)
    .map(({ key, asset }) => {
      const path = resolveAssetPath(asset, true);
      if (!path) return null;
      return {
        key,
        label: LOGO_VARIANT_LABELS[key] || key,
        path,
        preview: key === 'white' ? 'dark' : 'checkerboard',
      } as LogoVariantView;
    })
    .filter((item): item is LogoVariantView => item !== null);

  const alternativeVariants: LogoVariantView[] = (group.alternatives || [])
    .map((alt, index) => {
      const path = resolveAssetPath(alt.path, true);
      if (!path) return null;
      return {
        key: `alt-${index}`,
        label: alt.label,
        path,
        preview: alt.preview || 'checkerboard',
      } as LogoVariantView;
    })
    .filter((item): item is LogoVariantView => item !== null);

  return [...baseVariants, ...alternativeVariants];
}

/**
 * Construiește URL-ul CDN pentru un logo cu verificare.
 * Returnează null dacă varianta specificată nu există.
 */
export function getCdnLogoUrl(inst: Institution, preferredVariant: string = 'color'): string | null {
  const cdnBase = `https://cdn.jsdelivr.net/npm/@identitate-md/logos/logos/${inst.id}`;
  const mainLayout = inst.assets.main?.type || 'horizontal';
  
  // Verificăm dacă varianta există în assets.main
  const main = inst.assets.main;
  if (!main) return null;
  
  // Găsim variantele disponibile
  const availableVariants: string[] = [];
  if (main.color) availableVariants.push('color');
  if (main.dark_mode) availableVariants.push('dark_mode');
  if (main.white) availableVariants.push('white');
  if (main.black) availableVariants.push('black');
  if (main.monochrome) availableVariants.push('monochrome');
  
  if (availableVariants.length === 0) return null;
  
  // Folosim varianta preferată sau prima disponibilă
  const variant = availableVariants.includes(preferredVariant) 
    ? preferredVariant 
    : availableVariants[0];
  
  return `${cdnBase}/${mainLayout}/${variant}.svg`;
}

/**
 * Construiește un segment URL sigur pentru catalog.
 * Preferă shortname când este disponibil (ex: MAE -> mae), apoi fallback pe slug.
 */
export function getPreferredCatalogKey(inst: InstitutionPathFields): string {
  const raw = String(inst.shortname || '').trim().toLowerCase();
  const normalized = raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized || inst.slug;
}

/**
 * Returnează o mapare unică slug -> segment URL pentru rutele /catalog/:id.
 */
export function buildCatalogPathMap(institutions: InstitutionPathFields[]): Record<string, string> {
  const map: Record<string, string> = {};
  const used = new Set<string>();

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

/**
 * Returnează numele de afișat al instituției (numele complet).
 */
export function getDisplayName(inst: Institution): string {
  // Shortname for display (uppercase), fallback to full name
  return inst.shortname?.toUpperCase() || inst.name;
}

/**
 * Returnează numele complet pentru titluri (always full name).
 */
export function getFullName(inst: Institution): string {
  return inst.name;
}

/**
 * Formatează valorile RGB ca string.
 */
export function formatRgb(rgb: [number, number, number]): string {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

/**
 * Formatează valorile CMYK ca string.
 */
export function formatCmyk(cmyk: [number, number, number, number]): string {
  return `${cmyk[0]}, ${cmyk[1]}, ${cmyk[2]}, ${cmyk[3]}`;
}

/**
 * Verifică dacă instituția are culori definite.
 */
export function hasColors(inst: Institution): boolean {
  return !!(inst.colors && inst.colors.length > 0);
}

/**
 * Verifică dacă instituția are tipografie definită.
 */
export function hasTypography(inst: Institution): boolean {
  return !!(inst.typography && inst.typography.primary);
}

/**
 * Returnează URL-ul site-ului oficial (dacă există).
 */
export function getWebsiteUrl(inst: Institution): string | undefined {
  return inst.resources?.website;
}

/**
 * Returnează URL-ul manualului de brand (dacă există).
 */
export function getBrandManualUrl(inst: Institution): string | undefined {
  return inst.resources?.branding_manual;
}

/**
 * Returnează URL-ul site-ului curat (fără slash la final).
 * Folosește configurația din Astro sau fallback.
 */
export function getSiteUrl(siteConfig?: string): string {
  if (siteConfig) {
    return siteConfig.replace(/\/$/, '');
  }
  return 'https://identitate.eu';
}

/**
 * Returnează origin-ul (protocol + host) din URL-ul site-ului.
 */
export function getSiteOrigin(siteConfig?: string): string {
  const url = getSiteUrl(siteConfig);
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
}
