import { jsPDF } from 'jspdf';
import regularFont from './fonts/regular';
import boldFont from './fonts/bold';
import { zipSync, strToU8 } from 'fflate';
import { deedTiles, expandText, moneyTotal, readableInk } from './model';
import { download, fileName } from './storage';
import {getCardFonts,missingCardFonts} from './cardFonts';

export function serializeBoard(svg){
 const clone=svg.cloneNode(true);clone.setAttribute('width','6000');clone.setAttribute('height','6000');clone.removeAttribute('class');clone.removeAttribute('style');clone.style.fontFamily=svg.style.fontFamily||'Arial, Helvetica, sans-serif';
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
function startPdf(format='a4'){const d=new jsPDF({unit:'mm',format,compress:true,putOnlyUsedFonts:true});d.addFileToVFS('NotoSans-Regular.ttf',regularFont);d.addFont('NotoSans-Regular.ttf','GameSans','normal');d.addFileToVFS('NotoSans-Bold.ttf',boldFont);d.addFont('NotoSans-Bold.ttf','GameSans','bold');for(const [name,data] of Object.entries(getCardFonts())){d.addFileToVFS(name+'.ttf',data);d.addFont(name+'.ttf',name,'normal');}d.setFont('GameSans','normal');d.setProperties({title:'Monopolyer printable game kit',creator:'Monopolyer'});return d;}
function pageHeader(d,board,label,page){d.setTextColor('#56665e');text(d,board.title,10,7,7);text(d,`${label} / ${page}`,200,7,7,{align:'right'});text(d,'Print at 100% / Actual size. Cut on solid borders.',105,291,7,{align:'center'});d.setTextColor('#203e34');}
function cardBorder(d,x,y,w,h,color='#ffffff'){d.setFillColor(color);d.setDrawColor('#526258');d.setLineWidth(.2);d.rect(x,y,w,h,'FD');}
export function propertyPdf(board,backs=false){
 const doc=startPdf();const cards=deedTiles(board);const cols=3,rows=3,w=788/300*25.4,h=900/300*25.4,gap=1,startX=(210-cols*w-(cols-1)*gap)/2,startY=14;
 for(let i=0;i<cards.length;i++){
  if(i>0&&i%9===0)doc.addPage();const t=cards[i];const slot=i%9;const col=backs?2-slot%3:slot%3;const x=startX+col*(w+gap),y=startY+Math.floor(slot/3)*(h+gap);
  if(i%9===0)pageHeader(doc,board,backs?'Deed backs (mirrored)':'Property deeds',Math.floor(i/9)+1);
  const color=t.kind==='property'?board.groups[t.group]:t.color;
  if(backs)cardBorder(doc,x,y,w,h);else{doc.setFillColor('#ffffff');doc.rect(x,y,w,h,'F');}
  if(backs){doc.setFillColor(color);doc.rect(x+2,y+2,w-4,h-4,'F');doc.setTextColor(readableInk(color));fitted(doc,board.title,x+w/2,y+27,w-12,14,3);text(doc,'TITLE DEED',x+w/2,y+58,9,{align:'center'});doc.setTextColor('#203e34');continue;}
  const scale=w/788;const fy=height=>y+height/900*h;const fx=width=>x+width/788*w;
  const sourceText=(value,px,py,size=38,font='KabobLight',align='center')=>{doc.setFont(getCardFonts()[font]?font:'GameSans','normal');text(doc,value,fx(px),fy(py),size*scale*72/25.4,{align});};
  doc.setDrawColor('#000000');doc.setLineWidth(2*scale);doc.rect(fx(20),fy(20),748*scale,860/900*h);
  doc.setFillColor(color);doc.rect(fx(40),fy(38),708*scale,160/900*h,'FD');doc.setTextColor(readableInk(color));doc.setCharSpace(8*scale);sourceText('TITLE DEED',394,79,27);doc.setCharSpace(0);
  sourceText(t.name.toUpperCase(),394,158,Math.min(51,1100/Math.max(t.name.length,18)),t.kind==='property'?'Cornerstone':'KabobExtrabold');doc.setTextColor('#000000');
  const money=n=>`${board.currency}${n}`;
  if(t.kind==='property'){
   sourceText(`RENT ${money(t.rents[0])}`,394,286);
   ['With 1 House','With 2 Houses','With 3 Houses','With 4 Houses'].forEach((label,j)=>{sourceText(label,110,343+j*57,38,'KabobLight','left');sourceText(`${money(t.rents[j+1])}.`,680,343+j*57,38,'KabobLight','right');});
   sourceText(`With HOTEL ${money(t.rents[5])}.`,394,576);sourceText(`Mortgage Value ${money(t.mortgage)}.`,394,633);sourceText(`Houses cost ${money(t.houseCost)} each.`,394,690);sourceText(`Hotels, ${money(t.houseCost)} plus 4 houses`,394,747);
  }else if(t.kind==='rail'){
   ['Rent','If 2 transports are owned','If 3 transports are owned','If 4 transports are owned'].forEach((label,j)=>{sourceText(label,90,345+j*80,34,'KabobLight','left');sourceText(money(t.rents[j]),690,345+j*80,34,'KabobLight','right');});sourceText(`Mortgage Value ${money(t.mortgage)}`,394,750);
  }else{
   ['If one utility is owned, rent is','4 times the amount on dice.','If both utilities are owned, rent is','10 times the amount on dice.'].forEach((line,j)=>sourceText(line,394,[350,400,510,560][j],36));sourceText(`Mortgage Value ${money(t.mortgage)}`,394,750);
  }
  doc.setFont('GameSans','normal');
 }
 return doc;
}
export function eventsPdf(board,backs=false){
 const doc=startPdf();let page=0;
 for(const key of ['chance','chest']){
  const deck=board.decks[key];deck.cards.forEach((card,i)=>{
   if(i%8===0){if(page)doc.addPage();page++;pageHeader(doc,board,`${deck.name}${backs?' backs (mirrored)':''}`,page);}
   const slot=i%8,col=backs?1-slot%2:slot%2,x=23.4+col*87,y=20+Math.floor(slot/2)*59,w=76.2,h=44.45;
   if(backs)cardBorder(doc,x,y,w,h,deck.color);else{doc.setFillColor('#ffffff');doc.rect(x,y,w,h,'F');}
   if(backs){doc.setTextColor(readableInk(deck.color));fitted(doc,deck.name.toUpperCase(),x+w/2,y+24,w-14,18,2);fitted(doc,board.title,x+w/2,y+47,w-12,7,1);doc.setTextColor('#203e34');return;}
   doc.setTextColor('#000000');doc.setFont(getCardFonts()['CataneoBT-Regular']?'CataneoBT-Regular':'GameSans','normal');text(doc,deck.name,x+2,y+5.5,12);doc.setTextColor('#203e34');doc.setFont(getCardFonts()['ArialNarrow-Bold']?'ArialNarrow-Bold':'GameSans','normal');const headingHeight=fitted(doc,card.title,x+w/2,y+16,w-10,11,2);fitted(doc,expandText(card.text,board),x+w/2,y+15+headingHeight,w-10,8,4);
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
 const setup=`PRINT & ASSEMBLE\nBoard: 500 x 500 mm. The A4 board has nine numbered panels; trim at the panel borders and join matching edges. Property deeds: 66.72 x 76.2 mm (788 x 900 at 300 dpi). Event cards: 76.2 x 44.45 mm (900 x 525 at 300 dpi). Print fronts and mirrored backs separately, then glue back-to-back, or test duplex on the long edge before printing the full set. Money: ${board.money.players} player sets, ${board.currency}${moneyTotal(board)} each. Use cardstock for cards and glue the board to backing card. Supply two dice and player tokens.\n\n`;
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
 if(kind==='originals'){const response=await fetch(`${import.meta.env.BASE_URL}reference-assets/original-card-templates.zip`);if(!response.ok)throw new Error('Original templates could not be downloaded.');download(await response.blob(),'original-photoshop-card-templates.zip','application/zip');return;}
 if(kind==='svg'){download(svg(),`${name}-board.svg`,'image/svg+xml');return;}
 if(kind==='png'){onProgress('Rendering 6000 px artwork…');download(await svgToPng(svg(),6000),`${name}-board.png`,'image/png');return;}
 if(kind==='project'){download(JSON.stringify(board,null,2),`${name}.monopolyer.json`,'application/json');return;}
 const generators={deeds:()=>propertyPdf(board),deedBacks:()=>propertyPdf(board,true),events:()=>eventsPdf(board),eventBacks:()=>eventsPdf(board,true),money:()=>moneyPdf(board),rules:()=>rulesPdf(board),buildings:()=>buildingsPdf(board),board:()=>boardPdf(svg()),tiled:()=>boardPdf(svg(),true)};
 if(kind!=='kit'){onProgress('Preparing your PDF…');const doc=await generators[kind]();download(pdfBytes(doc),`${name}-${kind}${['deeds','deedBacks','events','eventBacks'].includes(kind)&&missingCardFonts().length?'-DRAFT-fonts-missing':''}.pdf`,'application/pdf');return;}
 const files={};const art=svg();files['board.svg']=strToU8(art);files['project.monopolyer.json']=strToU8(JSON.stringify(board,null,2));
 onProgress('Rendering board artwork…');files['board-6000px.png']=new Uint8Array(await (await svgToPng(art,6000)).arrayBuffer());
 for(const key of Object.keys(generators)){
  onProgress(`Preparing ${key}…`);await new Promise(r=>setTimeout(r,30));files[`${key}.pdf`]=pdfBytes(await generators[key]());
 }
 files['READ-ME.txt']=strToU8(`CARD FONT STATUS: ${missingCardFonts().length?'Draft text; missing exact font files: '+missingCardFonts().join(', '):'All original template fonts loaded and embedded.'}\n\n`+'MONOPOLYER PRINT KIT\n\nStart with rules.pdf for print and assembly instructions. Print at 100% / actual size. tiled.pdf is a nine-page A4 board; board.pdf is one 500 x 500 mm page for a print shop. Deed backs and event backs use mirrored columns to align with their fronts on long-edge duplex printing. Test one sheet first; printers vary. You can also print separately and glue together. buildings.pdf contains 32 houses and 12 hotels. Supply two dice and player tokens. Reopen the .monopolyer.json file in Monopolyer to keep editing.\n');
 onProgress('Packing your game kit…');download(zipSync(files,{level:5}),`${name}-game-kit.zip`,'application/zip');
}
