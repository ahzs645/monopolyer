# Monopolyer

A browser-based studio for making a custom property-trading board game, built from the supplied Printopoly website and Photoshop references.

**Website:** https://projects.ahmadjalil.com/monopolyer/

## Included

- One full builder using the supplied Printopoly Kabel font, BUILD page, mint/red styling, 60/40 desktop split and searchable icon picker. Board design, spaces, cards, money and export are available together; the actual board is the initial preview.
- Live, clickable 40-space board with editable names, prices, rents, group colors, special-space icons, and currency.
- Company SVG logo upload, logo sizing, board palette, and custom title/subtitle.
- Printopoly, company, UNBC campus PNG, and original Photoshop board presets. The campus preset reconstructs the supplied 6000-pixel board PNG, including its complete illustrations, typography, deck frames, and exact palette.
- Adjustable comparison overlays for the original PNG, PSD composite, and the previous board layout; website screenshot overlays are in the source gallery.
- Automatically synchronized property, transport, and utility deeds.
- Two editable event decks with 16 starter cards each; add or remove cards, up to 64 per deck.
- The seven supplied PDF bill designs, reused as vectors, with custom denominations, optional colors/branding, quantities, player sets and an opacity overlay. The simple bill design remains available.
- Editable game guide, paper houses and hotels, PDF fronts and mirrored backs.
- All-vector SVG/PDF board exports, individual deed/event SVGs, and a complete vector game kit. Separate source-matched SVG/PNG/PDF downloads preserve the exact original pixels.
- Complete ZIP kit or individual downloads.
- Undo/redo, browser autosave, project JSON import/export, and `json-url` share links.

## Saving a design

Edits autosave in this browser. **Download an editable project JSON for a durable backup.** Clearing site data removes the local copy.

