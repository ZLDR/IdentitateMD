# IdentitateMD

**Registru digital open-source pentru identitatea vizuală a instituțiilor publice din Republica Moldova.**

Logo-uri vectoriale (SVG), palete de culori oficiale și manuale de brand — o singură sursă de adevăr, accesibilă gratuit.

---

## Despre

IdentitateMD rezolvă fragmentarea identității vizuale a statului român. Funcționarii, designerii, jurnaliștii și developerii pot accesa instantaneu logo-uri corecte ale instituțiilor publice, în format vectorial.

## Quick Start

```bash
# Clonează
git clone https://github.com/identitate-md/registry.git
cd registry/website

# Instalează dependințele
npm install

# Pornește serverul local
npm run dev
```

Website-ul rulează pe `http://localhost:4321`.

## Structura Proiectului

```
IdentitateRO/
├── website/                     # Astro static site
│   ├── public/
│   │   ├── logos/               # Fișierele de logo (SVG, PNG)
│   │   │   ├── guvernul-romaniei/
│   │   │   │   ├── guvernul-romaniei.svg
│   │   │   │   ├── guvernul-romaniei-mono.svg
│   │   │   │   └── guvernul-romaniei-alb.svg
│   │   │   ├── pnrr/
│   │   │   └── ...
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/          # Componente Astro
│   │   │   ├── Header.astro
│   │   │   ├── Footer.astro
│   │   │   └── LogoCard.astro
│   │   ├── data/
│   │   │   ├── institutions/    # Fișierele JSON per instituție
│   │   │   │   ├── guvernul-romaniei.json
│   │   │   │   ├── primaria-cluj-napoca.json
│   │   │   │   └── ...
│   │   │   └── institutions-index.json  # Index centralizat (generat)
│   │   ├── layouts/
│   │   │   └── BaseLayout.astro
│   │   ├── lib/
│   │   │   └── labels.ts        # Label-uri și constante
│   │   ├── pages/
│   │   │   ├── index.astro      # Homepage cu search & grid
│   │   │   ├── despre.astro     # Pagina "Despre"
│   │   │   └── solicita.astro   # Formular solicitare logo
│   │   ├── styles/
│   │   │   └── global.css       # Design system Tailwind
│   │   └── types/
│   │       └── institution.ts   # TypeScript interfaces
│   ├── scripts/
│   │   └── generate-index.js    # Script generare index
│   ├── astro.config.mjs
│   ├── tailwind.config.mjs
│   ├── tsconfig.json
│   └── package.json
├── prd-draft.md                 # Product Requirements Document
└── website-inspiration.md       # Design specs
```

## Schema de Date

Fiecare instituție are un fișier JSON în `src/data/institutions/`:

```json
{
  "id": "primaria-timisoara",
  "name": "Primăria Municipiului Timișoara",
  "shortName": "Primăria Timișoara",
  "abbreviation": "PMT",
  "category": "primarie",
  "region": "Timiș",
  "description": "Administrația locală a municipiului Timișoara.",
  "colors": [
    { "name": "Primary Red", "hex": "#E30613", "pantone": "485 C" },
    { "name": "Silver", "hex": "#A7A9AC" }
  ],
  "assets": [
    {
      "variant": "principal",
      "format": "svg",
      "path": "/logos/primaria-timisoara/primaria-timisoara.svg"
    },
    {
      "variant": "monocrom-alb",
      "format": "svg",
      "path": "/logos/primaria-timisoara/primaria-timisoara-alb.svg"
    }
  ],
  "resources": {
    "website": "https://www.pfrcluj.ro",
    "brandManual": "https://...",
    "fontPrimary": "Roboto"
  },
  "updatedAt": "2026-02-08",
  "quality": "community"
}
```

### Categorii disponibile

| Categorie            | Descriere                                      |
| -------------------- | ---------------------------------------------- |
| `guvern`             | Guvernul României, Administrația Prezidențială |
| `minister`           | Ministere                                      |
| `agentie`            | Agenții guvernamentale (ANAF, ANM, etc.)       |
| `autoritate`         | Autorități independente                        |
| `primarie`           | Primării municipale și orășenești              |
| `consiliu-judetean`  | Consilii Județene                              |
| `prefectura`         | Prefecturi                                     |
| `proiect-ue`         | Proiecte UE (PNRR, POCU, etc.)                 |
| `institutie-cultura` | Instituții de cultură                          |

### Variante de logo

| Variantă       | Descriere                     |
| -------------- | ----------------------------- |
| `principal`    | Logo-ul complet, oficial      |
| `vertical`     | Layout stivuit vertical       |
| `horizontal`   | Layout orizontal              |
| `simbol`       | Doar stema/simbolul           |
| `monocrom`     | Varianta monocromă (negru)    |
| `monocrom-alb` | Varianta albă (fundal închis) |
| `inversata`    | Varianta inversată            |

## CDN Usage

Logo-urile se accesează direct ca fișiere statice:

```html
<!-- SVG direct -->
<img
  src="https://identitate.eu/logos/guvernul-romaniei/guvernul-romaniei.svg"
  alt="Guvernul României"
  width="200"
/>

<!-- PNG -->
<img src="https://identitate.eu/logos/pnrr/pnrr.png" alt="PNRR" width="400" />
```

## Cum Contribui

### Adaugă o instituție nouă

1. Creează `src/data/institutions/{slug}.json` cu schema de mai sus
2. Adaugă fișierele SVG în `public/logos/{slug}/`
3. Rulează `npm run data:generate` pentru a regenera indexul
4. Verifică local cu `npm run dev`
5. Trimite un Pull Request

### Cerințe SVG

- Fișierele SVG trebuie să fie **curate** (fără metadate Adobe/Figma)
- Viewport-ul trebuie definit corect (`viewBox`)
- Preferă **forme native** (nu texte convertite la paths dacă nu e necesar)
- Numele fișierelor: `{slug}.svg`, `{slug}-mono.svg`, `{slug}-alb.svg`

## Stack Tehnic

- **[Astro](https://astro.build)** — Static site generator (nu VitePress, nu Next.js)
- **[Tailwind CSS](https://tailwindcss.com)** — Sistem de design
- **TypeScript** — Tipuri strict definite pentru schema de date
- **Vercel** — Hosting & CDN global
- **GitHub** — Baza de date publică (fișiere JSON + SVG)

## Diferențe față de LogoHub

Proiectul este _inspirat conceptual_ de [LogoHub](https://github.com/saeedreza/logohub), dar complet diferit:

| Aspect             | LogoHub                       | IdentitateRO                                      |
| ------------------ | ----------------------------- | ------------------------------------------------- |
| Target             | Companii tech                 | Instituții publice RO                             |
| Framework          | VitePress (Vue)               | Astro                                             |
| API                | Express.js server             | Static files (no server)                          |
| Schema             | Simplă (name, colors)         | Complexă (Pantone, brand manual, categorii admin) |
| Categorii          | Tech categories               | Ierarhie administrativă RO                        |
| Pachete npm        | @logohub/core, @logohub/react | N/A (doar CDN)                                    |
| Limbă              | Engleză                       | Română                                            |
| Conversie dinamică | SVG→PNG/WebP via Sharp        | Pre-generate doar                                 |
| Licență            | MIT                           | MIT                                               |

## Licență

MIT — vezi [LICENSE](LICENSE) pentru detalii.

## Avertisment Legal

Acest proiect **nu este afiliat oficial** niciunei instituții publice din România. Logo-urile sunt proprietatea instituțiilor respective. Informațiile sunt de interes public și scopul proiectului este pur civic — facilitarea accesului la materiale vizuale oficiale în formate corecte.
