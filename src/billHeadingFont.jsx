import React,{useEffect,useState} from 'react';
import opentype from 'opentype.js';
import source from './reference-assets/money-heading.json';
import regular from './fonts/regular';

let uploaded,fontFallback,initialized=false;
const listeners=new Set(),storageKey='monopolyer.bill-font.Myriad-Roman';
const bytes=base64=>Uint8Array.from(atob(base64),c=>c.charCodeAt(0));
function parse(base64){return opentype.parse(bytes(base64).buffer);}
function sourceFont(font){const names=font.names.postScriptName||{};return Object.values(names).some(n=>/^(Myriad-Roman|MyriadPro-Regular)$/i.test(n));}
function install(base64){const font=parse(base64);if(!sourceFont(font))throw new Error('Choose Myriad-Roman or MyriadPro-Regular to match the source bill lettering.');uploaded=font;for(const fn of listeners)fn(font);}
export function useBillFont(){const [font,setFont]=useState(uploaded);useEffect(()=>{listeners.add(setFont);if(!initialized){initialized=true;try{const data=localStorage.getItem(storageKey);if(data)install(data);}catch{}}return()=>listeners.delete(setFont);},[]);return font;}
export async function uploadBillFont(file){if(file.size>2000000)throw new Error('Use an OTF or TTF font under 2 MB.');const buffer=await file.arrayBuffer();const font=opentype.parse(buffer);if(!sourceFont(font))throw new Error('Choose Myriad-Roman or MyriadPro-Regular to match the source bill lettering.');let raw='';const data=new Uint8Array(buffer);for(let i=0;i<data.length;i+=8192)raw+=String.fromCharCode(...data.subarray(i,i+8192));const base64=btoa(raw);install(base64);try{localStorage.setItem(storageKey,base64);}catch{throw new Error('Font loaded for this session. Browser storage is full; keep the font file to reload it.');}}
export const headingWording=value=>String(value).replace(/\s+/g,' ').trim().toUpperCase();
export function missingBillGlyphs(value){return [...new Set([...headingWording(value)].filter(c=>!source.glyphs[c]&&!(uploaded?.charToGlyphIndex(c))))];}
function fontGlyph(font,c){const g=font.charToGlyph(c);return {d:g.getPath(0,0,1).toPathData(6),width:g.advanceWidth/font.unitsPerEm,down:true};}
export function curvedBillHeading(value){
 const text=headingWording(value),missing=missingBillGlyphs(value);fontFallback??=parse(regular);
 const glyphs=[...text].map(c=>source.glyphs[c]||fontGlyph(uploaded?.charToGlyphIndex(c)?uploaded:fontFallback,c));
 const tracking=.13,units=glyphs.reduce((n,g)=>n+g.width,0)+Math.max(0,glyphs.length-1)*tracking;
 const sx=Math.min(8.75,54/Math.max(.001,units)),sy=sx/1.25,width=units*sx,r=source.radius,[cx,cy]=source.center;let cursor=-width/2;
 const paths=glyphs.map((g,i)=>{const advance=g.width*sx,angle=(cursor+advance/2)/r,x=cx+r*Math.sin(angle),y=cy-r*Math.cos(angle);cursor+=advance+tracking*sx;return {char:text[i],d:g.d,transform:`translate(${x} ${y}) rotate(${angle*180/Math.PI}) translate(${-advance/2} 0) scale(${sx} ${g.down?sy:-sy})`};});
 return {text,missing,paths};
}
export function BillFontControls({value,onNotice}){const loaded=useBillFont(),missing=missingBillGlyphs(value);return <details className="card-font-controls"><summary>Curved bill lettering · {missing.length?'matching font needed':'source letters available'}</summary><p>Original PDF letters and missing-letter outlines from your supplied Myriad-Roman font follow the source heading curve. {missing.length?`Missing source letters: ${missing.join(' ')}. These use a fallback until you load the matching font.`:'All letters in this heading are covered.'}</p><label><strong>Myriad-Roman / MyriadPro-Regular</strong><span>{loaded?'Loaded on this device':'Supplied Myriad outlines included'}</span><input aria-label="Load bill heading font" type="file" accept=".otf,.ttf,font/otf,font/ttf" onChange={async e=>{const file=e.target.files?.[0];e.target.value='';if(file)try{await uploadBillFont(file);onNotice?.('Bill font loaded. Heading exports contain vector outlines.');}catch(err){onNotice?.(err.message);}}}/></label><p>Font files stay on this device. Generated PDF headings are outlines and retain their appearance.</p></details>;}
