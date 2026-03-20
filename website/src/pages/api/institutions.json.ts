import type { APIRoute } from 'astro';
import institutionsIndex from '../../data/institutions-index.json';

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(institutionsIndex, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
