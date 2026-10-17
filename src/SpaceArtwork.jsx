import React,{useState} from 'react';
import {Check} from 'lucide-react';
import {ICONS} from './model';
import {SvgIcon} from './Board';
import {IconPicker} from './original/IconPicker';
import {ICON_COMPONENTS,originalArtwork} from './spaceIcons';
import {ARTWORK_NAMES} from './reference-assets/artwork';
import {ArtworkInput} from './ArtworkInput';

// A space shows exactly one artwork source: uploaded artwork wins, then an
// original illustration, then a vector icon.
export const artworkMode=tile=>tile.customArtwork?'upload':tile.artwork&&tile.artwork!=='none'?'original':'icon';
const MODES=[['original','Original art'],['icon','Icon'],['upload','Your artwork']];
const iconName=name=>name.replace(/^Fa/,'').replace(/([a-z])([A-Z])/g,'$1 $2');

// Switching tabs only browses; the space changes when a choice is made.
export function SpaceArtwork({board,tile,onChange,onNotice}){
 const active=artworkMode(tile),[mode,setMode]=useState(active);
 const update=patch=>onChange(t=>({...t,...patch}));
 const iconOnly={artwork:'none',customArtwork:undefined};
 const current=active==='upload'?tile.customArtwork.name:active==='original'?ARTWORK_NAMES[tile.artwork]||tile.artwork:tile.faIcon?iconName(tile.faIcon):tile.icon;
 const fallbackArt=originalArtwork(board,tile.id);
 return <section className="field space-artwork" aria-label="Space artwork">
  <span>Space artwork</span>
  <div className="segmented artwork-source" role="group" aria-label="Artwork source">{MODES.map(([id,label])=><button key={id} type="button" className={mode===id?'active':''} aria-pressed={mode===id} onClick={()=>setMode(id)}>{label}{active===id&&<Check size={14} aria-label="in use"/>}</button>)}</div>
  <p className="artwork-status">On the board: <strong>{MODES.find(([id])=>id===active)[1]} · {current}</strong></p>
  {mode==='original'&&<label className="artwork-control"><span>Original PSD illustration</span><select aria-label="Original PSD illustration" value={active==='original'?tile.artwork:''} onChange={e=>update({artwork:e.target.value,customArtwork:undefined})}>{active!=='original'&&<option value="" disabled>Choose an illustration…</option>}{Object.entries(ARTWORK_NAMES).map(([key,name])=><option key={key} value={key}>{name}{key===fallbackArt?' · this space’s original':''}</option>)}</select></label>}
  {mode==='icon'&&<>
   <div className="icon-picker" role="group" aria-label="Space icon">{ICONS.map(icon=>{const on=active==='icon'&&!tile.faIcon&&tile.icon===icon;return <button type="button" title={icon} aria-label={`Use ${icon} icon`} aria-pressed={on} className={on?'selected':''} key={icon} onClick={()=>update({icon,faIcon:undefined,...iconOnly})}><SvgIcon name={icon} size={21}/></button>;})}</div>
   <div className="icon-search-row"><IconPicker ariaLabel="Choose another space icon" value={tile.faIcon||ICON_COMPONENTS[tile.icon]} containerStyles={{left:0,top:48,width:'min(340px, 74vw)',maxHeight:320,gap:4}} onChange={faIcon=>update({faIcon,...iconOnly})}/><p><strong>Search all icons</strong><small>{active==='icon'&&tile.faIcon?`Using ${iconName(tile.faIcon)}`:'Font Awesome · type to filter'}</small></p></div>
   {tile.kind!=='event'&&<label className="color-field"><input aria-label="Icon color" type="color" value={tile.color} onChange={e=>update({color:e.target.value,...(active==='icon'?{}:iconOnly)})}/><span><strong>Icon color</strong><small>{tile.color.toUpperCase()}</small></span></label>}
  </>}
  {mode==='upload'&&<ArtworkInput value={tile.customArtwork} onChange={art=>update({customArtwork:art})} onNotice={onNotice}/>}
 </section>;
}
