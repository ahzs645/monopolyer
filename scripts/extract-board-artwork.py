"""Build an editable template from the supplied 6000px PNG and PSD layer geometry.
Usage: python scripts/extract-board-artwork.py TEMPLATE_DIRECTORY [psd]
Requires Pillow, numpy, psd-tools. No source font is substituted during extraction.
"""
import sys,io,json,base64,math
from pathlib import Path
import numpy as np
from PIL import Image,ImageFilter
from psd_tools import PSDImage
root=Path(sys.argv[1]);psd_mode=len(sys.argv)>2 and sys.argv[2]=='psd';dest=Path(__file__).resolve().parents[1]/('src/reference-assets/board-psd.json' if psd_mode else 'src/reference-assets/board.json')
p=PSDImage.open(root/'monopoly.psd');im=p.topil().convert('RGBA') if psd_mode else Image.open(root/'image001.png').convert('RGBA');rgb=np.array(im)[:,:,:3];bg=tuple(rgb[3000,3000]);ink=tuple(rgb[3000,814]) if psd_mode else (0,0,0);ls=list(p.descendants());base=im.copy()
def png(a):
 b=io.BytesIO();a.save(b,format='PNG',optimize=True);return 'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
def asset(a,x=0,y=0):return {'src':png(a),'x':x,'y':y,'w':a.width,'h':a.height}
def transparent(a):
 a=np.array(a);a[np.all(a[:,:,:3]==bg,axis=2),3]=0;return Image.fromarray(a)
def crop(box):return asset(transparent(im.crop(box)),box[0],box[1])
def erase(box):base.paste((*bg,255),box)
def box(l,pad=3):return (max(0,l.left-pad),max(0,l.top-pad),min(6000,l.right+pad),min(6000,l.bottom+pad))
# Stable tile IDs remain clockwise from GO, irrespective of source layer order.
name_layers={1:158,3:159,6:160,8:161,9:162,11:163,13:164,14:165,16:166,18:167,19:168,21:169,23:170,24:171,26:172,27:173,29:174,31:175,32:176,34:177,37:178,39:179,2:182,17:185,33:192,7:196,22:198,36:204,28:206,12:207,35:209,5:210,15:211,25:212,4:215,38:216}
price_layers=dict(zip([1,3,5,6,8,9,11,12,13,14,15,16,18,19,21,23,24,25,26,27,28,29,31,32,34,35,37,38,39],range(218,247)))
art_boxes={0:[(5362,5386,5825,5850),(5232,5867,5967,5955)],10:[(214,5192,820,5792)],20:[(171,191,646,634)],30:[(5289,272,5811,653)],5:[box(ls[186])],15:[box(ls[188])],25:[box(ls[189])],35:[box(ls[187])],12:[box(ls[61])],28:[box(ls[62])],7:[(1843,5401,2228,5966)],22:[(1374,46,1760,611)],36:[(5396,3319,5961,3705)],2:[box(ls[253])],17:[box(ls[254])],33:[box(ls[255])]}
art={}
for tile,boxes in art_boxes.items():
 art[tile]=[crop(b) for b in boxes]
 for b in boxes:erase(b)
# Isolate the original UNBCOPOLY title by its ink, retaining actual PNG edges.
accent=(15,122,187) if psd_mode else (0,87,61);region=(1700,1400,4400,4500);a=np.array(im.crop(region));c=a[:,:,:3].astype(float);coverage=(bg[0]-c[:,:,0])/(bg[0]-accent[0]);pred=np.array(bg)+(np.array(accent)-np.array(bg))*coverage[:,:,None];match=(np.max(abs(c-pred),axis=2)<4)&(coverage>.002)&(coverage<=1.02)
match=(np.asarray(Image.fromarray((match*255).astype('uint8')).filter(ImageFilter.MaxFilter(7)))>0)&np.any(a[:,:,:3]!=bg,axis=2)
ys,xs=np.where(match);titlebox=(region[0]+int(xs.min()),region[1]+int(ys.min()),region[0]+int(xs.max())+1,region[1]+int(ys.max())+1)
mask=np.zeros((6000,6000),bool);mask[region[1]:region[3],region[0]:region[2]]=match
title=np.array(im);title[~mask,3]=0;title=Image.fromarray(title).crop(titlebox);titlealpha=np.zeros((6000,6000),np.uint8);titlealpha[region[1]:region[3],region[0]:region[2]]=np.where(match,np.clip(coverage*255,0,255),0).astype('uint8');tint=Image.new('RGBA',(6000,6000),'white');tint.putalpha(Image.fromarray(titlealpha));title_data=asset(title,*titlebox[:2]);title_data['mask']=png(tint.crop(titlebox))
b=np.array(base);b[mask]=(*bg,255);base=Image.fromarray(b)
# Split pure source ink and palette pixels into masks. Original antialias pixels
# remain untouched, so the unmodified template reconstructs the supplied PNG.
samples=[(4900,5280),(2500,5280),(700,4940),(700,2500),(1000,700),(3450,700),(5250,1000),(5250,3950)]
colors=[tuple(int(v) for v in rgb[y,x]) for x,y in samples];layers=[]
for color in [bg,ink,*colors]:
 b=np.array(base);selection=np.all(b[:,:,:3]==color,axis=2)&(b[:,:,3]>0);
 if color!=ink:b[selection,3]=0
 base=Image.fromarray(b)
 if color==bg:continue
 ys,xs=np.where(selection);bounds=(int(xs.min()),int(ys.min()),int(xs.max())+1,int(ys.max())+1);alpha=Image.fromarray((selection*255).astype('uint8')).crop(bounds);m=Image.new('RGBA',alpha.size,'white');m.putalpha(alpha);layers.append({**asset(m,*bounds[:2]),'color':'#%02x%02x%02x'%color})
