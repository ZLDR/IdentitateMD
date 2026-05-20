/**
 * Shared logo-path selection helpers that are safe in browser bundles.
 */

import type { Institution, LogoAssetGroup, AssetUrls } from '../types/institution';

function resolveAsset(asset: AssetUrls | undefined): string {
  if (!asset) return '';
  if (typeof asset === 'string') return asset;
  return asset.local || asset.cdn_primary || asset.cdn_fallback || '';
}

export function getFirstLogoPath(group: LogoAssetGroup | undefined): string {
  if (!group) return '';
  for (const asset of [group.color, group.dark_mode, group.black, group.white, group.monochrome]) {
    const path = resolveAsset(asset);
    if (path) return path;
  }
  return resolveAsset(group.png?.path);
}

export function getPreviewLogoPath(inst: Institution): string {
  return getFirstLogoPath(inst.assets?.main) || '';
}
