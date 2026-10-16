# Original artwork and font overlay review

Open [the interactive review](https://projects.ahmadjalil.com/monopolyer/review/font-overlays/) to choose a comparison and change opacity. Measurements use full-resolution inputs; viewer images are reduced for browsing.

The original-pixel campus and Photoshop boards each reproduce their independent 6000 × 6000 reference with zero changed pixels. The clean geometric grid intentionally differs at border/strip edges. Native font recreation is tested separately by forcing original words through the edited-text renderer; these diagnostic differences do not replace the cached source artwork.

The forced board-text row measures a 390 × 505 crop. Full-board rows measure 6000 × 6000 pixels.

| Comparison | Mean RGB error /255 | Pixels differing by >32 |
|---|---:|---:|
| Campus board: original-pixel mode | 0.0000 | 0.0000% |
| Photoshop board: original-pixel mode | 0.0000 | 0.0000% |
| Campus board: clean grid | 2.2616 | 1.1689% |
| Property deed: original source lettering | 0.2854 | 0.0000% |
| Event card: original source lettering | 0.6347 | 0.7257% |
| Board labels and edited prices: forced rebuild | 9.2178 | 6.3503% |
| Property deed: forced font recreation | 4.6271 | 3.6953% |
| Event card: native font with original whitespace | 6.7860 | 4.0652% |
| Northern Health: source export vs vector export | 0.9014 | 0.9892% |

Corrections found through overlays: edited prices retain source mixed-size glyphs; property labels use the original 66.11-unit font size, -50 tracking and source line spacing without an unnecessary multi-line size reduction; SVG card text preserves whitespace; the typed TITLE DEED line retains its horizontal scale and tracking.

Residual differences: forced board labels still have small horizontal ink-alignment offsets and rasterization differences; native card rebuilds differ from cached Photoshop text. Vector exports trace raster-only source artwork, so their edges are close rather than pixel-identical. The Northern Health logo/title, clean grid and monochrome renamed bills are intentional changes.

All six uploaded board/card fonts are included. The Myriad-Roman TTF supplies missing-letter outlines without embedding its font binary; original PDF glyphs take precedence. All letters in Northern Healthopoly are covered.

The seven unchanged exported bill PDFs have mean RGB error between 0.1346 and 0.9727 /255 against the original PDF crops, and contain zero raster images.

See `public/review/font-overlays/report.json`, `bill-pdf-report.json` and the reproducible review scripts in `scripts/`.
