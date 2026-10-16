# Classic illustrated event cards and Over the Edge template

## Source artwork

User-requested repository: [donutheist/monopoly-vectors](https://github.com/donutheist/monopoly-vectors), pinned at commit `6a68e5f76a5530134efe6613e8bda1ea79329ef3`.

Its README describes SVG illustrations traced with GIMP/Potrace. There are 15 Chance and 16 Community Chest illustrations, with corresponding PNG/XCF sources. These are black illustration outlines, **not complete card fronts, wording or layout specifications**. The Classic illustrated mode composes those illustrations with editable text and separate paper colors, using this app’s existing supplied Cataneo BT and Arial Narrow Bold fonts. No font binaries were copied from this repository. Upstream has no LICENSE file; this review records provenance without assigning a new license to that artwork.

`scripts/extract-classic-events.py` imports the paths into `src/reference-assets/classic-events.json`. It bakes the source translation/y-axis flip into SVG path coordinates. Each entry records its upstream filename, SHA-256, viewBox and extraction method. Every illustration remains a path in previews, SVGs and PDF exports; no PNG is embedded in the application’s classic cards.

Four source SVGs contain only a solid rectangle, while their PNGs contain valid illustrations:

- Community Chest — Advance To Go
- Community Chest — Bank Error In Your Favor
- Community Chest — Xmas Fund Matures
- Community Chest — You Inherit $100

Those four are re-traced from the upstream PNG alpha masks with Potrace (`turdsize=2`, `opttolerance=.2`). Compound contour winding preserves the white holes in each figure. Both original SVG and PNG SHA-256 values are retained in the catalog. Independent upstream PNGs in `tests/fixtures/classic-events` support alpha-overlay comparisons; the browser test requires less than 0.9% normalized alpha difference and excludes empty or solid-black output.

Classic mode is optional for each deck; existing projects default to the unchanged Photoshop mode. Selecting classic assigns a suitable illustration to each starter card. Card artwork stays attached through edits/removal and can be changed or removed individually. There are 16 starter Chance cards and 15 source Chance illustrations; the extra bank-winning card reuses the dividend figure. Custom projects retain their wording and deck names, including Campus Mail.

Both card compositions use the original 900 × 525 coordinate system and 76.2 × 44.45 mm print slots. Paper color, titles and artwork are deck/card data, validated and included in project/share persistence. Text expands the existing currency/GO/jail/space placeholders, wraps and scales within fixed bounds. Native font text and SVG paths feed the shared preview/PDF display list. A dark paper color automatically switches text and illustration to white.

## Over the EdgeOPOLY

The uploaded `nugssopoly.monopolyer.json` has SHA-256 `3d653e71659a5e96cd32704f7a0a75d497471bbc187964628b57728ba3ef69b9`. Its schema-validated snapshot is saved in `src/reference-assets/nugssopoly-preset.json`; each template load clones the complete snapshot. Properties, rents, mortgages, group colors, decks, rules and money are preserved, including space 29 “Over The Edge”, space 35 “Residence Parking Lot”, and the custom bill heading “Over the Edgeopoly”.

The pasted WordPress content contained the actual 33-path Over the Edge wordmark. `src/reference-assets/over-the-edge-logo.js` preserves those paths and the `0 0 690.73 118.6` viewBox. WordPress CSS variables are resolved to the supplied green `#155329` and dark `#262626`; page scaffolding is excluded. The logo retains its newspaper tagline, with an editable green OPOLY appended alongside the main lettering. The preset sets 136% whole-title scale, 100% suffix size and a 71.4% baseline. Existing Northern Health and older project title defaults retain their previous alignment.

Original logo colors are optional. Choosing a title/brand color turns off that option and recolors logo plus suffix; re-enabling it restores the supplied wordmark palette. This changes no property or board background colors.

Original Printopoly is removed from the template picker. Its underlying preset/layout remains supported for saved projects and source comparisons.

## Verification

- Exact saved-project data comparison and isolated template cloning.
- All 32 starter event cards render in either mode, with text/path bounds checked on the actual website.
- Independent alpha overlays for the four repaired illustrations.
- Editing, paper colors, title visibility, text-only cards, card removal and independent deck modes.
- Mobile layout, autosave/share/project import and vector SVG/PDF downloads.
- Existing Photoshop source-card comparisons and Northern Health branding checks remain part of the regression suite.
