import { buildCatalogDetail } from './catalog-detail';
import { attachCatalogMobileSheet } from './catalog-mobile-sheet';

export function attachCatalogController() {
// ─── Bootstrap ──────────────────────────────────────────────────────────────
const { institutions, CATEGORY_LABELS_SINGULAR, LAYOUT_LABELS, VARIANT_LABELS, USAGE_LABELS, QUALITY_LABELS, PATH_BY_SLUG, SLUG_BY_PATH, initialPathId, cdnVersion, routeBase = 'catalog' } = (window as any).__catalogData;

const normalizedRouteBase = String(routeBase || 'catalog').replace(/^\/+|\/+$/g, '') || 'catalog';

const CDN_BASE = `https://cdn.jsdelivr.net/npm/@identitate-md/logos@${cdnVersion}`;
const SITE = 'https://identitate.md';

/** Build an index map by slug */
const bySlug = {};
institutions.forEach(i => { bySlug[i.slug] = i; });

// ─── DOM refs ────────────────────────────────────────────────────────────────
const categoryBtns   = document.querySelectorAll('.category-btn');
const institutionBtns = document.querySelectorAll('.institution-btn');
const institutionGroups = document.querySelectorAll('.institution-group');
const logoCards = document.querySelectorAll<HTMLElement>('[data-institution-id]');
const searchInput    = document.getElementById('catalog-search');
const searchClear    = document.getElementById('search-clear');
const sortAZ         = document.getElementById('sort-az');
const sortZA         = document.getElementById('sort-za');
const sidebarCount   = document.getElementById('sidebar-count');
const detail         = document.getElementById('institution-detail');
const placeholder    = document.getElementById('catalog-placeholder');

let currentCategory  = null; // null = all
let currentSlug      = null;
let currentSort      = 'az';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function buildDetail(inst) {
  return buildCatalogDetail(inst, {
    categoryLabels: CATEGORY_LABELS_SINGULAR,
    layoutLabels: LAYOUT_LABELS,
    variantLabels: VARIANT_LABELS,
    usageLabels: USAGE_LABELS,
    qualityLabels: QUALITY_LABELS,
    cdnVersion,
  });
}

// ─── Sidebar helpers ──────────────────────────────────────────────────────────
function updateSidebarCount() {
  const visible = [...document.querySelectorAll('.institution-btn')]
    .filter(b => !b.classList.contains('hidden')).length;
  if (sidebarCount) sidebarCount.textContent = `${visible} instituții`;
}

function setActiveCategory(value) {
  currentCategory = value;
  categoryBtns.forEach(b => {
    const active = b.dataset.categoryBtn === value;
    b.classList.toggle('bg-primary-50',  active);
    b.classList.toggle('text-primary-700', active);
    b.classList.toggle('font-medium',    active);
    b.classList.toggle('text-surface-700', !active);
  });
  institutionGroups.forEach(g => {
    g.classList.toggle('hidden', !!value && g.dataset.categoryGroup !== value);
  });
  updateSidebarCount();
}

function setActiveInstitution(slug) {
  currentSlug = slug;
  document.querySelectorAll('.institution-btn').forEach(b => {
    const active = b.dataset.institutionBtn === slug;
    b.classList.toggle('bg-primary-50', active);
    b.classList.toggle('text-primary-700', active);
    b.classList.toggle('font-medium', active);
  });
  // Auto-scroll active button into view
  const activeBtn = document.querySelector(`.institution-btn[data-institution-btn="${slug}"]`);
  activeBtn?.scrollIntoView({ block: 'nearest' });
}

function getPathIdFromUrl() {
  const m = window.location.pathname.match(new RegExp(`^/${normalizedRouteBase}/([^/?#]+)`));
  return m?.[1] ? decodeURIComponent(m[1]) : '';
}

function resolveSlugFromPathId(pathId) {
  if (!pathId) return null;
  return SLUG_BY_PATH[pathId] || (bySlug[pathId] ? pathId : null);
}

function syncUrlForSlug(slug, replace = false) {
  if (!slug) return;
  const pathId = normalizedRouteBase === 'institution' ? slug : (PATH_BY_SLUG[slug] || slug);
  const nextPath = `/${normalizedRouteBase}/${encodeURIComponent(pathId)}`;
  if (window.location.pathname === nextPath) return;
  window.history[replace ? 'replaceState' : 'pushState']({ slug }, '', nextPath);
}

// ─── Load institution detail ──────────────────────────────────────────────────
function loadInstitution(slug, options = { updateUrl: false, replace: false }) {
  const inst = bySlug[slug];
  if (!inst || !detail) return;
  setActiveInstitution(slug);
  if (options.updateUrl) syncUrlForSlug(slug, options.replace);
  detail.innerHTML = buildDetail(inst);
  if (placeholder) placeholder.classList.add('hidden');
  detail.classList.remove('hidden');
  detail.scrollTop = 0;
  // Scroll main pane to top
  document.getElementById('catalog-main')?.scrollTo({ top: 0 });
  // Wire up copy + tabs + ZIP after inject
  wireDetail();
}

// ─── Wire events inside injected detail ──────────────────────────────────────
function wireDetail() {
  // Share button
  detail.querySelector('.share-inst-btn')?.addEventListener('click', async () => {
    const url = window.location.href;
    const btn = detail.querySelector('.share-inst-btn');
    try {
      await navigator.clipboard.writeText(url);
      if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>Link copiat!`;
        btn.classList.add('border-green-400', 'text-green-600', 'bg-green-50');
        btn.classList.remove('text-surface-500', 'border-surface-200');
        setTimeout(() => {
          btn.innerHTML = orig;
          btn.classList.remove('border-green-400', 'text-green-600', 'bg-green-50');
          btn.classList.add('text-surface-500', 'border-surface-200');
        }, 2000);
      }
    } catch { /* ignore */ }
  });
  // Copy: svg assets
  detail.querySelectorAll('.copy-asset-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (btn.dataset.copying) return;
      btn.dataset.copying = '1';
      const path = btn.dataset.path;
      window.posthog?.capture('logo_copied', { institution: currentSlug, asset_path: path });
      try {
        const text = await fetch(path).then(r => r.text());
        await navigator.clipboard.writeText(text);
        flashCheck(btn);
      } catch { flashX(btn); }
      delete btn.dataset.copying;
    });
  });
  // Copy: color / code snippets
  detail.querySelectorAll('.copy-color-btn, .copy-code-btn, .copy-contact-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const val = btn.dataset.value || '';
      // decode HTML entities back to plain text
      const txt = new DOMParser().parseFromString(val, 'text/html').documentElement.textContent;
      try { await navigator.clipboard.writeText(txt); flashCheck(btn); }
      catch { flashX(btn); }
    });
  });
  // Integration tabs
  const tabs   = detail.querySelectorAll('.intg-tab');
  const panels = detail.querySelectorAll('.intg-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const id = tab.dataset.tab;
      tabs.forEach(t => {
        const active = t.dataset.tab === id;
        t.classList.toggle('border-primary-500', active);
        t.classList.toggle('text-primary-700', active);
        t.classList.toggle('border-transparent', !active);
        t.classList.toggle('text-surface-500', !active);
      });
      panels.forEach(p => p.classList.toggle('hidden', p.dataset.panel !== id));
    });
  });
  // ZIP download
  const zipBtn = detail.querySelector('#download-zip');
  if (zipBtn) {
    zipBtn.addEventListener('click', async () => {
      const items = JSON.parse(zipBtn.dataset.downloadables || '[]');
      const slug  = zipBtn.dataset.slug || 'logos';
      const orig  = zipBtn.innerHTML;
      zipBtn.disabled = true;
      zipBtn.innerHTML = `<svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg> Se pregătește ZIP...`;
      try {
        const { default: JSZip } = await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm');
        const zip = new JSZip();
        for (const a of items) {
          const blob = await fetch(a.path).then(r => r.blob());
          zip.file(`${a.label}.${a.format}`, blob);
        }
        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url; a.download = `${slug}-logos.zip`; a.click();
        window.va?.('pageview', { route: '/download/[slug]/[format]', path: `/download/${slug}/zip` });
        window.posthog?.capture('zip_downloaded', { institution: slug, file_count: items.length });
        URL.revokeObjectURL(url);
        zipBtn.innerHTML = `<svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> ZIP descărcat!`;
        setTimeout(() => { zipBtn.innerHTML = orig; zipBtn.disabled = false; }, 2000);
      } catch {
        zipBtn.innerHTML = `<svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg> Eroare`;
        setTimeout(() => { zipBtn.innerHTML = orig; zipBtn.disabled = false; }, 2000);
      }
    });
  }
}

function flashCheck(btn) {
  const orig = btn.innerHTML;
  btn.innerHTML = `<svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`;
  setTimeout(() => { btn.innerHTML = orig; }, 1800);
}
function flashX(btn) {
  const orig = btn.innerHTML;
  btn.innerHTML = `<svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`;
  setTimeout(() => { btn.innerHTML = orig; }, 1800);
}

// ─── Sidebar 2 sorting ────────────────────────────────────────────────────────
function applySortAndFilter(query) {
  const q = (query || '').toLowerCase().trim();
  // Update visibility of each institution button based on query + category
  document.querySelectorAll('.institution-group').forEach(group => {
    const cat = group.dataset.categoryGroup;
    const catHidden = !!currentCategory && cat !== currentCategory;
    const btns = [...group.querySelectorAll('.institution-btn')];

    // Sort
    const container = group; // buttons are direct children or inside
    btns.sort((a, b) => {
      const an = (a.dataset.name || '').toLowerCase();
      const bn = (b.dataset.name || '').toLowerCase();
      return currentSort === 'az' ? an.localeCompare(bn) : bn.localeCompare(an);
    });
    btns.forEach(b => group.appendChild(b));

    let groupVisible = false;
    btns.forEach(b => {
      const name = (b.dataset.name || '').toLowerCase();
      const match = !q || name.includes(q);
      b.classList.toggle('hidden', !match || catHidden);
      if (match && !catHidden) groupVisible = true;
    });
    // Hide group header when nothing visible
    const hdr = group.querySelector('div');
    if (hdr) hdr.classList.toggle('hidden', !groupVisible);
    group.classList.toggle('hidden', !groupVisible);
  });
  logoCards.forEach(card => {
    const slug = card.dataset.institutionId || '';
    const cat = card.dataset.cardCategory || '';
    const inst = bySlug[slug];
    const name = (inst?.name || '').toLowerCase();
    const shortname = (inst?.shortname || '').toLowerCase();
    const matchCategory = !currentCategory || cat === currentCategory;
    const matchSearch = !q || name.includes(q) || shortname.includes(q) || slug.includes(q);
    card.classList.toggle('hidden', !(matchCategory && matchSearch));
  });
  updateSidebarCount();
}

// ─── Events ───────────────────────────────────────────────────────────────────
categoryBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const cat = btn.dataset.categoryBtn;
    setActiveCategory(cat === currentCategory ? null : cat);
    applySortAndFilter(searchInput?.value);
    // Auto-load first visible institution in selected category
    const firstVisible = [...document.querySelectorAll('.institution-btn')]
      .find(b => !b.classList.contains('hidden'));
    if (firstVisible) loadInstitution(firstVisible.dataset.institutionBtn, { updateUrl: true, replace: false });
  });
});

institutionBtns.forEach(btn => {
  btn.addEventListener('click', (event) => {
    const isPlainLeftClick = event.button === 0
      && !event.metaKey
      && !event.ctrlKey
      && !event.shiftKey
      && !event.altKey;
    if (isPlainLeftClick) {
      event.preventDefault();
      loadInstitution(btn.dataset.institutionBtn, { updateUrl: true, replace: false });
    }
  });
});

if (searchInput) {
  searchInput.addEventListener('input', () => {
    const q = searchInput.value;
    searchClear?.classList.toggle('hidden', !q);
    applySortAndFilter(q);
  });
}
if (searchClear) {
  searchClear.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    searchClear.classList.add('hidden');
    applySortAndFilter('');
  });
}

[sortAZ, sortZA].forEach(btn => {
  if (!btn) return;
  btn.addEventListener('click', () => {
    currentSort = btn.dataset.sort;
    sortAZ?.classList.toggle('bg-primary-50',     currentSort === 'az');
    sortAZ?.classList.toggle('text-primary-600',  currentSort === 'az');
    sortAZ?.classList.toggle('text-surface-400',  currentSort !== 'az');
    sortZA?.classList.toggle('bg-primary-50',     currentSort === 'za');
    sortZA?.classList.toggle('text-primary-600',  currentSort === 'za');
    sortZA?.classList.toggle('text-surface-400',  currentSort !== 'za');
    applySortAndFilter(searchInput?.value);
  });
});

// ─── Download tracking ────────────────────────────────────────────────────────
document.addEventListener('click', e => {
  const a = e.target.closest('[data-va-dl]');
  if (a) {
    window.va?.('pageview', { route: '/download/[slug]/[format]', path: `/download/${a.dataset.vaDl}/${a.dataset.vaFmt}` });
    window.posthog?.capture('logo_downloaded', {
      institution: a.dataset.vaDl,
      format: a.dataset.vaFmt,
      asset: a.dataset.vaAsset,
    });
  }
});

const mobileSheet = attachCatalogMobileSheet((slug) => loadInstitution(slug, { updateUrl: true, replace: false }));

// ─── Initialise ───────────────────────────────────────────────────────────────
(function init() {
  const params = new URLSearchParams(window.location.search);
  const slugFromPath = resolveSlugFromPathId(initialPathId || getPathIdFromUrl());
  const startSlug = slugFromPath || params.get('institution');
  const startCat  = params.get('categorie') || (startSlug ? bySlug[startSlug]?.category : null);

  // Activate first category or requested one
  const firstCat = startCat
    || document.querySelector('.category-btn')?.dataset.categoryBtn
    || null;
  if (firstCat) setActiveCategory(firstCat);

  applySortAndFilter('');

  // Load starting institution
  const slugToLoad = startSlug
    || document.querySelector('.institution-btn:not(.hidden)')?.dataset.institutionBtn;
  if (slugToLoad) loadInstitution(slugToLoad, { updateUrl: false, replace: false });
  else if (placeholder) { placeholder.classList.remove('hidden'); placeholder.style.display = 'flex'; }
  // Auto-open sheet on mobile when no institution is pre-selected
  if (!slugToLoad && window.innerWidth < 1024) mobileSheet.openSheet();

  window.addEventListener('popstate', () => {
    const popSlug = resolveSlugFromPathId(getPathIdFromUrl());
    if (popSlug && bySlug[popSlug]) {
      if (bySlug[popSlug]?.category !== currentCategory) {
        setActiveCategory(bySlug[popSlug].category);
        applySortAndFilter(searchInput?.value);
      }
      loadInstitution(popSlug, { updateUrl: false, replace: false });
    }
  });
})();
}
