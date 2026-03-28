# Contribuții — IdentitateMD

Mulțumim că vrei să contribui! Iată cum poți adăuga o instituție nouă.

## Adaugă o instituție în 3 pași

**1. Creează fișierul de date**

```bash
website/src/data/institutions/{id}.json
```

Exemplu minim:
```json
{
  "id": "md-exemplu",
  "slug": "md-exemplu",
  "name": "Numele Instituției",
  "shortname": "NI",
  "category": "minister",
  "meta": {
    "version": "1.0",
    "last_updated": "2026-01-01",
    "keywords": ["moldova", "exemplu"],
    "quality": "draft"
  },
  "location": { "country_code": "MD", "city": "Chișinău" },
  "description": "Descriere scurtă.",
  "assets": {
    "main": { "type": "horizontal", "color": "/logos/md-exemplu/horizontal-color.svg" },
    "horizontal": { "color": "/logos/md-exemplu/horizontal-color.svg" }
  },
  "resources": { "website": "https://exemplu.gov.md" }
}
```

Categorii acceptate: `guvern`, `minister`, `parlament`, `directie`, `agentie`, `primarie`, `institutie-cultura`, `servicii`, `consilii`, `universitate`, `altele`

**2. Adaugă logo-urile SVG**

```
packages/logos/logos/{id}/        ← sursă (NPM package)
website/public/logos/{id}/        ← copie pentru website
```

Convenții de denumire: `horizontal-color.svg`, `horizontal-white.svg`, `vertical-color.svg`, `symbol.svg` etc.

**3. Regenerează indexul și deschide PR**

```bash
cd website
npm run data:generate
```

Verifică că logo-urile se afișează local (`npm run dev`), apoi deschide un Pull Request.

---

Pentru detalii suplimentare: [website/CONTRIBUTING.md](website/CONTRIBUTING.md)