**Share design** compresses the complete project with [`@firstform/json-url` 4.2.0](https://github.com/ahzs645/json-url), using its `lzstring` codec. Names, colors, cards, rules, money, the sanitized SVG logo, and uploaded space artwork are embedded in the `#board=` URL fragment. The fragment is not sent in the HTTP request. The app uses the package's required browser `Buffer` shim. This is an editable snapshot, not a cloud database or a collaborative session. Generate a fresh link after editing. Large logos or images can make long links; the UI recommends project files when appropriate.

SVGs must be under 200 KB. Scripts, external images/resources, and embedded HTML are removed; supported presentation CSS is converted into SVG attributes. Logos with outlined text and self-contained vector paths work best. Imported files and links pass through the same schema and SVG validation. Space images are embedded PNG/JPEG data, never external URLs. Project imports allow up to 15 MB; oversized share links use a project-file backup instead.

## Print

Download the complete kit, then read `rules.pdf` or `READ-ME.txt`.

- Print at **100% / Actual size**, not “Fit to page.”
- `board.pdf`: one 508 × 508 mm (20-inch) page for the source-based campus/Photoshop/Printopoly layouts; the older studio layout remains 500 × 500 mm. The original-size PNG records 300 DPI, and the SVG declares its dimensions in millimeters.
- `tiled.pdf`: nine A4 sheets, numbered by row and column. Trim panel borders and join a 3 × 3 grid.
- `deeds.pdf`: 28 cards at the source PSD’s 66.72 × 76.2 mm (788 × 900 at 300 dpi), nine per A4 sheet.
- `events.pdf`: event cards at the source PSD’s 76.2 × 44.45 mm (900 × 525 at 300 dpi), eight per A4 sheet; each deck starts on a new sheet.
- Deed/event back PDFs mirror the columns. Test long-edge duplex printing on one sheet, or print separately and glue front to back.
- Reference money prints ten notes per A4 sheet at the original 90.84 × 43.22 mm bill size, in the quantities selected for each player. The simple design retains its 99 × 50 mm size.
- Building strips make 32 houses and 12 hotels. Supply two dice and player tokens.

### Setting up properties and group colors

Open **Spaces** to edit properties in groups. Each group header has a color picker, editable hex value and **Reset** control. Group changes update every property in that group, its deed and all exported artwork. The selected property's detailed settings also show a shared group color control. Board design includes the full eight-group palette; **Edit all property names as a list** keeps the original bulk editor available without a long default setup form.

Names and purchase prices are editable directly below each preview. **Find a space** searches by name, and **Show spaces** filters to one group or the special spaces. Click a space or **Edit details** for group assignment, rents, mortgages, icons and uploads. Moving a property to another group also changes its source-board color band and deed. Group numbers and current hex values identify groups without relying on outdated color names.

Preview crops retain the current board's exact artwork, but normalize each side's rotation so names and prices are upright. SVG viewports clip each crop at its own boundaries and maintain its aspect ratio. Full-board previews and exports keep the original orientation and layout. The original Studio template has its own margin-free preview viewport; its full-board export dimensions are unchanged.

### Changing icons and text without moving the layout

In **Spaces**, choose a space and use the icon grid or **Search more icons** to reuse the reference site's searchable Font Awesome picker. Its symbol stays centered in the source illustration slot and rotates with its side of the board. The GO arrow has its own replacement slot; the GO title stays separate. Corner captions and the jail frame remain in place. Tax spaces also support vector icons. Icon color switches to the selected vector symbol; choose an original PSD illustration to restore that artwork.

**Upload or paste artwork** replaces any of the 18 existing board icons with an SVG, PNG, JPEG, WebP or GIF (first frame). Upload a file, focus the artwork box and press Ctrl+V / ⌘V, use **Paste from clipboard**, or paste SVG markup and choose **Apply SVG**. **Copy artwork** copies the current upload for pasting into another space. Clipboard access depends on the browser; file upload and the SVG markup field remain available. Images fit inside the existing slot without stretching or moving text. Removing an upload restores the previous illustration/icon. Uploads are limited to 5 MB and raster inputs are resized to at most 768 pixels to keep projects manageable; SVGs use the existing 200 KB sanitization. SVG uploads retain vector shapes. Raster uploads remain raster in source-matched files and are rejected by vector exports; the main kit button chooses the source-matched kit when raster icons are present.

Space names update immediately. Text retains the source center and rotation, measures its actual font/glyph widths, wraps, and shrinks to fit the original label area. Use line breaks in the space-name box for explicit line breaks. Complete wording is retained. Prices stay at their separate source anchors. Transport and utility symbol changes also update the matching deed illustration without moving its title, rent table or mortgage text. Saved projects and share links retain the symbol, color and multiline name. The supplied-font limitations below still apply to exact new lettering.

### Vector exports

Choose **Get print files → Download the vector kit** for a path-based board SVG, a print-shop PDF, nine vector A4 panels, deed/event PDFs, 28 individual deed SVGs and 32 individual event SVGs, plus the existing native PDF money, buildings, backs and guide. Individual vector downloads are also available. SVG logos are inlined as vector shapes.

The original archives are mixed media. Five embedded SVG smart objects retain their original paths (the information symbol and four parking signs). Cached PSD lettering, the bitmap book/mail illustrations, and the remaining cached artwork are traced at their original resolution into filled SVG outlines. These are real vector paths, but tracing changes some edges; they are **not pixel-identical redraws or recovered font files**. Known source letter shapes remain available without the missing fonts; new wording still uses the existing source-glyph/fallback-font behavior described below. Outlined text edits as paths in a graphics editor; live text still needs its font.

Vector SVG downloads are checked for bitmap images and external resources. Vector PDFs draw those paths directly, with no canvas snapshot or embedded raster image. Unsupported bitmap artwork or SVG effects cause an explicit error instead of being silently rasterized. PNG downloads are always raster. **Source-matched SVG board**, **Print-shop board** and the original complete kit retain the previous lossless raster source artwork for exact source-pixel reproduction.

The asset builder is `scripts/vectorize-artwork.py` (Python: Pillow, NumPy, psd-tools, vtracer 0.6.15). It preserves the original embedded SVG placements and traces remaining source assets. Its checked-in path catalog and method audit are in `public/vector-assets/`; no Python installation is needed by visitors. The atlas loads only when a vector export is requested.

Browser tests compare each vector board at 6000 pixels against the original PNG/PSD composite, checking all group-color fills separately and allowing tracing differences at edges. They also compare edited source/vector boards, inline logos, and inspect every SVG/PDF in the vector kit for raster image content. The pixel-matched exports retain their strict zero-difference tests.

### Brand color, white lettering and logo previews

Board design includes a separate **Board title text** color with hex entry, **White title text**, and **White board text** actions. **Brand blue** accepts an exact hex color; **Brand background & white title** applies that brand color to the board background and makes the center title white. Text/lines, title, property groups and brand color remain independently editable. White SVG logos are shown against the current brand color in the upload preview.

Long center titles now fit as a single unbroken line. When changing source-board ink, all original label and line outlines are recolored using the same audited source-ink paths already used for vector exports, including cached letters whose colors differed slightly from the original line ink. Default source-colored boards retain their exact source-pixel renderer. `scripts/extract-board-ink-paths.py` regenerates the deduplicated path list from the existing vector atlas. The supplied Northern Health SVG is covered by upload, share, project and vector export regression tests.

### Reference bills and overlays

**Money → Bill design** defaults to the seven newly supplied bills. Each vector SVG is extracted directly from its PDF, retaining the border, guilloche, denomination outlines, illustrations and source colors. Each PDF has its own measured crop offset; `public/money-reference/manifest.json` records the source bounds and SHA-256. Original PDFs are also available through the overlay panel. The preview and PDF share the same artwork builder. Repeated notes reuse a PDF Form XObject instead of rasterizing or duplicating the design.

**Bill heading** replaces the original MONOPOLY word with **Use board name**, **Custom wording**, or **Use bank name**. Board-name mode follows later board renames; custom wording stays independent. **Original MONOPOLY** restores the original source heading. Heading color and a white-heading action are available for custom headings. The heading fits inside the original oval and is used on all seven previews and the printable PDF. Existing projects with the old personalization setting keep their bank heading. The optional board-name footer remains separately controlled.

**Overlay reference bill** lets you choose a denomination and opacity. The overlay is comparison-only. Custom values replace the three number areas; changing a note color enables **Apply my note colors**, and changing the bank name on older projects retains their bank-heading personalization. With an explicit heading choice, bank-name edits do not change the separate footer option. Turn those options off to compare unbranded source artwork. Newly typed values/branding use live serif text; unchanged denominations keep the exact original outlines. **Simple custom bills** retains the previous design.

`scripts/extract-money-artwork.py` requires PyMuPDF to regenerate the source SVGs from the PDFs. Browser tests compare every bill against a PNG rendered independently from the uploaded PDF. `scripts/compare-money-overlays.py` (PyMuPDF, Pillow, NumPy) compares a one-of-each exported PDF with the seven originals at 288 DPI, outputs source/export/50% overlay/difference images, and checks for raster content. See [the overlay report](docs/MONEY_REVIEW.md). Neither Python nor the original PDF parser is needed in the deployed app.

### Matching the exact fonts

The site’s Kabel font **is included** in the website archive and reused locally. The card PSDs name the following fonts, but **their font files are not in either archive**:

- **Cornerstone**: property names.
- **KabobLight**: deed body, rent tables, and TITLE DEED.
- **KabobExtrabold**: transport/utility names.
- **CataneoBT-Regular**: Chance/Community Chest headings.
- **ArialNarrow-Bold**: event-template body text.
- **HelveticaNeue-BoldItalic**: custom center titles on the source board.

Open **Cards → Exact Photoshop fonts** to load the matching TTF files. Font names are checked against their internal font metadata. The app stores them on this device and embeds loaded fonts in PDF exports and deed SVG previews. Font files are not inserted in share URLs; the receiving device also needs the fonts for exact editable text. Project data, colors, logos, names and artwork keys still travel in the link.

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

The original PSD documents and archived third-party runtime are not bundled into the application. The original About, Maker, input, tile-preview and icon-picker sources remain in `src/original` for reference. The searchable icon picker is reused in the unified builder. `src/builder.css` preserves the source typography and desktop proportions while making all current tools available; `src/exact-source.css` retains the archived scoped rules and included font. The decorative dice, included Kabel font, and nine extracted PSD illustrations are reused. See `public/reference-assets` and `src/reference-assets/artwork.js` for the assets; the embedded image data makes exported SVGs and PDFs self-contained.

Independent project; not affiliated with the Monopoly brand or its owners. Uploaded reference artwork remains attributed to its original creators. Noto Sans is distributed under the SIL Open Font License; its notice is in `src/fonts/LICENSE.txt`. UI fonts and other libraries retain their package licenses.

### The builder interface follows the current design

New designs start with the supplied Photoshop board. Existing projects and share links keep their own board, cards, logo and palette. The former original/advanced editor split is removed: BUILD opens the full builder, initially showing the actual board, and no legacy session flag hides the newer tools. The heading follows the current board name. Property editing keeps the selected preview open. Spaces opens the grouped setup view; Board design starts with the full board. Space previews use cropped SVG instances of the same board renderer, including its illustrations, rotations and typography, rather than separately drawn generic Printopoly tiles. One shared artwork definition supplies all 40 crops, and the full board remains mounted independently for export.
