import { createRequire } from "module";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import type { Institution, InstitutionsIndex, CategoryEntry } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const req = createRequire(import.meta.url);

let _institutions: Map<string, Institution> | null = null;
let _categories: CategoryEntry[] | null = null;
let _index: InstitutionsIndex | null = null;

function loadIndexSync(): InstitutionsIndex {
  // Prefer bundled data shipped with @identitate-md/logos
  try {
    const data = req("@identitate-md/logos/institutions-index") as InstitutionsIndex;
    if (data && Array.isArray(data.institutions)) {
      return data;
    }
  } catch {
    // fall through to local dev path
  }

  // Local dev / monorepo: load directly from website data
  const fallback = resolve(
    __dirname,
    "../../../website/src/data/institutions-index.json"
  );
  return JSON.parse(readFileSync(fallback, "utf-8")) as InstitutionsIndex;
}

export function init(): void {
  const data = loadIndexSync();
  _index = data;
  _institutions = new Map(data.institutions.map((i) => [i.id, i]));
  _categories = data.categories;
}

export function getAll(): Institution[] {
  if (!_institutions) throw new Error("Data not initialized. Call init() first.");
  return Array.from(_institutions.values());
}

export function getById(id: string): Institution | undefined {
  if (!_institutions) throw new Error("Data not initialized. Call init() first.");
  return _institutions.get(id);
}

export function getCategories(): CategoryEntry[] {
  if (!_categories) throw new Error("Data not initialized. Call init() first.");
  return _categories;
}

export function getIndex(): InstitutionsIndex {
  if (!_index) throw new Error("Data not initialized. Call init() first.");
  return _index;
}

/** Resolve the local filesystem path for a logo file.
 *  logoPath looks like "/logos/md-age/symbol/color.svg"
 */
export function resolveLogoPath(logoPath: string): string {
  let logosRoot: string;

  try {
    const logosPackagePath = req.resolve("@identitate-md/logos/package.json");
    logosRoot = dirname(logosPackagePath);
  } catch {
    // Local dev: use monorepo packages/logos
    logosRoot = resolve(__dirname, "../../../packages/logos");
  }

  // Strip leading "/logos/" prefix → "md-age/symbol/color.svg"
  const relative = logoPath.replace(/^\/logos\//, "");
  return resolve(logosRoot, "logos", relative);
}
