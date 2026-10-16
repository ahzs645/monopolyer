import {billFontStatus} from './moneyArtwork';
import 'svg2pdf.js';
import {subtractRectangles} from './textLayout';
import {zipSync,strToU8} from 'fflate';
import {download,fileName} from './storage';
import {deedTiles} from './model';
import {deedArtwork,eventArtwork,cardArtworkStatus} from './psdCards';
import {boardFontStatus} from './boardSource';
import {serializeBoard,boardPrintSize,moneyPdf,buildingsPdf,rulesPdf,propertyPdf,eventsPdf,startPdf} from './exports';
const NS='http://www.w3.org/2000/svg';
let atlasPromise;
const atlas=()=>atlasPromise??=fetch(`${import.meta.env.BASE_URL}vector-assets/artwork.json`).then(r=>{if(!r.ok)throw new Error('Vector artwork could not be loaded.');return r.json();});
const parse=s=>{const doc=new DOMParser().parseFromString(s,'image/svg+xml');if(doc.querySelector('parsererror'))throw new Error('The SVG artwork could not be parsed.');return doc.documentElement;};
const hash=async s=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))].map(b=>b.toString(16).padStart(2,'0')).join('');
function node(tag,attrs={}){const el=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))if(v!==undefined)el.setAttribute(k,String(v));return el;}
function prefixIds(root,prefix){
 const ids=new Map([root,...root.querySelectorAll('[id]')].filter(el=>el.id).map(el=>[el.id,prefix+el.id]));
 for(const el of [root,...root.querySelectorAll('*')])for(const attr of [...el.attributes]){let v=attr.value;if(attr.name==='id'&&ids.has(v))v=ids.get(v);else{for(const [id,next] of ids){v=v.replaceAll(`url(#${id})`,`url(#${next})`);if(v===`#${id}`)v=`#${next}`;}}el.setAttribute(attr.name,v);}
}
export function assertVectorSvg(root){
 if(root.querySelector('image, foreignObject, feImage'))throw new Error('This design contains bitmap or unsupported embedded artwork. Use a logo made from SVG paths, shapes and text.');
 for(const el of [root,...root.querySelectorAll('*')])for(const a of el.attributes)if(/data:image\/(png|jpe?g|webp|gif)|https?:\/\//i.test(a.value)&&!a.name.startsWith('xmlns'))throw new Error('Vector export cannot include raster images or external artwork.');
 return root;
}
export async function vectorizeSvg(source){
 const root=parse(source),assets=await atlas();let index=0;
 // A nested SVG logo can itself contain an image: recursively inspect every level.
 while(root.querySelector('image')){
  const el=root.querySelector('image'),href=el.getAttribute('href')||el.getAttributeNS('http://www.w3.org/1999/xlink','href')||'';
  const x=Number(el.getAttribute('x')||0),y=Number(el.getAttribute('y')||0),w=Number(el.getAttribute('width')),h=Number(el.getAttribute('height'));let replacement;
  if(href.startsWith('data:image/png;base64,')){
   const a=assets[await hash(href)];if(!a)throw new Error('This SVG contains a bitmap that has no vector source. Upload a path-based SVG logo or use the source-matched download.');
   replacement=node('g',{'data-vector-method':a.method,transform:`translate(${x} ${y}) scale(${w/a.width} ${h/a.height})`});
   const body=parse(`<svg xmlns="${NS}">${a.body}</svg>`);prefixIds(body,`asset${index++}-`);replacement.append(...body.childNodes);
  }else if(href.startsWith('data:image/svg+xml')){
   const comma=href.indexOf(',');const nested=parse(href.slice(0,comma).includes(';base64')?new TextDecoder().decode(Uint8Array.from(atob(href.slice(comma+1)),c=>c.charCodeAt(0))):decodeURIComponent(href.slice(comma+1)));prefixIds(nested,`logo${index++}-`);nested.setAttribute('x',x);nested.setAttribute('y',y);nested.setAttribute('width',w);nested.setAttribute('height',h);replacement=nested;
  }else throw new Error('Vector export requires embedded SVG paths. External or bitmap logos cannot be included.');
  // Retain the original image's transform, clipping, opacity and semantic labels.
  const group=node('g');for(const attr of [...el.attributes])if(!['href','xlink:href','x','y','width','height','preserveAspectRatio'].includes(attr.name))group.setAttribute(attr.name,attr.value);group.append(replacement);el.replaceWith(group);
 }
 // Source masks contain solid alpha outlines. Clip paths preserve these as PDF
 // paths; svg2pdf does not support SVG luminance masks or flood filters.
 for(const mask of [...root.querySelectorAll('mask')]){
  if(mask.id.startsWith('logo'))throw new Error('This logo uses an SVG mask that cannot be preserved in vector PDF. Convert its mask to paths in your graphics editor first.');
  const clip=node('clipPath',{id:mask.id,clipPathUnits:'userSpaceOnUse'});const children=[...mask.children];
  if(children.every(c=>c.localName==='rect')){
   const bounds=c=>[Number(c.getAttribute('x')||0),Number(c.getAttribute('y')||0),Number(c.getAttribute('width')),Number(c.getAttribute('height'))];
   const regions=subtractRectangles(bounds(children[0]),children.slice(1).map(bounds));
   for(const [x,y,width,height] of regions)clip.append(node('rect',{x,y,width,height}));
  }else{
   // SVG clipPath children must be geometry, not nested groups. Carry every
   // ancestor transform onto each outline so both browsers and PDFs clip it.
   const flatten=(parent,transforms=[])=>{for(const child of parent.children){const next=[...transforms,child.getAttribute('transform')||''];if(['g','svg'].includes(child.localName))flatten(child,next);else{const shape=child.cloneNode(true);shape.setAttribute('transform',next.join(' '));clip.append(shape);}}};flatten(mask);
  }
  mask.replaceWith(clip);
 }
 for(const el of root.querySelectorAll('[mask]')){el.setAttribute('clip-path',el.getAttribute('mask'));el.removeAttribute('mask');}
 for(const el of root.querySelectorAll('[filter]')){
  const id=el.getAttribute('filter').match(/^url\(#(.+)\)$/)?.[1];const filter=[...root.querySelectorAll('filter')].find(f=>f.id===id);const flood=filter?.querySelector('feFlood'),composite=filter?.querySelector('feComposite');if(!flood||!composite||filter.children.length!==2||composite.getAttribute('operator')!=='in'||composite.getAttribute('in2')!=='SourceGraphic')throw new Error('This SVG effect is not supported in vector exports.');const color=flood.getAttribute('flood-color')||'#000000';
  for(const shape of [el,...el.querySelectorAll('path,rect,circle,ellipse,polygon,polyline,text')]){shape.setAttribute('fill',color);if(shape.hasAttribute('stroke'))shape.setAttribute('stroke',color);}el.removeAttribute('filter');
 }
 root.querySelectorAll('filter').forEach(e=>e.remove());root.setAttribute('data-export-content','vector-paths-and-text');
 return assertVectorSvg(root);
}
export const serializeVector=root=>new XMLSerializer().serializeToString(root);
export async function vectorBoardPdf(root,tiled=false){
 const size=boardPrintSize(serializeVector(root)),doc=startPdf(tiled?'a4':[size,size]);
 if(!tiled){await doc.svg(root,{x:0,y:0,width:size,height:size});return doc;}
 const panel=size/3;
 for(let row=0;row<3;row++)for(let col=0;col<3;col++){
  if(row||col)doc.addPage();const x=(210-panel)/2,y=45;
  doc.saveGraphicsState();doc.rect(x,y,panel,panel,null);doc.clip();doc.discardPath();await doc.svg(root,{x:x-col*panel,y:y-row*panel,width:size,height:size});doc.restoreGraphicsState();
  doc.setDrawColor('#203e34');doc.rect(x,y,panel,panel);doc.setFont('GameSans','normal');doc.setFontSize(10);doc.text(`BOARD / ROW ${row+1} / COLUMN ${col+1}`,105,25,{align:'center'});doc.setFontSize(8);doc.text('Print at 100% / Actual size. Trim borders and join in a 3 x 3 grid.',105,230,{align:'center'});
 }return doc;
}
async function cardRoot(art){
 const {renderToStaticMarkup}=await import('react-dom/server');const {createElement}=await import('react');const {CardArtwork}=await import('./TemplateCard');
 return vectorizeSvg(renderToStaticMarkup(createElement(CardArtwork,{art,label:'Vector card'})));
}
export async function vectorCardsPdf(board,events=false,onProgress=()=>{}){
 const doc=startPdf();const files={};let n=0;
 const cards=events?['chance','chest'].flatMap(key=>board.decks[key].cards.map((card,i)=>({key,i,art:eventArtwork(board,key,card)}))):deedTiles(board).map((tile,i)=>({key:'deed',i,art:deedArtwork(board,tile)}));
 let page=0;
 for(const item of cards){
  const {key,i,art}=item;const slots=events?8:9;if(i%slots===0){if(page++)doc.addPage();doc.setFont('GameSans','normal');doc.setFontSize(7);doc.text(board.title,10,7);doc.text('Print at 100% / Actual size. Cut on solid borders.',105,291,{align:'center'});}
  onProgress(`Preparing vector ${events?'event':'property'} card ${++n} of ${cards.length}…`);
  const root=await cardRoot(art);const w=art.width/300*25.4,h=art.height/300*25.4;root.setAttribute('width',w+'mm');root.setAttribute('height',h+'mm');files[`${key}-${String(i+1).padStart(2,'0')}.svg`]=strToU8(serializeVector(root));
  const slot=i%slots,x=events?23.4+(slot%2)*87:(210-3*w-2)/2+(slot%3)*(w+1),y=events?20+Math.floor(slot/2)*59:14+Math.floor(slot/3)*(h+1);
  await doc.svg(root,{x,y,width:w,height:h});
 }return {doc,files};
}
const bytes=d=>new Uint8Array(d.output('arraybuffer'));
export async function exportVectorFile(kind,board,svgElement,onProgress=()=>{}){
 const name=fileName(board),boardFonts=boardFontStatus(board),cardFonts=cardArtworkStatus(board);const draft=missing=>missing.length?'-DRAFT-fonts-missing':'';onProgress('Loading and checking vector artwork…');
 if(kind==='vectorDeeds'||kind==='vectorEvents'){
  const {doc}=await vectorCardsPdf(board,kind==='vectorEvents',onProgress);download(bytes(doc),`${name}-${kind==='vectorEvents'?'events':'deeds'}-vector${draft(cardArtworkStatus(board,kind==='vectorEvents'?'events':'deeds'))}.pdf`,'application/pdf');return;
 }
 if(kind==='vectorCards'){
  const deeds=await vectorCardsPdf(board,false,onProgress),events=await vectorCardsPdf(board,true,onProgress);const files={};for(const [key,value] of Object.entries(deeds.files))files['deeds/'+key]=value;for(const [key,value] of Object.entries(events.files))files['events/'+key]=value;download(zipSync(files),`${name}-vector-cards.zip`,'application/zip');return;
 }
 const root=await vectorizeSvg(serializeBoard(svgElement));
 if(kind==='vectorSvg'){download(serializeVector(root),`${name}-board-vector.svg`,'image/svg+xml');return;}
 if(kind==='vectorBoard'||kind==='vectorTiled'){onProgress('Drawing vector PDF paths…');download(bytes(await vectorBoardPdf(root,kind==='vectorTiled')),`${name}-${kind==='vectorTiled'?'a4':'board'}-vector${draft(boardFonts)}.pdf`,'application/pdf');return;}
 const files={'board-vector.svg':strToU8(serializeVector(root)),'project.monopolyer.json':strToU8(JSON.stringify(board,null,2))};
 onProgress('Drawing vector board PDF…');files['board-vector.pdf']=bytes(await vectorBoardPdf(root));onProgress('Drawing nine vector board panels…');files['tiled-vector.pdf']=bytes(await vectorBoardPdf(root,true));
 for(const events of [false,true]){const result=await vectorCardsPdf(board,events,onProgress);files[events?'events-vector.pdf':'deeds-vector.pdf']=bytes(result.doc);for(const [key,value] of Object.entries(result.files))files[(events?'events/':'deeds/')+key]=value;}
 for(const [key,doc] of Object.entries({money:moneyPdf(board),buildings:buildingsPdf(board),rules:rulesPdf(board),deedBacks:propertyPdf(board,true),eventBacks:eventsPdf(board,true)}))files[key+'.pdf']=bytes(await doc);
 files['READ-ME.txt']=strToU8(`BILL FONT STATUS: ${billFontStatus(board).length?'Myriad font needed for letters: '+billFontStatus(board).join(', '):'Source outlines retained or required font loaded.'}\n\nBOARD FONT STATUS: ${boardFonts.length?'Missing original fonts for edited wording: '+boardFonts.join(', '):'Source lettering retained or covered by loaded fonts.'}\nCARD FONT STATUS: ${cardFonts.length?'Missing original fonts/characters: '+cardFonts.join('; '):'Source lettering retained or covered by loaded fonts.'}\n\n`+'VECTOR GAME KIT\n\nSVGs contain paths, shapes and live text, with no raster images. Five embedded source SVG smart objects retain their original paths. Raster-only PSD lettering and illustrations have been traced to outlines at source resolution. Their edges can differ from the pixel-matched source exports; these are not recovered original font files. Unsupported edited lettering uses the font shown in the editor; load the original fonts for exact new wording. Live text remains text and needs a font when editing. SVG logos must contain vector shapes/text: embedded bitmap logos are rejected.\n\nPrint at 100% / Actual size. Board size and all card dimensions match the source templates. Deeds and events folders contain individual vector SVG fronts. Money reuses the supplied vector PDF bill artwork. Card backs, buildings and rules use native PDF drawing/text. The original PSDs remain available separately.\n');
 onProgress('Packing vector files…');download(zipSync(files,{level:5}),`${name}-vector-game-kit.zip`,'application/zip');
}
