# IdentitateMD

[![Website](https://img.shields.io/badge/website-identitate.md-blue)](https://identitate.md)
[![npm logos](https://img.shields.io/npm/v/@identitate-md/logos.svg?label=npm%20logos)](https://www.npmjs.com/package/@identitate-md/logos)
[![npm mcp](https://img.shields.io/npm/v/@identitate-md/mcp.svg?label=npm%20mcp)](https://www.npmjs.com/package/@identitate-md/mcp)
[![Institutions](https://img.shields.io/badge/instituții-34-blue)](https://identitate.md/catalog)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

Registru digital open-source pentru identitatea vizuală a instituțiilor publice din Republica Moldova.

Logo-uri vectoriale (SVG), palete de culori oficiale și manuale de brand — o singură sursă de adevăr.

🌐 **Website**: [identitate.md](https://identitate.md)
📦 **NPM Package**: [@identitate-md/logos](https://www.npmjs.com/package/@identitate-md/logos)
🤖 **MCP Server**: [@identitate-md/mcp](https://www.npmjs.com/package/@identitate-md/mcp)

## 🚀 Utilizare Rapidă

### Prin CDN (Recomandat)

```html
<img
  src="https://cdn.jsdelivr.net/npm/@identitate-md/logos@1.3.34/logos/md-guvern/horizontal/color.svg"
  alt="Guvernul Republicii Moldova"
/>
```

### Prin NPM

```bash
npm install @identitate-md/logos
```

```javascript
import logoPath from "@identitate-md/logos/logos/md-guvern/horizontal/color.svg";
```

📖 **Documentație completă**: [identitate.md/utilizare](https://identitate.md/utilizare)

## 📁 Structură Proiect

```
IdentitateMD/
├── packages/logos/          # NPM package cu logo-uri (@identitate-md/logos)
│   ├── logos/              # Fișiere SVG organizate pe instituții
│   ├── index.json          # Index logo-uri
│   ├── institutions-index.json  # Index complet cu brand data (culori, tipografie etc.)
│   └── package.json
│
├── packages/mcp/            # MCP server (@identitate-md/mcp)
│   ├── src/
│   │   ├── index.ts        # Entry point (stdio transport)
│   │   ├── data.ts         # Încarcă și cache-uiește datele la startup
│   │   ├── types.ts        # TypeScript interfaces
│   │   ├── tools/          # search, get-institution, get-logo, get-brand-colors, list-categories
│   │   └── resources/      # MCP resources (identitate-md://institutions/*)
│   └── package.json
│
├── website/                # Site-ul Astro (identitate.md)
│   ├── src/
│   │   ├── data/          # Date JSON per instituție
│   │   ├── pages/         # Pagini Astro (index, utilizare, despre, etc.)
│   │   └── components/    # Componente reutilizabile
│   └── public/logos/      # Logo-uri pentru preview
│
└── docs/                  # Documentație tehnică
```

## 🎯 Caracteristici

- ✅ **Logo-uri vectoriale** de înaltă calitate (SVG)
- ✅ **CDN gratuit** prin jsDelivr și unpkg
- ✅ **NPM package** pentru integrare ușoară
- ✅ **MCP server** pentru AI coding assistants (Claude Code, Cursor etc.)
- ✅ **TypeScript support** cu type definitions
- ✅ **Metadata completă** (culori, tipografie, variante)
- ✅ **Open-source** și gratuit de folosit

## 🛠️ Development Setup

### Website

```bash
cd website
npm install
npm run dev
```

Site-ul va fi disponibil la `http://localhost:4321`

### NPM Package (logos)

```bash
cd packages/logos
npm run generate  # Generează index.json + institutions-index.json
```

### MCP Server

```bash
cd packages/mcp
npm install
npm run build
node dist/index.js  # pornește serverul (stdio)
```

Sau adaugă în `.mcp.json` pentru Claude Code:

```json
{
  "mcpServers": {
    "identitate-md": {
      "command": "npx",
      "args": ["-y", "@identitate-md/mcp"]
    }
  }
}
```

## 📦 NPM Packages

### `@identitate-md/logos`

- 🖼️ Toate logo-urile în format SVG
- 📋 `index.json` cu metadata logo-uri
- 📋 `institutions-index.json` cu brand data complet (culori, tipografie)
- 🔄 Actualizări regulate cu logo-uri noi

### `@identitate-md/mcp`

Server MCP (Model Context Protocol) pentru AI coding assistants. Permite Claude Code, Cursor și alte unelte AI să caute instituții, obțină logo-uri și culori de brand direct din editor.

**Tools disponibile:**

| Tool | Descriere |
|---|---|
| `search_institutions` | Caută după nume, keyword sau categorie |
| `get_institution` | Date complete de brand pentru o instituție |
| `get_logo` | URL logo (+ SVG inline opțional) pentru un layout și variantă |
| `get_brand_colors` | Paleta de culori în format hex, rgb sau CSS custom properties |
| `list_categories` | Lista categoriilor cu numărul de instituții |

### Instituții Disponibile

**Guvern**
- Guvernul Republicii Moldova

**Parlament**
- Parlamentul Republicii Moldova

**Ministere** (11)
- Ministerul Afacerilor Externe (MAE)
- Ministerul Agriculturii și Industriei Alimentare (MAIA)
- Ministerul Culturii (MC)
- Ministerul Dezvoltării Economice și Digitalizării (MDED)
- Ministerul Educației și Cercetării (MEC)
- Ministerul Energiei
- Ministerul Finanțelor (MF)
- Ministerul Infrastructurii și Dezvoltării Regionale (MIDR)
- Ministerul Justiției (MJ)
- Ministerul Mediului
- Ministerul Muncii și Protecției Sociale (MMPS)
- Ministerul Sănătății (MS)

**Agenții & Servicii**
- Agenția De Guvernare Electronică (AGE)
- Agenția Națională pentru Reglementare în Energetică (ANRE)
- Biroul Național de Statistică (BNS)
- Consiliul Audiovizualului (CA)
- Direcția Generală Cultură și Patrimoniu Cultural (DGCPC)
- Primăria Municipiului Chișinău
- Serviciul Tehnologia Informației și Securitatea Cibernetică (STISC)

**Cultură**
- Muzeul Național de Artă Moldovei (MNAM)
- Muzeul de Istorie a Orașului Chișinău (MIOC)

**Altele**
- Banca Națională a Moldovei (BNM)
- MIA Plăți Instant

**Simboluri**
- Stema Republicii Moldova
- Steagul Republicii Moldova
- Steagul Uniunii Europene

**Total: 32 instituții** (actualizat automat la fiecare `data:generate`)

## 🤝 Contribuții

Contribuțiile sunt binevenite! Adaugă o instituție nouă în 3 pași:

1. **Creează fișierul de date** — `website/src/data/institutions/{id}.json` cu numele, categoria, culorile și resursele instituției
2. **Adaugă logo-urile SVG** — în `packages/logos/logos/{id}/` și copiază-le și în `website/public/logos/{id}/`
3. **Regenerează indexul** — `cd website && npm run data:generate`, apoi deschide un Pull Request

Ghid complet: [CONTRIBUTING.md](CONTRIBUTING.md)

## 📄 Licență

MIT License - vezi [LICENSE](LICENSE) pentru detalii.

Toate logo-urile sunt proprietatea instituțiilor respective și sunt disponibile în scopuri informative și de utilizare legală conform ghidurilor de identitate vizuală ale fiecărei instituții.

## 🔗 Link-uri Utile

- **Website**: [identitate.md](https://identitate.md)
- **NPM (logos)**: [@identitate-md/logos](https://www.npmjs.com/package/@identitate-md/logos)
- **NPM (mcp)**: [@identitate-md/mcp](https://www.npmjs.com/package/@identitate-md/mcp)
- **CDN (jsDelivr)**: [cdn.jsdelivr.net/npm/@identitate-md/logos](https://cdn.jsdelivr.net/npm/@identitate-md/logos/)
- **CDN (unpkg)**: [unpkg.com/@identitate-md/logos](https://unpkg.com/@identitate-md/logos/)
- **Documentație**: [identitate.md/utilizare](https://identitate.md/utilizare)

---

Made with ❤️ by [Contributors](https://github.com/ZLDR/IdentitateMD/graphs/contributors)

Forked from [IdentitateRO](https://github.com/laurentiucotet/IdentitateRO)
