// Builds nginx.conf from vercel.json redirects so Dokploy serves the same rules as Vercel.
import { readFileSync, writeFileSync } from 'node:fs';

const { redirects } = JSON.parse(readFileSync('vercel.json', 'utf8'));
const exact = redirects
  .filter((r) => !r.source.includes(':'))
  .map((r) => `  location = ${r.source} { return ${r.permanent ? 301 : 302} ${r.destination}; }`)
  .join('\n');

writeFileSync('nginx.conf', `server {
  listen 80;
  root /usr/share/nginx/html;
  absolute_redirect off;
  gzip on;
  gzip_types text/css application/javascript application/json image/svg+xml text/plain application/xml;

${exact}

  # Vercel's /:id/ -> /:id patterns
  rewrite ^/(.+)/$ /$1 permanent;

  location /_assets/ {
    add_header Cache-Control "public, max-age=31536000, immutable";
  }

  location / {
    try_files $uri $uri/index.html $uri.html =404;
  }

  error_page 404 /404.html;
}
`);
