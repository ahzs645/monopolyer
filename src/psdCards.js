import source from './reference-assets/cards.json';
import {getCardFonts} from './cardFonts';
import {expandText} from './model';
import {deedIcon} from './spaceIcons';
const image=(a,extra={})=>({type:'image',...a,...extra});
const rect=(x,y,w,h,fill)=>({type:'rect',x,y,w,h,fill});
const black='#040707';
// A shared display list feeds the on-screen SVG and the printable PDF. Cached
// Photoshop lines retain their pixels; edited text uses the source glyphs.
export function sourceLine(value,font,x,baseline,options={}){
 const {size=48,scaleY=1,maxWidth=Infinity,align='center',color=black}=options;const fd=source.fonts[font];const cached=fd?.lines[String(value).trim().toLowerCase()];
 if(cached){
  const scale=Math.min(size/cached.size,maxWidth/cached.w);const sy=scale*scaleY/cached.scaleY;const w=cached.w*scale;const h=cached.h*sy;const left=cached.align===align?x+(cached.x-cached.anchorX)*scale:align==='left'?x:align==='right'?x-w:x-w/2;
  return [image(cached,{src:color==='#ffffff'?(cached.white||cached.src):(cached.black||cached.src),x:left,y:baseline+(cached.y-cached.baseline)*sy,w,h})];
 }
 // Real uploaded fonts supply glyphs that were never represented in the PSD.
 const chars=[...String(value)];const unsupported=chars.filter(c=>!c.match(/\s/)&&!fd?.glyphs[c]);
 if(getCardFonts()[font]||unsupported.length||!fd){return [{type:'text',value:String(value),font,x,y:baseline,size,scaleY,maxWidth,align,color,tracking:font==='Cornerstone'||font==='CataneoBT-Regular'||font==='KabobExtrabold'?size*.075:font==='ArialNarrow-Bold'?-size*.03:0,fallback:!getCardFonts()[font],missing:[...new Set(unsupported)].join('')}];}
 const pieces=chars.map(c=>{const g=fd.glyphs[c];if(!g)return {space:fd.space*size/48};const s=size/g.size;return {...g,w:g.w*s,h:g.h*s*scaleY/g.scaleY,dy:g.dy*s*scaleY/g.scaleY};});
 const gap=fd.gap*size/48;let width=pieces.reduce((n,g)=>n+(g.space||g.w),0)+Math.max(0,chars.length-1)*gap;const fit=Math.min(1,maxWidth/width);width*=fit;let cursor=align==='left'?x:align==='right'?x-width:x-width/2;
 return pieces.flatMap(g=>{if(g.space){cursor+=(g.space+gap)*fit;return [];}const op=image(g,{src:color==='#ffffff'?g.white:g.src,x:cursor,y:baseline+g.dy*fit,w:g.w*fit,h:g.h*fit});cursor+=(g.w+gap)*fit;return [op];});
}
export function deedArtwork(board,tile){
 const ops=[image(source.art.outer)];const money=n=>`${board.currency}${n}`;const line=(v,font,x,y,o)=>ops.push(...sourceLine(v,font,x,y,o));const body=(v,x,y,o={})=>line(v,'KabobLight',x,y,o);
 if(tile.kind==='property'){
  const color=board.groups[tile.group];const n=parseInt(color.slice(1),16);const light=(((n>>16)&255)*.299+((n>>8)&255)*.587+(n&255)*.114)>150;const ink=light?black:'#ffffff';
  ops.push(rect(38,36,712,163,color),image(source.art.header));
  line('TITLE DEED','KabobLight',395.7143576162896,78.43131270609696,{size:24,scaleY:1.1915853972263148,color:ink});
  line(tile.name.replace(/\s+/g,' ').trim().toUpperCase(),'Cornerstone',396,159,{size:47,maxWidth:652,color:ink});
  body(`RENT ${money(tile.rents[0])}`,381,257.83410471507085,{scaleY:.8222736476713913});
  ['With 1 House','With 2 Houses','With 3 Houses','With 4 Houses'].forEach((v,i)=>{body(v,113,320+i*60,{align:'left'});body(`${i===0?board.currency+' ':''}${tile.rents[i+1]}.`,633,320+i*60,{align:'right'});});
  body(`With HOTEL ${money(tile.rents[5])}.`,386,562);body(`Mortgage Value ${money(tile.mortgage)}.`,386,622);body(`Houses cost ${money(tile.houseCost)}. each`,386,682);body(`Hotels, ${money(tile.houseCost)}. plus 4 houses`,386,742);
 }else{
  ops.push(image(source.art.rule),image(source.art.rule,{y:316}));
  if(tile.kind==='rail'){
   ops.push(deedIcon(board,tile,source.art.train3)||image(source.art.train3));line(tile.name.replace(/\s+/g,' ').trim().toUpperCase(),'KabobExtrabold',396,301,{size:48,maxWidth:660});
   ['Rent','If 2 R.R.’s are owned','If 3      “     “     “','If 4      “     “     “'].forEach((v,i)=>{body(v,113,407+i*72,{align:'left'});body(`${i===0?board.currency:''}${tile.rents[i]}.`,691,407+i*72,{align:'right'});});body('Mortgage Value',113,767,{align:'left'});body(`${tile.mortgage}.`,691,767,{align:'right'});
  }else{
   const art=source.art[tile.id===12?'lightbulb':'faucet'];ops.push(deedIcon(board,tile,art)||image(art));line(tile.name.replace(/\s+/g,' ').trim().toUpperCase(),'KabobExtrabold',398,302,{size:48,maxWidth:660});
   ['If one “Utility” is owned','rent is 4 times amount shown','on dice.','If both “Utilities” are owned','rent is 10 times amount shown','on dice.'].forEach((v,i)=>body(v,101,407+i*60,{align:'left'}));body(`Mortgage Value                ${money(tile.mortgage)}.`,101,827,{maxWidth:650,align:'left'});
  }
 }
 return {width:788,height:900,ops,fallbacks:ops.filter(o=>o.fallback)};
}
export function eventArtwork(board,key,card){
 const deck=board.decks[key];const ops=[rect(0,0,900,525,'#ffffff')];
 // The supplied event PSD contains these headings and a placeholder, no icons
 // or decorative frame. Keep its white card and top-left calligraphic heading.
 const heading=source.fonts['CataneoBT-Regular'].lines[deck.name.toLowerCase()];
 if(heading)ops.push(image(heading));else ops.push(...sourceLine(deck.name,'CataneoBT-Regular',25,62,{size:60,align:'left',maxWidth:850}));
 const text=`${card.title}\n\n${expandText(card.text,board)}`.toUpperCase();const size=60;const maxChars=25;const paragraphs=text.split('\n');const lines=[];
 for(const para of paragraphs){if(!para){lines.push('');continue;}let line='';for(const word of para.split(/\s+/)){if(line&&(line+' '+word).length>maxChars){lines.push(line);line=word;}else line+=(line?' ':'')+word;}if(line)lines.push(line);}
 const fit=Math.min(1,340/(Math.max(1,lines.length)*size));const actual=size*fit;lines.forEach((v,i)=>{if(v)ops.push(...sourceLine(v,'ArialNarrow-Bold',460,155+i*actual,{size:actual,maxWidth:780}));});
 return {width:900,height:525,ops,fallbacks:ops.filter(o=>o.fallback)};
}
export function cardArtworkStatus(board,kind='all'){
 const warnings=new Map();if(kind!=='events')for(const tile of board.tiles.filter(t=>['property','rail','utility'].includes(t.kind))){for(const o of deedArtwork(board,tile).fallbacks)warnings.set(o.font,(warnings.get(o.font)||'')+o.missing);}
 if(kind!=='deeds')for(const key of ['chance','chest'])for(const card of board.decks[key].cards)for(const o of eventArtwork(board,key,card).fallbacks)warnings.set(o.font,(warnings.get(o.font)||'')+o.missing);
 return [...warnings].map(([font,chars])=>`${font}: ${[...new Set(chars)].join('')}`);
}
