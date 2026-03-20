# @identitate-md/logos

> Logo-uri oficiale ale instituțiilor publice din Republica Moldova — Official logos of public institutions from the Republic of Moldova

[![npm version](https://img.shields.io/npm/v/@identitate-md/logos.svg)](https://www.npmjs.com/package/@identitate-md/logos)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Instalare

```bash
npm install @identitate-md/logos
```

## Utilizare

### Via CDN (Recomandat)

Logo-urile sunt disponibile automat prin CDN-uri gratuite:

#### URL-uri directe

```html
<!-- Guvernul Republicii Moldova -->
<img src="https://identitate.md/logos/md-guvern/horizontal-color.svg" alt="Guvernul Republicii Moldova" />

<!-- Parlamentul Republicii Moldova -->
<img src="https://identitate.md/logos/md-parlament/horizontal-color.svg" alt="Parlamentul Republicii Moldova" />

<!-- Ministerul Justiției -->
<img src="https://identitate.md/logos/md-mj/horizontal-color.svg" alt="Ministerul Justiției" />
```

#### jsDelivr

```html
<!-- Versiune specifică (recomandată pentru producție) -->
<img
  src="https://cdn.jsdelivr.net/npm/@identitate-md/logos@1.4.1/logos/md-guvern/horizontal-color.svg"
  alt="Guvernul Republicii Moldova"
/>

<!-- Latest (se actualizează automat) -->
<img
  src="https://cdn.jsdelivr.net/npm/@identitate-md/logos/logos/md-guvern/horizontal-color.svg"
  alt="Guvernul Republicii Moldova"
/>
```

#### unpkg

```html
<img
  src="https://unpkg.com/@identitate-md/logos/logos/md-guvern/horizontal-color.svg"
  alt="Guvernul Republicii Moldova"
/>
```

### Via npm Package

```javascript
// React, Vue, etc.
import logoPath from "@identitate-md/logos/logos/md-guvern/horizontal-color.svg";

function MyComponent() {
  return <img src={logoPath} alt="Guvernul Republicii Moldova" />;
}
```

```javascript
// Node.js
import { readFileSync } from "fs";
import { join } from "path";

const logoPath = join(
  process.cwd(),
  "node_modules/@identitate-md/logos/logos/md-guvern/horizontal-color.svg",
);
const logoContent = readFileSync(logoPath, "utf8");
```

### Web Component

**Framework-agnostic** — funcționează cu React, Vue, Angular, vanilla HTML, etc.

**Setup**

```bash
npm install @identitate-md/logos
```

```javascript
// În index.js, main.js, App.js — o singură dată
import "@identitate-md/logos/loader";
```

Sau direct în HTML:

```html
<script src="https://cdn.jsdelivr.net/npm/@identitate-md/logos/identity-loader.js"></script>
```

**Utilizare**

```html
<identity-icon src="https://identitate.md/logos/md-guvern/horizontal-color.svg"></identity-icon>
```

**React**

```jsx
import "@identitate-md/logos/loader";

function InstitutionLogo({ id, layout = "horizontal", variant = "color" }) {
  return (
    <identity-icon
      src={`https://identitate.md/logos/${id}/${layout}-${variant}.svg`}
      className="w-16 h-16"
    />
  );
}

<InstitutionLogo id="md-guvern" />
```

**Vue**

```vue
<script setup>
import "@identitate-md/logos/loader";
const props = defineProps(["id"]);
</script>

<template>
  <identity-icon
    :src="`https://identitate.md/logos/${id}/horizontal-color.svg`"
    style="width: 64px; height: 64px;"
  />
</template>
```

**Stilizare CSS**

```css
identity-icon {
  width: 64px;
  height: 64px;
  color: #003087; /* SVG-urile cu fill:currentColor vor prelua culoarea */
  transition: color 0.3s;
}

identity-icon:hover {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
}
```

**Atribute**

- `src` **(obligatoriu)** — URL-ul SVG
- `size` _(opțional)_ — shortcut pentru width/height (ex: `size="64px"`)

### Metadata

```javascript
import metadata from "@identitate-md/logos/index.json";

