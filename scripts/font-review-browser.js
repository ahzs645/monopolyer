// Development-only overlay harness. Mutations affect this disposable browser
// context only; production code and project data are not modified.
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Board} from '../src/Board.jsx';
import {CardArtwork} from '../src/TemplateCard.jsx';
import {createBoard} from '../src/model.js';
import {deedArtwork,eventArtwork,sourceLine} from '../src/psdCards.js';
import cards from '../src/reference-assets/cards.json';
import {getBoardSource} from '../src/boardSource.js';
import {ensureCardFonts} from '../src/cardFonts.jsx';
import {loadMoneyTemplate,moneyArtwork,MONEY_VALUES} from '../src/moneyArtwork.js';
import {startPdf} from '../src/exports.js';
import {referenceMoneyPdf} from '../src/moneyArtwork.js';
import {vectorizeSvg,serializeVector} from '../src/vectorExports.js';

export async function captureReview(){
 await ensureCardFonts();await document.fonts.ready;
 const output={},fields={};
 const boardSvg=board=>renderToStaticMarkup(React.createElement(Board,{board,interactive:false}));
 for(const preset of ['campus','photoshop']){
  const board=createBoard(preset);output[`${preset}-source`]={svg:boardSvg(board),width:6000,height:6000};
  board.bandEdges='clean';output[`${preset}-clean`]={svg:boardSvg(board),width:6000,height:6000};
  board.bandEdges='source';const {source,template}=getBoardSource(board),saved=source.tiles.map(t=>({...t}));
  for(const t of board.tiles.filter(t=>t.kind==='property')){board.tiles[t.id].name=template.fields[t.id].name.original.replace(/\r/g,'\n');source.tiles[t.id].name='AUDIT_FORCE_NAME';source.tiles[t.id].price=t.price+1;}
  output[`${preset}-native-labels`]={svg:boardSvg(board),width:6000,height:6000};
  source.tiles=saved;fields[preset]=Object.fromEntries(board.tiles.filter(t=>t.kind==='property').map(t=>[t.id,{name:template.fields[t.id].name.box,price:template.fields[t.id].price.box}]));
 }
 const board=createBoard('printopoly');board.tiles[1].name='Mediterranean Ave';board.groups[0]='#430144';board.decks.chance.cards[0]={title:'Community Chest and\nChance Card Templates',text:'Sorry no graphics'};
 const cardSvg=(art,label)=>renderToStaticMarkup(React.createElement(CardArtwork,{art,label}));
 const sources={deed:deedArtwork(board,board.tiles[1]),event:eventArtwork(board,'chance',board.decks.chance.cards[0])};
 for(const [name,art] of Object.entries(sources))output[`${name}-source`]={svg:cardSvg(art,name),width:art.width,height:art.height};
 const cached=Object.fromEntries(Object.entries(cards.fonts).map(([name,font])=>[name,font.lines]));for(const font of Object.values(cards.fonts))font.lines={};
 for(const [name,art] of Object.entries({deed:deedArtwork(board,board.tiles[1]),event:eventArtwork(board,'chance',board.decks.chance.cards[0])}))output[`${name}-native`]={svg:cardSvg(art,name),width:art.width,height:art.height};
 const rebuiltEvent={...sources.event,ops:sources.event.ops.flatMap(op=>{
   if(op.type!=='image')return [op];
   for(const [font,lines] of Object.entries(cached))for(const line of Object.values(lines))if(line.src===op.src)return sourceLine(line.text,font,line.anchorX,line.baseline,{size:line.size,scaleY:line.scaleY,align:line.align});
   return [op];
 })};
 output['event-native-reference']={svg:cardSvg(rebuiltEvent,'Native source wording, including source trailing spaces'),width:900,height:525};
 for(const [name,lines] of Object.entries(cached))cards.fonts[name].lines=lines;
 const north=createBoard('northern-health');output.northern={svg:boardSvg(north),width:6000,height:6000};output['northern-vector']={svg:serializeVector(await vectorizeSvg(output.northern.svg)),width:6000,height:6000};
 for(let i=0;i<MONEY_VALUES.length;i++){
  const original=await loadMoneyTemplate(i);output[`bill-${MONEY_VALUES[i]}-source`]={svg:original,width:1030,height:490};output[`bill-${MONEY_VALUES[i]}-north`]={svg:moneyArtwork(original,north,i),width:1030,height:490};
 }
 const money=createBoard('campus');money.money.players=1;money.money.quantities.fill(1);const doc=await referenceMoneyPdf(money,startPdf);const northPdf=await referenceMoneyPdf(north,startPdf);return {output,fields,pdfs:{'original-bills':[...new Uint8Array(doc.output('arraybuffer'))],'northern-bills':[...new Uint8Array(northPdf.output('arraybuffer'))]}};
}
