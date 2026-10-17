"""Measure the font review against independent source baselines and build an offline overlay viewer.
Usage: python scripts/summarize-font-review.py /path/to/review-output
Requires Pillow and NumPy. Render inputs with render-font-review.mjs first.
"""
import base64,io,json,pathlib,sys,html
import numpy as np
from PIL import Image,ImageChops,ImageDraw
repo=pathlib.Path(__file__).resolve().parents[1];root=pathlib.Path(sys.argv[1]);entries=[]
def load(path):return Image.open(path).convert('RGB')
def metrics(a,b):
 d=np.abs(np.asarray(a).astype('int16')-np.asarray(b).astype('int16'))
 return {'width':a.width,'height':a.height,'meanAbsoluteError':round(float(d.mean()),6),'changedPixels':int((d.max(2)>0).sum()),'pixelsOver32Percent':round(float((d.max(2)>32).mean()*100),6)}
def add(key,title,ref,current,note,box=None):
 a=load(ref);b=load(current)
 if box:a=a.crop(box);b=b.crop(box)
 m=metrics(a,b);entry={'key':key,'title':title,'note':note,**m};entries.append(entry)
 diff=ImageChops.difference(a,b).point(lambda x:min(255,x*4));w,h=a.size
 views=[('Original',a),('Current / rebuilt',b),('50% overlay',Image.blend(a,b,.5)),('Difference x4',diff)]
 thumbs=[]
 for label,im in views:
  thumb=im.copy();thumb.thumbnail((450,1050));thumbs.append((label,thumb))
 tw,th=thumbs[0][1].size;contact=Image.new('RGB',(tw*4,th+32),'white');draw=ImageDraw.Draw(contact)
 for i,(label,im) in enumerate(thumbs):contact.paste(im,(i*tw,32));draw.text((i*tw+8,9),label,fill='black')
 contact.save(root/(key+'-comparison.png'))
 def uri(image):
  image=image.copy();image.thumbnail((1300,1300));buf=io.BytesIO();image.save(buf,format='PNG',optimize=True);return 'data:image/png;base64,'+base64.b64encode(buf.getvalue()).decode()
 entry['original']=uri(a);entry['current']=uri(b);entry['difference']=uri(diff)
for style in ['campus','photoshop']:
 original=repo/'tests/fixtures'/f'original-{style}-board.png'
 add(style+'-exact',style.title()+' board: original-pixel mode',original,root/(style+'-source.png'),'Unchanged source artwork. Compared at the original 6000 x 6000 resolution.')
 add(style+'-clean',style.title()+' board: clean grid',original,root/(style+'-clean.png'),'Intentional geometric grid and color-band replacement. Text, title and illustrations still use source artwork.')
add('board-text','Board labels and edited prices: forced rebuild',root/'campus-source.png',root/'campus-native-labels.png','Diagnostic: original words are forced through the edited-text path. Original labels normally retain their cached pixels. The price adapter retains mixed-size source glyphs.',(4750,5480,5140,5985))
for kind,label in [('deed','Property deed'),('event','Event card')]:
 original=repo/'tests/e2e/psd-cards.spec.js-snapshots'/('property-psd.png' if kind=='deed' else 'event-psd.png')
 add(kind+'-exact',label+': original source lettering',original,root/(kind+'-source.png'),'Independent Photoshop composite baseline; original source lettering is retained.')
 add(kind+'-native',label+': forced font recreation',root/(kind+'-source.png'),root/(kind+'-native.png'),'Diagnostic: text caches are bypassed. Differences include native font rasterization and text layout; this is not the default unchanged-card renderer.')
add('event-native-reference','Event card: native font with original whitespace',root/'event-source.png',root/'event-native-reference.png','Diagnostic using the original text, source anchors and original trailing spaces, rather than the builder\'s rewrapped text.')
add('northern','Northern Health preset vs original',repo/'tests/fixtures/original-campus-board.png',root/'northern.png','Intentional changes: Northern Health SVG + opoly in #005699 and a clean geometric grid. The mint background and property palette are retained.')
add('northern-vector','Northern Health: source export vs vector export',root/'northern.png',root/'northern-vector.png','Measures traced source-art edges against the source-matched export. Vector tracing is not pixel-identical to the original raster artwork.')
for value in [1,5,10,20,50,100,500]:
 add('bill-'+str(value),str(value)+' bill: supplied PDF vs unchanged SVG',repo/'tests/fixtures/money'/f'{value}.png',root/f'bill-{value}-source.png','PDF-crop and browser SVG rasterizers differ at thin lines. Use the PDF overlay report for a PDF-to-PDF comparison.')
