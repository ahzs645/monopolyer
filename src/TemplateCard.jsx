import React from 'react';
import {getCardFonts,useCardFonts} from './cardFonts';
import {deedArtwork,eventArtwork} from './psdCards';
function NativeCardText({op:o}){
 let width=o.value.length*o.size*.55;
 if(typeof document!=='undefined'){const ctx=document.createElement('canvas').getContext('2d');if(ctx){ctx.font=`${o.size}px "${o.font}", Arial, sans-serif`;width=ctx.measureText(o.value).width+(o.value.length-1)*(o.tracking||0);}}
 const fit=Math.min(1,o.maxWidth/Math.max(1,width*(o.scaleX||1)));
 return <text transform={`translate(${o.x} ${o.y}) scale(${fit*(o.scaleX||1)} ${fit*o.scaleY})`} x="0" y="0" xmlSpace="preserve" fontFamily={`${o.font}, Arial, sans-serif`} fontSize={o.size} letterSpacing={o.tracking||0} fill={o.color} textAnchor={o.align==='left'?'start':o.align==='right'?'end':'middle'}>{o.value}</text>;
}
export function CardArtwork({art,label,className='template-card'}){
 const fonts=getCardFonts();return <svg className={className} viewBox={`0 0 ${art.width} ${art.height}`} role="img" aria-label={label} xmlns="http://www.w3.org/2000/svg">
 <defs><style>{Object.entries(fonts).filter(([name])=>art.ops.some(o=>o.type==='text'&&o.font===name)).map(([name,data])=>`@font-face{font-family:'${name}';src:url(data:font/ttf;base64,${data}) format('truetype');}`).join('\n')}</style></defs>
 {art.ops.map((o,i)=>o.type==='image'?<image key={i} data-deed-source-artwork={o.sourceArtwork} href={o.src} x={o.x} y={o.y} width={o.w} height={o.h}/>:o.type==='rect'?<rect key={i} x={o.x} y={o.y} width={o.w} height={o.h} fill={o.fill}/>:o.type==='icon'?<svg key={i} data-deed-icon={o.name} x={o.x} y={o.y} width={o.w} height={o.h} viewBox={o.viewBox.join(' ')} fill={o.color}>{o.paths.map((d,j)=><path key={j} d={d}/>)}</svg>:<NativeCardText key={i} op={o}/>)}
 </svg>;
}
export function TemplateCard({board,tile}){useCardFonts();return <CardArtwork art={deedArtwork(board,tile)} label={`${tile.name} Photoshop deed layout`}/>;}
export function TemplateEventCard({board,deckKey,card}){useCardFonts();return <CardArtwork art={eventArtwork(board,deckKey,card)} label={`${card.title} Photoshop event layout`} className="template-event-card"/>;}
