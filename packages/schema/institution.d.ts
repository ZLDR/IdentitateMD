/**
 * Shared TypeScript contract for the IdentitateMD institution catalog.
 *
 * This declaration is consumed by the website and MCP package so both expose
 * the same institution and asset shapes.
 */

export type InstitutionCategory =
  | "guvern"
  | "minister"
  | "directie"
  | "primarie"
  | "consiliu-judetean"
  | "prefectura"
  | "agentie"
  | "autoritate"
  | "proiect-ue"
  | "institutie-cultura"
  | "consilii"
  | "servicii"
  | "parlament"
  | "universitate"
  | "altele";

export type LogoColorVariant =
  | "color"
  | "dark_mode"
  | "white"
  | "black"
  | "monochrome";

export type LogoLayout = "horizontal" | "vertical" | "symbol";
export type ColorUsage = "primary" | "secondary" | "accent" | "neutral";
export type PreviewBackground =
  | "checkerboard"
  | "checkerboard-dark"
  | "dark"
  | "light"
  | `#${string}`;

export interface Location {
  country_code: string;
  county?: string;
  city?: string;
}

export interface Color {
  name: string;
  hex: string;
  rgb?: [number, number, number];
  cmyk?: [number, number, number, number];
  pantone?: string;
  usage?: ColorUsage;
}

export interface Typography {
  primary: { family: string; url?: string; weights?: number[] };
  secondary?: { family: string; url?: string; weights?: number[] };
}

export type AssetUrls =
  | string
  | { cdn_primary?: string; cdn_fallback?: string; local: string };

export interface LogoAssetGroup {
  type: LogoLayout;
  color?: AssetUrls;
  dark_mode?: AssetUrls;
  white?: AssetUrls;
  black?: AssetUrls;
  monochrome?: AssetUrls;
  alternatives?: Array<{
    label: string;
    path: AssetUrls;
    preview?: PreviewBackground;
  }>;
  variantPreviews?: Partial<Record<LogoColorVariant, PreviewBackground>>;
  png?: { path: AssetUrls; width: number; height: number };
}

export interface Assets {
  main: LogoAssetGroup;
  horizontal?: LogoAssetGroup;
  vertical?: LogoAssetGroup;
  symbol?: LogoAssetGroup;
  favicon?: string;
  [key: string]: LogoAssetGroup | string | undefined;
}

export interface Resources {
  website?: string;
  branding_manual?: string;
  contact?: { phone?: string; email?: string };
  social_media?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
  };
  wikidata_id?: string;
  wikipedia_url?: string;
}

export interface Meta {
  version: string;
  last_updated: string;
  keywords: string[];
  quality?: "verified" | "community" | "draft";
  seo_title?: string;
  seo_description?: string;
}

export interface Institution {
  id: string;
  slug: string;
  name: string;
  shortname?: string;
  category: InstitutionCategory;
  meta: Meta;
  location?: Location;
  description?: string;
  usage_notes?: string;
  colors?: Color[];
  typography?: Typography;
  assets: Assets;
  resources?: Resources;
}

export interface CategoryEntry {
  id: InstitutionCategory;
  label: string;
  count: number;
}

export interface InstitutionsIndex {
  schemaVersion: string;
  generatedAt: string;
  total: number;
  stats: {
    byCategory: Record<string, number>;
    withManual: number;
    withSvg: number;
  };
  categories: CategoryEntry[];
  institutions: Institution[];
}
