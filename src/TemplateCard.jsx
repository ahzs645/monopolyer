import React from 'react';
import {readableInk} from './model';
import {getCardFonts,useCardFonts} from './cardFonts';
export function TemplateCard({board,tile}){
 useCardFonts();const fonts=getCardFonts();const money=n=>`${board.currency}${n}`;const color=tile.kind==='property'?board.groups[tile.group]:tile.color;const ink=readableInk(color);
 return <svg className="template-card" viewBox="0 0 788 900" role="img" aria-label={`${tile.name} Photoshop deed layout`} xmlns="http://www.w3.org/2000/svg">
 <defs><style>{Object.entries(fonts).map(([name,data])=>`@font-face{font-family:'${name}';src:url(data:font/ttf;base64,${data}) format('truetype');}`).join('\n')}</style></defs>
 <rect width="788" height="900" fill="#fff"/><rect x="20" y="20" width="748" height="860" fill="#fff" stroke="#000" strokeWidth="2"/>
 <rect x="40" y="38" width="708" height="160" fill={color} stroke="#000" strokeWidth="3"/>
 <g fill="#000" fontFamily="KabobLight, Arial, sans-serif" textAnchor="middle">
 <text x="394" y="79" fontSize="27" letterSpacing="8" fill={ink}>TITLE DEED</text>
 <text x="394" y="158" fontSize={Math.min(51,1100/Math.max(tile.name.length,18))} fontFamily={tile.kind==='property'?'Cornerstone, Arial, sans-serif':'KabobExtrabold, Arial, sans-serif'} fontWeight={fonts.Cornerstone?'normal':'bold'} fill={ink}>{tile.name.toUpperCase()}</text>
 {tile.kind==='property'?<><text x="394" y="286" fontSize="38">RENT {money(tile.rents[0])}</text>{['With 1 House','With 2 Houses','With 3 Houses','With 4 Houses'].map((label,i)=><g key={label} fontSize="38"><text x="110" y={343+i*57} textAnchor="start">{label}</text><text x="680" y={343+i*57} textAnchor="end">{money(tile.rents[i+1])}.</text></g>)}<text x="394" y="576" fontSize="38">With HOTEL {money(tile.rents[5])}.</text><text x="394" y="633" fontSize="38">Mortgage Value {money(tile.mortgage)}.</text><text x="394" y="690" fontSize="38">Houses cost {money(tile.houseCost)} each.</text><text x="394" y="747" fontSize="38">Hotels, {money(tile.houseCost)} plus 4 houses</text></>:tile.kind==='rail'?<>{['Rent','If 2 transports are owned','If 3 transports are owned','If 4 transports are owned'].map((label,i)=><g key={label} fontSize="34"><text x="90" y={345+i*80} textAnchor="start">{label}</text><text x="690" y={345+i*80} textAnchor="end">{money(tile.rents[i])}</text></g>)}<text x="394" y="750" fontSize="38">Mortgage Value {money(tile.mortgage)}</text></>:<g fontSize="36"><text x="394" y="350">If one utility is owned, rent is</text><text x="394" y="400">4 times the amount on dice.</text><text x="394" y="510">If both utilities are owned, rent is</text><text x="394" y="560">10 times the amount on dice.</text><text x="394" y="750">Mortgage Value {money(tile.mortgage)}</text></g>}
 </g></svg>;
}
