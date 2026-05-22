import { buildLocalImageOnError } from './image-fallback';

interface CatalogDetailContext {
  categoryLabels: Record<string, string>;
  layoutLabels: Record<string, string>;
  variantLabels: Record<string, string>;
  usageLabels: Record<string, string>;
  qualityLabels: Record<string, string>;
  cdnVersion: string;
}

const SITE = 'https://identitate.md';
const CDN_BASE = 'https://cdn.jsdelivr.net/npm/@identitate-md/logos';

function escHtml(str: unknown): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function toLocalLogosPath(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('/logos/')) return path;
  const m = String(path).match(/^https?:\/\/(?:cdn\.jsdelivr\.net\/npm\/@identitate-md\/logos@[^/]+|unpkg\.com\/@identitate-md\/logos@[^/]+)(\/logos\/.+)$/i);
  return m?.[1] || '';
}

function resolveUrl(path: any, cdnVersion: string): string {
  if (!path) return '';
  if (typeof path === 'object') path = path.local || path.cdn_primary || path.cdn_fallback || '';
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/logos/')) return `${CDN_BASE}@${cdnVersion}${path}`;
  if (path.startsWith('/')) return path;
  return `${SITE}/${path.replace(/^\/+/, '')}`;
}

function resolveLocalAsset(asset: any): string {
  if (!asset) return '';
  if (typeof asset === 'string') return asset;
  return asset.local || '';
}

function getPrimaryLogoPath(inst: any): string {
  const main = inst.assets?.main;
  if (!main) return '';
  return (
    resolveLocalAsset(main.color) ||
    resolveLocalAsset(main.dark_mode) ||
    resolveLocalAsset(main.black) ||
    resolveLocalAsset(main.white) ||
    resolveLocalAsset(main.monochrome) ||
    resolveLocalAsset(main.png?.path)
  );
}

function getCdnLogoUrl(inst: any, cdnVersion: string): string {
  const main = inst.assets?.main;
  if (!main) return '';
  const selected = main.color || main.dark_mode || main.black || main.white || main.monochrome || main.png?.path;
  if (!selected) return '';
  if (typeof selected === 'object') {
    if (selected.cdn_primary) return selected.cdn_primary;
    if (selected.cdn_fallback) return selected.cdn_fallback;
    if (selected.local?.startsWith('/logos/')) return `${CDN_BASE}@${cdnVersion}${selected.local}`;
    return selected.local || '';
  }
  if (selected.startsWith('http')) return selected;
  if (selected.startsWith('/logos/')) return `${CDN_BASE}@${cdnVersion}${selected}`;
  if (selected.startsWith('/')) return `${SITE}${selected}`;
  return `${SITE}/${selected}`;
}

function shouldUseDarkPreview(inst: any, layout: string, variant: string, path: string): boolean {
  if (variant === 'white') return true;
  const localPath = toLocalLogosPath(path);
  return (
    inst?.slug === 'md-primaria-chisinau' &&
    layout === 'horizontal' &&
    variant === 'color' &&
    localPath === '/logos/md-primaria-chisinau/horizontal-white.svg'
  );
}

function getDownloadables(inst: any, cdnVersion: string) {
  const assets: any[] = [];
  for (const layout of ['horizontal', 'vertical', 'symbol']) {
    const group = inst.assets?.[layout];
    if (!group) continue;
    for (const variant of ['color', 'dark_mode', 'white', 'black', 'monochrome']) {
      const p = group[variant];
      if (!p) continue;
      assets.push({ label: `${layout}-${variant}`, format: 'svg', path: resolveUrl(p, cdnVersion), layout, variant });
    }
    if (Array.isArray(group.alternatives)) {
      for (const alt of group.alternatives) {
        if (!alt?.path) continue;
        assets.push({
          label: `${layout}-${alt.label || 'alternative'}`,
          format: 'svg',
          path: resolveUrl(alt.path, cdnVersion),
          layout,
          variant: 'custom',
        });
      }
    }
    if (group.png?.path) {
      assets.push({ label: `${layout}-png`, format: 'png', path: resolveUrl(group.png.path, cdnVersion), layout, variant: 'png', width: group.png.width, height: group.png.height });
    }
  }
  return assets;
}

