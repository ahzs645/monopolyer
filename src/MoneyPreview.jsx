import {useBillFont} from './billHeadingFont';
import React,{useEffect,useState} from 'react';
import {loadMoneyTemplate,moneyArtwork,MONEY_VALUES,billFontStatus} from './moneyArtwork';
import {moneyTotal} from './model';
export function MoneyPreview({board}){
 useBillFont();
 const missing=billFontStatus(board);
 const [templates,setTemplates]=useState([]),[error,setError]=useState('');
 useEffect(()=>{let active=true;Promise.all(MONEY_VALUES.map((_,i)=>loadMoneyTemplate(i))).then(values=>{if(active)setTemplates(values);}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[]);
 const reference=board.money.style!=='studio';
 return <div className="money-preview"><div className="preview-description"><h3>Your custom bills</h3><p>{board.money.players} player sets · {board.currency}{moneyTotal(board).toLocaleString()} each</p></div>
 {reference&&missing.length>0&&<p className="font-draft-note">Bill lettering: source Myriad-Roman outlines are reused; {missing.join(', ')} need the matching font. Load it in Money for an exact match.</p>}
 {error&&<p role="alert">{error}</p>}
 <div className="banknote-grid">{board.money.denominations.map((value,i)=><article className={reference?'reference-banknote':'banknote'} style={reference?undefined:{background:board.money.colors[i],color:board.ink}} key={i}>{reference?(templates[i]?<img data-money-note={i} alt={`${value} reference-style bill`} src={'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(moneyArtwork(templates[i],board,i))}/>:<p>Loading bill…</p>):<><small>{board.money.bankName}</small><strong>{board.currency}{value.toLocaleString()}</strong><span>{board.title}</span></>}<footer>{board.money.quantities[i]} PER PLAYER · PLAY MONEY</footer></article>)}</div></div>;
}
