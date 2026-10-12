import type { APIRoute, GetStaticPaths } from "astro";
import institutionsIndex from "../../../data/institutions-index.json";
import { buildCatalogPathMap } from "../../../lib/catalog-paths.js";
import type { Institution } from "../../../types/institution";

const institutions = institutionsIndex.institutions as unknown as Institution[];
const catalogPaths = buildCatalogPathMap(institutions);

export const getStaticPaths: GetStaticPaths = () =>
  institutions.map((institution) => ({ params: { id: institution.id } }));

export const GET: APIRoute = ({ params }) => {
  const institution = institutions.find((entry) => entry.id === params.id);
  if (!institution) return new Response("Not found", { status: 404 });

  const catalogSlug = catalogPaths[institution.slug] ?? institution.slug;
  return new Response(
    JSON.stringify(
      {
        ...institution,
        catalogUrl: `https://identitate.md/catalog/${catalogSlug}`,
        source: "https://identitate.md/api/institutions.json",
        schemaVersion: institutionsIndex.schemaVersion,
        catalogGeneratedAt: institutionsIndex.generatedAt,
      },
      null,
      2,
    ),
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
};