function hexToRgb(hex: string): [number, number, number] | null {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? [parseInt(r[1], 16), parseInt(r[2], 16), parseInt(r[3], 16)] : null;
}
function luminance(r: number, g: number, b: number) {
  return [r, g, b].reduce((acc, c, i) => {
    c /= 255;
    return acc + (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)) * [0.2126, 0.7152, 0.0722][i];
  }, 0);
}
function contrastVsWhite(hex: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 1;
  const l = luminance(...rgb);
  return 1.05 / (l + 0.05);
}
function wcagBadge(hex: string) {
  const c = contrastVsWhite(hex);
  if (c >= 7) return { level: 'AAA', cls: 'text-blue-600', icon: 'info', title: 'AAA (≥7:1)' };
  if (c >= 4.5) return { level: 'AA', cls: 'text-green-600', icon: 'info', title: 'AA (≥4.5:1)' };
  return { level: 'N/A', cls: 'text-red-500', icon: 'warning', title: '<4.5:1 - contrast insuficient' };
}

const ICONS = {
  download: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`,
  copy: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>`,
  copySm: `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>`,
  web: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>`,
  book: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`,
};

function buildVariantCard(inst: any, layout: string, variant: string, path: string, layoutLabel: string, variantLabels: Record<string, string>, customLabel = '', customPreview = '') {
  const useDarkPreview = shouldUseDarkPreview(inst, layout, variant, path);
  const isDark = variant === 'dark_mode';
  const label = customLabel || variantLabels[variant] || variant;
  const bg = customPreview === 'light'
    ? 'bg-gray-50'
    : customPreview === 'dark'
      ? 'bg-gray-800'
      : customPreview === 'checkerboard-dark'
        ? 'checkerboard-dark'
        : useDarkPreview
          ? 'bg-gray-800'
          : isDark
            ? 'checkerboard-dark'
            : 'checkerboard';
  const fallbackPath = toLocalLogosPath(path);
  return `
    <div class="border border-surface-200 rounded overflow-hidden hover:shadow-md hover:border-surface-300 transition-all duration-200">
      <div class="aspect-[3/2] flex items-center justify-center p-6 ${bg}">
        <img src="${escHtml(path)}" alt="Logo ${escHtml(inst.name)} - ${escHtml(layoutLabel)} ${escHtml(label)}"
             class="max-w-full max-h-full object-contain" loading="lazy" decoding="async"
             data-local-fallback="${escHtml(fallbackPath)}"
             onerror="${buildLocalImageOnError(fallbackPath)}" />
      </div>
      <div class="p-2 bg-white flex items-center justify-between">
        <div>
          <span class="text-xs font-medium text-primary-900">${escHtml(label)}</span>
          <span class="text-[11px] text-surface-400 ml-1">SVG</span>
        </div>
        <div class="flex items-center gap-0.5">
          <a href="${escHtml(path)}" download data-va-dl="${escHtml(inst.slug)}" data-va-fmt="svg" data-va-asset="${escHtml(layout + ':' + (variant || label))}" class="p-2 rounded hover:bg-primary-50 text-surface-400 hover:text-primary-500 transition-colors" title="Descarcă SVG">${ICONS.download}</a>
          <button type="button" class="copy-asset-btn p-2 rounded hover:bg-primary-50 text-surface-400 hover:text-primary-500 transition-colors" data-path="${escHtml(path)}" title="Copiază SVG">${ICONS.copy}</button>
        </div>
      </div>
    </div>`;
}

