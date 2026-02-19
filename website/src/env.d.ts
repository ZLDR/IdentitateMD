/// <reference types="astro/client" />

import type { Institution } from './types/institution';

/**
 * Global window interfaces for client-side data injection
 */
declare global {
  interface Window {
    /** Institution data injected from server (index.astro) */
    __IDENTITATE_DATA__: Institution[];
    /** Category labels injected from server */
    __CATEGORY_LABELS__: Record<string, string>;
  }
}

export {};
