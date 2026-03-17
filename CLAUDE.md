# IdentitateMD — Project Instructions

## Adding a New Institution

1. Create `website/src/data/institutions/{id}.json`
2. Add logos to `packages/logos/logos/{id}/`
3. Copy logos to `website/public/logos/{id}/`
4. Run `npm run data:generate` in `website/`
5. Commit and push

**After adding a new institution, always generate a Facebook announcement post:**
- Open `marketing/facebook-announcement.html`
- Update the `institution` config block at the bottom of the file (logoSrc, name, shortname, slug, category)
- Screenshot at 1200×630px using Chrome "Capture node screenshot" or:
  ```bash
  B=~/.claude/skills/gstack/browse/dist/browse
  $B goto "file:///path/to/marketing/facebook-announcement.html"
  $B viewport 1200x630
  $B screenshot /tmp/fb-{id}.png
  ```
- Share the image on the IdentitateMD social media channels
