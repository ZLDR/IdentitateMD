import type { Institution } from "../../../packages/schema/institution.js";

export type * from "../../../packages/schema/institution.js";

/** Check whether an object has the minimum shape of a catalog institution. */
export function isInstitution(obj: unknown): obj is Institution {
  if (!obj || typeof obj !== "object") return false;

  const institution = obj as Partial<Institution>;
  return (
    typeof institution.id === "string" &&
    /^[a-z]{2}-/.test(institution.id) &&
    typeof institution.slug === "string" &&
    typeof institution.name === "string" &&
    typeof institution.category === "string" &&
    !!institution.meta &&
    typeof institution.meta.version === "string" &&
    typeof institution.meta.last_updated === "string" &&
    Array.isArray(institution.meta.keywords) &&
    !!institution.assets?.main &&
    typeof institution.assets.main.type === "string"
  );
}

/** Check whether data has the current catalog schema markers. */
export function hasCurrentSchema(obj: unknown): boolean {
  if (!obj || typeof obj !== "object") return false;

  const institution = obj as Partial<Institution>;
  return (
    typeof institution.id === "string" &&
    /^[a-z]{2}-/.test(institution.id) &&
    typeof institution.slug === "string" &&
    !!institution.meta &&
    Array.isArray(institution.meta.keywords) &&
    !!institution.assets?.main
  );
}
