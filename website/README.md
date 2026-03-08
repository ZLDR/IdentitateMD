# IdentitateMD

**Registru digital open-source pentru identitatea vizuală a instituțiilor publice din Republica Moldova.**

Logo-uri vectoriale (SVG), palete de culori oficiale și manuale de brand — o singură sursă de adevăr, accesibilă gratuit.

---

## Despre

IdentitateMD rezolvă fragmentarea identității vizuale a Republicii Moldova. Funcționarii, designerii, jurnaliștii și developerii pot accesa instantaneu logo-uri corecte ale instituțiilor publice, în format vectorial.

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
IdentitateMD/
├── website/                     # Astro static site
│   ├── public/
│   │   ├── logos/               # Fișierele de logo (SVG, PNG)
│   │   │   ├── md-guvern/
│   │   │   │   ├── horizontal/
│   │   │   │   └── symbol/
│   │   │   ├── md-mae/
│   │   │   │   ├── horizontal/
│   │   │   │   ├── vertical/
│   │   │   │   └── symbol/
│   │   │   ├── md-maia/
│   │   │   ├── md-primaria-chisinau/
│   │   │   └── ...
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/          # Componente Astro
│   │   │   ├── Header.astro
│   │   │   ├── Footer.astro
│   │   │   └── LogoCard.astro
│   │   ├── data/
│   │   │   ├── institutions/    # Fișierele JSON per instituție
│   │   │   │   ├── md-guvern.json
│   │   │   │   ├── md-mae.json
│   │   │   │   ├── md-maia.json
│   │   │   │   ├── md-mc.json
│   │   │   │   ├── md-mec.json
│   │   │   │   ├── md-mediu.json
│   │   │   │   ├── md-mf.json
│   │   │   │   ├── md-midr.json
│   │   │   │   ├── md-mj.json
│   │   │   │   ├── md-parlament.json
│   │   │   │   ├── md-primaria-chisinau.json
│   │   │   │   ├── md-stisc.json
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
  "id": "md-mc",
  "slug": "md-mc",
  "name": "Ministerul Culturii al Republicii Moldova",
  "shortname": "Ministerul Culturii",
  "category": "minister",
  "meta": {
    "version": "1.0",
    "last_updated": "2026-03-06",
    "keywords": ["moldova", "minister", "cultură", "arte", "patrimoniu"],
    "quality": "verified"
  },
  "location": {
    "country_code": "MD",
    "city": "Chișinău"
  },
  "description": "Ministerul Culturii are în subordine instituții publice concertistice și teatrale, biblioteci, muzee și alte instituții publice.",
  "colors": [
    { "name": "Albastru Oficial", "hex": "#0E4C90", "rgb": [14, 76, 144], "usage": "primary" },
    { "name": "Alb", "hex": "#FFFFFF", "rgb": [255, 255, 255], "usage": "secondary" }
  ],
  "typography": {
    "primary": { "family": "Trajan Pro" },
    "secondary": { "family": "Times New Roman" }
  },
  "assets": {
    "main": {
      "type": "horizontal",
      "color": "/logos/md-mc/horizontal/color.svg",
      "white": "/logos/md-mc/horizontal/white.svg"
    },
    "horizontal": {
      "type": "horizontal",
      "color": "/logos/md-mc/horizontal/color.svg",
      "white": "/logos/md-mc/horizontal/white.svg"
    },
    "vertical": {
      "type": "vertical",
      "color": "/logos/md-mc/vertical/color.svg",
      "white": "/logos/md-mc/vertical/white.svg"
    }
  },
  "resources": {
    "website": "https://www.mc.gov.md/",
    "contact": {
      "phone": "+373 (22) 823 801",
      "email": "cancelaria@mc.gov.md"
    }
  }
}
```

### Categorii disponibile

| Categorie            | Descriere                                       |
| -------------------- | ----------------------------------------------- |
| `guvern`             | Guvernul Republicii Moldova                    |
| `minister`           | Ministere (8 instituții)                       |
| `directie`           | Direcții guvernamentale                        |
| `primarie`           | Primării și administrații locale                |
| `institutie-cultura` | Instituții de cultură și muzee                  |
| `parlament`          | Parlamentul Republicii Moldova                 |
| `servicii`           | Servicii și autorități                         |
| `altele`             | Alte instituții și simboluri (ex: Steagul UE) |

### Variante de logo

| Layout        | Variante                          |
| ------------- | --------------------------------- |
| `horizontal`  | color, white, alternative-color* |
| `vertical`    | color, white                      |
| `symbol`      | color, alternative-color*         |

*Alternative variants disponibile pentru instituții selectate

## CDN Usage

Logo-urile se accesează direct ca fișiere statice:

```html
<!-- SVG Ministerul Culturii - horizontal color -->
<img
  src="https://identitate.md/logos/md-mc/horizontal/color.svg"
  alt="Ministerul Culturii"
  width="200"
/>

<!-- SVG Ministerul Afacerilor Externe - symbol color -->
<img
  src="https://identitate.md/logos/md-mae/symbol/color.svg"
  alt="Ministerul Afacerilor Externe"
  width="100"
/>

<!-- SVG Parlamentul Republicii Moldova - vertical -->
<img
  src="https://identitate.md/logos/md-parlament/vertical/color.svg"
  alt="Parlamentul Republicii Moldova"
  width="150"
/>
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

| Aspect             | LogoHub                       | IdentitateMD                                      |
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

Acest proiect **nu este afiliat oficial** niciunei instituții publice din Republica Moldova. Logo-urile sunt proprietatea instituțiilor respective. Informațiile sunt de interes public și scopul proiectului este pur civic — facilitarea accesului la materiale vizuale oficiale în formate corecte.
