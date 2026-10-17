import React,{useEffect,useState} from 'react';
import {createBoard} from './model';
import {TemplateCard} from './TemplateCard';
export function GroupColorControl({color,label,onChange,resetColor,compact=false}){
 const [hex,setHex]=useState(color.toUpperCase()),[invalid,setInvalid]=useState(false);
 useEffect(()=>{setHex(color.toUpperCase());setInvalid(false);},[color]);
 const parse=value=>/^#?[0-9a-f]{6}$/i.test(value.trim())?'#'+value.trim().replace(/^#/,'').toLowerCase():null;
 const commit=()=>{const value=parse(hex);if(value){onChange(value);setHex(value.toUpperCase());setInvalid(false);}else setInvalid(true);};
 return <div className={`group-color-control ${compact?'compact':''}`}><label className="group-color-swatch"><input type="color" aria-label={`${label} color`} value={color} onChange={e=>onChange(e.target.value)}/><span>{compact?'Group color':label}</span></label><input className="group-color-hex" aria-label={`${label} hex`} aria-invalid={invalid} spellCheck="false" value={hex} maxLength={7} onChange={e=>{const value=e.target.value;setHex(value);setInvalid(false);const parsed=parse(value);if(parsed)onChange(parsed);}} onBlur={commit} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();commit();}if(e.key==='Escape'){setHex(color.toUpperCase());setInvalid(false);}}}/>{resetColor&&<button type="button" className="text-button group-color-reset" aria-label={`Reset ${label.toLowerCase()} color`} disabled={color.toLowerCase()===resetColor.toLowerCase()} onClick={()=>onChange(resetColor)}>Reset</button>}{invalid&&<small className="color-error" role="alert">Use six hex digits, such as #590A38.</small>}</div>;
}
export function originalGroupColors(board){return createBoard(board.boardStyle==='classic'?'printopoly':board.boardStyle||'studio').groups;}
export function GroupPalette({board,onChange,onOpenGroup,onSelect}){
 const [open,setOpen]=useState(null);
 const defaults=originalGroupColors(board);
 return <div className="setup-group-palette">{board.groups.map((color,group)=>{
  const tiles=board.tiles.filter(t=>t.kind==='property'&&t.group===group),expanded=open===group,cost=tiles.every(t=>t.houseCost===tiles[0]?.houseCost)?tiles[0]?.houseCost:'';
  return <section className={`property-group-setup ${expanded?'is-open':''}`} aria-label={`Property group ${group+1} setup`} key={group}>
   <button className="group-setup-toggle" aria-label={`${expanded?'Close':'Open'} property group ${group+1}`} aria-expanded={expanded} onClick={()=>{setOpen(expanded?null:group);if(!expanded)onOpenGroup?.(group);}}><span>Property group {group+1}</span><small>{tiles.length} deeds {expanded?'−':'+'}</small></button>
   <GroupColorControl compact color={color} label={`Property group ${group+1}`} resetColor={defaults[group]} onChange={value=>onChange(b=>({...b,groups:b.groups.map((c,i)=>i===group?value:c)}))}/>
   {expanded&&<div className="group-setup-content">
    <label>House / hotel cost for this group<input type="number" min="0" max="1000000" aria-label={`Group ${group+1} house / hotel cost`} value={cost??''} placeholder={tiles.length?'Mixed values':'No properties'} disabled={!tiles.length} onChange={e=>{const value=e.target.valueAsNumber;if(Number.isFinite(value))onChange(b=>({...b,tiles:b.tiles.map(t=>t.kind==='property'&&t.group===group?{...t,houseCost:Math.max(0,Math.min(1000000,value))}:t)}));}}/></label><small>Applies to every property in this group. Open a deed to edit its name, price, mortgage and rents.</small>
    <div className="group-member-deeds">{tiles.map(tile=><button key={tile.id} aria-label={`Open property ${tile.name}`} onClick={()=>onSelect?.(tile.id)}><TemplateCard board={board} tile={tile}/><strong>{tile.name}</strong><span>{board.currency}{tile.price}</span></button>)}</div>
    {!tiles.length&&<p>Assign properties to this group in Spaces.</p>}
   </div>}
  </section>;
 })}</div>;
}
