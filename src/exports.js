import { jsPDF } from 'jspdf';
import regularFont from './fonts/regular';
import boldFont from './fonts/bold';
import { zipSync, strToU8 } from 'fflate';
import { deedTiles, expandText, moneyTotal, readableInk } from './model';
import { download, fileName } from './storage';

export function serializeBoard(svg){
 const clone=svg.cloneNode(true);clone.setAttribute('width','6000');clone.setAttribute('height','6000');clone.removeAttribute('class');clone.removeAttribute('style');clone.style.fontFamily='Arial, Helvetica, sans-serif';
 clone.querySelectorAll('[role="button"]').forEach(el=>{el.removeAttribute('tabindex');el.removeAttribute('role');el.removeAttribute('aria-label');el.removeAttribute('style');});
 // Selection highlights are editor controls, not part of the design.
 clone.querySelectorAll('[pointer-events="none"]').forEach(el=>el.remove());
 return new XMLSerializer().serializeToString(clone);
}
export async function svgToPng(svg,size=3000){
 const blob=new Blob([svg],{type:'image/svg+xml;charset=utf-8'});const url=URL.createObjectURL(blob);
 try{
  const img=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(new Error('The artwork could not be rendered. Try simplifying your logo.'));i.src=url;});
  const canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;const ctx=canvas.getContext('2d');if(!ctx)throw new Error('This browser cannot export images.');ctx.drawImage(img,0,0,size,size);
  return await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Image export failed.')),'image/png'));
 }finally{URL.revokeObjectURL(url);}
}
const pdfText=s=>String(s).replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/[–—]/g,'-').replace(/…/g,'...').replace(/→/g,'>');
function text(doc,s,x,y,size=9,opts={}){doc.setFontSize(size);doc.text(pdfText(s),x,y,opts);}
function fitted(doc,s,x,y,width,size=10,maxLines=2,align='center'){
 let lines=[];
 do{doc.setFontSize(size);lines=doc.splitTextToSize(pdfText(s),width);if(lines.length<=maxLines)break;size-=.5;}while(size>4);
 if(lines.length>maxLines)throw new Error('Some text is too long to fit the print layout. Shorten the title or card text and try again.');
 doc.text(lines,x,y,{align,lineHeightFactor:1.22});return size*0.3528*1.22*lines.length;
}
function startPdf(format='a4'){const d=new jsPDF({unit:'mm',format,compress:true});d.addFileToVFS('NotoSans-Regular.ttf',regularFont);d.addFont('NotoSans-Regular.ttf','GameSans','normal');d.addFileToVFS('NotoSans-Bold.ttf',boldFont);d.addFont('NotoSans-Bold.ttf','GameSans','bold');d.setFont('GameSans','normal');d.setProperties({title:'Monopolyer printable game kit',creator:'Monopolyer'});return d;}
function pageHeader(d,board,label,page){d.setTextColor('#56665e');text(d,board.title,10,7,7);text(d,`${label} / ${page}`,200,7,7,{align:'right'});text(d,'Print at 100% / Actual size. Cut on solid borders.',105,291,7,{align:'center'});d.setTextColor('#203e34');}
function cardBorder(d,x,y,w,h,color='#ffffff'){d.setFillColor(color);d.setDrawColor('#526258');d.setLineWidth(.2);d.rect(x,y,w,h,'FD');}
export function propertyPdf(board,backs=false){
 const doc=startPdf();const cards=deedTiles(board);const cols=3,rows=3,w=63,h=88,gap=2,startX=(210-cols*w-(cols-1)*gap)/2,startY=14;
 for(let i=0;i<cards.length;i++){
  if(i>0&&i%9===0)doc.addPage();const t=cards[i];const slot=i%9;const col=backs?2-slot%3:slot%3;const x=startX+col*(w+gap),y=startY+Math.floor(slot/3)*(h+gap);
  if(i%9===0)pageHeader(doc,board,backs?'Deed backs (mirrored)':'Property deeds',Math.floor(i/9)+1);
  const color=t.kind==='property'?board.groups[t.group]:t.color;
  cardBorder(doc,x,y,w,h);
  if(backs){doc.setFillColor(color);doc.rect(x+2,y+2,w-4,h-4,'F');doc.setTextColor(readableInk(color));fitted(doc,board.title,x+w/2,y+27,w-12,14,3);text(doc,'TITLE DEED',x+w/2,y+58,9,{align:'center'});doc.setTextColor('#203e34');continue;}
  doc.setFillColor(color);doc.rect(x+2,y+2,w-4,19,'F');doc.setTextColor(readableInk(color));text(doc,'TITLE DEED',x+w/2,y+7,6,{align:'center'});doc.setFont('GameSans','bold');fitted(doc,t.name.toUpperCase(),x+w/2,y+12,w-8,9,2);doc.setFont('GameSans','normal');doc.setTextColor('#203e34');
  const money=n=>`${board.currency}${n}`;text(doc,`Purchase price ${money(t.price)}`,x+w/2,y+27,9,{align:'center'});
  if(t.kind==='property'){
   ['Base rent','1 house','2 houses','3 houses','4 houses','Hotel'].forEach((s,j)=>{text(doc,s,x+5,y+35+j*5,8);text(doc,money(t.rents[j]),x+w-5,y+35+j*5,8,{align:'right'});});
   text(doc,`House / hotel cost: ${money(t.houseCost)}`,x+w/2,y+68,7,{align:'center'});
   text(doc,`Mortgage: ${money(t.mortgage)}`,x+w/2,y+73,8,{align:'center'});
   fitted(doc,'Full color group: double base rent. A hotel replaces four houses.',x+w/2,y+79,w-8,6,2);
  }else if(t.kind==='rail'){
   ['1 transport owned','2 transports owned','3 transports owned','4 transports owned'].forEach((s,j)=>{text(doc,s,x+5,y+39+j*7,7.5);text(doc,money(t.rents[j]),x+w-5,y+39+j*7,8,{align:'right'});});text(doc,`Mortgage: ${money(t.mortgage)}`,x+w/2,y+77,8,{align:'center'});
  }else{
   fitted(doc,'ONE UTILITY OWNED',x+w/2,y+38,w-8,8,1);fitted(doc,'Rent is 4 times the dice total.',x+w/2,y+45,w-8,8,2);fitted(doc,'BOTH UTILITIES OWNED',x+w/2,y+57,w-8,8,1);fitted(doc,'Rent is 10 times the dice total.',x+w/2,y+64,w-8,8,2);text(doc,`Mortgage: ${money(t.mortgage)}`,x+w/2,y+79,8,{align:'center'});
  }
 }
 return doc;
}
export function eventsPdf(board,backs=false){
 const doc=startPdf();let page=0;
 for(const key of ['chance','chest']){
  const deck=board.decks[key];deck.cards.forEach((card,i)=>{
   if(i%8===0){if(page)doc.addPage();page++;pageHeader(doc,board,`${deck.name}${backs?' backs (mirrored)':''}`,page);}
   const slot=i%8,col=backs?1-slot%2:slot%2,x=15+col*92,y=20+Math.floor(slot/2)*64,w=88,h=56;
   cardBorder(doc,x,y,w,h,backs?deck.color:'#ffffff');
   if(backs){doc.setTextColor(readableInk(deck.color));fitted(doc,deck.name.toUpperCase(),x+w/2,y+24,w-14,18,2);fitted(doc,board.title,x+w/2,y+47,w-12,7,1);doc.setTextColor('#203e34');return;}
   doc.setTextColor(deck.color);text(doc,deck.name.toUpperCase(),x+5,y+7,7);doc.setTextColor('#203e34');doc.setFont('GameSans','bold');const headingHeight=fitted(doc,card.title,x+w/2,y+16,w-10,11,2);doc.setFont('GameSans','normal');fitted(doc,expandText(card.text,board),x+w/2,y+20+headingHeight,w-12,9,5);
  });
 }
 return doc;
}
export function moneyPdf(board){
 const doc=startPdf();let i=0;
 board.money.denominations.forEach((value,index)=>{
  const count=board.money.quantities[index]*board.money.players;
  for(let n=0;n<count;n++,i++){
   if(i>0&&i%10===0)doc.addPage();if(i%10===0)pageHeader(doc,board,'Money',Math.floor(i/10)+1);
   const x=5+(i%2)*101,y=18+Math.floor((i%10)/2)*53;cardBorder(doc,x,y,99,50,board.money.colors[index]);doc.setDrawColor(board.ink);doc.rect(x+2,y+2,95,46);doc.setTextColor(board.ink);
   fitted(doc,board.money.bankName.toUpperCase(),x+49.5,y+10,79,8,1);doc.setFont('GameSans','bold');fitted(doc,`${board.currency}${value}`,x+49.5,y+32,85,29,1);doc.setFont('GameSans','normal');fitted(doc,board.title,x+49.5,y+43,83,7,1);text(doc,'PLAY MONEY',x+49.5,y+47,4,{align:'center'});
  }
 });
 if(!i)throw new Error('Set at least one banknote quantity before exporting money.');return doc;
}
export function rulesPdf(board){
 const doc=startPdf();pageHeader(doc,board,'Game guide',1);doc.setFont('GameSans','bold');fitted(doc,board.title,105,24,180,22,2);doc.setFont('GameSans','normal');let y=40,page=1;
 const setup=`PRINT & ASSEMBLE\nBoard: 500 x 500 mm. The A4 board has nine numbered panels; trim at the panel borders and join matching edges. Property deeds: 63 x 88 mm. Event cards: 88 x 56 mm. Print fronts and mirrored backs separately, then glue back-to-back, or test duplex on the long edge before printing the full set. Money: ${board.money.players} player sets, ${board.currency}${moneyTotal(board)} each. Use cardstock for cards and glue the board to backing card. Supply two dice and player tokens.\n\n`;
 for(const para of (setup+expandText(board.rules,board)).split('\n\n')){
  doc.setFontSize(10);const lines=doc.splitTextToSize(pdfText(para),184);
  for(const line of lines){if(y>278){doc.addPage();page++;pageHeader(doc,board,'Game guide',page);y=22;}text(doc,line,13,y,10);y+=4.8;}y+=5;
 }
 return doc;
}
export function buildingsPdf(board){
 const doc=startPdf();pageHeader(doc,board,'32 houses + 12 hotels',1);
 text(doc,'Cut around each strip. Fold the dashed lines; glue the end tab.',105,18,9,{align:'center'});
 // Four panels and a glue tab form a hollow square building; the flat roof closes it.
 for(let i=0;i<44;i++){
  const pageSlot=i%24;if(i===24){doc.addPage();pageHeader(doc,board,'32 houses + 12 hotels',2);}
  const x=10+(pageSlot%3)*65,y=27+Math.floor(pageSlot/3)*31;const hotel=i>=32;const side=hotel?12:10;const color=hotel?'#d65b51':'#549975';
  doc.setFillColor(color);doc.setDrawColor('#203e34');doc.setLineWidth(.2);doc.rect(x,y,side*4+4,12,'FD');doc.rect(x+side,y+12,side,side,'FD');
  doc.setLineDashPattern([1,1],0);for(let j=1;j<=4;j++)doc.line(x+j*side,y,x+j*side,y+12);doc.line(x+side,y+12,x+side*2,y+12);doc.setLineDashPattern([],0);
  doc.setTextColor('#ffffff');text(doc,hotel?'HOTEL':'HOUSE',x+side*2,y+7,5,{align:'center'});doc.setTextColor('#203e34');text(doc,String(i+1),x+side*4+7,y+7,6);
 }
 return doc;
}
export async function boardPdf(svg, tiled=false){
 const png=await svgToPng(svg,4000);const bytes=new Uint8Array(await png.arrayBuffer());
 if(!tiled){const doc=startPdf([500,500]);doc.addImage(bytes,'PNG',0,0,500,500,undefined,'FAST');return doc;}
 const doc=startPdf();const panel=500/3;
 for(let row=0;row<3;row++)for(let col=0;col<3;col++){
  if(row||col)doc.addPage();const x=21.5,y=45;
  // Clip each full-size image to a 1/3 panel so home printers can assemble at actual size.
  doc.saveGraphicsState();doc.rect(x,y,panel,panel,null);doc.clip();doc.discardPath();doc.addImage(bytes,'PNG',x-col*panel,y-row*panel,500,500,'board','FAST');doc.restoreGraphicsState();
  doc.setDrawColor('#203e34');doc.rect(x,y,panel,panel);text(doc,`BOARD / ROW ${row+1} / COLUMN ${col+1}`,105,25,10,{align:'center'});text(doc,'Print at 100% / Actual size. Trim panel borders and join in a 3 x 3 grid.',105,230,8,{align:'center'});
 }
 return doc;
}
const pdfBytes=doc=>new Uint8Array(doc.output('arraybuffer'));
export async function exportFile(kind,board,svgElement,onProgress=()=>{}){
 const name=fileName(board);const svg=()=>serializeBoard(svgElement);
 if(kind==='svg'){download(svg(),`${name}-board.svg`,'image/svg+xml');return;}
 if(kind==='png'){onProgress('Rendering 6000 px artwork…');download(await svgToPng(svg(),6000),`${name}-board.png`,'image/png');return;}
 if(kind==='project'){download(JSON.stringify(board,null,2),`${name}.monopolyer.json`,'application/json');return;}
 const generators={deeds:()=>propertyPdf(board),deedBacks:()=>propertyPdf(board,true),events:()=>eventsPdf(board),eventBacks:()=>eventsPdf(board,true),money:()=>moneyPdf(board),rules:()=>rulesPdf(board),buildings:()=>buildingsPdf(board),board:()=>boardPdf(svg()),tiled:()=>boardPdf(svg(),true)};
 if(kind!=='kit'){onProgress('Preparing your PDF…');const doc=await generators[kind]();download(pdfBytes(doc),`${name}-${kind}.pdf`,'application/pdf');return;}
 const files={};const art=svg();files['board.svg']=strToU8(art);files['project.monopolyer.json']=strToU8(JSON.stringify(board,null,2));
 onProgress('Rendering board artwork…');files['board-6000px.png']=new Uint8Array(await (await svgToPng(art,6000)).arrayBuffer());
 for(const key of Object.keys(generators)){
  onProgress(`Preparing ${key}…`);await new Promise(r=>setTimeout(r,30));files[`${key}.pdf`]=pdfBytes(await generators[key]());
 }
 files['READ-ME.txt']=strToU8('MONOPOLYER PRINT KIT\n\nStart with rules.pdf for print and assembly instructions. Print at 100% / actual size. tiled.pdf is a nine-page A4 board; board.pdf is one 500 x 500 mm page for a print shop. Deed backs and event backs use mirrored columns to align with their fronts on long-edge duplex printing. Test one sheet first; printers vary. You can also print separately and glue together. buildings.pdf contains 32 houses and 12 hotels. Supply two dice and player tokens. Reopen the .monopolyer.json file in Monopolyer to keep editing.\n');
 onProgress('Packing your game kit…');download(zipSync(files,{level:5}),`${name}-game-kit.zip`,'application/zip');
}