function buildPngCard(inst: any, group: any, layoutLabel: string, cdnVersion: string) {
  const path = resolveUrl(group.png.path, cdnVersion);
  return `
    <div class="border border-surface-200 rounded overflow-hidden hover:shadow-md hover:border-surface-300 transition-all duration-200">
      <div class="aspect-[3/2] flex items-center justify-center p-6 checkerboard">
        <img src="${escHtml(path)}" alt="Logo ${escHtml(inst.name)} - ${escHtml(layoutLabel)} PNG"
             class="max-w-full max-h-full object-contain" loading="lazy" decoding="async" />
      </div>
      <div class="p-2 bg-white flex items-center justify-between">
        <div>
          <span class="text-xs font-medium text-primary-900">PNG</span>
          ${group.png.width ? `<span class="text-[11px] text-surface-400 ml-1">${group.png.width} × ${group.png.height}px</span>` : ''}
        </div>
        <a href="${escHtml(path)}" download data-va-dl="${escHtml(inst.slug)}" data-va-fmt="png" data-va-asset="${escHtml(layoutLabel + ':png')}" class="p-2 rounded hover:bg-primary-50 text-surface-400 hover:text-primary-500 transition-colors" title="Descarcă PNG">${ICONS.download}</a>
      </div>
    </div>`;
}

function buildColorsSection(colors: any[], usageLabels: Record<string, string>) {
  if (!colors?.length) return '';
  const swatches = colors.map(c => {
    const { level, cls, title } = wcagBadge(c.hex);
    const usageLabel = c.usage ? (usageLabels[c.usage] || c.usage) : '';
    const rgbStr = c.rgb ? c.rgb.join(', ') : '';
    return `
      <div class="bg-white border border-surface-200 rounded p-3 flex items-start gap-3 group">
        <div class="relative w-12 h-12 rounded border border-surface-200 shrink-0">
          <div class="w-full h-full rounded" style="background-color:${escHtml(c.hex)}"></div>
          <span class="absolute -top-1 -right-1 text-[10px] font-bold px-1 py-0.5 rounded-full bg-white border border-gray-300 shadow-sm ${cls}" title="${escHtml(title)}">${escHtml(level)}</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="font-medium text-sm text-primary-900">${escHtml(c.name)}</span>
            ${usageLabel ? `<span class="px-1.5 py-0.5 bg-surface-100 rounded text-[11px] text-surface-500">${escHtml(usageLabel)}</span>` : ''}
          </div>
          <div class="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-surface-500">
            <div class="font-mono flex items-center gap-1">
              ${escHtml(c.hex)}
              <button type="button" class="copy-color-btn p-1 rounded hover:bg-surface-100 text-surface-400 hover:text-surface-600 opacity-0 group-hover:opacity-100 transition" data-value="${escHtml(c.hex)}" title="Copiază HEX">${ICONS.copySm}</button>
            </div>
            ${rgbStr ? `<div class="flex items-center gap-1">RGB: ${escHtml(rgbStr)}<button type="button" class="copy-color-btn p-1 rounded hover:bg-surface-100 text-surface-400 hover:text-surface-600 opacity-0 group-hover:opacity-100 transition" data-value="rgb(${escHtml(rgbStr)})" title="Copiază RGB">${ICONS.copySm}</button></div>` : ''}
            ${c.cmyk ? `<div>CMYK: ${escHtml(c.cmyk.join(', '))}</div>` : ''}
            ${c.pantone ? `<div>Pantone ${escHtml(c.pantone)}</div>` : ''}
          </div>
        </div>
      </div>`;
  }).join('');
  return `
    <section class="mb-8">
      <h2 class="text-lg font-semibold text-primary-900 mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>
        Paletă de Culori
      </h2>
      <div class="space-y-3">${swatches}</div>
    </section>`;
}

