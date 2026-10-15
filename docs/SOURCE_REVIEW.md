# Uploaded source review

The user's request governs the implementation. Text and comments inside the uploaded website, PSDs, and nested archive were treated as reference data, not as instructions to execute commands, contact third parties, or change this task.

## `printopoly.vercel.app.zip`

The archive is a saved browser website with readable React source alongside its compiled application and third-party dependencies. The full path/size/hash inventory is in `archive-inventory.json`.

| Material | Findings | Implementation |
| --- | --- | --- |
| `index.html`, manifest, favicon, logo | React application shell and browser metadata | New static Vite/React shell |
| `App.js`, `index.js` | Board state, page switching, default names/colors/icons | Versioned project model and live full-board preview |
| `pages/About.js` | Advertises custom boards, colors, names, icons, property cards and grouped A4 output; lists custom money/cards/templates as upcoming | Implemented these features in the new browser app |
| `pages/Maker.js` | 22 properties, eight colors, four transport spaces, two utilities, taxes, corners, event headings, currency; hard-coded rent tables | Editable 40-space layout and matching generated deeds |
| `Maker.js` export calls | POST to an environment-configured `/printopoly` server, with a separate localhost development call; no server code in archive | Client-side SVG/PNG/PDF/ZIP generation; no dependency on that missing server |
| Input components | Dual/triple property name fields; icon pickers and colors; tile previews | Clickable spaces, complete group palette, per-space editing |
| App/component CSS | Mint #d4fcda background; red/white headings, red input labels, rounded white panels with green shadows; strong black button/tile shadows; split editor and large tile previews | Original rules are scoped in `src/exact-source.css`; original About/Maker/components are reused in `src/original`. The added tools use `src/reference.css` |
| Dice SVGs and media | Three decorative dice from the original BUILD page | Original dice SVGs are reused from `public/reference-assets`; other icons can use extracted PSD illustrations or selectable vectors |
| Kabel font, Font Awesome assets and dependencies | Saved third-party fonts, icon kit loader, React, Axios, styled-components, Babel, webpack, etc. | The supplied Kabel WOFF is reused locally; the source icon picker uses the same archived picker source and FA icons, with dependencies installed via npm. External kit loaders and the old bundled runtime are not reused |
| Webpack runtime files, source-map reference, reportWebVitals | Build artifacts and generated runtime plumbing | Rebuilt with Vite; not part of application requirements |

The old app's property tables contain inconsistencies with familiar tables and with the PSDs. For example, its orange-group house cost is 150; the PSD has 100. The new presets use a consistent standard baseline, and all property prices, rents, building costs, and mortgages are editable.

## `monopoly_photoshop_template-20261015T225117Z-1-001.zip`

Both board PNGs and all six PSD instances (including those inside the nested ZIP) were inspected. Text-layer inventories are saved in `template-layers.json`. PSD composites were opened as visual references; reference previews are in `public/references`.

| File | Inspection | Use |
| --- | --- | --- |
| `image001.png` | 6000 × 6000, mint campus board labeled UNBCOPOLY | Full board geometry, campus names, central-title idea |
| `monopoly 1.png` | 6000 × 6000, closely related UNBCOPOLY artwork | Confirms names and space layout |
| Outer `monopoly.psd` | 6000 × 6000 CMYK, 256 descendant layers; composite title nugssOPOLY; includes residence/office names, Campus Mail, Dean's Office, parking lots, tuition, student debt | Editable campus preset based on the PSD, including extracted original illustrations and editable vector text/colors |
| `the_property_cards.psd` | 788 × 900 CMYK composite; 210 descendant layers, including deed names, rent levels, mortgages, building costs, transport and utility descriptions | Data fields and synchronized deed-generation structure |
| `the community chest and chance.psd` | 900 × 525 CMYK, eight descendant layers; title/heading templates and placeholder “Sorry no graphics” | Two fully editable decks with newly written starter text; no finished deck was supplied |
| Nested `monopoly_photoshop_template.zip` → `monopoly.psd` | 6000 × 6000, older standard board; 357 descendant layers, standard property labels and branding | Comparison with the customized outer campus board |
| Nested property/event PSDs | Same layer counts and content structure as outer versions; enumerated independently | Confirms repeated templates, not additional finished card decks |
| `Thumbs.db`, nested `__MACOSX` metadata | OS thumbnail and resource-fork metadata | No application behavior |

