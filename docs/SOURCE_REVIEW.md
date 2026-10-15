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
| App/component CSS | Original typography, forms, layout and tile-preview styling | New responsive studio interface |
| Dice SVGs and media | Decorative assets | Newly drawn vector icons; archived assets not copied into production code |
| Kabel font, Font Awesome assets and dependencies | Saved third-party fonts, icon kit loader, React, Axios, styled-components, Babel, webpack, etc. | Dependencies installed through npm; no archived external script loaders or old node_modules copied |
| Webpack runtime files, source-map reference, reportWebVitals | Build artifacts and generated runtime plumbing | Rebuilt with Vite; not part of application requirements |

The old app's property tables contain inconsistencies with familiar tables and with the PSDs. For example, its orange-group house cost is 150; the PSD has 100. The new presets use a consistent standard baseline, and all property prices, rents, building costs, and mortgages are editable.

## `monopoly_photoshop_template-20261015T225117Z-1-001.zip`

Both board PNGs and all six PSD instances (including those inside the nested ZIP) were inspected. Text-layer inventories are saved in `template-layers.json`. PSD composites were opened as visual references; reference previews are in `public/references`.

| File | Inspection | Use |
| --- | --- | --- |
| `image001.png` | 6000 × 6000, mint campus board labeled UNBCOPOLY | Full board geometry, campus names, central-title idea |
| `monopoly 1.png` | 6000 × 6000, closely related UNBCOPOLY artwork | Confirms names and space layout |
| Outer `monopoly.psd` | 6000 × 6000 CMYK, 256 descendant layers; composite title nugssOPOLY; includes residence/office names, Campus Mail, Dean's Office, parking lots, tuition, student debt | Editable campus preset based on the PSD; own icons and vector artwork |
| `the_property_cards.psd` | 788 × 900 CMYK composite; 210 descendant layers, including deed names, rent levels, mortgages, building costs, transport and utility descriptions | Data fields and synchronized deed-generation structure |
| `the community chest and chance.psd` | 900 × 525 CMYK, eight descendant layers; title/heading templates and placeholder “Sorry no graphics” | Two fully editable decks with newly written starter text; no finished deck was supplied |
| Nested `monopoly_photoshop_template.zip` → `monopoly.psd` | 6000 × 6000, older standard board; 357 descendant layers, standard property labels and branding | Comparison with the customized outer campus board |
| Nested property/event PSDs | Same layer counts and content structure as outer versions; enumerated independently | Confirms repeated templates, not additional finished card decks |
| `Thumbs.db`, nested `__MACOSX` metadata | OS thumbnail and resource-fork metadata | No application behavior |

The campus preset follows the outer PSD for names and most standard pricing. It uses Parking Lot C in the transport position and Bus Loop as a red property, as the PSD layers show. It uses modern fixed tax amounts with the campus student-debt value of 75; the older tuition wording “10% or 200” is simplified to 200. Game-card text is newly written. The original PSDs are not imported or edited by the browser: the app builds a clean vector board and printable cards from structured data.

## Storage and deployment

The linked `ahzs645/json-url` repository publishes `@firstform/json-url`. The app pins its published version 4.2.0 (the repository's 4.4.0 source was not published at implementation time). Browser link decoding needs a `Buffer` global for that version's `urlsafe-base64` dependency; this is explicitly supplied by the npm `buffer` package. A single lzstring codec gives a predictable shared format. Designs are stored locally, in downloadable JSON, or directly in the link fragment. There is no hidden server database.

GitHub Pages serves the compiled static app. The source PNGs are represented by small preview JPEGs rather than uploading 6000-pixel sources and PSDs to every visitor. No external fonts or script CDNs are required at runtime. PDF fonts are subsetted Noto Sans with their license notice.

## Verification scope

Automated tests cover structural integrity, codec round-trips, print pagination, saving/reloading, undo/redo, uploaded logos, shared links, deck editing, project import/export, a complete generated ZIP, invalid input, and a mobile viewport. PDF sheets and the tiled board were additionally rendered for visual inspection. Physical print alignment still depends on the printer: test one duplex card sheet before printing the complete set.
