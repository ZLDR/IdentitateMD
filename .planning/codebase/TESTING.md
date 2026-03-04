# Testing Patterns

**Analysis Date:** 2026-03-04

## Test Framework

**Status:** No automated tests currently implemented

**Runner:**
- None detected
- No Jest, Vitest, or other test runner in dependencies
- No test configuration files found

**Build/Type Checking:**
- TypeScript `astro check` available
- `"check": "astro check"` in package.json - validates types without running tests

**Run Commands:**
```bash
npm run check              # TypeScript type checking (astro check)
astro build               # Build & validate schema
npm run data:generate     # Validate institution JSON structure
```

## Validation Approach (Build-Time)

**TypeScript Validation:**
- Strict mode enabled: `"strict": true` in `tsconfig.json`
- Type guards for runtime validation: `isInstitution(obj): obj is Institution`
- Schema validation in index generation: `scripts/generate-index.js`

**Index Generation Validation:**
```typescript
// Location: /website/scripts/generate-index.js
// Validates minimum structure before including in index
if (!data.id || !data.slug || !data.name || !data.category) {
  console.error(`  ⚠️  ${file}: structura invalidă`);
  continue;
}

// Validates v3 schema markers
if (!data.id.startsWith('ro-') || !data.meta?.keywords || !data.assets?.main) {
  console.error(`  ⚠️  ${file}: nu respectă schema v3.0`);
  continue;
}
```

## Data Validation

**Institution Schema Validation:**

File: `src/types/institution.ts`

Type guards validate Institution structure:
```typescript
export function isInstitution(obj: any): obj is Institution {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    obj.id.startsWith('ro-') &&
    typeof obj.slug === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.category === 'string' &&
    obj.meta &&
    typeof obj.meta.version === 'string' &&
    typeof obj.meta.last_updated === 'string' &&
    Array.isArray(obj.meta.keywords) &&
    obj.assets &&
    obj.assets.main &&
    typeof obj.assets.main.type === 'string'
  );
}

export function hasCurrentSchema(obj: any): boolean {
  return (
    obj &&
    typeof obj.id === 'string' &&
    obj.id.startsWith('ro-') &&
    typeof obj.slug === 'string' &&
    obj.meta &&
    Array.isArray(obj.meta.keywords) &&
    obj.assets &&
    obj.assets.main !== undefined
  );
}
```

**JSON Validation at Build:**
- Institution files in `src/data/institutions/` must pass `generate-index.js` checks
- Invalid entries logged with reason and excluded from index
- Schema version (v3.0.0) enforced during index generation

## Asset Validation

**Image Fallback Pattern:**

Location: `src/components/LogoCard.astro`

```html
<img
  src={logoPath}
  alt={`Logo ${name}`}
  class="max-w-full max-h-full object-contain"
  onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
/>
<!-- Fallback placeholder shown on load failure -->
<div class="hidden flex-col items-center justify-center">
  <span>Logo indisponibil</span>
</div>
```

**URL Validation:**

Location: `src/lib/cdn-helpers.ts`

```typescript
export function resolveAssetPath(asset: AssetUrls | undefined, preferCdn: boolean = false): string | null {
  if (!asset) return null;

  // String path: validate CDN-ready paths
  if (typeof asset === 'string') {
    if (preferCdn && asset.startsWith('/logos/')) {
      return CDN_PATTERNS.jsdelivr(CDN_VERSION, asset);
    }
    return asset;
  }

  // Object validation: fallback chain
  if (preferCdn) {
    return asset.cdn_primary || asset.cdn_fallback || asset.local;
  }

  return asset.local;
}
```

## Search/Filter Validation

**Client-Side Search Pattern:**

Location: `src/pages/index.astro` (inline script)

```typescript
// Fuse.js fuzzy search configuration
const fuse = new Fuse(data, {
  keys: [
    { name: 'name', weight: 0.4 },
    { name: 'shortname', weight: 0.3 },
    { name: 'meta.keywords', weight: 0.2 },
    { name: 'description', weight: 0.1 },
  ],
  threshold: 0.35,
  ignoreLocation: true,
  useExtendedSearch: false,
});

// Validate matching results
const matchingSlugs = query
  ? new Set(fuse.search(query).map(r => r.item.slug))
  : null;
```

**Filter Validation:**
- Category filter validates against known categories from CATEGORY_LABELS
- Search query trimmed: `searchQuery.trim()`
- URL state persisted and re-validated on page load

## Copy Functionality Testing

**Client-Side Copy Logic:**

Location: `src/pages/institution/[id].astro` (inline script)

