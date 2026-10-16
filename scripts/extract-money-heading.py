"""Recover the embedded Myriad-Roman subset for curved bill headings.
Requires PyMuPDF and fontTools. No replacement glyphs are invented.
"""
import io,json,pathlib,fitz
from fontTools.cffLib import CFFFontSet
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
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
(root/'src/reference-assets/money-heading.json').write_text(json.dumps(out,separators=(',',':'))+'\n')
print('Recovered',len(chars),'source glyphs')
