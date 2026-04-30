---
name: add-institution
description: |
  Interactive wizard to add a new institution to IdentitateMD.
  Gathers all required data, creates the JSON, verifies logos,
  runs data:generate, updates the Facebook announcement, screenshots it,
  then commits and pushes.
  Use when the user says "add institution", "new institution", "adaugă instituție", or "add [name] to IdentitateMD".
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - AskUserQuestion
---

## Overview

You are running the `add-institution` wizard for the **IdentitateMD** project.
Walk through each step in order. Be concise — ask everything in one batch, act fast.

The project root is: `/Users/dorianzlatan/Dev/IdentitateMD`

---

## Step 1 — Gather institution data

Print the following block **verbatim** as a plain text message to the user, then wait for their reply.
Do NOT use `AskUserQuestion` here — these are free-form fields that need typed answers.

---

Please fill in all fields and reply with the completed form:

```
1.  ID (e.g. md-ansp — country prefix + kebab-case):
2.  Slug (URL-friendly, e.g. agentia-nationala-pentru-sanatate-publica):
3.  Full name (e.g. Agenția Națională pentru Sănătate Publică):
4.  Shortname / abbreviation (e.g. ANSP):
5.  Category (pick one):
      agentie | altele | consilii | directie | guvern |
      institutie-cultura | minister | parlament | primarie | servicii | universitate
6.  Description (1-2 sentences in Romanian):
7.  Website URL:
8.  Branding manual URL (or "none"):
9.  Colors — one per line, format: Name | #HEX | usage
      usage = primary | secondary | accent | neutral
      e.g.  Albastru | #003DA5 | primary
10. Typography:
      Primary font + weights (e.g. Onest 400,700):
      Secondary font (optional):
11. Logo variants available (check which SVGs exist):
      [ ] horizontal   (horizontal-color.svg + horizontal-white.svg)
      [ ] vertical     (vertical-color.svg + vertical-white.svg)
      [ ] symbol       (symbol-color.svg + symbol-white.svg)
      Main variant (horizontal | vertical | symbol):
12. Facebook URL (or "none"):
13. Twitter/X URL (or "none"):
14. Contact email (or "none"):
15. Contact phone (or "none"):
16. Keywords (comma-separated, e.g. moldova, sănătate, publică):
17. Quality (draft | verified):
```

---

Wait for the user to reply with the completed form. Store all answers before proceeding.

---

## Step 2 — Verify logos exist

Check if logos are in place:

```bash
ls /Users/dorianzlatan/Dev/IdentitateMD/packages/logos/logos/{ID}/
ls /Users/dorianzlatan/Dev/IdentitateMD/website/public/logos/{ID}/
```

If either directory is missing or empty, **pause and tell the user**:

```
⚠️  Logos not found for {ID}.

Please add SVG files to:
  packages/logos/logos/{ID}/
  website/public/logos/{ID}/

Required files (based on variants you listed):
  horizontal-color.svg, horizontal-white.svg
  symbol-color.svg, symbol-white.svg   (if applicable)
  vertical-color.svg, vertical-white.svg  (if applicable)

Once logos are in place, reply "done" and I'll continue.
```

Then wait. Use `AskUserQuestion` to ask "Are logos in place? (reply 'yes' to continue)".

---

## Step 3 — Build the institution JSON

Create `/Users/dorianzlatan/Dev/IdentitateMD/website/src/data/institutions/{ID}.json`.

Use this template, filling in values from Step 1.
Only include fields that have real values — omit null/empty optional fields.

