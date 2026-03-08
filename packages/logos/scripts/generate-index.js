#!/usr/bin/env node

/**
 * Generează index.json pentru pachetul @identitate-md/logos
 * Scanează structura: logos/{slug}/{layout}/{variant}.svg
 * Suportă și fișiere flat legacy: logos/{slug}/{layout}_{variant}.svg
 */

import {
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
  existsSync,
} from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LOGOS_DIR = join(__dirname, "../logos");
const OUTPUT_FILE = join(__dirname, "../index.json");
const WEBSITE_INSTITUTIONS_DIR = join(__dirname, "../../../website/src/data/institutions");

const VALID_LAYOUTS = ["horizontal", "vertical", "symbol"];

// Map variant aliases to canonical names
const VARIANT_ALIASES = {
  color: "color",
  white: "white",
  alb: "white",
  black: "black",
  negru: "black",
  mono: "monochrome",
  monochrome: "monochrome",
  dark: "dark_mode",
  dark_mode: "dark_mode",
  "alternative-color": "alternative-color",
  "alternative-white": "alternative-white",
  filled: "filled",
  "filled-white": "filled-white",
  "english-white": "english-white",
};

/**
 * Detectează varianta dintr-un nume de fișier
 * e.g. "color.svg" → "color", "symbol_black.svg" → "black", "Horizontal White.svg" → "white"
 */
function detectVariant(filename) {
  const name = filename.replace(/\.(svg|png)$/, "").toLowerCase();
  // Try exact match first (for subdirectory files like "color.svg")
  if (VARIANT_ALIASES[name]) return VARIANT_ALIASES[name];
  // Check for alternative variants (before generic suffix matching)
  if (name === "alternative-color" || name.endsWith("-alternative-color")) return "alternative-color";
  if (name === "alternative-white" || name.endsWith("-alternative-white")) return "alternative-white";
  // Handle alternative with space + color/white ("alternative color", "alternative white")
  if (name.includes("alternative")) {
    if (name.includes("white")) return "alternative-white";
    return "alternative-color";
  }
  if (name.endsWith("-alternative")) return "alternative-color";
  // Try suffix match (for legacy flat files like "symbol_black.svg" or "Horizontal White.svg")
  for (const [alias, canonical] of Object.entries(VARIANT_ALIASES)) {
    if (name.endsWith(`_${alias}`) || name.endsWith(`-${alias}`) || name.endsWith(` ${alias}`))
      return canonical;
  }
  // Default: treat as color variant
  return "color";
}

/**
 * Detectează layout-ul dintr-un nume de fișier legacy
 * e.g. "symbol_black.svg" → "symbol", "Horizontal White.svg" → "horizontal"
 */
function detectLayout(filename) {
  const name = filename.toLowerCase();
  if (
    name.startsWith("symbol") ||
    name.startsWith("simbol") ||
    name.startsWith("icon")
  )
    return "symbol";
  if (name.startsWith("vertical") || name.includes("vertical")) return "vertical";
  if (name.startsWith("horizontal") || name.includes("horizontal")) return "horizontal";
  return "horizontal";
}

function getCandidateScore(file, layout, variant, source) {
  const name = file.replace(/\.(svg|png)$/i, "").toLowerCase();
  let score = source === "layoutDir" ? 100 : 0;

  if (name === variant) score += 100;
  if (variant === "color" && name === layout) score += 95;

  if (
    name === `${layout}-${variant}` ||
    name === `${layout}_${variant}` ||
    name === `${layout} ${variant}`
  ) {
    score += 90;
  }

  if (
    name.endsWith(`-${variant}`) ||
    name.endsWith(`_${variant}`) ||
    name.endsWith(` ${variant}`)
  ) {
    score += 35;
  }

  if (name.includes(variant)) score += 10;
  // Only penalize "alternative" if it's NOT a recognized alternative variant
  if ((name.includes("alternative") || name.includes("alternativ")) && !variant.startsWith("alternative")) score -= 80;
  if (/(?:-|_| )\d+$/.test(name)) score -= 30;

  return score;
}