```typescript
copyButtons.forEach(button => {
  button.addEventListener('click', async (e) => {
    try {
      let textToCopy = '';

      if (isColorBtn) {
        textToCopy = btn.dataset.value!;
      } else if (isCodeBtn) {
        textToCopy = btn.dataset.value!;
      } else {
        // Fetch SVG content for asset copy
        const response = await fetch(assetPath);
        textToCopy = await response.text();
      }

      await navigator.clipboard.writeText(textToCopy);

      // Visual feedback on success
      btn.innerHTML = `<svg>...</svg>`;
      setTimeout(() => { btn.innerHTML = originalIcon; }, 2000);

    } catch (err) {
      console.error('Failed to copy:', err);
      // Visual feedback on error
      btn.innerHTML = `<svg class="text-red-500">...</svg>`;
      setTimeout(() => { btn.innerHTML = originalIcon; }, 2000);
    }
  });
});
```

**Error Handling:** Try-catch with visual feedback (icon changes for 2 seconds)

## ZIP Download Testing

**Location:** `src/pages/institution/[id].astro`

```typescript
const downloadZipBtn = document.getElementById('download-zip');
if (downloadZipBtn) {
  downloadZipBtn.addEventListener('click', async () => {
    const downloadables = JSON.parse(downloadZipBtn.dataset.downloadables || '[]');

    try {
      // Lazy-load JSZip from CDN
      const { default: JSZip } = await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm');

      const zip = new JSZip();
      for (const asset of downloadables) {
        const response = await fetch(asset.path);
        const blob = await response.blob();
        zip.file(asset.label + '.' + asset.format, blob);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      // Trigger download
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slug}-logos.zip`;
      a.click();

    } catch (err) {
      console.error('Failed to create ZIP:', err);
    }
  });
}
```

**Error Handling:** Console logging + visual feedback on failure

## Contrast Ratio Testing (Accessibility)

**Location:** `src/pages/institution/[id].astro`

```typescript
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 1;

  const l1 = getRelativeLuminance(rgb1[0], rgb1[1], rgb1[2]);
  const l2 = getRelativeLuminance(rgb2[0], rgb2[1], rgb2[2]);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Validate accessibility levels
const contrastWhite = getContrastRatio(hex, '#FFFFFF');
if (contrastWhite >= 7) {
  level = 'AAA';  // Excellent
} else if (contrastWhite >= 4.5) {
  level = 'AA';   // Acceptable
} else {
  level = 'N/A';  // Insufficient
}
```

## Testing Gaps & Recommendations

**Currently Not Tested:**
- Unit tests for helper functions: `getPrimaryLogoPath()`, `getAllDownloadableAssets()`, `getLogoVariants()`
- Helper module: `cdn-helpers.ts` URL generation and fallback logic
- Complex filtering logic in `index.astro` (category + search combinations)
- Mobile responsive behavior (layout breakpoints)
- Cross-browser compatibility (especially older browsers)

**Recommended Test Coverage Areas:**
- Helper function behavior with edge cases (missing assets, null values)
- CDN URL generation and fallback chain logic
- Search fuzzy matching accuracy with ROmanian special characters
- Asset path resolution with different input types
- Institution data schema migrations

**Suggested Testing Setup:**

To implement testing, consider:
1. Install Vitest: `npm install -D vitest @vitest/ui`
2. Add `vitest.config.ts`:
   ```typescript
   import { defineConfig } from 'vitest/config';
   export default defineConfig({
     test: {
       globals: true,
       environment: 'jsdom',
     },
   });
   ```
3. Create test files: `src/lib/*.test.ts`
4. Add `"test": "vitest"` and `"test:ui": "vitest --ui"` to package.json

## Manual QA Checklist

**Before Merging Institution Data:**
- [ ] JSON validates against v3.0 schema
- [ ] `id` starts with `ro-`
- [ ] `slug` is URL-safe (no spaces, special chars)
- [ ] `meta.keywords` is non-empty array
- [ ] `assets.main` exists with at least one variant
- [ ] Logo paths are CDN-ready or local
- [ ] Color hex values are valid (#000000 format)
- [ ] Typography fonts are accessible (Google Fonts or web-safe)

**Before Building for Production:**
- [ ] `npm run data:generate` completes without errors
- [ ] `npm run check` passes (TypeScript validation)
- [ ] Visual inspection: Logo previews load correctly
- [ ] Search works with Romanian characters (ț, ă, etc.)
- [ ] Category filters select/deselect correctly
- [ ] Copy buttons provide visual feedback
- [ ] Download ZIP button works and includes all assets

---

*Testing analysis: 2026-03-04*
