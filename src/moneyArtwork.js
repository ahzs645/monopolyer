export const MONEY_VALUES=[1,5,10,20,50,100,500];
export const MONEY_COLORS=['#ffffff','#fbd5e3','#fcf373','#c9decf','#c6e0e8','#f1cf9d','#ffcb20'];
export const MONEY_WIDTH=257.5,MONEY_HEIGHT=122.50049;
export const moneyReferenceUrl=(index,original=false)=>`${import.meta.env.BASE_URL}money-reference/${MONEY_VALUES[index]}${original?'-original.pdf':'.svg'}`;
const templates=new Map();
export function loadMoneyTemplate(index){if(!templates.has(index))templates.set(index,fetch(moneyReferenceUrl(index)).then(r=>{if(!r.ok)throw new Error('The reference bill could not be loaded.');return r.text();}).catch(e=>{templates.delete(index);throw e;}));return templates.get(index);}
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
function label(value,x,y,width,size){const fontSize=Math.min(size,width/Math.max(1,String(value).length*.62));return `<text x="${x}" y="${y}" text-anchor="middle" font-family="Georgia, Times New Roman, serif" font-weight="bold" font-size="${fontSize}">${escape(value)}</text>`;}
export function billHeading(board){
 const mode=board.money.headingMode||(board.money.personalize?'bank':'original');
 return {mode,value:mode==='board'?board.title:mode==='custom'?(board.money.headingText||''):mode==='bank'?board.money.bankName:'MONOPOLY',color:board.money.headingColor||'#000000'};
}
export function moneyArtwork(template,board,index){
 const value=board.money.denominations[index],fill=board.money.tint?board.money.colors[index]:MONEY_COLORS[index];
 let svg=template;
 if(board.money.tint)svg=svg.replaceAll(`fill="${MONEY_COLORS[index]}"`,`fill="${fill}"`);
 let edits='<defs><clipPath id="money-center-edit"><ellipse cx="128.75" cy="61.25" rx="52.1" ry="46.0"/></clipPath></defs>';
 if(value!==MONEY_VALUES[index]){
  edits+=`<g clip-path="url(#money-center-edit)"><rect x="83" y="38" width="91" height="46" fill="${fill}"/>`+label(value,128.75,81,84,53)+'</g>';
  edits+=`<rect x="28" y="24.25" width="36.5" height="19" fill="${fill}"/>`+label(value,46,42,34,22);
  edits+=`<rect x="193" y="79.25" width="36.5" height="19" fill="${fill}"/>`+label(value,211,96.5,34,22);
 }
 const heading=billHeading(board);
 if(heading.mode!=='original'){
  edits+=`<g clip-path="url(#money-center-edit)"><rect x="94" y="15" width="72" height="16" fill="${fill}"/>`+`<g data-money-heading-source="${heading.mode}" fill="${heading.color}">`+label(heading.value,128.75,25,68,6)+'</g>'+'</g>';
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
   if(count%10===0){doc.setFont('GameSans','normal');doc.setFontSize(7);doc.setTextColor('#56665e');doc.text(board.title,10,7);doc.text('Money / '+(Math.floor(count/10)+1),200,7,{align:'right'});doc.text('Print at 100% / Actual size. Cut on the bill borders.',105,291,{align:'center'});}
   const x=(210-2*w-8)/2+(count%2)*(w+8),y=18+Math.floor((count%10)/2)*53;
   doc.doFormObject(form,new doc.Matrix(1,0,0,1,x*doc.internal.scaleFactor,(doc.internal.pageSize.getHeight()-y-h)*doc.internal.scaleFactor));
  }
 }
 return doc;
}