add('bill-northern','Northern Health bill vs original one-dollar bill',repo/'tests/fixtures/money/1.png',root/'bill-1-north.png','Intentional renamed curved heading using original Myriad outlines plus the supplied missing-letter outlines. The preset prints all denominations in black and white.')
report={'threshold':'Pixels over32 differ by more than32 on at least one RGB channel. MAE is on a0..255 scale. Original source comparisons and diagnostic rebuilds are distinct.','comparisons':[{k:v for k,v in e.items() if k not in ['original','current','difference']} for e in entries]}
(root/'report.json').write_text(json.dumps(report,indent=2)+'\n')
data=json.dumps(entries,separators=(',',':')).replace('</','<\\/')
page='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Monopolyer original-artwork overlay review</title><style>body{font:16px system-ui;margin:0;background:#f2f5f3;color:#18342b}main{max-width:1200px;margin:auto;padding:24px}h1{font-size:28px;margin:0 0 12px}label{display:block;margin:16px 0}select{font:inherit;max-width:100%;padding:8px}input{vertical-align:middle;width:240px}#stage{position:relative;background:white;border:1px solid #81938a;max-width:100%;margin:auto}#stage img{display:block;width:100%}#current{position:absolute;inset:0}#difference{display:none}#note{max-width:900px}#stats{font-family:monospace;padding:12px;background:#e2eae5}a{color:#005699}button{font:inherit;padding:8px;margin-right:8px}</style><main><h1>Original artwork overlay review</h1><p>These comparisons distinguish exact source rendering, intentional branding/grid changes, and forced font-recreation diagnostics. A zero difference in source mode does not imply that all retyped text is pixel-identical to Photoshop.</p><label>Comparison <select id="choice"></select></label><p id="note"></p><p id="stats"></p><label>Current layer opacity <input id="opacity" type="range" min="0" max="100" value="50"> <output id="value">50%</output></label><button id="showOriginal">Original</button><button id="showOverlay">50% overlay</button><button id="showCurrent">Current</button><button id="showDifference">Difference x4</button><div id="stage"><img id="original" alt="Original reference"><img id="current" alt="Current rendering"><img id="difference" alt="Difference amplified four times"></div></main><script>const entries=__DATA__;const $=id=>document.getElementById(id);entries.forEach((e,i)=>{const o=document.createElement('option');o.value=i;o.textContent=e.title;$('choice').append(o)});function opacity(n){$('opacity').value=n;$('value').textContent=n+'%';$('original').style.display='block';$('current').style.display='block';$('difference').style.display='none';$('current').style.opacity=n/100}function select(){const e=entries[$('choice').value];$('original').src=e.original;$('current').src=e.current;$('difference').src=e.difference;$('stage').style.width=Math.min(e.width,1100)+'px';$('note').textContent=e.note;$('stats').textContent=e.width+' x '+e.height+' pixels; mean difference '+e.meanAbsoluteError+'/255; pixels differing by >32: '+e.pixelsOver32Percent+'%; any changed pixels: '+e.changedPixels;opacity(50)}$('choice').onchange=select;$('opacity').oninput=e=>opacity(e.target.value);$('showOriginal').onclick=()=>opacity(0);$('showOverlay').onclick=()=>opacity(50);$('showCurrent').onclick=()=>opacity(100);$('showDifference').onclick=()=>{$('current').style.display='none';$('original').style.display='none';$('difference').style.display='block'};select();</script></html>'''.replace('__DATA__',data)
(root/'index.html').write_text(page)
print(json.dumps(report,indent=2))
# A lightweight hosted variant loads only the selected comparison images.
import hashlib
web=root/'web';(web/'images').mkdir(parents=True,exist_ok=True)
webentries=json.loads(data)
for entry in webentries:
 for key in ['original','current','difference']:
  raw=base64.b64decode(entry[key].split(',',1)[1]);name=hashlib.sha256(raw).hexdigest()[:20]+'.png';(web/'images'/name).write_bytes(raw);entry[key]='images/'+name
webdata=json.dumps(webentries,separators=(',',':')).replace('</','<\\/')
(web/'index.html').write_text(page.replace(data,webdata))
(web/'report.json').write_text(json.dumps(report,indent=2)+'\n')
