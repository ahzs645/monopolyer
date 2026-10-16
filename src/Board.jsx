import {artworkHref} from './customArtwork';
import React from 'react';
import {TemplateBoard} from './TemplateBoard';
import {tilePosition} from './model';
import {ORIGINAL_ARTWORK} from './reference-assets/artwork';
import * as SourceIcons from 'react-icons/fa';
import {getCardFonts,useCardFonts} from './cardFonts';

const paths={home:'M3 11 12 3 21 11 M5 10v11h14V10 M10 21v-7h4v7',train:'M5 16V5q0-3 7-3t7 3v11q0 3-3 3H8q-3 0-3-3Z M5 10h14 M8 22l2-3 M16 22l-2-3 M8 15h.1 M16 15h.1',bolt:'m13 2-9 12h7l-1 8 10-13h-8Z',drop:'M12 2S4 11 4 15a8 8 0 0 0 16 0c0-4-8-13-8-13Z',gift:'M3 9h18v5H3Z M5 14v8h14v-8 M12 9v13 M12 9C2 9 5 0 9 4l3 5c10 0 7-9 3-5Z',question:'M8 7a4 4 0 1 1 6 4c-2 1-2 2-2 4 M12 20h.01',car:'M3 15v5 M21 15v5 M3 17h18v-7l-3-6H6l-3 6Z M3 10h18 M7 14h.1 M17 14h.1',lock:'M5 10h14v12H5Z M8 10V6a4 4 0 0 1 8 0v4 M12 15v3',gavel:'m8 3 9 9 4-4-9-9Z M3 18l10-10 M2 22h18',coin:'M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20 M15 7H10a3 3 0 0 0 0 5h4a3 3 0 0 1 0 5H8 M12 5v14',tree:'m12 2-7 8h3l-5 7h7v5h4v-5h7l-5-7h3Z',book:'M12 5Q6 1 2 4v16q5-3 10 0 5-3 10 0V4q-4-3-10 1v15',coffee:'M3 7h14v9a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5Z M17 8h2a3 3 0 0 1 0 6h-2 M6 2v2 M10 2v2 M14 2v2',building:'M4 22V3h16v19 M1 22h22 M8 7h1 M15 7h1 M8 11h1 M15 11h1 M8 15h1 M15 15h1 M10 22v-4h4v4',star:'m12 2 3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1Z',heart:'M12 21S1 15 2 8c1-7 9-6 10-1 1-5 9-6 10 1 1 7-10 13-10 13Z'};
export function SvgIcon({name='home',size=24,...props}){return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}><path d={paths[name]||paths.home}/></svg>;}
export function SourceIcon({tile,...props}){const Icon=SourceIcons[tile.faIcon];return Icon?<Icon {...props}/>:<SvgIcon name={tile.icon} {...props}/>;}
export function WrappedText({text,x,y,width,fontSize=12,maxLines=3,...props}){
 const words=text.split(/\s+/);const lines=[];let line='';const limit=width/(fontSize*.56);
 for(const word of words){if((line+' '+word).trim().length>limit&&line){lines.push(line);line=word;}else line=(line+' '+word).trim();}if(line)lines.push(line);
 const shown=lines.slice(0,maxLines);if(lines.length>maxLines)shown[maxLines-1]=shown[maxLines-1].slice(0,-1)+'…';
 return <text x={x} y={y} fontSize={fontSize} textAnchor="middle" {...props}>{shown.map((l,i)=><tspan key={i} x={x} dy={i?fontSize*1.18:0} textLength={l.length>limit?width:undefined} lengthAdjust="spacingAndGlyphs">{l}</tspan>)}</text>;
}
export function Board(props){return props.board.boardStyle==='campus'||props.board.boardStyle==='classic'||props.board.boardStyle==='photoshop'?<TemplateBoard {...props}/>:<LegacyBoard {...props}/>;}
function LegacyBoard({board,selected,onSelect,svgRef,interactive=true,previewSize}){
 useCardFonts();
 const fonts=getCardFonts();
 const style=board.boardStyle||'studio';
 const deckPositions=style==='campus'?[['chest',292,292,-45],['chance',708,708,-45]]:[['chance',315,300,-35],['chest',685,700,-35]];
 const deckLabel=(id)=>[7,22,36].includes(id)?board.decks.chance.name:[2,17,33].includes(id)?board.decks.chest.name:null;
 return <svg ref={svgRef} className="game-board" xmlns="http://www.w3.org/2000/svg" viewBox="-3 -3 1006 1006" role="img" aria-label={`${board.title} custom 40-space board`} style={{fontFamily:board.boardStyle==='campus'?'KabobLight, Arial, sans-serif':'Arial, Helvetica, sans-serif',...(previewSize?{width:previewSize,height:previewSize,maxWidth:'none',maxHeight:'none'}:{})}}>
 <defs><style>{Object.entries(fonts).map(([name,data])=>`@font-face{font-family:'${name}';src:url(data:font/ttf;base64,${data}) format('truetype');}`).join('\n')}</style></defs>
 <rect x="-2" y="-2" width="1004" height="1004" rx="2" fill={board.background} stroke={board.ink} strokeWidth="4"/>
 <g fill={board.ink}>
  <g transform={`translate(500 500) rotate(${style==='studio'?-35:-45})`}>
   {style==='studio'&&<text y="-185" textAnchor="middle" letterSpacing="5" fontSize="12">A WORLD OF YOUR OWN</text>}
   {board.logo?<image href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(board.logo)}`} x={-board.logoSize/2} y={-board.logoSize-30} width={board.logoSize} height={board.logoSize} preserveAspectRatio="xMidYMid meet"/>:style==='studio'&&<g transform="translate(-32 -142)" color={board.accent}><SvgIcon name="building" size={64}/></g>}
   {style==='classic'&&<rect x="-295" y="-57" width="590" height="100" fill={board.accent} stroke="#ffffff" strokeWidth="6"/>}
   <WrappedText text={board.title.toUpperCase()} x={0} y={12} width={560} fontSize={Math.min(style==='campus'?78:65,980/Math.max(board.title.length,12))} maxLines={2} fill={style==='classic'?'#ffffff':board.accent} fontWeight="800" letterSpacing="1"/>
   <WrappedText text={board.subtitle} x={0} y={80} width={490} fontSize={15} maxLines={2}/>
   {style==='studio'&&<><path d="M-70 107h140" stroke={board.accent} strokeWidth="2"/><text y="140" textAnchor="middle" fontSize="10" letterSpacing="3">MADE FOR YOUR NEXT GAME NIGHT</text></>}
  </g>
  {deckPositions.map(([key,x,y,r])=><g key={key} transform={`translate(${x} ${y}) rotate(${r})`} color={board.decks[key].color}>
   <rect x="-92" y="-49" width="184" height="98" rx="5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray={style==='campus'?'2 7':'5 4'}/>
   <SvgIcon name={key==='chance'?'question':'gift'} x="-13" y="-30" size={26}/>
   <WrappedText text={board.decks[key].name.toUpperCase()} x={0} y={20} width={160} fontSize={12} fill="currentColor" fontWeight="bold" maxLines={2}/>
  </g>)}
 </g>
 {board.tiles.map(tile=>{
  const p=tilePosition(tile.id);const corner=tile.id%10===0;const w=corner?135:81.111111;const h=135;const color=tile.kind==='property'?board.groups[tile.group]:tile.color;const label=deckLabel(tile.id)||tile.name;const original=artworkHref(tile.customArtwork)||ORIGINAL_ARTWORK[tile.artwork];
  return <g key={tile.id} transform={`translate(${p.x+p.w/2} ${p.y+p.h/2}) rotate(${p.rotation}) translate(${-w/2} ${-h/2})`} onClick={interactive?()=>onSelect?.(tile.id):undefined} onKeyDown={interactive?(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect?.(tile.id);}}:undefined} tabIndex={interactive?0:undefined} role={interactive?'button':undefined} aria-label={interactive?`Edit ${label}`:undefined} style={interactive?{cursor:'pointer'}:undefined}>
   <rect width={w} height={h} fill={board.background} stroke={board.ink} strokeWidth="1.6"/>
   {tile.kind==='property'?<><rect width={w} height="27" fill={color} stroke={board.ink} strokeWidth="1.5"/><WrappedText text={label.toUpperCase()} x={w/2} y={48} width={w-12} fontSize={10} maxLines={4} fill={board.ink} fontWeight="600"/><text x={w/2} y="121" textAnchor="middle" fontSize="11" fill={board.ink}>{board.currency}{tile.price}</text></>:corner?<g fill={board.ink}>
    <g transform="translate(67.5 67.5) rotate(-45)"><WrappedText text={label.toUpperCase()} x={0} y={-32} width={125} fontSize={14} maxLines={2} fontWeight="bold"/>{original?<g transform={`rotate(${45-p.rotation} 0 13)`}><image href={original} x="-25" y="-12" width="50" height="50" preserveAspectRatio="xMidYMid meet"/></g>:<SourceIcon tile={tile} x="-18" y="-5" size={36} style={{color:tile.color}}/>}{tile.kind==='go'&&<text y="47" fontSize="10" textAnchor="middle">COLLECT {board.currency}200 →</text>}</g>
   </g>:<><WrappedText text={label.toUpperCase()} x={w/2} y={22} width={w-10} fontSize={9.5} maxLines={3} fill={board.ink} fontWeight="600"/>{original?<image href={original} x={w/2-23} y="59" width="46" height="47" preserveAspectRatio="xMidYMid meet"/>:<SourceIcon tile={tile} x={w/2-17} y="61" size={34} style={{color:tile.kind==='event'?([7,22,36].includes(tile.id)?board.decks.chance.color:board.decks.chest.color):tile.color}}/>}{tile.price>0&&<text x={w/2} y="121" fontSize="11" textAnchor="middle" fill={board.ink}>{board.currency}{tile.price}</text>}</>}
   {interactive&&selected===tile.id&&<rect x="3" y="3" width={w-6} height={h-6} fill={board.accent} fillOpacity=".12" stroke={board.accent} strokeWidth="4" pointerEvents="none"/>}
  </g>;
 })}
 </svg>;
}
