# Monopolyer

A browser-based studio for making a custom property-trading board game, built from the supplied Printopoly website and Photoshop references.

**Website:** https://ahzs645.github.io/monopolyer/

## Included

- Live, clickable 40-space board with editable names, prices, rents, group colors, special-space icons, and currency.
- Company SVG logo upload, logo sizing, board palette, and custom title/subtitle.
- Company and UNBC campus presets inspired by the uploaded artwork.
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
- `deeds.pdf`: 28 cards at 63 × 88 mm, nine per A4 sheet.
- `events.pdf`: event cards at 88 × 56 mm, eight per A4 sheet; each deck starts on a new sheet.
- Deed/event back PDFs mirror the columns. Test long-edge duplex printing on one sheet, or print separately and glue front to back.
- Money prints ten notes per A4 sheet, in the quantities selected for each player.
- Building strips make 32 houses and 12 hotels. Supply two dice and player tokens.

PDF text embeds a Latin/Latin-extended Noto Sans subset with currency symbols. Board SVG/PNG uses browser text rendering. For logos, outline unusual lettering in your SVG. Very long card text may need shortening to fit a physical card.

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

`.github/workflows/pages.yml` tests and builds the app, then deploys `dist` on pushes to `main`. In the repository's **Settings → Pages**, set the source to **GitHub Actions**. No backend, API keys, or paid hosting is required. Relative asset URLs support a repository subpath such as `/monopolyer/`.

## Reference review

See [the source review](docs/SOURCE_REVIEW.md), [archive inventory](docs/archive-inventory.json), and [Photoshop layer inventory](docs/template-layers.json). The app also includes a preview gallery. The original PSDs and archived third-party website code are not bundled into the application. This is a new implementation, not a PSD editor or the missing Printopoly server.

Independent project; not affiliated with the Monopoly brand or its owners. Uploaded reference artwork remains attributed to its original creators. Noto Sans is distributed under the SIL Open Font License; its notice is in `src/fonts/LICENSE.txt`. UI fonts and other libraries retain their package licenses.