fields={}
for tile,idx in name_layers.items():
 l=ls[idx];b=box(l);fields.setdefault(tile,{})['name']={'box':b,'original':l.text,'src':crop(b),'rotation':0 if tile<10 else 90 if tile<20 else 180 if tile<30 else 270}
for tile,idx in price_layers.items():
 l=ls[idx];b=box(l);fields.setdefault(tile,{})['price']={'box':b,'src':crop(b),'rotation':0 if tile<10 else 90 if tile<20 else 180 if tile<30 else 270}
# Original split corner captions and additional instructions stay editable.
for tile,indices in {0:[118],10:[60],20:[64,65],30:[120,121]}.items():
 fields.setdefault(tile,{})['corner']=[{'box':box(ls[i]),'src':asset(ls[i].topil().convert('RGBA'),ls[i].left,ls[i].top)} for i in indices]
fields[0]['name']={'box':(5362,5386,5825,5850),'rotation':-45};fields[10]['name']={'box':box(ls[60]),'rotation':45};fields[20]['name']={'box':(45,39,710,717),'rotation':135};fields[30]['name']={'box':(5248,69,5932,747),'rotation':225}
fields[4]['tax']={'box':box(ls[214]),'src':crop(box(ls[214]))}
decks={k:{'box':box(ls[i]),'src':crop(box(ls[i]))} for k,i in [('chance',15),('chest',26)]}
# Source letter shapes for renamed spaces. Cached complete labels remain in base.
glyphs={}
def runs(v):
 result=[];start=None
 for i,on in enumerate([*v,False]):
  if on and start is None:start=i
  if not on and start is not None:result.append((start,i));start=None
 return result
for idx in name_layers.values():
 l=ls[idx];raw=l.topil().convert('RGBA');angle=round(math.degrees(math.atan2(l.transform[1],l.transform[0]))/90)*90;raw=raw.rotate(angle,expand=True);alpha=np.asarray(raw)[:,:,3];rows=runs((alpha>8).any(axis=1));strings=[s.strip().upper() for s in l.text.replace('\x03','\r').split('\r') if s.strip()]
 if len(rows)!=len(strings):continue
 for text,(top,bottom) in zip(strings,rows):
  row=raw.crop((0,top,raw.width,bottom));a=np.asarray(row)[:,:,3];cols=runs((a>128).any(axis=0));chars=[c for c in text if not c.isspace()]
  if len(cols)!=len(chars):continue
  for ch,(left,right) in zip(chars,cols):
   if ch in glyphs:continue
   g=row.crop((left,0,right,bottom-top));glyphs[ch]=asset(g)
price_glyphs={};price_prefixes={}
for idx in price_layers.values():
 l=ls[idx];raw=l.topil().convert('RGBA');angle=round(math.degrees(math.atan2(l.transform[1],l.transform[0]))/90)*90;raw=raw.rotate(angle,expand=True);a=np.asarray(raw)[:,:,3];cols=runs((a>128).any(axis=0));prefix='PAY' if l.text.startswith('PAY') else 'PRICE';n=1 if prefix=='PAY' else 5;chars=list(l.text[len(prefix):].strip())
 if len(cols)!=n+len(chars):continue
 if prefix not in price_prefixes:price_prefixes[prefix]=asset(raw.crop((cols[0][0],0,cols[n-1][1],raw.height)))
 for ch,(left,right) in zip(chars,cols[n:]):
  if ch not in price_glyphs:price_glyphs[ch]=asset(raw.crop((left,0,right,raw.height)))
result={'background':'#%02x%02x%02x'%bg,'accent':'#%02x%02x%02x'%accent,'groups':['#%02x%02x%02x'%c for c in colors],'base':asset(base),'ink':layers[0],'colors':layers[1:],'art':art,'title':title_data,'fields':fields,'decks':decks,'glyphs':glyphs,'priceGlyphs':price_glyphs,'pricePrefixes':price_prefixes}
dest.write_text(json.dumps(result,separators=(',',':')));print(dest,dest.stat().st_size,'bytes');print('palette',result['background'],result['groups']);print('title',titlebox,'glyphs',''.join(sorted(glyphs)))
