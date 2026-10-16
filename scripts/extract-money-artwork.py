"""Extract one native-vector bill from each supplied PDF. Requires PyMuPDF.
Usage: python scripts/extract-money-artwork.py /path/to/folder/containing/pdfs
"""
import sys, pathlib, fitz, json, hashlib
source=pathlib.Path(sys.argv[1]); target=pathlib.Path(__file__).resolve().parents[1]/'public/money-reference'
target.mkdir(exist_ok=True)
names={1:'one',5:'five',10:'ten',20:'twenty',50:'fifty',100:'one-hundred',500:'five-hundred'}
manifest={}
for value,name in names.items():
 file=next(source.rglob(f'monopoly-money-{name}-dollar.pdf'))
 raw=file.read_bytes();(target/f'{value}-original.pdf').write_bytes(raw)
 doc=fitz.open(stream=raw,filetype='pdf');page=doc[0]
 # Include the 0.5 pt outer border. Remove the other nine bills before clipping.
 outer=page.get_drawings()[0]['rect']
 box=fitz.Rect(outer.x0-.5,outer.y0-.5,outer.x1+.5,outer.y1+.5)
 for r in [fitz.Rect(0,0,612,box.y0),fitz.Rect(0,box.y1,612,792),fitz.Rect(0,box.y0,box.x0,box.y1),fitz.Rect(box.x1,box.y0,612,box.y1)]:page.add_redact_annot(r,fill=False)
 page.apply_redactions(images=0,graphics=1,text=0);page.set_cropbox(box)
 svg=page.get_svg_image(text_as_path=True)
 (target/f'{value}.svg').write_text(svg)
 manifest[value]={'file':file.name,'sha256':hashlib.sha256(raw).hexdigest(),'width':box.width,'height':box.height,'sourceClip':list(box),'vector':True}
(target/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
