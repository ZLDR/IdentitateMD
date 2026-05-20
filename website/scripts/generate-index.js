#!/usr/bin/env node

/**
 * IdentitateMD - Generator index instituții (v3.0)
 *
 * Citește toate fișierele JSON din src/data/institutions/
 * și generează un index central (institutions-index.json)
 * cu statistici și rezumat pe categorii.
 *
 * Rulare: node scripts/generate-index.js
 */

import { readdir, readFile, writeFile } from "fs/promises";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { buildCatalogPathMap } from "../src/lib/catalog-paths.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const INSTITUTIONS_DIR = join(__dirname, "../src/data/institutions");
const OUTPUT_FILE = join(__dirname, "../src/data/institutions-index.json");

const CATEGORY_LABELS = {
  guvern: "Guvern",
  minister: "Ministere",
  directie: "Direcții",
  primarie: "Primării",
  "consiliu-judetean": "Consilii Județene",
  prefectura: "Prefecturi",
  agentie: "Agenții",
  autoritate: "Autorități",
  "proiect-ue": "Proiecte UE / PNRR",
  "institutie-cultura": "Cultură",
  altele: "Altele",
  universitate: "Universități",
};

const CATEGORY_ORDER = [
  "guvern",
  "minister",
  "directie",
  "agentie",
  "autoritate",
  "primarie",
  "consiliu-judetean",
  "prefectura",
  "proiect-ue",
  "institutie-cultura",
  "altele",
  "universitate",
];

async function generateIndex() {
  console.log("📊 Generare index instituții (v3.0)...\n");

  const files = await readdir(INSTITUTIONS_DIR);
  const jsonFiles = files.filter((f) => f.endsWith(".json"));

  const institutions = [];
  const categoryStats = {};
  let withManual = 0;
  let withSvg = 0;

  for (const file of jsonFiles) {
    try {
      const content = await readFile(join(INSTITUTIONS_DIR, file), "utf-8");
      const data = JSON.parse(content);

      // Validare structură minimă v3
      if (!data.id || !data.slug || !data.name || !data.category) {
        console.error(
          `  ⚠️  ${file}: structură invalidă (lipsește id, slug, name sau category)`,
        );
        continue;
      }

      // Validate v3 schema markers
      const hasCountryPrefix = /^[a-z]{2}-/.test(data.id);
      if (!hasCountryPrefix || !data.meta?.keywords || !data.assets?.main) {
        console.error(
          `  ⚠️  ${file}: nu respectă schema v3.0 (lipsește country prefix, keywords sau assets.main)`,
        );
        continue;
      }

      institutions.push(data);

      // Statistici
      const cat = data.category;
      categoryStats[cat] = (categoryStats[cat] || 0) + 1;

      if (data.resources?.branding_manual) withManual++;

      // Verifică dacă are cel puțin un SVG (v3: verifică assets.main și layouturi)
      const { main, horizontal, vertical, symbol } = data.assets;
      const groups = [main, horizontal, vertical, symbol].filter(Boolean);
      const hasSvg = groups.some(
        (group) =>
          group &&
          (group.color ||
            group.dark_mode ||
            group.white ||
            group.black ||
            group.monochrome),
      );
      if (hasSvg) withSvg++;

      console.log(`  ✅ ${data.name} (${cat})`);
    } catch (err) {
      console.error(`  ❌ Eroare la ${file}:`, err.message);
    }
  }

  // Sortare alfabetică după numele instituției
  institutions.sort((a, b) => a.name.localeCompare(b.name, "ro"));

  // Generare rezumat categorii (doar cele active, sortate)
  const categories = CATEGORY_ORDER.filter((cat) => categoryStats[cat]).map(
    (cat) => ({
      id: cat,
      label: CATEGORY_LABELS[cat] || cat,
      count: categoryStats[cat],
    }),
  );

  const index = {
    schemaVersion: "3.0.0",
    generatedAt: new Date().toISOString(),
    total: institutions.length,
    stats: {
      byCategory: categoryStats,
      withManual,
      withSvg,
    },
    categories,
    institutions,
  };

  const indexJson = JSON.stringify(index, null, 2);
  await writeFile(OUTPUT_FILE, indexJson, "utf-8");

  // Also copy to packages/logos so the MCP server can bundle it
  const logosIndexPath = join(
    __dirname,
    "../../packages/logos/institutions-index.json",
  );
  await writeFile(logosIndexPath, indexJson, "utf-8");

  console.log(`\n📋 REZUMAT`);
  console.log(`   Schema: v3.0.0`);
  console.log(`   Total instituții: ${institutions.length}`);
  console.log(`   Categorii active: ${categories.length}`);
  console.log(`   Cu manual de brand: ${withManual}`);
  console.log(`   Cu SVG: ${withSvg}`);
  console.log(`\n💾 Index salvat: ${OUTPUT_FILE}`);
  console.log(`💾 Copiat la: ${logosIndexPath}`);

  // Generate vercel.json with HTTP 301 redirects for /institution/* → /catalog/*
  const catalogPathBySlug = buildCatalogPathMap(institutions);
  const redirects = institutions.flatMap((inst) => {
    const dest = `/catalog/${catalogPathBySlug[inst.slug] || inst.slug}`;
    return [
      { source: `/institution/${inst.slug}`, destination: dest, permanent: true },
      { source: `/institution/${inst.slug}/`, destination: dest, permanent: true },
    ];
  });
  const vercelConfig = { redirects };
  const vercelConfigPath = join(__dirname, "../vercel.json");
  writeFileSync(vercelConfigPath, JSON.stringify(vercelConfig, null, 2) + "\n", "utf-8");
  console.log(`🔀 vercel.json actualizat cu ${redirects.length / 2} redirecționări`);

  // Auto-update institution count badge in README.md
  const readmePath = join(__dirname, "../../README.md");
  try {
    const readme = readFileSync(readmePath, "utf-8");
    const updated = readme.replace(
      /!\[Institutions\]\(https:\/\/img\.shields\.io\/badge\/instituții-\d+-blue\)/,
      `![Institutions](https://img.shields.io/badge/instituții-${institutions.length}-blue)`,
    );
    if (updated !== readme) {
      writeFileSync(readmePath, updated, "utf-8");
      console.log(
        `🏷️  README badge actualizat: ${institutions.length} instituții`,
      );
    }
  } catch {
    // README update is non-critical
  }
}

generateIndex().catch(console.error);
