# Supplied money reference review

All seven supplied files contain one US Letter page with ten vector bills and zero embedded raster images. The actual bills share a 257.5 × 122.50049 point outer box (90.84 × 43.22 mm including a half-point border allowance). Their page offsets differ, so the extraction measures each first bill independently rather than assuming a common crop.

The SVGs in `public/money-reference` retain native paths and outline the original PDF text. Source bounds and input hashes are recorded in `manifest.json`; the untouched originals are kept alongside the SVGs. The default bill preview and printable money PDF use these SVGs. Optional new denomination values, bank names and board names use live serif text; source denomination lettering remains unchanged when the value has not been edited.

## Overlay validation

A one-of-each export was compared with independent crops of the seven original PDFs using the same MuPDF renderer at 288 DPI. The exported PDF contained zero raster images. Original and exported bills were aligned at their physical dimensions, without image registration or adjusting the images to reduce differences.

| Bill | Mean absolute channel difference / 255 | Pixels differing by more than 32 |
| --- | ---: | ---: |
| 1 | 0.135 | 0.157% |
| 5 | 0.807 | 0.154% |
| 10 | 0.347 | 0.155% |
| 20 | 0.567 | 0.134% |
| 50 | 0.362 | 0.140% |
| 100 | 0.951 | 0.146% |
| 500 | 0.973 | 0.156% |

These are close source matches, not zero-difference raster copies: PDF-to-SVG color conversion and outlining/re-rendering small source lettering create minor differences. The checked-in browser fixtures also compare each current SVG preview with an independent original-PDF render; those checks allow for Chromium/MuPDF antialiasing differences.

Reproduce after the browser test creates `test-results/all-seven-reference-bills.pdf`:

```sh
python scripts/compare-money-overlays.py test-results/all-seven-reference-bills.pdf money-review
```

The script produces a JSON report, full-size per-denomination source/export/overlay/difference PNGs, and `all-bills-overlay.png`. It rejects PDFs with raster images, mean differences above 1.2/255, or more than 0.3% of pixels differing by over 32.
