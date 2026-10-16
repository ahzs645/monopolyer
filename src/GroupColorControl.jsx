import React,{useEffect,useState} from 'react';
import {createBoard} from './model';
export function GroupColorControl({color,label,onChange,resetColor,compact=false}){
 const [hex,setHex]=useState(color.toUpperCase()),[invalid,setInvalid]=useState(false);
 useEffect(()=>{setHex(color.toUpperCase());setInvalid(false);},[color]);
 const parse=value=>/^#?[0-9a-f]{6}$/i.test(value.trim())?'#'+value.trim().replace(/^#/,'').toLowerCase():null;
 const commit=()=>{const value=parse(hex);if(value){onChange(value);setHex(value.toUpperCase());setInvalid(false);}else setInvalid(true);};
 return <div className={`group-color-control ${compact?'compact':''}`}><label className="group-color-swatch"><input type="color" aria-label={`${label} color`} value={color} onChange={e=>onChange(e.target.value)}/><span>{compact?'Group color':label}</span></label><input className="group-color-hex" aria-label={`${label} hex`} aria-invalid={invalid} spellCheck="false" value={hex} maxLength={7} onChange={e=>{const value=e.target.value;setHex(value);setInvalid(false);const parsed=parse(value);if(parsed)onChange(parsed);}} onBlur={commit} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();commit();}if(e.key==='Escape'){setHex(color.toUpperCase());setInvalid(false);}}}/>{resetColor&&<button type="button" className="text-button group-color-reset" aria-label={`Reset ${label.toLowerCase()} color`} disabled={color.toLowerCase()===resetColor.toLowerCase()} onClick={()=>onChange(resetColor)}>Reset</button>}{invalid&&<small className="color-error" role="alert">Use six hex digits, such as #590A38.</small>}</div>;
}
export function originalGroupColors(board){return createBoard(board.boardStyle==='classic'?'printopoly':board.boardStyle||'studio').groups;}
export function GroupPalette({board,onChange}){
 const defaults=originalGroupColors(board);
 return <div className="setup-group-palette">{board.groups.map((color,group)=><GroupColorControl key={group} color={color} label={`Property group ${group+1}`} resetColor={defaults[group]} onChange={value=>onChange(b=>({...b,groups:b.groups.map((c,i)=>i===group?value:c)}))}/>)}</div>;
}
