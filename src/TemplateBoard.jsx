import React,{useId} from 'react';
import {template,norm,getBoardSource} from './boardSource';
import {getCardFonts,useCardFonts} from './cardFonts';
import {ORIGINAL_ARTWORK} from './reference-assets/artwork';
import {iconGeometry} from './spaceIcons';
import {fitText,nativeTextMetrics} from './textLayout';
export function templateTileRect(id){
 const xs=[814,1307,1781,2274,2761,3247,3741,4227,4714,5186];const bs=[814,1306,1793,2280,2773,3260,3747,4227,4687,5186];const ys=[806,1301,1788,2275,2768,3255,3741,4235,4708,5194];
 if(id===0)return {x:5186,y:5194,w:814,h:806};if(id===10)return {x:0,y:5194,w:814,h:806};if(id===20)return {x:0,y:0,w:814,h:806};if(id===30)return {x:5186,y:0,w:814,h:806};
 if(id<10){const i=9-id;return {x:bs[i],y:5194,w:bs[i+1]-bs[i],h:806};}
 if(id<20){const i=19-id;return {x:0,y:ys[i],w:814,h:ys[i+1]-ys[i]};}
 if(id<30){const i=id-21;return {x:xs[i],y:0,w:xs[i+1]-xs[i],h:806};}
 const i=id-31;return {x:5186,y:ys[i],w:814,h:ys[i+1]-ys[i]};
}
const Bitmap=({a,...props})=><image href={a.src} x={a.x} y={a.y} width={a.w} height={a.h} {...props}/>;
function Label({value,box,rotation=0,color='#000000',fontSize=66,maxWidth=440,maxHeight=230,font='KabobLight',bold=false,field='label',contain=false}){
 const inkId='label'+useId().replace(/[^a-zA-Z0-9]/g,'');const x=(box[0]+box[2])/2,y=(box[1]+box[3])/2;
 const nativeFont=!!getCardFonts()[font],italic=!nativeFont&&font==='HelveticaNeue-BoldItalic';
 const glyphMode=!nativeFont&&font==='KabobLight'&&[...norm(value)].every(c=>c===' '||template.glyphs[c]);
 const measure=(text,size)=>glyphMode?[...text].reduce((n,c)=>n+(c===' '?size*.35:template.glyphs[c].w*size/66),0)+Math.max(0,text.length-1)*size*.015:nativeTextMetrics(text,size,font,!nativeFont&&bold,italic).width;
 const layout=fitText(value,{width:maxWidth,height:maxHeight,fontSize,measure});let size=layout.size,lineHeight=layout.lineHeight;
 if(contain){const angle=rotation*Math.PI/180,c=Math.abs(Math.cos(angle)),s=Math.abs(Math.sin(angle)),w=c*layout.width+s*layout.height,h=s*layout.width+c*layout.height;const factor=Math.min(1,(box[2]-box[0])/Math.max(.001,w),(box[3]-box[1])/Math.max(.001,h));size*=factor;lineHeight*=factor;}
 return <g aria-label={norm(value)} data-text-field={field} data-anchor-x={x} data-anchor-y={y} data-rotation={rotation} data-slot-width={maxWidth} data-slot-height={maxHeight} transform={`translate(${x} ${y}) rotate(${rotation})`} fill={color}><defs><filter id={inkId} colorInterpolationFilters="sRGB"><feFlood floodColor={color}/><feComposite in2="SourceGraphic" operator="in"/></filter></defs>
 {layout.lines.map((text,i)=>{
  const center=(i-(layout.lines.length-1)/2)*lineHeight;
  if(!glyphMode){const m=nativeTextMetrics(text,size,font,!nativeFont&&bold,italic);return <text key={i} x="0" y={center+(m.ascent-m.descent)/2} textAnchor="middle" fontFamily={`${font}, Arial, sans-serif`} fontWeight={!nativeFont&&bold?'bold':'normal'} fontStyle={italic?'italic':undefined} fontSize={size}>{text}</text>;}
  const pieces=[...text].map(c=>{const g=template.glyphs[c];return g?{...g,w:g.w*size/66,h:g.h*size/66}:{space:size*.35};});const height=Math.max(0,...pieces.map(g=>g.h||0));let cursor=-measure(text,size)/2;
  return <g key={i} filter={color==='#000000'?undefined:`url(#${inkId})`}>{pieces.map((g,j)=>{if(g.space){cursor+=g.space+size*.015;return null;}const left=cursor;cursor+=g.w+size*.015;return <image key={j} href={g.src} x={left} y={center+height/2-g.h} width={g.w} height={g.h}/>;})}</g>;
 })}</g>;
}
function PriceLabel({value,field,color}){
 const inkId='price'+useId().replace(/[^a-zA-Z0-9]/g,'');
 const [prefix,amount]=value.split(' ');const cache=template.pricePrefixes[prefix];const glyphs=[...amount].map(c=>template.priceGlyphs[c]);
 if(getCardFonts().KabobLight||!cache||glyphs.some(g=>!g))return <Label value={value} box={field.box} rotation={field.rotation} fontSize={53} maxWidth={400} maxHeight={65} field="price" color={color}/>;
 const width=cache.w+21+glyphs.reduce((n,g)=>n+g.w+5,0)-5;let x=-width/2;const items=[{...cache,x}];x+=cache.w+21;for(const g of glyphs){items.push({...g,x});x+=g.w+5;}
 const cx=(field.box[0]+field.box[2])/2,cy=(field.box[1]+field.box[3])/2;return <g aria-label={value} data-text-field="price" data-anchor-x={cx} data-anchor-y={cy} data-rotation={field.rotation} transform={`translate(${cx} ${cy}) rotate(${field.rotation}) scale(${Math.min(1,400/width)})`}><defs><filter id={inkId} colorInterpolationFilters="sRGB"><feFlood floodColor={color}/><feComposite in2="SourceGraphic" operator="in"/></filter></defs><g filter={color==='#000000'?undefined:`url(#${inkId})`}>{items.map((g,i)=><image key={i} href={g.src} x={g.x} y={-g.h/2} width={g.w} height={g.h}/>)}</g></g>;
}
export function iconSlot(id,art){
 if(id===0){const a=art[1];return {...a,rotation:0};}
 if(id===10)return {x:396,y:5340,w:280,h:280,rotation:45};
 if(id===4)return {x:3416,y:5530,w:160,h:160,rotation:0};
 if(id===38)return {x:5520,y:4330,w:280,h:280,rotation:270};
 const a=art?.[0];if(!a)return null;
 const rotation=id===20?135:id===30?225:id<10?0:id<20?90:id<30?180:270;
 const available=Math.min(a.w,a.h)*((id===20||id===30)?0.7:1);return {x:a.x+(a.w-available)/2,y:a.y+(a.h-available)/2,w:available,h:available,rotation};
}
function ChangedIcon({tile,slot,color}){
 const {x,y,w,h,rotation}=slot,size=Math.min(w,h),geometry=iconGeometry(tile);const original=ORIGINAL_ARTWORK[tile.artwork];
 return <g data-space-icon={tile.id} data-icon-name={original?tile.artwork:geometry.name} data-icon-rotation={rotation} data-icon-center-x={x+w/2} data-icon-center-y={y+h/2} transform={`translate(${x+w/2} ${y+h/2}) rotate(${rotation})`} color={color}>
 {original?<image href={original} x={-size/2} y={-size/2} width={size} height={size} preserveAspectRatio="xMidYMid meet"/>:<svg x={-size/2} y={-size/2} width={size} height={size} viewBox={geometry.viewBox.join(' ')} fill="currentColor">{geometry.paths.map((d,i)=><path key={i} d={d}/>)}</svg>}</g>;
}
export function TemplateBoard({board,selected,onSelect,svgRef,interactive=true}){
 useCardFonts();const {template,source}=getBoardSource(board);const uid='board'+useId().replace(/[^a-zA-Z0-9]/g,'');const fonts=getCardFonts();const edits=[],patches=[],overlays=[];
 const clear=(box,fill=board.background)=>{edits.push(box);patches.push(<rect key={patches.length} x={box[0]} y={box[1]} width={box[2]-box[0]} height={box[3]-box[1]} fill={fill}/>);};
 const price=(value,field)=>{clear(field.box);overlays.push(<PriceLabel key={overlays.length} value={value} field={field} color={board.ink}/>);};
 const label=(value,field,options={})=>{clear(field.box,options.background||board.background);const sideways=Math.abs(field.rotation||0)%180===90;const originalHeight=sideways?field.box[2]-field.box[0]:field.box[3]-field.box[1];overlays.push(<Label contain={Math.abs(field.rotation||0)%90!==0} maxHeight={Math.max(66,Math.min(230,originalHeight+12))} key={overlays.length} value={value} box={field.box} rotation={field.rotation} color={board.ink} {...options}/>);};
 const deckName=id=>[7,22,36].includes(id)?board.decks.chance.name:[2,17,33].includes(id)?board.decks.chest.name:board.tiles[id].name;
 for(const tile of board.tiles){const original=source.tiles[tile.id],f=template.fields[tile.id]||{},name=deckName(tile.id);const art=template.art[tile.id];const slot=iconSlot(tile.id,art);const iconChanged=!!slot&&(art?tile.artwork!==original.artwork:!!tile.artwork||tile.icon!==original.icon||tile.faIcon!==original.faIcon);
  if(iconChanged){
   const areas=tile.id===0?[art[1]]:tile.id===10?[{x:240,y:5208,w:571,h:558}]:(art||[]);
   const pad=tile.id===20||tile.id===30?12:0;for(const a of areas)clear([a.x-pad,a.y-pad,a.x+a.w+pad,a.y+a.h+pad],tile.id===10?'#f57f23':board.background);
   overlays.push(<ChangedIcon key={'icon'+tile.id} tile={tile} slot={slot} color={tile.kind==='event'?([7,22,36].includes(tile.id)?board.decks.chance.color:board.decks.chest.color):tile.color}/>);
   if(tile.id===10){const b=[679,5270,741,5331];overlays.push(<svg key="jail-in" x={b[0]} y={b[1]} width={b[2]-b[0]} height={b[3]-b[1]} viewBox={`${b[0]} ${b[1]} ${b[2]-b[0]} ${b[3]-b[1]}`} overflow="hidden"><Bitmap a={art[0]}/></svg>);}
  }
  if(iconChanged&&tile.id!==0&&f.corner){for(const [i,c] of f.corner.entries())if(norm(name)===norm(original.name)||(tile.id===30&&i===1))overlays.push(<Bitmap key={'caption'+overlays.length} a={c.src} data-source-caption={tile.id}/>);}
  if(norm(name)!==norm(original.name)){
   if(tile.id===0){clear(f.name.box);overlays.push(<Label key="go-name" value={name} box={f.name.box} rotation={-45} fontSize={170} maxWidth={480} maxHeight={180} field="space-name" contain color={board.ink} bold/>);}
   else if(tile.id===10)label(name,f.name,{fontSize:55,maxWidth:210,maxHeight:150,background:'#f57f23'});
   else if(tile.id===20){const words=name.split(/\s+/);label(words.slice(1).join(' ')||words[0],{...f.corner[0],rotation:135},{fontSize:75,maxWidth:430,maxHeight:115});label(words.length>1?words[0]:'',{...f.corner[1],rotation:135},{fontSize:75,maxWidth:300,maxHeight:115});}
   else if(tile.id===30){label(name.replace(/^go to /i,''),{...f.corner[0],rotation:225},{fontSize:75,maxWidth:430,maxHeight:230});}
   else if(f.name)label(name,f.name,{fontSize:tile.kind==='tax'?85:66,maxWidth:440,field:'space-name'});
  }
  if(f.price&&(tile.price!==original.price||board.currency!==source.currency))price(`${tile.kind==='tax'?'PAY':'PRICE'} ${board.currency}${tile.price}${tile.kind==='tax'?'.00':''}`,f.price);
  if(tile.id===4&&(tile.price!==original.price||board.currency!==source.currency))label(`PAY ${board.currency}${tile.price}`,{...f.tax,rotation:0},{fontSize:66,maxWidth:340,maxHeight:180});
  if(tile.id===0&&board.currency!==source.currency)label(`COLLECT ${board.currency}200 END OF SEMESTER`,{...f.corner[0],rotation:-45},{fontSize:65,maxWidth:470,maxHeight:160});
 }
 for(const key of ['chance','chest'])if(norm(board.decks[key].name)!==norm(source.decks[key].name))label(board.decks[key].name,{...template.decks[key],rotation:-45},{fontSize:80,maxWidth:key==='chest'?660:500,maxHeight:130});
 const titleUnchanged=norm(board.title)===norm(source.title);const title=template.title;
 return <svg ref={svgRef} className="game-board" data-board-template={board.boardStyle==='photoshop'?'supplied-campus-psd':'supplied-campus-png'} data-print-size-mm="508" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 6000 6000" role="img" aria-label={`${board.title} custom 40-space board`} style={{fontFamily:'KabobLight, Arial, sans-serif'}}>
 <defs>
 <style>{Object.entries(fonts).map(([name,data])=>`@font-face{font-family:'${name}';src:url(data:font/ttf;base64,${data}) format('truetype');}`).join('\n')}</style>
 <mask id={uid+'edits'} maskUnits="userSpaceOnUse" x="0" y="0" width="6000" height="6000"><rect width="6000" height="6000" fill="white"/>{edits.map((b,i)=><rect key={i} x={b[0]} y={b[1]} width={b[2]-b[0]} height={b[3]-b[1]} fill="black"/>)}</mask>
 {template.colors.map((a,i)=><mask key={i} id={uid+'color'+i} maskUnits="userSpaceOnUse" x={a.x} y={a.y} width={a.w} height={a.h}><Bitmap a={a}/></mask>)}
 <mask id={uid+'ink'} maskUnits="userSpaceOnUse" x="0" y="0" width="6000" height="6000"><Bitmap a={template.ink}/></mask>
 <mask id={uid+'title'} maskUnits="userSpaceOnUse" x={title.x} y={title.y} width={title.w} height={title.h}><image href={title.mask} x={title.x} y={title.y} width={title.w} height={title.h}/></mask>
 </defs>
 <rect width="6000" height="6000" fill={board.background}/>
 {template.colors.map((a,i)=><rect key={i} x={a.x} y={a.y} width={a.w} height={a.h} fill={board.groups[i]} mask={`url(#${uid}color${i})`}/>)}
 {patches}
 <g mask={`url(#${uid}edits)`}><Bitmap a={template.base}/>{board.ink!==template.ink.color&&<rect width="6000" height="6000" fill={board.ink} mask={`url(#${uid}ink)`}/>}
 {Object.entries(template.art).map(([id,art])=>art.map((a,i)=><Bitmap key={id+'-'+i} a={a} data-source-artwork={source.tiles[id].artwork} data-tile-id={id}/>))}</g>
 {overlays}
 {titleUnchanged?(board.accent===template.accent?<Bitmap a={title}/>:<rect x={title.x} y={title.y} width={title.w} height={title.h} fill={board.accent} mask={`url(#${uid}title)`}/>):<g transform="translate(3050 3040) rotate(-45)">{board.boardStyle==='classic'&&<rect x="-1770" y="-320" width="3540" height="600" fill={board.accent} stroke="white" strokeWidth="36"/>}<Label value={board.title} box={[-1700,-380,1700,280]} font="HelveticaNeue-BoldItalic" fontSize={430} maxWidth={3400} maxHeight={650} color={board.boardStyle==='classic'?'#ffffff':board.accent} bold/></g>}
 {board.subtitle&&<g transform="translate(3300 3420) rotate(-45)"><Label value={board.subtitle} box={[-1400,-80,1400,100]} fontSize={88} maxWidth={2800} maxHeight={160} color={board.ink}/></g>}
 {board.logo&&<g transform="translate(3350 1700) rotate(-45)"><image data-company-logo="true" href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(board.logo)}`} x={-board.logoSize*2} y={-board.logoSize*2} width={board.logoSize*4} height={board.logoSize*4} preserveAspectRatio="xMidYMid meet"/></g>}
 {interactive&&board.tiles.map(tile=>{const r=templateTileRect(tile.id);return <g key={tile.id} role="button" tabIndex="0" aria-label={`Edit ${deckName(tile.id)}`} onClick={()=>onSelect?.(tile.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect?.(tile.id);}}} style={{cursor:'pointer'}}><rect x={r.x} y={r.y} width={r.w} height={r.h} fill="transparent"/>{selected===tile.id&&<rect x={r.x+15} y={r.y+15} width={r.w-30} height={r.h-30} fill={board.accent} fillOpacity=".12" stroke={board.accent} strokeWidth="20" pointerEvents="none"/>}</g>;})}
 </svg>;
}
