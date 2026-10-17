import opentype from 'opentype.js';
import bodoni from './fonts/bodoni-bold';
import notoBold from './fonts/bold';
import {curvedBillHeading,missingBillGlyphs,straightBillFooter} from './billHeadingFont';
export const MONEY_VALUES=[1,5,10,20,50,100,500];
export const MONEY_COLORS=['#ffffff','#fbd5e3','#fcf373','#c9decf','#c6e0e8','#f1cf9d','#ffcb20'];
export const MONEY_WIDTH=257.5,MONEY_HEIGHT=122.50049;
export const moneyReferenceUrl=(index,original=false)=>`${import.meta.env.BASE_URL}money-reference/${MONEY_VALUES[index]}${original?'-original.pdf':'.svg'}`;
const templates=new Map();
export function loadMoneyTemplate(index){if(!templates.has(index))templates.set(index,fetch(moneyReferenceUrl(index)).then(r=>{if(!r.ok)throw new Error('The reference bill could not be loaded.');return r.text();}).catch(e=>{templates.delete(index);throw e;}));return templates.get(index);}
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
let valueFonts;
const parseFont=base64=>opentype.parse(Uint8Array.from(atob(base64),c=>c.charCodeAt(0)).buffer);
// Edited values are outlines from a bundled serif with lining figures, so bills
// look the same on every system and digits never cross the original frames.
function label(value,x,y,width,size){
 valueFonts??=[parseFont(bodoni),parseFont(notoBold)];
 const text=String(value),glyphs=[...text].map(c=>{const font=valueFonts.find(f=>f.charToGlyphIndex(c))||valueFonts[0];return {font,glyph:font.charToGlyph(c)};});
 const units=glyphs.reduce((n,{font,glyph})=>n+glyph.advanceWidth/font.unitsPerEm,0),fontSize=Math.min(size,width/Math.max(.001,units));let cursor=x-units*fontSize/2;
 const d=glyphs.map(({font,glyph})=>{const path=glyph.getPath(cursor,y,fontSize).toPathData(3);cursor+=glyph.advanceWidth/font.unitsPerEm*fontSize;return path;}).join('');
 return `<g data-bill-value="${escape(text)}"><title>${escape(text)}</title><path d="${d}"/></g>`;
}
export function billHeading(board){
 const mode=board.money.headingMode||(board.money.personalize?'bank':'original');
 return {mode,value:mode==='board'?board.title:mode==='custom'?(board.money.headingText||''):mode==='bank'?board.money.bankName:'MONOPOLY',color:board.money.headingColor||'#000000'};
}
export function billFontStatus(board){const heading=billHeading(board);return board.money.style==='studio'?[]:[...new Set([...(heading.mode==='original'?[]:missingBillGlyphs(heading.value)),...(board.money.footerMode==='custom'?straightBillFooter(board.money.footerText||'').missing:[])])];}
export function moneyArtwork(template,board,index){
 const value=board.money.denominations[index],fill=board.money.monochrome?'#ffffff':board.money.tint?board.money.colors[index]:MONEY_COLORS[index];
 let svg=template;
 if(board.money.monochrome)svg=svg.replaceAll(MONEY_COLORS[index],'#ffffff').replaceAll('#231f20','#000000');
 else if(board.money.tint)svg=svg.replaceAll(`fill="${MONEY_COLORS[index]}"`,`fill="${fill}"`);
 let edits='<defs><clipPath id="money-center-edit"><ellipse cx="128.75" cy="61.25" rx="52.1" ry="46.0"/></clipPath></defs>';
 if(board.money.footerMode&&board.money.footerMode!=='original'){
  // Remove only the source footer glyph uses, retaining its frame and paper.
  svg=svg.replace(/<use\b[^>]*\btransform="matrix\(3\.75,0,0,-3,[^,]+,113\.375\d*\)"[^>]*\/>/g,'');
  if(board.money.footerMode==='custom'){
   const footer=straightBillFooter(board.money.footerText||'');
   edits+=`<g data-money-footer="custom" data-footer-font="Myriad-Roman" aria-label="${escape(footer.text)}" fill="#000000"><title>${escape(footer.text)}</title>`+footer.paths.map(g=>`<path data-footer-letter="${escape(g.char)}" d="${g.d}" transform="${g.transform}"/>`).join('')+'</g>';
  }
 }
 if(value!==MONEY_VALUES[index]){
  edits+=`<g clip-path="url(#money-center-edit)"><rect x="83" y="38" width="91" height="46" fill="${fill}"/>`+label(value,128.75,81,84,53)+'</g>';
  edits+=`<rect x="28" y="24.25" width="36.5" height="19" fill="${fill}"/>`+label(value,46,42,34,22);
  edits+=`<rect x="193" y="79.25" width="36.5" height="19" fill="${fill}"/>`+label(value,211,96.5,34,22);
 }
 const heading=billHeading(board);
 if(heading.mode!=='original'){
  const curved=curvedBillHeading(heading.value),color=board.money.monochrome?'#000000':heading.color;
  edits+=`<g clip-path="url(#money-center-edit)"><rect x="94" y="15" width="72" height="16" fill="${fill}"/>`+`<g data-money-heading-source="${heading.mode}" data-heading-layout="source-curve" data-heading-font="${curved.missing.length?'source-with-fallback':'Myriad-Roman'}" fill="${color}" aria-label="${escape(heading.value)}"><title>${escape(heading.value)}</title>`+curved.paths.map(g=>`<path data-heading-letter="${escape(g.char)}" d="${g.d}" transform="${g.transform}"/>`).join('')+'</g></g>';
 }
 if(board.money.personalize)edits+=label(board.title,128.75,99,66,6);
 return svg.replace('</svg>',`<g data-money-customization="true">${edits}</g></svg>`);
}
export async function referenceMoneyPdf(board,startPdf){
 await import('svg2pdf.js');
 const active=MONEY_VALUES.map((_,i)=>i).filter(i=>board.money.quantities[i]*board.money.players>0);
 if(!active.length)throw new Error('Set at least one banknote quantity before exporting money.');
 const doc=startPdf(),w=MONEY_WIDTH/72*25.4,h=MONEY_HEIGHT/72*25.4;let count=0;
 for(const index of active){
  const svg=moneyArtwork(await loadMoneyTemplate(index),board,index),root=new DOMParser().parseFromString(svg,'image/svg+xml').documentElement;
  // Reuse the exact same vector bill on every copy, keeping print files small.
  const form='bill'+index;doc.beginFormObject(0,0,MONEY_WIDTH,MONEY_HEIGHT,new doc.Matrix(1,0,0,1,0,0));await doc.svg(root,{x:0,y:0,width:w,height:h});doc.endFormObject(form);
  for(let n=0;n<board.money.quantities[index]*board.money.players;n++,count++){
   if(count&&count%10===0)doc.addPage();
   if(count%10===0){doc.setFont('GameSans','normal');doc.setFontSize(7);doc.setTextColor(board.money.monochrome?'#555555':'#56665e');doc.text(board.title,10,7);doc.text('Money / '+(Math.floor(count/10)+1),200,7,{align:'right'});doc.text('Print at 100% / Actual size. Cut on the bill borders.',105,291,{align:'center'});}
   const x=(210-2*w-8)/2+(count%2)*(w+8),y=18+Math.floor((count%10)/2)*53;
   doc.doFormObject(form,new doc.Matrix(1,0,0,1,x*doc.internal.scaleFactor,(doc.internal.pageSize.getHeight()-y-h)*doc.internal.scaleFactor));
  }
 }
 return doc;
}
