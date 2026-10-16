"""Import donutheist/monopoly-vectors illustration paths.
Usage: python scripts/extract-classic-events.py /path/to/monopoly-vectors
Requires Pillow, potracer, and the project's Node dependencies.
Four upstream SVGs contain a filled rectangle; re-trace their PNG alpha masks.
"""
import hashlib,json,re,subprocess,sys,xml.etree.ElementTree as ET
from pathlib import Path
from PIL import Image
import potrace
root=Path(sys.argv[1]);project=Path(__file__).resolve().parents[1]
repaired={'Community Chest - Advance To Go','Community Chest - Bank Error In Your Favor','Community Chest - Xmas Fund Matures','Community Chest - You Inherit $100'}
items={}
def point(p):return f'{p.x:.3f} {p.y:.3f}'
for file in sorted((root/'SVG').glob('*.svg')):
 tree=ET.parse(file).getroot();viewbox=[float(n) for n in tree.get('viewBox').split()];deck='chance' if file.stem.startswith('Chance - ') else 'chest';label=file.stem.split(' - ',1)[1];key=deck+'-'+re.sub(r'[^a-z0-9]+','-',label.lower()).strip('-')
 item={'deck':deck,'label':label,'viewBox':viewbox,'file':file.name,'sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'method':'upstream-svg'}
 if file.stem in repaired:
  png=root/'PNG'/(file.stem+'.png');im=Image.open(png).convert('RGBA');curves=potrace.Bitmap(im.getchannel('A').point(lambda a:0 if a>127 else 255).convert('1')).trace(turdsize=2,opttolerance=.2);parts=[]
  for curve in curves:
   parts.append('M'+point(curve.start_point))
   for segment in curve:
    parts.append(('L'+point(segment.c)+' L'+point(segment.end_point)) if segment.is_corner else ('C'+point(segment.c1)+' '+point(segment.c2)+' '+point(segment.end_point)))
   parts.append('Z')
  item.update(paths=[' '.join(parts)],matrix=[1,0,0,1,0,0],viewBox=[0,0,*im.size],method='repaired-png-alpha-trace',pngSha256=hashlib.sha256(png.read_bytes()).hexdigest())
 else:
  transforms=[el.get('transform') for el in tree.iter() if el.get('transform')];expected=f'translate(0.000000,{viewbox[3]:.6f}) scale(0.100000,-0.100000)';assert transforms==[expected],(file,transforms)
  assert {el.tag.rsplit('}',1)[-1] for el in tree.iter()}<={'svg','g','path','metadata'}
  item.update(paths=[el.get('d') for el in tree.iter('{http://www.w3.org/2000/svg}path')],matrix=[.1,0,0,-.1,0,viewbox[3]])
 items[key]=item
code="""import fs from 'node:fs';import svgpath from 'svgpath';const data=JSON.parse(fs.readFileSync(0,'utf8'));for(const a of Object.values(data)){a.paths=a.paths.map(d=>svgpath(d).matrix(a.matrix).round(3).toString());delete a.matrix;}fs.writeFileSync(process.argv[1],JSON.stringify(data)+'\\n');"""
out=project/'src/reference-assets/classic-events.json';subprocess.run(['node','--input-type=module','-e',code,str(out)],input=json.dumps(items),text=True,cwd=project,check=True)
print(out,len(items),'illustrations;',len(repaired),'repaired;',out.stat().st_size,'bytes')
