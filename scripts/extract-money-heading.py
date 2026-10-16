"""Recover the embedded Myriad-Roman subset for curved bill headings.
Requires PyMuPDF and fontTools. No replacement glyphs are invented.
"""
import io,json,pathlib,fitz,argparse,hashlib
from fontTools.cffLib import CFFFontSet
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--extension-font',type=pathlib.Path,help='Supplied full Myriad-Roman TTF; adds missing outlines without embedding its font binary.')
args=parser.parse_args()
root=pathlib.Path(__file__).resolve().parents[1]
doc=fitz.open(root/'public/money-reference/1-original.pdf')
xref=doc[0].get_fonts()[0][0]
font=CFFFontSet();font.decompile(io.BytesIO(doc.extract_font(xref)[3]),None)
f=font[font.fontNames[0]]
chars={}
from fontTools.agl import toUnicode
for name in f.charset:
 char=toUnicode(name)
 if len(char)!=1:continue
 pen=SVGPathPen(None);cs=f.CharStrings[name];cs.draw(TransformPen(pen,(.001,0,0,.001,0,0)))
 chars[char]={'d':pen.getCommands(),'width':cs.width/1000}
out={'font':'Myriad-Roman','source':'Embedded subset from the supplied one-dollar PDF','radius':50.205916,'center':[128.685179,71.695054],'glyphs':chars}
if args.extension_font:
 raw=args.extension_font.read_bytes();ttf=TTFont(io.BytesIO(raw));names=[r.toUnicode() for r in ttf['name'].names if r.nameID==6]
 if 'Myriad-Roman' not in names:raise ValueError('The extension must identify as Myriad-Roman.')
 glyphs=ttf.getGlyphSet();scale=1/ttf['head'].unitsPerEm;added=[]
 for code,name in ttf.getBestCmap().items():
  char=chr(code)
  if code<32 or char in chars:continue
  pen=SVGPathPen(glyphs);glyphs[name].draw(TransformPen(pen,(scale,0,0,scale,0,0)))
  chars[char]={'d':pen.getCommands(),'width':glyphs[name].width*scale};added.append(char)
 out['extension']={'font':'Myriad-Roman','archive':'myriad-roman-regular.zip','sha256':hashlib.sha256(raw).hexdigest(),'addedGlyphs':''.join(added),'method':'Outlines from the user-supplied TTF; original PDF glyphs take precedence.'}
(root/'src/reference-assets/money-heading.json').write_text(json.dumps(out,separators=(',',':'))+'\n')
print('Recovered',len(chars),'source glyphs')
