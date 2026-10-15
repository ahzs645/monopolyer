export const GROUP_KEYS=['brown','cyan','purple','orange','red','yellow','green','blue'];
const slots=[[1,3],[6,8,9],[11,13,14],[16,18,19],[21,23,24],[26,27,29],[31,32,34],[37,39]];
const special={tax1:4,tax2:38,util1:12,util2:28,rail1:5,rail2:15,rail3:25,rail4:35,chance:7,chest:2,jail:10,parking:20};
const currencyIcons={'$':'FaDollarSign','£':'FaPoundSign','€':'FaEuroSign','¥':'FaYenSign',M:'FaMoneyBillAlt',C:'FaCoins'};
const vectorFa={home:'FaHome',train:'FaTrain',bolt:'FaBolt',drop:'FaTint',gift:'FaBoxOpen',question:'FaDice',car:'FaParking',lock:'FaRegFrown',gavel:'FaGavel',coin:'FaMoneyBillAlt',tree:'FaTree',book:'FaBook',coffee:'FaCoffee',building:'FaBuilding',star:'FaStar',heart:'FaHeart'};
export function toOriginalMaster(board){
 const master={title:board.title,currency:board.currencyIcon||currencyIcons[board.currency]};
 slots.forEach((ids,g)=>{master[`${GROUP_KEYS[g]}color`]=board.groups[g];ids.forEach((id,i)=>master[`${GROUP_KEYS[g]}${i+1}`]=board.tiles[id].name);});
 for(const [key,id] of Object.entries(special)){const t=board.tiles[id];master[key]=t.name;master[`${key}price`]=String(t.price);master[`${key}icon`]=t.faIcon||vectorFa[t.icon];master[`${key}color`]=t.color;}
 master.parking=board.tiles[20].name.replace(/^Free\s+/i,'');master.chance=board.decks.chance.name;master.chest=board.decks.chest.name;master.chancecolor=board.decks.chance.color;master.chestcolor=board.decks.chest.color;
 master.railicon=board.tiles[5].faIcon||'FaTrain';master.railcolor=board.tiles[5].color;master.gojailicon=board.tiles[30].faIcon||'FaGavel';master.gojailcolor=board.tiles[30].color;
 return master;
}
export function fromOriginalMaster(board,next){
 const previous=toOriginalMaster(board);const copy=structuredClone(board);
 const update=(key,fn)=>{if(next[key]!==previous[key])fn(next[key]);};
 update('title',v=>copy.title=v.slice(0,48));update('currency',v=>{copy.currencyIcon=v;copy.currency=Object.keys(currencyIcons).find(k=>currencyIcons[k]===v)||'M';});
 slots.forEach((ids,g)=>{update(`${GROUP_KEYS[g]}color`,v=>copy.groups[g]=v);ids.forEach((id,i)=>update(`${GROUP_KEYS[g]}${i+1}`,v=>copy.tiles[id].name=v.slice(0,60)));});
 for(const [key,id] of Object.entries(special)){
  update(key,v=>{copy.tiles[id].name=(key==='parking'?'Free '+v:v).slice(0,60);if(key==='jail')copy.tiles[30].name=('Go to '+v).slice(0,60);});update(`${key}icon`,v=>{copy.tiles[id].faIcon=v;copy.tiles[id].artwork='none';});update(`${key}color`,v=>copy.tiles[id].color=v);
 }
 for(const key of ['chance','chest']){const ids=key==='chance'?[7,22,36]:[2,17,33];update(key,v=>{copy.decks[key].name=v.slice(0,32);ids.forEach(id=>copy.tiles[id].name=v.slice(0,32));});update(`${key}icon`,v=>ids.forEach(id=>{copy.tiles[id].faIcon=v;copy.tiles[id].artwork='none';}));update(`${key}color`,v=>{copy.decks[key].color=v;ids.forEach(id=>copy.tiles[id].color=v);});}
 update('railicon',v=>[5,15,25,35].forEach(id=>{copy.tiles[id].faIcon=v;copy.tiles[id].artwork='none';}));update('railcolor',v=>[5,15,25,35].forEach(id=>copy.tiles[id].color=v));update('gojailicon',v=>{copy.tiles[30].faIcon=v;copy.tiles[30].artwork='none';});update('gojailcolor',v=>copy.tiles[30].color=v);
 return copy;
}
export function originalPrices(board){const values={};slots.forEach((ids,g)=>ids.forEach((id,i)=>values[`${GROUP_KEYS[g]}${i+1}`]={price:String(board.tiles[id].price)}));return values;}
