"""Compare a one-of-each exported money PDF to the seven original PDFs.
Requires PyMuPDF, Pillow, numpy. Usage: python scripts/compare-money-overlays.py exported.pdf output-folder
"""
import sys,json,pathlib,fitz,numpy as np
from PIL import Image,ImageChops,ImageDraw
root=pathlib.Path(__file__).resolve().parents[1];out=pathlib.Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True)
manifest=json.loads((root/'public/money-reference/manifest.json').read_text());export=fitz.open(sys.argv[1]);values=[1,5,10,20,50,100,500]
width,height=257.5,122.50049;mm=72/25.4
sheet=Image.new('RGB',(1560,7*220+40),'white');draw=ImageDraw.Draw(sheet)
for j,title in enumerate(['Uploaded PDF','Exported PDF','50% overlay','Difference × 4']):draw.text((j*390+8,10),title,fill='black')
results=[]
def crop(doc,box):
 copy=fitz.open();copy.insert_pdf(doc,from_page=0,to_page=0);page=copy[0];page.set_cropbox(fitz.Rect(box));pix=page.get_pixmap(matrix=fitz.Matrix(4,4),alpha=False);return Image.frombytes('RGB',[pix.width,pix.height],pix.samples).crop((0,0,1030,490))
for i,value in enumerate(values):
 original=fitz.open(root/f'public/money-reference/{value}-original.pdf');source=crop(original,manifest[str(value)]['sourceClip'])
 x=(210*mm-2*width-8*mm)/2+(i%2)*(width+8*mm);y=(18+(i//2)*53)*mm
 actual=crop(export,[x,y,x+width,y+height]);delta=np.abs(np.asarray(actual).astype(float)-np.asarray(source).astype(float));mae=float(delta.mean());changed=float(np.mean(np.max(delta,axis=2)>32));results.append({'denomination':value,'meanAbsoluteError':mae,'pixelsDifferingByMoreThan32':changed})
 overlay=Image.blend(source,actual,.5);difference=ImageChops.difference(source,actual).point(lambda n:min(255,n*4))
 for j,(label,img) in enumerate([('source',source),('export',actual),('overlay',overlay),('difference',difference)]):
  img.save(out/f'{value}-{label}.png');sheet.paste(img.resize((375,178),Image.Resampling.LANCZOS),(j*390+8,40+i*220))
 draw.text((8,40+i*220+182),f'{value}: mean difference {mae:.3f}/255; pixels >32: {changed:.2%}',fill='black')
 no_images=sum(len(page.get_images()) for page in export)==0
report={'export':pathlib.Path(sys.argv[1]).name,'reference':'Seven user-uploaded PDFs; original source bounds recorded in manifest.json','billSizePoints':[width,height],'pdfRasterImageCount':sum(len(page.get_images()) for page in export),'comparisons':results}
(out/'report.json').write_text(json.dumps(report,indent=2)+'\n');sheet.save(out/'all-bills-overlay.png');print(json.dumps(report,indent=2))
assert no_images,'The bill PDF contains raster images.'
assert all(r['meanAbsoluteError']<1.2 and r['pixelsDifferingByMoreThan32']<.003 for r in results),'The exported bills differ from the source artwork.'
