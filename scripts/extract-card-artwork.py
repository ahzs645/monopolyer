"""Extract cached PSD lettering/art. Usage: python scripts/extract-card-artwork.py TEMPLATE_DIRECTORY
Requires psd-tools, Pillow, numpy. No substitute fonts are rasterized.
"""
import sys,json,base64,io
from pathlib import Path
from PIL import Image,ImageDraw,ImageFilter
import numpy as np
from psd_tools import PSDImage
root=Path(sys.argv[1]);out=Path(__file__).resolve().parents[1]/'src/reference-assets/cards.json'
p=PSDImage.open(root/'the_property_cards.psd');e=PSDImage.open(root/'the community chest and chance.psd')
data={'width':788,'height':900,'fonts':{},'art':{}}
def png(im):
 b=io.BytesIO();im.save(b,format='PNG',optimize=True);return 'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
def asset(im,x=0,y=0):return {'src':png(im),'x':x,'y':y,'w':im.width,'h':im.height}
def runs(v):
 a=[];start=None
 for i,on in enumerate([*v,False]):
  if on and start is None:start=i
  if not on and start is not None:a.append((start,i));start=None
 return a
flat=p.topil().convert('RGBA');frame=flat.copy();draw=ImageDraw.Draw(frame);draw.rectangle((21,21,766,878),fill='white');data['art']['outer']=asset(frame)
header=flat.crop((38,36,750,199));draw=ImageDraw.Draw(header);draw.rectangle((3,3,708,159),fill=(0,0,0,0));data['art']['header']=asset(header,38,36)
for doc in [p,e]:
 for l in doc.descendants():
  if l.kind!='type':continue
  im=l.topil().convert('RGBA');alpha=np.array(im)[:,:,3];yr=runs((alpha>0).any(axis=1));strings=[(i,s) for i,s in enumerate(l.text.strip('\r').split('\r')) if s.strip()]
  if len(yr)!=len(strings):continue
  style=l.engine_dict['StyleRun']['RunArray'][0]['StyleSheet']['StyleSheetData'];font=l.resource_dict['FontSet'][style['Font']]['Name'].value;fd=data['fonts'].setdefault(font,{'lines':{},'glyphs':{}})
  a,b,c,d,tx,ty=l.transform;leading=float(style.get('Leading',60));size=float(style['FontSize']);runstyles=[]
  for r,n in zip(l.engine_dict['StyleRun']['RunArray'],l.engine_dict['StyleRun']['RunLengthArray']):runstyles += [r['StyleSheet']['StyleSheetData']]*n
  offset=0
  for (i,s),(top,bottom) in zip(strings,yr):
   rendered=''.join(ch.upper() if runstyles[min(offset+j,len(runstyles)-1)].get('FontCaps',0)==2 else ch for j,ch in enumerate(s));offset+=len(s)+1
   row=im.crop((0,top,im.width,bottom));bounds=row.getbbox();row=row.crop(bounds);x=l.left+bounds[0];y=l.top+top;baseline=ty+i*leading*d
   if doc is p and l.is_visible() and y>200:row=flat.crop((x,y,x+row.width,y+row.height))
   align=['left','right','center'][int(l.engine_dict['ParagraphRun']['RunArray'][0]['ParagraphSheet']['Properties'].get('Justification',0))%3]
   entry={**asset(row,x,y),'anchorX':tx,'align':align,'baseline':baseline,'size':size,'scaleY':d,'text':rendered};key=rendered.strip().lower()
   if font in ['Cornerstone','KabobExtrabold'] or key=='title deed':
    mask=im.crop((bounds[0],top,bounds[2],bottom)).getchannel('A');white=Image.new('RGBA',row.size,'white');white.putalpha(mask);ink=Image.new('RGBA',row.size,(4,7,7,255));ink.putalpha(mask);entry.update(white=png(white),black=png(ink))
   if key not in fd['lines']:fd['lines'][key]=entry
   raw=im.crop((bounds[0],top,bounds[2],bottom));ar=np.asarray(raw)[:,:,3];xr=runs((ar>8).any(axis=0));chars=[ch for ch in rendered if not ch.isspace()]
   if len(xr)!=len(chars):continue
   for ch,(left,right) in zip(chars,xr):
    if ch in fd['glyphs']:continue
    glyph=raw.crop((left,0,right,raw.height));bbox=glyph.getbbox();glyph=glyph.crop(bbox);mask=glyph.getchannel('A');black=Image.new('RGBA',glyph.size,(4,7,7,255));black.putalpha(mask);white=Image.new('RGBA',glyph.size,'white');white.putalpha(mask)
    fd['glyphs'][ch]={'src':png(black),'white':png(white),'w':glyph.width,'h':glyph.height,'dy':y+bbox[1]-baseline,'size':size,'scaleY':d}
def layer_art(group):
 canvas=Image.new('RGBA',p.size)
 def visit(g):
  for l in g:
   if not l.visible:continue
   if l.is_group():visit(l);continue
   im=l.topil()
   if im is None:continue
   im=im.convert('RGBA');fx=l.tagged_blocks.get_data(b'lfx2');stroke=fx.get(b'FrFX') if fx else None
   if stroke and bool(stroke.get(b'enab')):
    radius=round(float(stroke[b'Sz  ']));pad=radius+1;mask=Image.new('L',(im.width+2*pad,im.height+2*pad));mask.paste(im.getchannel('A'),(pad,pad));outline=Image.new('RGBA',mask.size,(4,7,7,255));outline.putalpha(mask.filter(ImageFilter.MaxFilter(radius*2+1)));canvas.alpha_composite(outline,(l.left-pad,l.top-pad))
   canvas.alpha_composite(im,(l.left,l.top))
 visit(group);bbox=canvas.getbbox();return asset(canvas.crop(bbox),bbox[0],bbox[1])
for name in ['train3','faucet','lightbulb']:
 g=next(l for l in p.descendants() if l.name==name);data['art'][name]=layer_art(g)
l=next(l for l in p.descendants() if l.name=='Shape 2');data['art']['rule']=asset(l.topil().convert('RGBA'),l.left,l.top)
for font,fd in data['fonts'].items():fd['gap']=5 if font=='Cornerstone' else 3 if font=='KabobLight' else 2;fd['space']=24 if font=='Cornerstone' else 15
out.write_text(json.dumps(data,separators=(',',':')));print(out,out.stat().st_size)
for n,f in data['fonts'].items():print(n,len(f['lines']),'lines; glyphs:', ''.join(sorted(f['glyphs'])))