console.log(metadata.institutions);
// [
//   {
//     "id": "md-guvern",
//     "name": "Guvernul Republicii Moldova",
//     "logos": { "horizontal": { "color": "/logos/md-guvern/horizontal-color.svg" } }
//   },
//   ...
// ]
```

## Structură

```
@identitate-md/logos/
├── logos/
│   ├── md-guvern/
│   │   ├── horizontal-color.svg
│   │   ├── horizontal-white.svg
│   │   ├── symbol-color.svg
│   │   └── symbol-white.svg
│   ├── md-parlament/
│   ├── md-mj/
│   ├── md-mec/
│   └── ... (28 instituții)
├── index.json
├── institutions-index.json
├── identity-loader.js
└── README.md
```

## Formate disponibile

**Variante:**
- `color` — versiunea color completă (recomandată)
- `white` — pentru fundal întunecat
- `black` — pentru fundal deschis
- `monochrome` — versiune monocromă
- `dark_mode` — optimizată pentru dark mode

**Layout-uri:**
- `horizontal` — logo complet orizontal
- `vertical` — logo complet vertical
- `symbol` — doar simbolul/iconița

**Convenție denumire fișiere:** `{layout}-{variant}.svg`

```
horizontal-color.svg
horizontal-white.svg
symbol-color.svg
symbol-white.svg
```

## Instituții disponibile

| ID | Instituție |
|----|-----------|
| `md-guvern` | Guvernul Republicii Moldova |
| `md-parlament` | Parlamentul Republicii Moldova |
| `md-mj` | Ministerul Justiției |
| `md-mec` | Ministerul Educației și Cercetării |
| `md-mf` | Ministerul Finanțelor |
| `md-ms` | Ministerul Sănătății |
| `md-mae` | Ministerul Afacerilor Externe |
| `md-maia` | Ministerul Agriculturii |
| `md-mmps` | Ministerul Muncii și Protecției Sociale |
| `md-mediu` | Ministerul Mediului |
| `md-mc` | Ministerul Culturii |
| `md-mded` | Ministerul Dezvoltării Economice |
| `md-midr` | Ministerul Infrastructurii |
| `md-mioc` | Ministerul de Interne |
| `md-ministerul-energiei` | Ministerul Energiei |
| `md-mnam` | Muzeul Național de Artă |
| `md-age` | Agenția de Guvernare Electronică |
| `md-ca` | Consiliul Audiovizualului |
| `md-dgcpc` | Direcția Generală pentru Copii |
| `md-stisc` | STISC |
| `md-primaria-chisinau` | Primăria Municipiului Chișinău |
| `md-stema` | Stema Republicii Moldova |
| `md-steag` | Steagul Republicii Moldova |
| `eu-flag` | Drapelul Uniunii Europene |
| `md-bnm` | Banca Națională a Moldovei |
| `md-mia` | MIA Plăți Instant |

Pentru lista completă și actualizată: [identitate.md](https://identitate.md)

## CDN URL Pattern

```
https://cdn.jsdelivr.net/npm/@identitate-md/logos@{version}/logos/{id}/{layout}-{variant}.svg
```

**Exemple:**

```
# Versiune specifică (recomandată pentru producție)
https://cdn.jsdelivr.net/npm/@identitate-md/logos@1.4.1/logos/md-guvern/horizontal-color.svg

# Latest
https://cdn.jsdelivr.net/npm/@identitate-md/logos/logos/md-guvern/horizontal-color.svg
```

## Best Practices

**Versiuni fixate în producție**

```html
<!-- Bine — versiune fixată -->
<img src="https://cdn.jsdelivr.net/npm/@identitate-md/logos@1.4.1/logos/md-guvern/horizontal-color.svg" />

<!-- Evită în producție — poate schimba -->
<img src="https://cdn.jsdelivr.net/npm/@identitate-md/logos/logos/md-guvern/horizontal-color.svg" />
```

**Lazy loading**

```html
<img
  src="https://cdn.jsdelivr.net/npm/@identitate-md/logos/logos/md-guvern/horizontal-color.svg"
  loading="lazy"
  alt="Guvernul Republicii Moldova"
/>
```

**Fallback**

```html
<img
  src="https://cdn.jsdelivr.net/npm/@identitate-md/logos/logos/md-guvern/horizontal-color.svg"
  onerror="this.src='https://unpkg.com/@identitate-md/logos/logos/md-guvern/horizontal-color.svg'"
  alt="Guvernul Republicii Moldova"
/>
```

**Accesibilitate**

```html
<img
  src="https://cdn.jsdelivr.net/npm/@identitate-md/logos/logos/md-guvern/horizontal-color.svg"
  alt="Logo Guvernul Republicii Moldova"
  role="img"
/>
```

## Licență

MIT License — toate logo-urile sunt proprietatea instituțiilor respective și sunt disponibile în scopuri informative conform ghidurilor de identitate vizuală ale fiecărei instituții.

## Contribuții

Parte din proiectul [IdentitateMD](https://github.com/identitate-md/identitate-md).

- **Website**: [identitate.md](https://identitate.md)
- **GitHub**: [github.com/identitate-md/identitate-md](https://github.com/identitate-md/identitate-md)
- **npm**: [@identitate-md/logos](https://www.npmjs.com/package/@identitate-md/logos)

---

Made with ❤️ for Moldova
