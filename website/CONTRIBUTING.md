# Ghid de Contribuire — IdentitateMD

Mulțumim că vrei să contribui! Acest document descrie procesul.

## Tipuri de contribuții

### 1. Adaugă un logo nou

**Cel mai valoros tip de contribuție.** Avem nevoie de logo-uri vectoriale curate ale instituțiilor publice.

#### Pași:

1. **Fork** repository-ul
2. Creează un folder nou în pachetul npm: `packages/logos/logos/md-{slug}/`
3. Adaugă fișierele SVG pe layout-uri:
   - `horizontal/color.svg` — logo-ul principal orizontal
   - `symbol/color.svg` — simbol / icon
   - (Opțional) `vertical/color.svg`, variante `white.svg`, `black.svg`
4. Creează fișierul de metadate: `packages/logos/logos/md-{slug}/metadata.md`
5. Creează datele pentru website: `website/src/data/institutions/md-{slug}.json`
6. Regenerează indexul: `cd packages/logos && node scripts/generate-index.js`
7. Regenerează indexul website: `cd website && npm run data:generate`
8. Verifică local cu `cd website && npm run dev`
9. Trimite un **Pull Request**

#### Structura fișierelor per instituție:

```
packages/logos/logos/md-{slug}/
  metadata.md
  horizontal/
    color.svg
    white.svg
    black.svg
  vertical/           (opțional)
    color.svg
  symbol/
    color.svg
    white.svg
```

#### Convenția de numire (slug):

```
md-primaria-timisoara     ✅ Corect (prefix md-)
primaria-timisoara        ❌ Lipsește prefixul md-
Primaria_Timisoara        ❌ Greșit
md-primăria-timișoara     ❌ Fără diacritice în slug
```

- Prefix `md-` obligatoriu
- Litere mici
- Fără diacritice
- Cuvinte separate prin `-`

#### Cerințe SVG:

- [ ] Fișierul are `viewBox` corect definit
- [ ] Nu conține metadate Adobe Illustrator / Figma
- [ ] Nu conține fonturi embed-uite (convertite la path-uri dacă e necesar)
- [ ] Culorile sunt consistente cu cele din manualul de identitate
- [ ] Fișierul nu depășește 200KB

### 2. Corectează date existente

- Culori greșite? Deschide un Issue sau un PR.
- Link expirat la brand manual? La fel.

### 3. Contribuie la cod

- Bugfix-uri sunt întotdeauna binevenite
- Feature-uri noi — deschide mai întâi un Issue pentru discuție

## Schema JSON (v3.0)

Consultă `src/types/institution.ts` pentru definiția completă.

Câmpuri obligatorii:

- `id` — format `md-{slug}` (ex: `md-anaf`)
- `slug` — slug URL (ex: `anaf`)
- `name` — numele complet oficial
- `category` — una din: `guvern`, `minister`, `agentie`, `autoritate`, `primarie`, `consiliu-judetean`, `prefectura`, `proiect-ue`, `institutie-cultura`, `altele`
- `meta.version` — versiunea datelor
- `meta.last_updated` — data ultimei modificări (ISO 8601)
- `meta.keywords` — array de cuvinte cheie pentru căutare
- `assets.main` — obiect cu logo-ul principal (trebuie să conțină cel puțin `type` și `color`)

Câmpuri opționale:

- `shortname` — nume scurt / acronim
- `description` — scurtă descriere
- `location` — `{ country_code, county?, city? }`
- `colors` — array de culori cu `name`, `hex`, opțional `rgb`, `cmyk`, `pantone`, `usage`
- `typography` — `{ primary: { family, url?, weights? }, secondary?: {...} }`
- `resources` — `{ website?, branding_manual?, social_media? }`

#### Exemplu minimal JSON:

```json
{
  "id": "md-exemplu",
  "slug": "exemplu",
  "name": "Instituția Exemplu",
  "category": "agentie",
  "meta": {
    "version": "1.0",
    "last_updated": "2026-01-15",
    "keywords": ["exemplu", "agenție"]
  },
  "assets": {
    "main": {
      "type": "horizontal",
      "color": "/logos/md-exemplu/horizontal/color.svg"
    }
  }
}
```

## Development

```bash
# Website
cd website
npm install
npm run dev          # Server local pe :4321
npm run build        # Build static
npm run preview      # Preview build
npm run data:generate  # Regenerează institutions-index.json

# NPM Package
cd packages/logos
node scripts/generate-index.js   # Regenerează index.json
```

## Code Style

- TypeScript strict
- Astro components (nu React/Vue)
- Tailwind CSS (nu CSS custom dacă nu e necesar)
- Commit messages în română sau engleză

## Mulțumiri

Contribuitorii sunt credit-ați automat prin GitHub.
