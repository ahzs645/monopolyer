import React,{useState} from 'react';
import {SvgIcon,SourceIcon} from './Board';
import {ORIGINAL_ARTWORK} from './reference-assets/artwork';

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
  <div className="adcontainer"><button className="ad" onClick={onTemplates}><strong>Start with your campus board</strong><span>Your original illustrations, campus names, and familiar layout.</span></button><button className="ad" onClick={onSources}><strong>Compare with your originals</strong><span>Overlay the uploaded board and see which source elements are reused.</span></button></div>
  <section className="upcoming"><h2>Everything in your custom edition</h2><p>SVG company logos · Custom colors · Property deeds · Editable event cards · Custom money · Printable game kit · Save and share with json-url</p></section>
  </section><p className="bottomscript">Reference design by Marcell Sarosi · Customized for your Monopolyer project</p>
 </main>;
}
export function GroupedPropertyEditors({board,onChange,onFocus}){
 return <section className="reference-property-groups" aria-label="Grouped property editor"><h3 className="heading2">Properties</h3>
  {board.groups.map((color,group)=>{const tiles=board.tiles.filter(t=>t.kind==='property'&&t.group===group);return <section className="neu" key={group}><h4 className="neutext">Property group {group+1}:</h4>
   <label className="reference-input-row"><span className="desc">Property color:</span><input aria-label={`Property group ${group+1} color`} type="color" className="colorinput" value={color} onChange={e=>onChange(b=>({...b,groups:b.groups.map((c,i)=>i===group?e.target.value:c)}))}/></label>
   {tiles.map((tile,i)=><label className="reference-input-row" key={tile.id}><span className="desc">Property {group+1}/{i+1}</span><input className="input" aria-label={`Property ${group+1}/${i+1}`} maxLength={60} value={tile.name} onFocus={()=>onFocus(tile.id,group)} onChange={e=>onChange(b=>({...b,tiles:b.tiles.map(t=>t.id===tile.id?{...t,name:e.target.value}:t)}))}/></label>)}
   {!tiles.length&&<p className="muted">Assign a property to this group in Spaces.</p>}
  </section>;})}
 </section>;
}
export function SpacePreviews({board,onSelect,groupRefs}){
 const groups=board.groups.map((_,group)=>({key:group,title:`Property group ${group+1}`,tiles:board.tiles.filter(t=>t.kind==='property'&&t.group===group)}));
 groups.push({key:'special',title:'Special spaces',tiles:board.tiles.filter(t=>t.kind!=='property')});
 return <div className="reference-space-previews"><h2 className="reference-board-title">{board.title}</h2>{groups.map(({key,title,tiles})=><section className="reference-preview-group" key={key} ref={el=>{groupRefs.current[key]=el;}}><h3>{title}</h3><div className="exprow">{tiles.map(tile=><button key={tile.id} className={`space ${tile.kind==='property'?'property':'railroad'}`} aria-label={`Edit ${tile.name}`} onClick={()=>onSelect(tile.id)}><div className="container">
  {tile.kind==='property'&&<div className="color-bar" style={{background:board.groups[tile.group]}}/>}<div className="name">{tile.kind==='event'?([7,22,36].includes(tile.id)?board.decks.chance.name:board.decks.chest.name):tile.name}</div>
  {tile.kind!=='property'&&(ORIGINAL_ARTWORK[tile.artwork]?<img className="drawing original-illustration" src={ORIGINAL_ARTWORK[tile.artwork]} alt="Original PSD illustration"/>:<SourceIcon className="drawing" tile={tile} size={64} style={{color:tile.kind==='event'?(board.decks[[7,22,36].includes(tile.id)?'chance':'chest'].color):tile.color}}/>)}
  <div className="price">{tile.price?`Price ${board.currency}${tile.price}`:tile.kind==='go'?`Collect ${board.currency}200`:''}</div></div></button>)}</div></section>)}</div>;
}

export function WebsiteOverlay(){
 const [kind,setKind]=useState('home'),[opacity,setOpacity]=useState(50);
 return <section className="website-comparison"><div className="segmented"><button className={kind==='home'?'active':''} onClick={()=>setKind('home')}>BUILD page</button><button className={kind==='editor'?'active':''} onClick={()=>setKind('editor')}>Editor</button></div><label className="website-opacity">Original website opacity: {opacity}%<input aria-label="Original website opacity" type="range" min="0" max="100" value={opacity} onChange={e=>setOpacity(Number(e.target.value))}/></label><p>0% shows the revised app. 100% shows your archived Printopoly reference. These are comparison snapshots.</p><div className="website-overlay-frame"><img alt="Revised website design" src={`${import.meta.env.BASE_URL}references/revised-site-${kind}.jpg`}/><img alt="Original website design overlay" src={`${import.meta.env.BASE_URL}references/original-site-${kind}.jpg`} style={{opacity:opacity/100}}/></div></section>;
}