function generateIndex() {
  const institutions = [];
  const institutionNameMap = new Map();

  // Încarcă nume instituții din website/src/data/institutions/*.json
  if (existsSync(WEBSITE_INSTITUTIONS_DIR)) {
    const jsonFiles = readdirSync(WEBSITE_INSTITUTIONS_DIR)
      .filter((f) => f.endsWith(".json"))
      .sort((a, b) => a.localeCompare(b));

    for (const file of jsonFiles) {
      try {
        const fileBase = file.replace(/\.json$/i, "");
        const jsonPath = join(WEBSITE_INSTITUTIONS_DIR, file);
        const data = JSON.parse(readFileSync(jsonPath, "utf8"));
        const officialName = data?.name;
        if (!officialName) continue;

        institutionNameMap.set(fileBase, officialName);
        if (data.id) institutionNameMap.set(data.id, officialName);
        if (data.slug) institutionNameMap.set(data.slug, officialName);
      } catch (_err) {
        // Ignorăm fișierele invalide, păstrăm fallback-ul din slug
      }
    }
  }

  // Citește toate directoarele din logos/
  const slugs = readdirSync(LOGOS_DIR)
    .filter((item) => {
      const itemPath = join(LOGOS_DIR, item);
      return statSync(itemPath).isDirectory();
    })
    .sort((a, b) => a.localeCompare(b));

  for (const slug of slugs) {
    const institutionDir = join(LOGOS_DIR, slug);
    const entries = readdirSync(institutionDir).sort((a, b) => a.localeCompare(b));
    const logos = {};
    const selected = {};

    const setBestLogo = (layout, variant, file, outputPath, source) => {
      const score = getCandidateScore(file, layout, variant, source);
      const key = `${layout}:${variant}`;
      const current = selected[key];
      const shouldReplace =
        !current ||
        score > current.score ||
        (score === current.score && file.localeCompare(current.file) < 0);

      if (!shouldReplace) return;

      selected[key] = { score, file };
      if (!logos[layout]) logos[layout] = {};
      logos[layout][variant] = outputPath;
    };

    // 1. Scanează subdirectoare layout (horizontal/, vertical/, symbol/)
    for (const layout of VALID_LAYOUTS) {
      const layoutDir = join(institutionDir, layout);
      if (!existsSync(layoutDir) || !statSync(layoutDir).isDirectory())
        continue;

      const files = readdirSync(layoutDir)
        .filter((f) => f.endsWith(".svg") || f.endsWith(".png"))
        .sort((a, b) => a.localeCompare(b));
      if (files.length === 0) continue;
      for (const file of files) {
        const variant = detectVariant(file);
        setBestLogo(
          layout,
          variant,
          file,
          `/logos/${slug}/${layout}/${file}`,
          "layoutDir",
        );
      }
    }

    // 2. Scanează fișiere flat legacy (symbol_color.svg etc.) la rădăcina instituției
    const flatFiles = entries.filter(
      (f) =>
        (f.endsWith(".svg") || f.endsWith(".png")) &&
        !statSync(join(institutionDir, f)).isDirectory(),
    );
    for (const file of flatFiles) {
      const layout = detectLayout(file);
      const variant = detectVariant(file);
      setBestLogo(layout, variant, file, `/logos/${slug}/${file}`, "flat");
    }

    // Încarcă numele oficial din datele website; fallback la slug
    let name =
      institutionNameMap.get(slug) ||
      slug
      .replace(/^ro-/, "")
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const logoCount = Object.values(logos).reduce(
      (sum, layout) => sum + Object.keys(layout).length,
      0,
    );

    institutions.push({
      id: slug, // slug-ul deja conține prefixul "ro-" (e.g. "ro-anaf")
      slug,
      name,
      layouts: Object.keys(logos),
      logoCount,
      logos,
    });
  }

  // Statistici globale
  const totalLogos = institutions.reduce(
    (sum, inst) => sum + inst.logoCount,
    0,
  );

  const output = {
    version: "1.1.0",
    generated: new Date().toISOString(),
    count: institutions.length,
    totalLogos,
    institutions: institutions.sort((a, b) => a.slug.localeCompare(b.slug)),
  };

  writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), "utf8");

  // Raport detaliat
  console.log(`\n✅ Generated index.json`);
  console.log(
    `   ${institutions.length} institutions, ${totalLogos} logo files\n`,
  );
  for (const inst of output.institutions) {
    const layouts = inst.layouts.join(", ") || "none";
    console.log(
      `   ${inst.id.padEnd(25)} ${String(inst.logoCount).padStart(2)} logos  [${layouts}]`,
    );
  }
  console.log("");
}

generateIndex();
