"""Reuse the audited source-ink outlines for complete board text recoloring.
Default source pixels remain unchanged. Requires only Python's standard library.
"""
import json,hashlib,xml.etree.ElementTree as ET
from pathlib import Path
root=Path(__file__).resolve().parents[1];atlas=json.loads((root/'public/vector-assets/artwork.json').read_text());paths=[];indices={};boards={}
for name,key in [('board','campus'),('board-psd','photoshop')]:
 board=json.loads((root/f'src/reference-assets/{name}.json').read_text());art=atlas[hashlib.sha256(board['base']['src'].encode()).hexdigest()];svg=ET.fromstring('<svg>'+art['body']+'</svg>');items=[]
 for node in svg:
  assert node.tag.split('}')[-1]=='path'
  attrs={k:v for k,v in node.attrib.items() if k!='fill'}
  assert set(attrs)<=set(['d','transform','fill-rule'])
  if 'fill-rule' in attrs:attrs['fillRule']=attrs.pop('fill-rule')
  serialized=json.dumps(attrs,sort_keys=True)
  if serialized not in indices:indices[serialized]=len(paths);paths.append(attrs)
  items.append(indices[serialized])
 boards[key]=items
out={'method':'Existing audited traced-source-ink paths; used only when changing the source ink color.','paths':paths,'boards':boards}
(root/'src/reference-assets/board-ink-paths.json').write_text(json.dumps(out,separators=(',',':'))+'\n')
print('Unique paths:',len(paths),'bytes:',(root/'src/reference-assets/board-ink-paths.json').stat().st_size)
