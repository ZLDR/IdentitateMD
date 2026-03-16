#!/usr/bin/env node

/**
 * IdentitateMD — SVG Optimization (SVGO)
 *
 * Scans packages/logos/logos/ and website/public/logos/ for SVG files,
 * deduplicates by content hash, and optimizes each with SVGO.
 *
 * Usage: node scripts/optimize-svgs.js
 */

import { readdir, readFile, writeFile, stat } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createHash } from "crypto";
import { optimize } from "svgo";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCAN_DIRS = [
  join(__dirname, "../../packages/logos/logos"),
  join(__dirname, "../public/logos"),
];

// ─── SVGO Config ──────────────────────────────────────────────────────────────

const svgoConfig = {
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          // Keep IDs that may be referenced (e.g. gradients, clip paths)
          cleanupIds: false,
          // Do not remove colors or modify fills/strokes
          removeUnknownsAndDefaults: false,
          convertColors: false,
          // Keep shape geometry stable
          convertPathData: {
            floatPrecision: 3,
          },
        },
      },
    },
    // Remove editor metadata (Adobe, Figma, Inkscape)
    { name: "removeEditorsNSData" },
    // Clean up numeric values
    { name: "cleanupNumericValues", params: { floatPrecision: 3 } },
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function md5(content) {
  return createHash("md5").update(content).digest("hex");
}

async function collectSvgFiles(dir) {
  const results = [];

  async function walk(currentDir) {
    let entries;
    try {
      entries = await readdir(currentDir, { withFileTypes: true });
    } catch {
      // Directory might not exist — skip silently
      return;
    }

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".svg")) {
        results.push(fullPath);
      }
    }
  }

  await walk(dir);
  return results;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function optimizeSvgs() {
  console.log("Scanning for SVG files...\n");

  // Collect all SVG files from all scan directories
  const allFiles = [];
  for (const dir of SCAN_DIRS) {
    const files = await collectSvgFiles(dir);
    allFiles.push(...files);
  }

  if (allFiles.length === 0) {
    console.log("No SVG files found.");
    return;
  }

  // Deduplicate by content hash — if two paths have identical content,
  // only process one of them (the first encountered)
  const seenHashes = new Map(); // hash -> first file path
  const uniqueFiles = [];

  for (const filePath of allFiles) {
    let content;
    try {
      content = await readFile(filePath, "utf-8");
    } catch (err) {
      console.warn(`SKIP  ${filePath}\n      Could not read: ${err.message}`);
      continue;
    }

    const hash = md5(content);
    if (seenHashes.has(hash)) {
      // Duplicate content — skip but still track for reporting
      continue;
    }

    seenHashes.set(hash, filePath);
    uniqueFiles.push({ filePath, content });
  }

  console.log(
    `Found ${allFiles.length} SVG files, ${uniqueFiles.length} unique (${allFiles.length - uniqueFiles.length} duplicates skipped)\n`
  );

  let processed = 0;
  let skipped = 0;
  let totalBefore = 0;
  let totalAfter = 0;

  for (const { filePath, content } of uniqueFiles) {
    const sizeBefore = Buffer.byteLength(content, "utf-8");
    totalBefore += sizeBefore;

    let result;
    try {
      result = optimize(content, {
        path: filePath,
        ...svgoConfig,
      });
    } catch (err) {
      console.warn(`SKIP  ${filePath}\n      SVGO error: ${err.message}`);
      totalAfter += sizeBefore;
      skipped++;
      continue;
    }

    const optimized = result.data;
    const sizeAfter = Buffer.byteLength(optimized, "utf-8");
    totalAfter += sizeAfter;

    if (sizeAfter < sizeBefore) {
      try {
        await writeFile(filePath, optimized, "utf-8");
        const savedPct = (((sizeBefore - sizeAfter) / sizeBefore) * 100).toFixed(1);
        console.log(
          `OPT   ${filePath.replace(join(__dirname, "../.."), "")}\n      ${sizeBefore} → ${sizeAfter} bytes (${savedPct}% saved)`
        );
        processed++;
      } catch (err) {
        console.warn(`SKIP  ${filePath}\n      Write error: ${err.message}`);
        skipped++;
      }
    } else {
      // Already optimal — no change needed
      console.log(`OK    ${filePath.replace(join(__dirname, "../.."), "")} (already optimal)`);
      processed++;
    }
  }

  const totalSaved = totalBefore - totalAfter;
  const totalSavedPct =
    totalBefore > 0
      ? (((totalBefore - totalAfter) / totalBefore) * 100).toFixed(1)
      : "0.0";

  console.log(`\n${"─".repeat(50)}`);
  console.log(`Files processed : ${processed}`);
  console.log(`Files skipped   : ${skipped}`);
  console.log(`Total before    : ${(totalBefore / 1024).toFixed(1)} KB`);
  console.log(`Total after     : ${(totalAfter / 1024).toFixed(1)} KB`);
  console.log(`Total saved     : ${(totalSaved / 1024).toFixed(1)} KB (${totalSavedPct}%)`);
}

optimizeSvgs().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
