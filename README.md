# Monopolyer

A browser-based studio for making a custom property-trading board game, built from the supplied Printopoly website and Photoshop references.

**Website after Pages is enabled:** https://ahzs645.github.io/monopolyer/

## Included

- The original supplied Printopoly React components and CSS, including the Kabel font, BUILD page, 60/40 editor split, original form spacing, icon picker, and preview tiles. The added tools are available from **Logo, cards & full board**.
- Live, clickable 40-space board with editable names, prices, rents, group colors, special-space icons, and currency.
- Company SVG logo upload, logo sizing, board palette, and custom title/subtitle.
- Printopoly, company, and UNBC campus presets. The campus preset reuses nine illustrations extracted from the uploaded PSD.
- Adjustable comparison overlays for the original PNG, PSD composite, and the previous board layout; website screenshot overlays are in the source gallery.
- Automatically synchronized property, transport, and utility deeds.
- Two editable event decks with 16 starter cards each; add or remove cards, up to 64 per deck.
- Custom banknote denominations, colors, quantities, and player sets.
- Editable game guide, paper houses and hotels, PDF fronts and mirrored backs.
- Vector SVG, 6000-pixel PNG, a 500 mm print-shop board PDF, and a nine-page tiled A4 board PDF.
- Complete ZIP kit or individual downloads.
- Undo/redo, browser autosave, project JSON import/export, and `json-url` share links.

## Saving a design

Edits autosave in this browser. **Download an editable project JSON for a durable backup.** Clearing site data removes the local copy.

**Share design** compresses the complete project with [`@firstform/json-url` 4.2.0](https://github.com/ahzs645/json-url), using its `lzstring` codec. Names, colors, cards, rules, money, and the sanitized SVG logo are embedded in the `#board=` URL fragment. The fragment is not sent in the HTTP request. The app uses the package's required browser `Buffer` shim. This is an editable snapshot, not a cloud database or a collaborative session. Generate a fresh link after editing. Large logos can make long links; the UI recommends project files when appropriate.

SVGs must be under 200 KB. Scripts, external images/resources, and embedded HTML are removed; supported presentation CSS is converted into SVG attributes. Logos with outlined text and self-contained vector paths work best. Imported files and links pass through the same schema and logo validation.

## Print

Download the complete kit, then read `rules.pdf` or `READ-ME.txt`.

- Print at **100% / Actual size**, not “Fit to page.”
- `board.pdf`: one 500 × 500 mm page for a print shop.
- `tiled.pdf`: nine A4 sheets, numbered by row and column. Trim panel borders and join a 3 × 3 grid.
- `deeds.pdf`: 28 cards at the source PSD’s 66.72 × 76.2 mm (788 × 900 at 300 dpi), nine per A4 sheet.
- `events.pdf`: event cards at the source PSD’s 76.2 × 44.45 mm (900 × 525 at 300 dpi), eight per A4 sheet; each deck starts on a new sheet.
- Deed/event back PDFs mirror the columns. Test long-edge duplex printing on one sheet, or print separately and glue front to back.
- Money prints ten notes per A4 sheet, in the quantities selected for each player.
- Building strips make 32 houses and 12 hotels. Supply two dice and player tokens.

### Matching the exact card fonts

The site’s Kabel font **is included** in the website archive and reused locally. The card PSDs name the following fonts, but **their font files are not in either archive**:

- **Cornerstone**: property names.
- **KabobLight**: deed body, rent tables, and TITLE DEED.
- **KabobExtrabold**: transport/utility names.
- **CataneoBT-Regular**: Chance/Community Chest headings.
- **ArialNarrow-Bold**: event-template body text.

Open **Logo, cards & full board → Cards → Exact Photoshop card fonts** to load the matching TTF files. Font names are checked against their internal font metadata. The app stores them on this device and embeds loaded fonts in PDF exports and deed SVG previews. Font files are not inserted in share URLs; the receiving device also needs the fonts for exact editable text. Project data, colors, logos, names and artwork keys still travel in the link.

Until those files are loaded, edited text uses draft fonts. Card PDF download names and the kit’s READ-ME indicate the missing fonts. The **Original Photoshop card templates** ZIP preserves the supplied PSD files and their original rendered artwork unchanged, with a font-name report.

The campus board also references KabobLight for its labels, with HongKong-Regular/HelveticaNeue-BoldItalic in the original mixed title and Times New Roman in deck decorations; see `docs/template-fonts.json`. The provided logo can replace the center lettering. Long custom text may require a smaller size to fit the source layout.

## Run locally

Requires Node.js 22 or later.

```sh
npm ci
npm run dev
```

```sh
npm test
npx playwright install chromium
npm run test:e2e
npm run build
npm run preview
```

## GitHub Pages

`.github/workflows/pages.yml` tests and builds the app, then deploys `dist` on pushes to `main`. In the repository's **Settings → Pages**, set the source to **GitHub Actions**. If the initial deploy ran before Pages was enabled, open **Actions → Test and deploy GitHub Pages → Run workflow** to deploy it again. No backend, API keys, or paid hosting is required. Relative asset URLs support a repository subpath such as `/monopolyer/`.

## Reference review

See [the source review](docs/SOURCE_REVIEW.md), [archive inventory](docs/archive-inventory.json), and [Photoshop layer inventory](docs/template-layers.json). The app includes a source gallery with a website comparison overlay. **Overlay original artwork** in the preview opens a reference/opacity control for comparing the board. Comparison layers are excluded from exported files. Choose **Original PSD illustration** in Spaces to reuse an extracted illustration, or choose a vector icon to replace it for that space. Illustration choices and title styles are saved in projects and share links.

The original PSD documents and archived third-party runtime are not bundled into the application. The original About, Maker, input, tile-preview, and icon-picker source is in `src/original`; only imports and state/export integration are adapted. Original CSS is scoped in `src/exact-source.css` so it does not change the added tools. The decorative dice, included Kabel font, and nine extracted PSD illustrations are reused. See `public/reference-assets` and `src/reference-assets/artwork.js` for the assets; the embedded image data makes exported SVGs and PDFs self-contained.

Independent project; not affiliated with the Monopoly brand or its owners. Uploaded reference artwork remains attributed to its original creators. Noto Sans is distributed under the SIL Open Font License; its notice is in `src/fonts/LICENSE.txt`. UI fonts and other libraries retain their package licenses.
