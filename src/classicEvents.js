import illustrations from './reference-assets/classic-events.json';
import {expandText,readableInk} from './model';
import {fitText,nativeTextMetrics} from './textLayout';

// These are illustration traces from donutheist/monopoly-vectors, not scans of
// complete cards. Keep artwork as paths; compose editable text in a fixed slot.
export const CLASSIC_PAPER={chance:'#f9b76b',chest:'#ffe782'};
const automatic={
 chance:['advance-to-go','take-a-walk-on-the-boardwalk','advance-to-nearest-railroad','advance-to-nearest-utility','bank-pays-you-dividend','go-back-3-spaces','go-directly-to-jail','get-out-of-jail-free','make-general-repairs','take-a-ride-on-the-reading','pay-poor-tax','you-have-been-elected','your-building-and-loan-matures','bank-pays-you-dividend','advance-to-illinois-ave','advance-to-st-charles-place'],
 chest:['advance-to-go','bank-error-in-your-favor','doctor-s-fee','from-sale-of-stock','get-out-of-jail-free','go-to-jail','xmas-fund-matures','income-tax-refund','grand-opera-opening','life-insurance-matures','pay-hospital','pay-school-tax','receive-for-services','you-are-assessed-for-street-repairs','you-have-won-second-prize-in-a-beauty-contest','you-inherit-100']
};
export const classicIllustrationOptions=key=>Object.entries(illustrations).filter(([,a])=>a.deck===key).map(([value,a])=>({value,label:a.label}));
export const defaultIllustration=(key,index)=>`${key}-${automatic[key][Math.max(0,index)%automatic[key].length]}`;
export function classicEventArtwork(board,key,card,line){
 const deck=board.decks[key],paper=deck.paperColor||CLASSIC_PAPER[key],ink=readableInk(paper)==='#ffffff'?'#ffffff':'#040707';
 const illustration=card.illustration||defaultIllustration(key,deck.cards.indexOf(card)),art=illustrations[illustration];
 const ops=[{type:'rect',x:0,y:0,w:900,h:525,fill:paper}];
 const text=(value,font,box,size)=>{
  const tracking=font==='ArialNarrow-Bold'?-.03:.075;
  const layout=fitText(value,{width:box.w,height:box.h,fontSize:size,lineHeight:1.12,measure:(v,s)=>nativeTextMetrics(v,s,font).width+Math.max(0,v.length-1)*tracking*s});
  layout.lines.forEach((v,i)=>{if(v)ops.push(...line(v,font,box.x+box.w/2,box.y+(box.h-layout.height)/2+i*layout.lineHeight+layout.size*.84,{size:layout.size,maxWidth:box.w,color:ink,native:true}));});
 };
 text(deck.name,'CataneoBT-Regular',{x:45,y:20,w:810,h:75},58);
 const title=deck.showCardTitle!==false&&card.title.trim();
 if(title)text(card.title,'ArialNarrow-Bold',{x:45,y:108,w:810,h:55},36);
 const top=title?190:125,height=475-top;
 if(art){ops.push({type:'icon',name:illustration,sourceArtwork:'monopoly-vectors',x:40,y:top,w:340,h:height,viewBox:art.viewBox,paths:art.paths,color:ink});}
 text(expandText(card.text,board),'ArialNarrow-Bold',{x:art?425:55,y:top,w:art?425:790,h:height},46);
 return {width:900,height:525,appearance:'classic',ops,fallbacks:ops.filter(o=>o.fallback)};
}
