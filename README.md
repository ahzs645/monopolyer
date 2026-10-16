# Monopolyer

A browser-based studio for making a custom property-trading board game, built from the supplied Printopoly website and Photoshop references.

**Website after Pages is enabled:** https://ahzs645.github.io/monopolyer/

## Included

- The original supplied Printopoly React components and CSS, including the Kabel font, BUILD page, 60/40 editor split, original form spacing, icon picker, and preview tiles. The added tools are available from **Logo, cards & full board**.
- Live, clickable 40-space board with editable names, prices, rents, group colors, special-space icons, and currency.
- Company SVG logo upload, logo sizing, board palette, and custom title/subtitle.
- Printopoly, company, UNBC campus PNG, and original Photoshop board presets. The campus preset reconstructs the supplied 6000-pixel board PNG, including its complete illustrations, typography, deck frames, and exact palette.
- Adjustable comparison overlays for the original PNG, PSD composite, and the previous board layout; website screenshot overlays are in the source gallery.
- Automatically synchronized property, transport, and utility deeds.
- Two editable event decks with 16 starter cards each; add or remove cards, up to 64 per deck.
- Custom banknote denominations, colors, quantities, and player sets.
- Editable game guide, paper houses and hotels, PDF fronts and mirrored backs.
- All-vector SVG/PDF board exports, individual deed/event SVGs, and a complete vector game kit. Separate source-matched SVG/PNG/PDF downloads preserve the exact original pixels.
- Complete ZIP kit or individual downloads.
- Undo/redo, browser autosave, project JSON import/export, and `json-url` share links.

## Saving a design

Edits autosave in this browser. **Download an editable project JSON for a durable backup.** Clearing site data removes the local copy.

**Share design** compresses the complete project with [`@firstform/json-url` 4.2.0](https://github.com/ahzs645/json-url), using its `lzstring` codec. Names, colors, cards, rules, money, and the sanitized SVG logo are embedded in the `#board=` URL fragment. The fragment is not sent in the HTTP request. The app uses the package's required browser `Buffer` shim. This is an editable snapshot, not a cloud database or a collaborative session. Generate a fresh link after editing. Large logos can make long links; the UI recommends project files when appropriate.

SVGs must be under 200 KB. Scripts, external images/resources, and embedded HTML are removed; supported presentation CSS is converted into SVG attributes. Logos with outlined text and self-contained vector paths work best. Imported files and links pass through the same schema and logo validation.

## Print

Download the complete kit, then read `rules.pdf` or `READ-ME.txt`.

- Print at **100% / Actual size**, not “Fit to page.”
- `board.pdf`: one 508 × 508 mm (20-inch) page for the source-based campus/Photoshop/Printopoly layouts; the older studio layout remains 500 × 500 mm. The original-size PNG records 300 DPI, and the SVG declares its dimensions in millimeters.
- `tiled.pdf`: nine A4 sheets, numbered by row and column. Trim panel borders and join a 3 × 3 grid.
- `deeds.pdf`: 28 cards at the source PSD’s 66.72 × 76.2 mm (788 × 900 at 300 dpi), nine per A4 sheet.
- `events.pdf`: event cards at the source PSD’s 76.2 × 44.45 mm (900 × 525 at 300 dpi), eight per A4 sheet; each deck starts on a new sheet.
- Deed/event back PDFs mirror the columns. Test long-edge duplex printing on one sheet, or print separately and glue front to back.
- Money prints ten notes per A4 sheet, in the quantities selected for each player.
- Building strips make 32 houses and 12 hotels. Supply two dice and player tokens.

### Vector exports

Choose **Get print files → Download the vector kit** for a path-based board SVG, a print-shop PDF, nine vector A4 panels, deed/event PDFs, 28 individual deed SVGs and 32 individual event SVGs, plus the existing native PDF money, buildings, backs and guide. Individual vector downloads are also available. SVG logos are inlined as vector shapes.

The original archives are mixed media. Five embedded SVG smart objects retain their original paths (the information symbol and four parking signs). Cached PSD lettering, the bitmap book/mail illustrations, and the remaining cached artwork are traced at their original resolution into filled SVG outlines. These are real vector paths, but tracing changes some edges; they are **not pixel-identical redraws or recovered font files**. Known source letter shapes remain available without the missing fonts; new wording still uses the existing source-glyph/fallback-font behavior described below. Outlined text edits as paths in a graphics editor; live text still needs its font.

Vector SVG downloads are checked for bitmap images and external resources. Vector PDFs draw those paths directly, with no canvas snapshot or embedded raster image. Unsupported bitmap artwork or SVG effects cause an explicit error instead of being silently rasterized. PNG downloads are always raster. **Source-matched SVG board**, **Print-shop board** and the original complete kit retain the previous lossless raster source artwork for exact source-pixel reproduction.

The asset builder is `scripts/vectorize-artwork.py` (Python: Pillow, NumPy, psd-tools, vtracer 0.6.15). It preserves the original embedded SVG placements and traces remaining source assets. Its checked-in path catalog and method audit are in `public/vector-assets/`; no Python installation is needed by visitors. The atlas loads only when a vector export is requested.

Browser tests compare each vector board at 6000 pixels against the original PNG/PSD composite, checking all group-color fills separately and allowing tracing differences at edges. They also compare edited source/vector boards, inline logos, and inspect every SVG/PDF in the vector kit for raster image content. The pixel-matched exports retain their strict zero-difference tests.

### Matching the exact fonts

The site’s Kabel font **is included** in the website archive and reused locally. The card PSDs name the following fonts, but **their font files are not in either archive**:

- **Cornerstone**: property names.
- **KabobLight**: deed body, rent tables, and TITLE DEED.
- **KabobExtrabold**: transport/utility names.
- **CataneoBT-Regular**: Chance/Community Chest headings.
- **ArialNarrow-Bold**: event-template body text.
- **HelveticaNeue-BoldItalic**: custom center titles on the source board.

Open **Logo, cards & full board → Cards → Exact Photoshop fonts** to load the matching TTF files. Font names are checked against their internal font metadata. The app stores them on this device and embeds loaded fonts in PDF exports and deed SVG previews. Font files are not inserted in share URLs; the receiving device also needs the fonts for exact editable text. Project data, colors, logos, names and artwork keys still travel in the link.

Unchanged source lettering uses the original artwork. New wording and prices reuse available source letters and numbers, with reconstructed spacing; missing characters use a fallback until matching fonts are loaded. Downloads and the kit’s READ-ME identify missing fonts. The **Original Photoshop card templates** ZIP preserves the supplied PSD files and their original rendered artwork unchanged, with a font-name report.

The campus board also references KabobLight for its labels, with HongKong-Regular/HelveticaNeue-BoldItalic in the original mixed title and Times New Roman in deck decorations; see `docs/template-fonts.json`. The original PNG title is preserved exactly, and an uploaded company logo can be placed in the center. Long custom text may require a smaller size to fit the source layout.

Native-resolution export tests compare every RGBA channel of the downloaded campus board against the supplied PNG and the Photoshop preset against the PSD’s cached composite converted to RGB: zero differences in each case. Choose **Start with a template → Original Photoshop board** for its blue nugssOPOLY title and source palette; **Back to campus** preserves the green UNBCOPOLY PNG version. The PDF embeds that same lossless 6000 × 6000 image. Tests also cover edited SVGs, palette changes, logos, print dimensions, nine-page tiling, and removing the old title. The editable SVG contains original raster artwork alongside editable masks, labels, and vector logos; it is not an all-vector redraw.

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
