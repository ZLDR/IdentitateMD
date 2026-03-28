#!/usr/bin/env node

/**
 * IdentitateMD — Validare JSON Schema (Ajv)
 *
 * Validates all institution JSON files against a strict Ajv schema.
 * Exits with process.exit(1) if any validation fails.
 *
 * Usage: node scripts/validate-institutions.js
 */

import { readdir, readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import Ajv from "ajv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const INSTITUTIONS_DIR = join(__dirname, "../src/data/institutions");

// ─── Schema ──────────────────────────────────────────────────────────────────

// Nullable helper — allows the value to be null (for optional fields that store explicit nulls)
function nullable(schema) {
  return { oneOf: [schema, { type: "null" }] };
}

const assetUrlsSchema = {
  oneOf: [
    { type: "string" },
    {
      type: "object",
      required: ["local"],
      properties: {
        cdn_primary: { type: "string" },
        cdn_fallback: { type: "string" },
        local: { type: "string" },
      },
      additionalProperties: false,
    },
  ],
};

// Asset URL that may be null (used in generated files)
const nullableAssetUrlsSchema = nullable(assetUrlsSchema);

const logoAssetGroupSchema = {
  type: "object",
  required: ["type"],
  properties: {
    type: { type: "string", enum: ["horizontal", "vertical", "symbol"] },
    color: nullableAssetUrlsSchema,
    dark_mode: nullableAssetUrlsSchema,
    white: nullableAssetUrlsSchema,
    black: nullableAssetUrlsSchema,
    monochrome: nullableAssetUrlsSchema,
    alternatives: nullable({
      type: "array",
      items: {
        type: "object",
        required: ["label", "path"],
        properties: {
          label: { type: "string" },
          path: assetUrlsSchema,
          preview: { type: "string", enum: ["checkerboard", "dark"] },
        },
      },
    }),
    png: nullable({
      type: "object",
      required: ["path", "width", "height"],
      properties: {
        path: assetUrlsSchema,
        width: { type: "number" },
        height: { type: "number" },
      },
    }),
  },
};

const institutionSchema = {
  type: "object",
  required: [
    "id",
    "slug",
    "name",
    "category",
    "meta",
    "location",
    "description",
    "assets",
  ],
  additionalProperties: true,
  properties: {
    id: {
      type: "string",
      pattern: "^[a-z]{2}-[a-z0-9-]+$",
    },
    slug: { type: "string" },
    name: { type: "string" },
    shortname: { type: "string" },
    category: {
      type: "string",
      enum: [
        "guvern",
        "minister",
        "directie",
        "primarie",
        "consiliu-judetean",
        "prefectura",
        "agentie",
        "autoritate",
        "proiect-ue",
        "institutie-cultura",
        "parlament",
        "servicii",
        "consilii",
        "altele",
        "universitate",
      ],
    },
    meta: {
      type: "object",
      required: ["version", "last_updated", "keywords"],
      properties: {
        version: { type: "string" },
        last_updated: { type: "string" },
        keywords: {
          type: "array",
          items: { type: "string" },
          minItems: 1,
        },
        quality: {
          type: "string",
          enum: ["draft", "verified", "community"],
        },
        seo_title: { type: "string" },
        seo_description: { type: "string" },
      },
    },
    location: {
      type: "object",
      required: ["country_code"],
      properties: {
        country_code: { type: "string" },
        county: nullable({ type: "string" }),
        city: nullable({ type: "string" }),
      },
    },
    description: nullable({ type: "string" }),
    colors: nullable({
      type: "array",
      items: {
        type: "object",
        required: ["hex"],
        properties: {
          name: { type: "string" },
          hex: { type: "string" },
          rgb: nullable({
            type: "array",
            items: { type: "number" },
            minItems: 3,
            maxItems: 3,
          }),
          cmyk: nullable({
            type: "array",
            items: { type: "number" },
            minItems: 4,
            maxItems: 4,
          }),
          pantone: nullable({ type: "string" }),
          usage: {
            type: "string",
            enum: ["primary", "secondary", "accent", "neutral"],
          },
        },
      },
    }),
    assets: {
      type: "object",
      required: ["main"],
      properties: {
        main: logoAssetGroupSchema,
        horizontal: nullable(logoAssetGroupSchema),
        vertical: nullable(logoAssetGroupSchema),
        symbol: nullable(logoAssetGroupSchema),
        favicon: nullable({ type: "string" }),
      },
    },
    resources: nullable({
      type: "object",
      properties: {
        website: nullable({ type: "string" }),
        branding_manual: nullable({ type: "string" }),
        contact: nullable({
          type: "object",
          properties: {
            phone: { type: "string" },
            email: { type: "string" },
          },
        }),
        social_media: nullable({
          type: "object",
          properties: {
            facebook: { type: "string" },
            twitter: { type: "string" },
            linkedin: { type: "string" },
            instagram: { type: "string" },
            youtube: { type: "string" },
          },
        }),
        wikidata_id: { type: "string" },
        wikipedia_url: { type: "string" },
      },
    }),
  },
};

// ─── Main ─────────────────────────────────────────────────────────────────────

async function validateInstitutions() {
  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(institutionSchema);

  const files = await readdir(INSTITUTIONS_DIR);
  const jsonFiles = files.filter((f) => f.endsWith(".json"));

  console.log(`Validating ${jsonFiles.length} institution files...\n`);

  let passCount = 0;
  let failCount = 0;

  for (const file of jsonFiles) {
    const filePath = join(INSTITUTIONS_DIR, file);
    let data;

    try {
      const content = await readFile(filePath, "utf-8");
      data = JSON.parse(content);
    } catch (err) {
      console.error(`FAIL  ${file}`);
      console.error(`      Parse error: ${err.message}\n`);
      failCount++;
      continue;
    }

    const valid = validate(data);

    if (valid) {
      console.log(`PASS  ${file}`);
      passCount++;
    } else {
      console.error(`FAIL  ${file}`);
      for (const error of validate.errors) {
        const path = error.instancePath || "(root)";
        console.error(`      ${path}: ${error.message}`);
        if (error.params?.allowedValues) {
          console.error(
            `        Allowed: ${error.params.allowedValues.join(", ")}`,
          );
        }
      }
      console.error();
      failCount++;
    }
  }

  console.log(`\n${"─".repeat(40)}`);
  console.log(`Results: ${passCount} passed, ${failCount} failed`);

  if (failCount > 0) {
    console.error(
      `\nValidation failed. Fix the errors above before continuing.`,
    );
    process.exit(1);
  } else {
    console.log(`\nAll institution files are valid.`);
  }
}

validateInstitutions().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