```json
{
  "id": "{ID}",
  "slug": "{SLUG}",
  "name": "{FULL_NAME}",
  "shortname": "{SHORTNAME}",
  "category": "{CATEGORY}",
  "meta": {
    "version": "1.0",
    "last_updated": "{TODAY_DATE}",
    "keywords": ["{KEYWORD1}", "{KEYWORD2}"],
    "quality": "{QUALITY}"
  },
  "location": {
    "country_code": "MD",
    "city": "Chișinău"
  },
  "description": "{DESCRIPTION}",
  "colors": [
    {
      "name": "{COLOR_NAME}",
      "hex": "{HEX}",
      "rgb": [{R}, {G}, {B}],
      "usage": "{USAGE}"
    }
  ],
  "typography": {
    "primary": {
      "family": "{PRIMARY_FONT}",
      "weights": [{WEIGHTS}]
    }
  },
  "assets": {
    "main": {
      "type": "{MAIN_VARIANT_TYPE}",
      "color": "/logos/{ID}/{MAIN_VARIANT}-color.svg",
      "white": "/logos/{ID}/{MAIN_VARIANT}-white.svg"
    },
    "{VARIANT1}": {
      "type": "{VARIANT1_TYPE}",
      "color": "/logos/{ID}/{VARIANT1}-color.svg",
      "white": "/logos/{ID}/{VARIANT1}-white.svg"
    }
  },
  "resources": {
    "website": "{WEBSITE}"
  }
}
```

**HEX → RGB conversion**: compute R,G,B from the hex string yourself.

**Assets block rules**:
- Always include a `"main"` key pointing to the primary variant
- Add one key per variant the institution has (horizontal, symbol, vertical)
- Only include `branding_manual` in resources if URL was provided
- Only include `social_media` sub-object if at least one social URL was provided
- Only include `contact` sub-object if email or phone was provided

**Date**: use today's date in `YYYY-MM-DD` format.

---

## Step 4 — Run data:generate

```bash
cd /Users/dorianzlatan/Dev/IdentitateMD/website && npm run data:generate
```

If it errors, show the error to the user and stop.

---

## Step 5 — Update Facebook announcement

Edit `/Users/dorianzlatan/Dev/IdentitateMD/marketing/facebook-announcement.html`.

Find the `const institution = {` block (near the bottom of the file) and replace it:

```js
const institution = {
  logoSrc:   "../packages/logos/logos/{ID}/{MAIN_VARIANT}-color.svg",
  name:      "{FULL_NAME_HTML}",
  shortname: "{SHORTNAME}",
  category:  "{CATEGORY_DISPLAY}",
  slug:      "{SLUG}",
  tagline:   null,
};
```

- `{FULL_NAME_HTML}`: use `<br/>` to break long names across 2-3 lines if > ~30 chars
- `{CATEGORY_DISPLAY}`: human-readable Romanian category label:
  - agentie → "Agenție"
  - altele → "Altele"
  - consilii → "Consiliu"
  - directie → "Direcție"
  - guvern → "Guvern"
  - institutie-cultura → "Instituție Culturală"
  - minister → "Minister"
  - parlament → "Parlament"
  - primarie → "Primărie"
  - servicii → "Serviciu"
  - universitate → "Universitate"

---

## Step 6 — Screenshot the announcement

```bash
B=~/.claude/skills/gstack/browse/dist/browse
$B goto "file:///Users/dorianzlatan/Dev/IdentitateMD/marketing/facebook-announcement.html"
$B viewport 1200x630
$B screenshot /tmp/fb-{ID}.png
```

Tell the user: "📸 Facebook announcement screenshot saved to `/tmp/fb-{ID}.png`"

If the browse binary isn't found, tell the user to open the HTML manually and use Chrome's "Capture node screenshot" on the `.canvas` element at 1200×630px.

---

## Step 7 — Commit and push

Stage and commit:

```bash
cd /Users/dorianzlatan/Dev/IdentitateMD
rtk git add website/src/data/institutions/{ID}.json \
            packages/logos/logos/{ID}/ \
            website/public/logos/{ID}/ \
            website/src/data/institutions-index.json \
            marketing/facebook-announcement.html
rtk git commit -m "add: {SHORTNAME} — {FULL_NAME}"
rtk git push
```

---

## Step 8 — Done

Print a summary:

```
✅  {FULL_NAME} ({SHORTNAME}) added to IdentitateMD!

  JSON:     website/src/data/institutions/{ID}.json
  Logos:    website/public/logos/{ID}/
  Preview:  http://localhost:4321/institutii/{SLUG}
  FB image: /tmp/fb-{ID}.png

Next: share the FB announcement on the IdentitateMD social channels 🚀
```
