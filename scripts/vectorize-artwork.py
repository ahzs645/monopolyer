"""Build path-only export assets. Requires pillow, numpy, psd-tools, vtracer.
Native embedded SVG smart objects are retained. Cached lettering/bitmap art
is traced at source resolution; these outlines do not recreate font files.
"""
import base64, hashlib, io, json, sys, time
from pathlib import Path
import xml.etree.ElementTree as ET
import numpy as np
from PIL import Image
import vtracer
from psd_tools import PSDImage
ROOT=Path(__file__).resolve().parents[1]
DEST=ROOT/'public/vector-assets';DEST.mkdir(exist_ok=True)
NS='http://www.w3.org/2000/svg';ET.register_namespace('',NS)
assets={};contexts={}
def collect(o,context=''):
 if isinstance(o,dict):
  for k,v in o.items():collect(v,context+'/'+k)
 elif isinstance(o,list):
  for i,v in enumerate(o):collect(v,context+'/'+str(i))
 elif isinstance(o,str) and o.startswith('data:image/png;base64,'):
  key=hashlib.sha256(o.encode()).hexdigest();assets[key]=o;contexts.setdefault(key,[]).append(context)
for name in ['board','board-psd','cards']:
 collect(json.loads((ROOT/f'src/reference-assets/{name}.json').read_text()),name)
# Older studio boards and replacement illustration choices use this catalog too.
artwork=(ROOT/'src/reference-assets/artwork.js').read_text()
collect(json.JSONDecoder().raw_decode(artwork.split('export const ORIGINAL_ARTWORK=',1)[1])[0],'legacy-artwork')
def inner(svg):
 r=ET.fromstring(svg)
 return ''.join(ET.tostring(c,encoding='unicode') for c in r if c.tag.split('}')[-1] in ['path','g','rect','circle','ellipse','polygon','polyline','line','defs'])
def trace_mask(selection,color):
 if not selection.any():return ''
 raw=Image.fromarray(np.where(selection,0,255).astype('uint8'));b=io.BytesIO();raw.save(b,format='PNG')
 s=vtracer.convert_raw_image_to_svg(b.getvalue(),img_format='png',colormode='binary',filter_speckle=0,mode='spline',corner_threshold=60,length_threshold=1,splice_threshold=45,path_precision=2)
 return inner(s).replace('fill="#000000"',f'fill="{color}"')
# Recover the five embedded SVG smart objects with their original affine placement.
native={};psd_path=Path(sys.argv[1]) if len(sys.argv)>1 else Path('/workspace/reference/0/monopoly_photoshop_template/monopoly.psd')
p=PSDImage.open(psd_path);layers=list(p.descendants())
for catalog in ['board','board-psd']:
 data=json.loads((ROOT/f'src/reference-assets/{catalog}.json').read_text())
 for tile,idx in [(12,61),(5,186),(35,187),(15,188),(25,189)]:
  a=data['art'][str(tile)][0];key=hashlib.sha256(a['src'].encode()).hexdigest();l=layers[idx];r=ET.fromstring(l.smart_object.data)
  vx,vy,vw,vh=map(float,r.attrib['viewBox'].split());
  if idx==61:vx,vy,vw,vh=0,0,66,66
  q=l.smart_object.transform_box;aa=(q[2]-q[0])/vw;bb=(q[3]-q[1])/vw;cc=(q[6]-q[0])/vh;dd=(q[7]-q[1])/vh;ee=q[0]-aa*vx-cc*vy-a['x'];ff=q[1]-bb*vx-dd*vy-a['y']
  native[key]=f'<g transform="matrix({aa} {bb} {cc} {dd} {ee} {ff})">{inner(l.smart_object.data)}</g>'
results={};started=time.time()
for n,(key,uri) in enumerate(assets.items()):
 im=Image.open(io.BytesIO(base64.b64decode(uri.split(',')[1]))).convert('RGBA');a=np.array(im);alpha=a[:,:,3]>127;rgb=a[:,:,:3]
 if key in native:s=native[key];method='native-svg'
 elif any(c.endswith('/base/src') for c in contexts[key]):
  # Base holds source ink and residual palette antialias fringes. Only ink
  # belongs here; group fills and illustrations are separate export layers.
  # Ink pixels are darker than all other palette colors. Drop pale edge fringes.
  selected=alpha&(rgb.astype(float).mean(axis=2)<65)
  s=trace_mask(selected,'#040707' if contexts[key][0].startswith('board-psd') else '#000000');method='traced-source-ink'
 else:
  visible=rgb[alpha]
  colors,counts=np.unique(visible,axis=0,return_counts=True) if len(visible) else (np.empty((0,3)),[])
  dominant=colors[np.argsort(counts)[-1]] if len(colors) else [0,0,0]
  # Cached glyphs and alpha masks are a single solid ink with antialiased alpha.
  single=len(colors)<2 or (len(visible) and max(counts)/len(visible)>.995)
  if single:s=trace_mask(alpha,'#%02x%02x%02x'%tuple(dominant));method='traced-outline'
  elif any('/title/' in c for c in contexts[key]):
   # Recover coverage relative to the source mint background, including rotation.
   bg=np.array([203,232,224]);color=dominant.astype(float);delta=color-bg;den=np.dot(delta,delta)
   cover=np.sum((rgb.astype(float)-bg)*delta,axis=2)/max(1,den)
   s=trace_mask(alpha&(cover>.5),'#%02x%02x%02x'%tuple(dominant));method='traced-outline'
  else:
   # Quantize only multicolor illustrations, retaining separate filled paths.
   clean=im.quantize(colors=12,method=Image.Quantize.FASTOCTREE).convert('RGBA');b=io.BytesIO();clean.save(b,format='PNG')
   s=inner(vtracer.convert_raw_image_to_svg(b.getvalue(),img_format='png',colormode='color',hierarchical='stacked',filter_speckle=2,color_precision=5,layer_difference=32,mode='spline',corner_threshold=60,length_threshold=1,splice_threshold=45,path_precision=2));method='traced-color'
 results[key]={'width':im.width,'height':im.height,'body':s,'method':method}
 if n%75==0:print(n,'/',len(assets),round(time.time()-started,1),'seconds',flush=True)
(DEST/'artwork.json').write_text(json.dumps(results,separators=(',',':')))
(DEST/'audit.json').write_text(json.dumps({'assets':len(results),'methods':{m:sum(v['method']==m for v in results.values()) for m in sorted(set(v['method'] for v in results.values()))},'note':'Native SVGs retain source paths. Raster-only source lettering/art is traced into outlines; tracing can differ at edges. New wording still depends on original fonts or available cached characters. No raster image is allowed in vector exports.'},indent=2))
print('Wrote',len(results),'assets,', (DEST/'artwork.json').stat().st_size,'bytes',flush=True)