export function buildCatalogDetail(inst: any, ctx: CatalogDetailContext) {
  const primaryLogo = getPrimaryLogoPath(inst);
  const cdnLogo = getCdnLogoUrl(inst, ctx.cdnVersion) || '';
  const downloadables = getDownloadables(inst, ctx.cdnVersion);
  const catLabel = ctx.categoryLabels[inst.category] || inst.category;
  const locationLabel = [inst.location?.city, inst.location?.county].filter(Boolean).join(', ');
  const shortLabel = inst.shortname?.trim() || '';
  const seoLabel = shortLabel && shortLabel.length <= 8 && /^[A-Za-z0-9]+$/.test(shortLabel)
    ? shortLabel.toUpperCase()
    : shortLabel;

  const contactLineHtml = (locationLabel || inst.resources?.contact?.phone || inst.resources?.contact?.email) ? `
    <div class="text-xs text-surface-400 flex flex-wrap items-center gap-3">
      ${locationLabel ? `
      <span class="inline-flex items-center gap-1">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        ${escHtml(locationLabel)}
      </span>` : ''}
      ${inst.resources?.contact?.phone ? `
      <button type="button" class="copy-contact-btn inline-flex items-center gap-1 hover:text-primary-600 transition-colors" data-value="${escHtml(inst.resources.contact.phone)}" title="Copiază numărul de telefon">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.684l1.5 4.5a1 1 0 01-.502 1.21l-2.257 1.128a11.042 11.042 0 005.266 5.266l1.128-2.257a1 1 0 011.21-.502l4.5 1.5A1 1 0 0121 15.72V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
        ${escHtml(inst.resources.contact.phone)}
      </button>` : ''}
      ${inst.resources?.contact?.email ? `
      <button type="button" class="copy-contact-btn inline-flex items-center gap-1 hover:text-primary-600 transition-colors" data-value="${escHtml(inst.resources.contact.email)}" title="Copiază adresa email">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2 7l10 7 10-7"/></svg>
        ${escHtml(inst.resources.contact.email)}
      </button>` : ''}
    </div>
  ` : '';

  let logoSectionsHtml = '';
  for (const layout of ['horizontal', 'vertical', 'symbol']) {
    const group = inst.assets?.[layout];
    if (!group) continue;
    const layoutLabel = ctx.layoutLabels[layout] || layout;
    let cards = '';
    let alternativeCards = '';
    for (const variant of ['color', 'dark_mode', 'white', 'black', 'monochrome']) {
      const p = group[variant];
      if (!p) continue;
      const groupPreview = group.variantPreviews?.[variant] || (variant === 'color' ? (group.preview || '') : '');
      cards += buildVariantCard(inst, layout, variant, resolveUrl(p, ctx.cdnVersion), layoutLabel, ctx.variantLabels, '', groupPreview);
    }
    if (Array.isArray(group.alternatives)) {
      for (const alt of group.alternatives) {
        if (!alt?.path) continue;
        alternativeCards += buildVariantCard(inst, layout, 'custom', resolveUrl(alt.path, ctx.cdnVersion), layoutLabel, ctx.variantLabels, alt.label || 'Alternative', alt.preview || '');
      }
    }
    if (group.png?.path) cards += buildPngCard(inst, group, layoutLabel, ctx.cdnVersion);
    if (!cards && !alternativeCards) continue;
    logoSectionsHtml += `
      <div class="mb-6">
        <h3 class="text-sm font-medium text-primary-800 mb-3">${escHtml(layoutLabel)}</h3>
        ${cards ? `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">${cards}</div>` : ''}
        ${alternativeCards ? `
          <h4 class="text-xs font-semibold uppercase tracking-wide text-surface-500 mt-4 mb-2">Alternative</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">${alternativeCards}</div>
        ` : ''}
      </div>`;
  }

  const colorsHtml = buildColorsSection(inst.colors, ctx.usageLabels);

  let typographyHtml = '';
  if (inst.typography?.primary) {
    const sec = inst.typography.secondary;
    typographyHtml = `
      <section class="mb-8">
        <h2 class="text-lg font-semibold text-primary-900 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16"/></svg>
          Tipografie
        </h2>
        <div class="space-y-2">
          <div class="bg-white border border-surface-200 rounded p-3 flex items-center justify-between">
            <div>
              <div class="font-medium text-sm text-primary-900">${escHtml(inst.typography.primary.family)}</div>
              <div class="text-xs text-surface-500">Font principal</div>
            </div>
            ${inst.typography.primary.url ? `<a href="${escHtml(inst.typography.primary.url)}" target="_blank" rel="noopener" class="text-xs text-primary-500 hover:text-primary-600">Vezi font &rarr;</a>` : ''}
          </div>
          ${sec ? `
          <div class="bg-white border border-surface-200 rounded p-3 flex items-center justify-between">
            <div>
              <div class="font-medium text-sm text-primary-900">${escHtml(sec.family)}</div>
              <div class="text-xs text-surface-500">Font secundar</div>
            </div>
            ${sec.url ? `<a href="${escHtml(sec.url)}" target="_blank" rel="noopener" class="text-xs text-primary-500 hover:text-primary-600">Vezi font &rarr;</a>` : ''}
          </div>` : ''}
        </div>
      </section>`;
  }

  let resourcesHtml = '';
  if (inst.resources?.website || inst.resources?.branding_manual || inst.resources?.social_media) {
    resourcesHtml = `
      <section class="mb-8">
        <h2 class="text-lg font-semibold text-primary-900 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          Resurse
        </h2>
        <div class="space-y-2">
          ${inst.resources.website ? `
            <a href="${escHtml(inst.resources.website)}" target="_blank" rel="noopener noreferrer"
               class="flex items-center gap-2 p-3 bg-white border border-surface-200 rounded hover:border-primary-300 transition-colors text-sm text-primary-600">
              ${ICONS.web} Website Oficial
            </a>` : ''}
          ${inst.resources.branding_manual ? `
            <a href="${escHtml(inst.resources.branding_manual)}" target="_blank" rel="noopener"
               class="flex items-center gap-2 p-3 bg-white border border-surface-200 rounded hover:border-primary-300 transition-colors text-sm text-primary-600">
              ${ICONS.book} Manual de Identitate Vizuală
            </a>` : ''}
          ${inst.resources.social_media?.facebook ? `
            <a href="${escHtml(inst.resources.social_media.facebook)}" target="_blank" rel="noopener noreferrer"
               class="flex items-center gap-2 p-3 bg-white border border-surface-200 rounded hover:border-primary-300 transition-colors text-sm text-primary-600">
              📘 Facebook
            </a>` : ''}
          ${inst.resources.social_media?.twitter ? `
            <a href="${escHtml(inst.resources.social_media.twitter)}" target="_blank" rel="noopener noreferrer"
               class="flex items-center gap-2 p-3 bg-white border border-surface-200 rounded hover:border-primary-300 transition-colors text-sm text-primary-600">
              𝕏 Twitter
            </a>` : ''}
          ${inst.resources.social_media?.instagram ? `
            <a href="${escHtml(inst.resources.social_media.instagram)}" target="_blank" rel="noopener noreferrer"
               class="flex items-center gap-2 p-3 bg-white border border-surface-200 rounded hover:border-primary-300 transition-colors text-sm text-primary-600">
              📷 Instagram
            </a>` : ''}
          ${inst.resources.social_media?.linkedin ? `
            <a href="${escHtml(inst.resources.social_media.linkedin)}" target="_blank" rel="noopener noreferrer"
               class="flex items-center gap-2 p-3 bg-white border border-surface-200 rounded hover:border-primary-300 transition-colors text-sm text-primary-600">
              💼 LinkedIn
            </a>` : ''}
          ${inst.resources.social_media?.youtube ? `
            <a href="${escHtml(inst.resources.social_media.youtube)}" target="_blank" rel="noopener noreferrer"
               class="flex items-center gap-2 p-3 bg-white border border-surface-200 rounded hover:border-primary-300 transition-colors text-sm text-primary-600">
              ▶️ YouTube
            </a>` : ''}
        </div>
      </section>`;
  }

  const npmSnippet = `import logos from '@identitate-md/logos';\nconst logo = logos.institutions.find(i => i.id === '${inst.id}');`;
  const integrationHtml = `
    <section class="mb-8">
      <h2 class="text-lg font-semibold text-primary-900 mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
        Integrare
      </h2>
      <div class="flex border-b border-surface-200" role="tablist">
        <button type="button" data-tab="cdn"    class="intg-tab active-tab px-4 py-2 text-sm font-medium border-b-2 border-primary-500 text-primary-700 -mb-px">CDN</button>
        <button type="button" data-tab="npm"    class="intg-tab px-4 py-2 text-sm font-medium border-b-2 border-transparent text-surface-500 hover:text-surface-700 -mb-px">NPM</button>
        <button type="button" data-tab="direct" class="intg-tab px-4 py-2 text-sm font-medium border-b-2 border-transparent text-surface-500 hover:text-surface-700 -mb-px">URL Direct</button>
      </div>
      <div class="bg-white border border-t-0 border-surface-200 rounded-b-lg p-4">
        <div data-panel="cdn" class="intg-panel">
          <p class="text-sm text-surface-600 mb-3">Include logo-ul direct în HTML:</p>
          <div class="relative bg-gray-50 p-3 rounded font-mono text-sm overflow-x-auto border">
            <span class="text-pink-600">&lt;img</span> <span class="text-blue-600">src</span>=<span class="text-green-600">"${escHtml(cdnLogo)}"</span> <span class="text-blue-600">alt</span>=<span class="text-green-600">"${escHtml(inst.name)}"</span><span class="text-pink-600">&gt;</span>
            <button type="button" class="copy-code-btn absolute top-2 right-2 p-2 rounded hover:bg-gray-200 text-gray-500 transition-colors" data-value='&lt;img src="${escHtml(cdnLogo)}" alt="${escHtml(inst.name)}"&gt;' title="Copiază">${ICONS.copy}</button>
          </div>
        </div>
        <div data-panel="npm" class="intg-panel hidden">
          <p class="text-sm text-surface-600 mb-3">Instalează pachetul și importă datele:</p>
          <div class="space-y-2">
            <div class="relative bg-gray-50 p-3 rounded font-mono text-sm border">
              <span class="text-surface-500">$</span> npm install @identitate-md/logos
              <button type="button" class="copy-code-btn absolute top-2 right-2 p-2 rounded hover:bg-gray-200 text-gray-500 transition-colors" data-value="npm install @identitate-md/logos" title="Copiază">${ICONS.copy}</button>
            </div>
            <div class="relative bg-gray-50 p-3 rounded font-mono text-sm border overflow-x-auto">
              <span class="text-pink-600">import</span> logos <span class="text-pink-600">from</span> <span class="text-green-600">'@identitate-md/logos'</span>;<br>
              <span class="text-pink-600">const</span> logo = logos.institutions.<span class="text-blue-600">find</span>(i =&gt; i.id === <span class="text-green-600">'${escHtml(inst.id)}'</span>);
              <button type="button" class="copy-code-btn absolute top-2 right-2 p-2 rounded hover:bg-gray-200 text-gray-500 transition-colors" data-value="${escHtml(npmSnippet)}" title="Copiază">${ICONS.copy}</button>
            </div>
          </div>
        </div>
        <div data-panel="direct" class="intg-panel hidden">
          <p class="text-sm text-surface-600 mb-3">Copiază URL-ul pentru Figma, Canva sau alte aplicații:</p>
          <div class="relative bg-gray-50 p-3 rounded font-mono text-sm border break-all">
            ${escHtml(cdnLogo)}
            <button type="button" class="copy-code-btn absolute top-2 right-2 p-2 rounded hover:bg-gray-200 text-gray-500 transition-colors" data-value="${escHtml(cdnLogo)}" title="Copiază URL">${ICONS.copy}</button>
          </div>
        </div>
      </div>
    </section>`;

  let downloadsHtml = '';
  if (downloadables.length > 0) {
    downloadsHtml = `
      <section class="mb-8">
        <h2 class="text-lg font-semibold text-primary-900 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          Toate Descărcările
        </h2>
        <button id="download-zip" data-downloadables='${JSON.stringify(downloadables).replace(/'/g, "&#39;")}' data-slug="${escHtml(inst.slug)}"
                class="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors flex items-center gap-2 text-sm">
          ${ICONS.download} Descarcă toate ca ZIP
        </button>
      </section>`;
  }

  const keywordsHtml = inst.meta?.keywords?.length ? `
    <div class="flex flex-wrap gap-1.5 mt-4">
      ${inst.meta.keywords.map((k: string) => `<span class="px-2 py-1 bg-surface-50 border border-surface-200 rounded-full text-[11px] text-surface-500">${escHtml(k)}</span>`).join('')}
    </div>` : '';

  return `
    <article>
      <!-- Header -->
      <header class="mb-8">
        <div class="flex items-start gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2 mb-1">
              <div class="flex items-center gap-2 text-xs text-surface-400">
                <a href="/catalog" class="text-primary-500 hover:text-primary-600">Catalog</a>
                <span>&rsaquo;</span>
                <span class="text-surface-600">${escHtml(catLabel)}</span>
              </div>
              <button type="button" class="share-inst-btn hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-surface-500 border border-surface-200 rounded hover:border-primary-300 hover:text-primary-600 transition-colors" title="Distribuie">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                Distribuie
              </button>
            </div>
            <h1 class="text-xl sm:text-2xl font-medium text-primary-900 mb-2" style="text-wrap:pretty">${escHtml(seoLabel ? `${seoLabel} logo oficial` : `Logo oficial ${inst.name}`)}</h1>
            <p class="text-xs text-surface-500 mb-2" style="text-wrap:pretty">${escHtml(inst.name)}</p>
            <div class="flex flex-wrap items-center gap-2 mb-2">
              ${inst.shortname ? `<span class="px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs font-semibold">${escHtml(inst.shortname.toUpperCase())}</span>` : ''}
              <span class="px-2 py-0.5 bg-surface-100 text-surface-600 rounded text-xs">${escHtml(catLabel)}</span>
            </div>
            ${inst.description ? `<p class="text-sm text-surface-500 mb-2" style="max-width:600px;text-wrap:pretty;font-weight:360">${escHtml(inst.description)}</p>` : ''}
            ${contactLineHtml}
            ${inst.usage_notes ? `<div class="mt-3 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800"><strong>Note de utilizare:</strong> ${escHtml(inst.usage_notes)}</div>` : ''}
          </div>
          ${primaryLogo ? `
          <div class="shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-white border border-surface-200 rounded p-3 flex items-center justify-center">
            <img src="${escHtml(primaryLogo)}" alt="Logo ${escHtml(inst.name)}" class="max-w-full max-h-full object-contain" loading="eager" />
          </div>` : ''}
        </div>
        ${keywordsHtml}
      </header>

      <!-- Logos -->
      <section class="mb-8">
        <h2 class="text-lg font-semibold text-primary-900 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          Logo-uri
        </h2>
        ${logoSectionsHtml}
      </section>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        ${colorsHtml}
        <div class="space-y-8">
          ${typographyHtml}
          ${resourcesHtml}
        </div>
      </div>

      ${downloadsHtml}
      ${integrationHtml}

      <section class="pt-6 border-t border-surface-200">
        <div class="flex items-center justify-between text-xs text-surface-400">
          <span>Actualizat ${new Date(inst.meta.last_updated).toLocaleDateString('ro-RO')}</span>
          <span class="font-mono">ID: ${escHtml(inst.id)}</span>
        </div>
      </section>
    </article>`;
}
