import React,{useState,useId} from 'react';
import {Board} from './Board';
import {spacePreviewLayout} from './spacePreviewLayout';
import {GroupColorControl,originalGroupColors} from './GroupColorControl';

const asset=(name)=>`${import.meta.env.BASE_URL}reference-assets/${name}`;
export function ReferenceWelcome({onBuild,onTemplates,onSources}){
 return <main className="aboutpage reference-welcome">
  <div className="titleContainer1"><h1 className="title1">PRINTOPOLY</h1><p className="subtitle1">Create your own monopoly game!</p></div>
  <section className="desccontainer1"><div className="dicecontainer">
   <div className="welcome-row"><img src={asset('dice-1.svg')} className="dice" alt="One on a die"/><p className="para">Make your own Monopoly-style board. Choose the property names, color schemes, and icons to make it uniquely yours.</p></div>
   <div className="welcome-row"><img src={asset('dice-2.svg')} className="dice" alt="Two on a die"/><p className="para">Add your company’s SVG logo, write your Chance and Community Chest cards, and choose your own currency.</p></div>
   <div className="welcome-row"><img src={asset('dice-3.svg')} className="dice" alt="Three on a die"/><p className="para">See your changes in the instant preview. Compare your board with the artwork you uploaded using the original-art overlay.</p></div>
  </div><p className="build">Click BUILD to start creating your own board</p><div className="buttoncontainer"><button className="buildButton" onClick={onBuild}>BUILD</button></div>
  <p className="blurb">Download a high-resolution board and a complete set of matching cards, money, houses, hotels, and print sheets for A4 paper.</p>
  <div className="adcontainer"><button className="ad" onClick={onTemplates}><strong>Choose a starting template</strong><span>Choose your PNG or Photoshop board, then customize every space and card.</span></button><button className="ad" onClick={onSources}><strong>Compare with your originals</strong><span>Overlay the uploaded board and see which source elements are reused.</span></button></div>
  <section className="upcoming"><h2>Everything in your custom edition</h2><p>SVG company logos · Custom colors · Property deeds · Editable event cards · Custom money · Printable game kit · Save and share with json-url</p></section>
  </section><p className="bottomscript">Reference design by Marcell Sarosi · Customized for your Monopolyer project</p>
 </main>;
}
export function GroupedPropertyEditors({board,onChange,onFocus}){
 return <section className="reference-property-groups" aria-label="Grouped property editor"><h3 className="heading2">Properties</h3>
  {board.groups.map((color,group)=>{const tiles=board.tiles.filter(t=>t.kind==='property'&&t.group===group);return <section className="neu" key={group}><h4 className="neutext">Property group {group+1}:</h4>
   <label className="reference-input-row"><span className="desc">Property color:</span><input aria-label={`Bulk property group ${group+1} color`} type="color" className="colorinput" value={color} onChange={e=>onChange(b=>({...b,groups:b.groups.map((c,i)=>i===group?e.target.value:c)}))}/></label>
   {tiles.map((tile,i)=><label className="reference-input-row" key={tile.id}><span className="desc">Property {group+1}/{i+1}</span><input className="input" aria-label={`Property ${group+1}/${i+1}`} maxLength={60} value={tile.name} onFocus={()=>onFocus(tile.id,group)} onChange={e=>onChange(b=>({...b,tiles:b.tiles.map(t=>t.id===tile.id?{...t,name:e.target.value}:t)}))}/></label>)}
   {!tiles.length&&<p className="muted">Assign a property to this group in Spaces.</p>}
  </section>;})}
 </section>;
}
export function SpacePreviews({board,onSelect,onDetails,onChange,selected,groupRefs,onViewGroup}){
 const uid='current-board-spaces'+useId().replace(/[^a-zA-Z0-9]/g,'');const native=board.boardStyle!=='studio',size=native?6000:1000;
 const [query,setQuery]=useState(''),[filter,setFilter]=useState('all'),[editing,setEditing]=useState(null),[closed,setClosed]=useState({});const defaults=originalGroupColors(board);
 const tileName=tile=>tile.kind==='event'?board.decks[[7,22,36].includes(tile.id)?'chance':'chest'].name:tile.name;
 const matches=tile=>tile.id===editing||tileName(tile).toLowerCase().includes(query.trim().toLowerCase());
 const groups=board.groups.map((color,group)=>({key:String(group),title:`Property group ${group+1}`,color,tiles:board.tiles.filter(t=>t.kind==='property'&&t.group===group)}));
 groups.push({key:'special',title:'Special spaces',tiles:board.tiles.filter(t=>t.kind!=='property')});
 const visible=groups.filter(g=>filter==='all'||g.key===filter).map(g=>({...g,matching:g.tiles.filter(matches)})).filter(g=>g.matching.length||(!query&&g.key!=='special'));
 const update=(id,key,value)=>onChange(b=>({...b,tiles:b.tiles.map(t=>t.id===id?{...t,[key]:value}:t)}));
 return <div className="reference-space-previews"><div className="space-setup-toolbar"><div className="space-setup-heading"><h2>Properties &amp; groups</h2><small>40 spaces · 8 color groups</small></div><p>Change a group color, name or price here. Open a space for rent, icon and layout options.</p><div className="space-setup-filters"><label>Find a space<input type="search" aria-label="Find a space" placeholder="Search by name…" value={query} onChange={e=>{setQuery(e.target.value);setEditing(null);setClosed({});}}/></label><label>Show spaces<select aria-label="Show spaces" value={filter} onChange={e=>{setFilter(e.target.value);setEditing(null);setClosed({});}}><option value="all">All 40 spaces</option>{groups.map(g=><option key={g.key} value={g.key}>{g.key==='special'?'Special spaces':`Group ${Number(g.key)+1}`} ({g.tiles.length})</option>)}</select></label></div><div className="group-list-actions"><button className="text-button" onClick={()=>setClosed({})}>Expand all groups</button><button className="text-button" onClick={()=>setClosed(Object.fromEntries(groups.map(g=>[g.key,true])))}>Collapse all groups</button></div></div>
 <svg className="space-art-library" aria-hidden="true" width="0" height="0"><defs><symbol id={uid} viewBox={`0 0 ${size} ${size}`}><Board board={board} interactive={false} previewSize={size}/></symbol></defs></svg>
 {!visible.length&&<div className="empty-space-search"><p>No spaces match your search.</p><button className="button outline" onClick={()=>{setQuery('');setFilter('all');}}>Clear filters</button></div>}
 {visible.map(({key,title,color,tiles,matching})=><section className="reference-preview-group" aria-label={title} key={key} ref={el=>{groupRefs.current[key]=el;}}><header className="property-group-header"><button className="group-setup-toggle" aria-label={`${closed[key]?'Open':'Close'} ${title.toLowerCase()}`} aria-expanded={!closed[key]} onClick={()=>setClosed(prev=>({...prev,[key]:!prev[key]}))}><span>{title}</span><small>{tiles.length} {tiles.length===1?'space':'spaces'} {closed[key]?'+':'−'}</small></button>{key!=='special'&&<GroupColorControl compact label={`Group ${Number(key)+1}`} color={color} resetColor={defaults[Number(key)]} onChange={value=>onChange(b=>({...b,groups:b.groups.map((c,i)=>i===Number(key)?value:c)}))}/>}{key!=='special'&&<button className="text-button" onClick={()=>onViewGroup?.(Number(key))}>View group deeds</button>}</header>{!closed[key]&&<><div className="current-spaces-grid">{matching.map(tile=>{
  const layout=spacePreviewLayout(board,tile.id),name=tileName(tile);
  return <article key={tile.id} className={`current-space-preview ${selected===tile.id?'selected':''}`} data-space-editor={tile.id}><button className="current-space-artwork" aria-label={`Edit ${name}`} onClick={()=>onDetails(tile.id)}><svg data-current-space={tile.id} data-preview-rotation={layout.rotation} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${layout.w} ${layout.h}`} style={{aspectRatio:`${layout.w}/${layout.h}`}} overflow="hidden" preserveAspectRatio="none" role="img" aria-label={`${name} from your board`}><g transform={layout.transform}><use href={`#${uid}`} width={size} height={size}/></g></svg></button>{tile.kind==='property'?<div className="inline-space-fields"><label>Name<textarea aria-label={`Name for space ${tile.id}`} rows="2" maxLength={60} value={tile.name} onFocus={()=>{setEditing(tile.id);onSelect(tile.id);}} onBlur={()=>setEditing(null)} onChange={e=>update(tile.id,'name',e.target.value)}/></label><label>Price ({board.currency})<input aria-label={`Price for space ${tile.id}`} type="number" min="0" max="1000000" value={tile.price} onFocus={()=>onSelect(tile.id)} onChange={e=>{const value=e.target.valueAsNumber;if(Number.isFinite(value))update(tile.id,'price',Math.max(0,Math.min(1000000,value)));}}/></label></div>:<><strong className="special-space-name">{name}</strong>{tile.price>0&&<small>{board.currency}{tile.price}</small>}</>}<button className="text-button space-details-link" aria-label={`Edit details for ${name}`} onClick={()=>onDetails(tile.id)}>Edit details →</button></article>;
 })}</div>{!tiles.length&&<p className="muted">Assign a property to this group using its space settings.</p>}</>}</section>)}
 </div>;
}

export function WebsiteOverlay(){
 const [kind,setKind]=useState('home'),[opacity,setOpacity]=useState(50);
 return <section className="website-comparison"><div className="segmented"><button className={kind==='home'?'active':''} onClick={()=>setKind('home')}>BUILD page</button><button className={kind==='editor'?'active':''} onClick={()=>setKind('editor')}>Editor</button></div><label className="website-opacity">Original website opacity: {opacity}%<input aria-label="Original website opacity" type="range" min="0" max="100" value={opacity} onChange={e=>setOpacity(Number(e.target.value))}/></label><p>0% shows the revised app. 100% shows your archived Printopoly reference. These are comparison snapshots.</p><div className="website-overlay-frame"><img alt="Revised website design" src={`${import.meta.env.BASE_URL}references/revised-site-${kind}.jpg`}/><img alt="Original website design overlay" src={`${import.meta.env.BASE_URL}references/original-site-${kind}.jpg`} style={{opacity:opacity/100}}/></div></section>;
}