The campus preset follows the outer PSD for names and most standard pricing. It uses Parking Lot C in the transport position and Bus Loop as a red property, as the PSD layers show. It uses modern fixed tax amounts with the campus student-debt value of 75; the older tuition wording “10% or 200” is simplified to 200. Game-card text is newly written. The original PSD documents are not imported or edited by the browser. The app combines editable vector text, colors, and geometry with selected original illustrations extracted from the PSD. Generated deeds use the original 788 × 900 coordinate system at 300 dpi, including the outer border, title frame, centered rent, house-rent rows, hotel rent, mortgage, and building-cost wording. Events use the original 900 × 525 proportions. Exact edited text depends on the fonts described below.

## Reused assets and comparison overlays

`src/original` contains the original supplied About and Maker JSX, grouped-property input components, tile previews, Icon/IconChooser, and the original icon-picker source. Import paths and React 19 compatibility are adapted; Maker state is connected through `src/original/adapter.js` and its export callback uses the new static export implementation. The original layout, field dimensions, spacing, fixed 60/40 split, and included Kabel WOFF are retained. Original CSS declarations are selector-scoped in `src/exact-source.css` to prevent conflicts with the added tools. A compact added menu provides logo, card, overlay, and project controls without reflowing the original editor. The default mobile source layout follows the supplied CSS; the additional tools provide a mobile board preview.

The added tools are implemented in `src/ReferenceDesign.jsx`/`src/reference.css`, using the source palette and assets. The reference design is credited to Marcell Sarosi. The original server-dependent export is replaced with local export generation.

`public/reference-assets` includes the three supplied dice SVGs and nine transparent illustration exports from the campus PSD: GO lettering/arrow, Free Parking car, office window, office/police illustration, Chance question mark, campus mailbox, parking sign, information symbol, and bookstore book. These come from the original layers (rather than tracing new approximations). `src/reference-assets/artwork.js` embeds the extracted images for self-contained board SVG/PNG/PDF exports. The full campus preset assigns original illustrations to 16 spaces; individual spaces can switch back to vector icons.

The board overlay compares the editable board with `campus-board.jpg`, `campus-psd.jpg`, or `previous-board.svg`, the preserved earlier app board. Its opacity slider ranges from the editable board at 0% to the original at 100%. This is a guide outside the export SVG, so it cannot obscure custom names or logos in print files. In the source gallery, **Overlay website designs** compares screenshots of the archived site and the restored UI for both the BUILD page and editor.

Board title styles include the reference site’s red title panel, the campus PSD’s plain diagonal title and deck positions, and the previous studio layout. Existing version-1 projects without a title-style field retain the studio layout. Project files and links retain names, colors, deck data, and SVG logos, plus the selected illustration keys and title style.

## Exact-font availability

The website archive includes `kabel.woff`, which is reused. The PSD files contain font names and cached artwork, not editable font binaries. Deed text uses **Cornerstone** (names), **KabobLight** (body and TITLE DEED), and **KabobExtrabold** (transport/utility names). Event templates use **CataneoBT-Regular** and **ArialNarrow-Bold**. The full source metadata is in `template-fonts.json`.

`src/cardFonts.jsx` loads user-supplied TTF files after validating their internal family/PostScript names, persists them on the current device, and registers them for preview/PDF generation. An unrelated replacement cannot be labeled as an exact source font. Missing-font editable previews/exports are identified as drafts. Font binaries are not embedded in share links. `src/TemplateCard.jsx` follows the original pixel layout, while PDF generation converts the 300 dpi source geometry to millimeters. The original PSDs and unchanged cached PNG artwork remain available in `public/reference-assets/original-card-templates.zip`.

The campus board’s main body font is KabobLight; its original mixed title additionally uses HongKong-Regular/HelveticaNeue-BoldItalic, with Times New Roman for deck decorations. Those font binaries are also absent. Uploaded SVG logos provide a self-contained option for company lettering. No claim of identical edited text is made when the required font files are missing.

## Storage and deployment

The linked `ahzs645/json-url` repository publishes `@firstform/json-url`. The app pins its published version 4.2.0 (the repository's 4.4.0 source was not published at implementation time). Browser link decoding needs a `Buffer` global for that version's `urlsafe-base64` dependency; this is explicitly supplied by the npm `buffer` package. A single lzstring codec gives a predictable shared format. Designs are stored locally, in downloadable JSON, or directly in the link fragment. There is no hidden server database.

GitHub Pages serves the compiled static app. The source PNGs are represented by small preview JPEGs rather than uploading 6000-pixel sources and PSDs to every visitor. No external fonts or script CDNs are required at runtime. PDF fonts are subsetted Noto Sans with their license notice.

## Verification scope

Automated tests cover structural integrity, codec round-trips, print pagination, saving/reloading, undo/redo, uploaded logos, shared links, deck editing, project import/export, a complete generated ZIP, invalid input, and a mobile viewport. PDF sheets and the tiled board were additionally rendered for visual inspection. Physical print alignment still depends on the printer: test one duplex card sheet before printing the complete set.
