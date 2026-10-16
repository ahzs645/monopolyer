import northernHealthLogo from './reference-assets/northern-health-logo.js';
import { z } from 'zod';

export const GROUP_NAMES = ['Brown', 'Sky', 'Rose', 'Orange', 'Red', 'Gold', 'Green', 'Blue'];
export const PRINTOPOLY_COLORS=['#964b00','#00ffff','#6a0dad','#ffa500','#ff0000','#ffff00','#00ff00','#0000ff'];
export const DEFAULT_COLORS = ['#87533e', '#9dcbdc', '#c86896', '#e99a47', '#d65b51', '#e6c95d', '#549975', '#4a79b8'];
export const ICONS = ['home','train','bolt','drop','gift','question','car','lock','gavel','coin','tree','book','coffee','building','star','heart'];
const rents = [
 [2,10,30,90,160,250],[4,20,60,180,320,450],
 [6,30,90,270,400,550],[6,30,90,270,400,550],[8,40,100,300,450,600],
 [10,50,150,450,625,750],[10,50,150,450,625,750],[12,60,180,500,700,900],
 [14,70,200,550,750,950],[14,70,200,550,750,950],[16,80,220,600,800,1000],
 [18,90,250,700,875,1050],[18,90,250,700,875,1050],[20,100,300,750,925,1100],
 [22,110,330,800,975,1150],[22,110,330,800,975,1150],[24,120,360,850,1025,1200],
 [26,130,390,900,1100,1275],[26,130,390,900,1100,1275],[28,150,450,1000,1200,1400],
 [35,175,500,1100,1300,1500],[50,200,600,1400,1700,2000]
];
const names = ['Oak Avenue','Willow Lane','Maple Street','Birch Boulevard','Cedar Court','Rose Avenue','Garden Walk','Orchid Place','Sunset Drive','Amber Street','Harvest Lane','Coral Avenue','Ruby Street','Cherry Lane','Golden Square','Saffron Street','Sunflower Way','Forest Avenue','Meadow Lane','Emerald Gardens','Harbour View','Summit Place'];
const positions = [1,3,6,8,9,11,13,14,16,18,19,21,23,24,26,27,29,31,32,34,37,39];
const groups = [0,0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,6,6,6,7,7];
const prices = [60,60,100,100,120,140,140,160,180,180,200,220,220,240,260,260,280,300,300,320,350,400];
const events = {
 chance: [
  ['A fresh start','Advance to {{go}}. Collect {{currency}}200.'],
  ['The view from the top','Advance to {{tile:39}}. If you pass {{go}}, collect {{currency}}200.'],
  ['Next stop','Advance to the nearest transport. If unowned, you may buy it. Otherwise pay the owner twice the usual rent.'],
  ['Power up','Advance to the nearest utility. If owned, pay ten times a new dice roll.'],
  ['Good investment','Collect a dividend of {{currency}}50 from the bank.'],
  ['A little detour','Go back three spaces.'],
  ['Time out','Go directly to {{jail}}. Do not pass {{go}} or collect {{currency}}200.'],
  ['Get out of jail free','Keep this card until needed or trade it. Return it to the deck when used.'],
  ['Looking after the neighbourhood','Pay {{currency}}25 per house and {{currency}}100 per hotel you own.'],
  ['Travel plans','Advance to {{tile:5}}. If you pass {{go}}, collect {{currency}}200.'],
  ['A small fine','Pay the bank {{currency}}15.'],
  ['Team celebration','Pay each other player {{currency}}50.'],
  ['Building fund','Collect {{currency}}150 from the bank.'],
  ['A winning idea','Collect {{currency}}100 from the bank.'],
  ['Your next project','Advance to {{tile:24}}. If you pass {{go}}, collect {{currency}}200.'],
  ['Community visit','Advance to {{tile:11}}. If you pass {{go}}, collect {{currency}}200.']
 ],
 chest: [
  ['New beginnings','Advance to {{go}}. Collect {{currency}}200.'],
  ['A happy surprise','Collect {{currency}}200 from the bank.'],
  ['Annual check-up','Pay the bank {{currency}}50.'],
  ['Sold your old equipment','Collect {{currency}}50 from the bank.'],
  ['Get out of jail free','Keep this card until needed or trade it. Return it to the deck when used.'],
  ['Time out','Go directly to {{jail}}. Do not pass {{go}} or collect {{currency}}200.'],
  ['Holiday fund','Collect {{currency}}100 from the bank.'],
  ['Tax refund','Collect {{currency}}20 from the bank.'],
  ['Happy birthday','Collect {{currency}}10 from each other player.'],
  ['Insurance payment','Collect {{currency}}100 from the bank.'],
  ['Unexpected expense','Pay the bank {{currency}}100.'],
  ['Learning something new','Pay the bank {{currency}}50.'],
  ['Consulting fee','Collect {{currency}}25 from the bank.'],
  ['Street repairs','Pay {{currency}}40 per house and {{currency}}115 per hotel you own.'],
  ['Local award','Collect {{currency}}10 from the bank.'],
  ['A gift for you','Collect {{currency}}100 from the bank.']
 ]
};
export const DEFAULT_RULES = `BEFORE YOU BEGIN\nChoose a banker. Each player starts with {{currency}}1,500: five 1s, one 5, two 10s, one 20, one 50, four 100s, and two 500s. Shuffle both event decks separately. Put all tokens on {{go}}.\n\nTAKE A TURN\nRoll two dice and move clockwise. Collect {{currency}}200 when you pass or land on {{go}}. Doubles let you roll again; three doubles in a row send you to {{jail}}.\n\nBUY, TRADE & BUILD\nBuy an unowned property at its printed price, or auction it among all players. Pay rent to the owner of an unmortgaged property. Owning an entire color group doubles the unimproved rent. Build evenly across a complete group: up to four houses, then replace four houses with a hotel, paying the building cost again. The bank holds 32 houses and 12 hotels.\n\nSPECIAL SPACES\nFollow event-card instructions and return used cards to the bottom of the deck, except retained cards. Pay taxes to the bank. Free parking gives no payment. On Just Visiting, take no action. In {{jail}}, pay {{currency}}50, use a release card, or try for doubles for up to three turns; after the third failed roll pay {{currency}}50 and move by that roll. A release by doubles does not give another roll.\n\nMORTGAGES & BANKRUPTCY\nSell buildings back at half cost, evenly across their group. Mortgage unimproved properties for the amount on the deed; pay that amount plus 10% to redeem. Trade mortgaged properties by agreement; the buyer pays 10% interest immediately and another 10% later if not redeemed at transfer. If you cannot pay a debt after selling and mortgaging, give remaining assets to the creditor and leave the game. If the bank is the creditor, auction the properties. The last player remaining wins.\n\nMAKE IT YOURS\nAgree on any house rules before playing. Use small objects as player tokens. Printable houses and hotels are included; fold on the dashed lines and glue the tabs.`;

export function createBoard(preset = 'studio') {
 const tiles = Array.from({length:40}, (_,id)=>({id,kind:'event',name:'',icon:'star',color:'#205847',price:0,group:0,rents:[0,0,0,0,0,0],houseCost:50,mortgage:0}));
 positions.forEach((id,i)=>Object.assign(tiles[id],{kind:'property',name:names[i],group:groups[i],price:prices[i],rents:[...rents[i]],houseCost:50*(Math.floor(groups[i]/2)+1),mortgage:prices[i]/2,icon:'home'}));
 [[0,'go','GO','star'],[10,'jail','Jail','lock'],[20,'parking','Free Parking','car'],[30,'gotojail','Go to Jail','gavel'],[4,'tax','Income Tax','coin'],[38,'tax','Luxury Tax','coin'],[12,'utility','Electric Company','bolt'],[28,'utility','Water Works','drop']].forEach(([id,kind,name,icon])=>Object.assign(tiles[id],{kind,name,icon,price:kind==='tax'?(id===4?200:100):kind==='utility'?150:0,mortgage:kind==='utility'?75:0,color:kind==='tax'?'#976739':'#205847'}));
 [5,15,25,35].forEach((id,i)=>Object.assign(tiles[id],{kind:'rail',name:['Central Station','West Station','North Station','East Station'][i],icon:'train',price:200,mortgage:100,rents:[25,50,100,200,0,0]}));
 [7,22,36].forEach(id=>Object.assign(tiles[id],{name:'Chance',icon:'question',color:'#d38b46'}));
 [2,17,33].forEach(id=>Object.assign(tiles[id],{name:'Community Chest',icon:'gift',color:'#4b85a1'}));
 const board={version:1,boardStyle:'studio',title:'YOUR COMPANY',subtitle:'The places. The people. The possibilities.',currency:'$',background:'#e5eee2',ink:'#203e34',accent:'#205847',logo:'',logoSize:180,groups:[...DEFAULT_COLORS],decks:{chance:{name:'Chance',color:'#d38b46',cards:events.chance.map(([title,text])=>({title,text}))},chest:{name:'Community Chest',color:'#4b85a1',cards:events.chest.map(([title,text])=>({title,text}))}},tiles,money:{bankName:'THE COMPANY BANK',players:4,denominations:[1,5,10,20,50,100,500],quantities:[5,1,2,1,1,4,2],colors:['#e8e3d4','#ecd4db','#dce6d2','#d8e3ef','#e8d9bb','#e7cbba','#d9d1e4']},rules:DEFAULT_RULES};
 if(preset==='printopoly'){board.title='Printopoly';board.subtitle='';board.background='#d4fcda';board.ink='#000000';board.accent='#ff0000';board.groups=[...PRINTOPOLY_COLORS];board.boardStyle='classic';for(const [id,faIcon,color] of [[5,'FaTrain','#000000'],[15,'FaTrain','#000000'],[25,'FaTrain','#000000'],[35,'FaTrain','#000000'],[12,'FaBriefcase','#ffff00'],[28,'FaShoppingCart','#0000ff'],[10,'FaRegFrown','#000000'],[20,'FaParking','#ff0000'],[30,'FaGavel','#000000'],[4,'FaMoneyBillAlt','#ffa500'],[38,'FaMoneyBillAlt','#6a0dad'],[7,'FaDice','#ffa500'],[22,'FaDice','#ffa500'],[36,'FaDice','#ffa500'],[2,'FaBoxOpen','#0000ff'],[17,'FaBoxOpen','#0000ff'],[33,'FaBoxOpen','#0000ff']])Object.assign(board.tiles[id],{faIcon,color});board.decks.chance.color='#ffa500';board.decks.chest.color='#0000ff';for(const [id,artwork] of [[0,'go'],[10,'jail'],[20,'parking'],[30,'police']])board.tiles[id].artwork=artwork;}
 if(preset==='campus'||preset==='photoshop'||preset==='northern-health'){
  board.boardStyle='campus';board.groups=['#590c38','#87a5d6','#ee3878','#f57f23','#ef3a24','#fde703','#13a55b','#274ea1'];board.ink='#000000';board.title='UNBCOPOLY';board.subtitle='';board.background='#cbe8e0';board.accent='#00573d';board.money.bankName='THE CAMPUS BANK';
  const campus=['Neyoh Residence','Keyoh Residence','International Office','NBCGSS Office','NUGSS Office','Bioenergy Plant','Access Resource Center','Academic Success Center','Canfor Theatre','Winter Garden','Administrative Building','Bus Loop','First Nation Center',"Northern Women’s Center",'Cafeteria','Northern Sports Center','Rotunda Gallery','Botanical Gardens','George R. Weller Library','Pride Center','Degrees Coffee Co.','Thirsty Moose Pub'];
  positions.forEach((id,i)=>board.tiles[id].name=campus[i]);
  [5,15,25,35].forEach((id,i)=>board.tiles[id].name=['Parking Lot A','Parking Lot B','Parking Lot C','Parking Lot D'][i]);
  board.tiles[4].name='Increased Tuition';board.tiles[38].name='Student Debt';board.tiles[12].name='Student Services';board.tiles[28].name='Bookstore';board.tiles[38].price=75;board.tiles[10].name='Dean’s Office';board.tiles[30].name='Go to Dean’s Office';
  for(const [id,artwork] of [[0,'go'],[10,'jail'],[20,'parking'],[30,'police'],[5,'parkingSign'],[15,'parkingSign'],[25,'parkingSign'],[35,'parkingSign'],[12,'information'],[28,'book'],[7,'chance'],[22,'chance'],[36,'chance'],[2,'mail'],[17,'mail'],[33,'mail']])board.tiles[id].artwork=artwork;
  board.decks.chance.color='#ed00d5';board.decks.chest.color='#3262c5';
  board.decks.chest.name='Campus Mail';[2,17,33].forEach(id=>board.tiles[id].name='Campus Mail');
 }
 if(preset==='photoshop'){board.boardStyle='photoshop';board.title='nugssOPOLY';board.ink='#040707';board.accent='#0f7abb';board.groups=['#590a38','#87a5d6','#ee3778','#f57f23','#ef3923','#fae90b','#13a55c','#264da1'];}
 if(preset==='northern-health'){board.title='Northern Healthopoly';board.titleMode='logo-suffix';board.titleSuffix='opoly';board.titleSuffixSize=.56;board.titleColor='#005699';board.logo=northernHealthLogo;board.bandEdges='clean';board.money.headingMode='board';board.money.headingColor='#000000';board.money.monochrome=true;}
 return board;
}
const color=z.string().regex(/^#[0-9a-f]{6}$/i);
const amount=z.number().finite().min(0).max(1000000);
const customArtwork=z.object({kind:z.enum(['svg','raster']),name:z.string().max(120),data:z.string().max(500000)});
const tile=z.object({customArtwork:customArtwork.optional(),id:z.number().int().min(0).max(39),kind:z.enum(['property','rail','utility','event','go','jail','parking','gotojail','tax']),name:z.string().max(60),faIcon:z.string().regex(/^Fa[A-Za-z0-9]+$/).max(80).optional(),artwork:z.enum(['none','go','parking','jail','police','chance','mail','parkingSign','information','book']).optional(),icon:z.enum(ICONS),color,price:amount,group:z.number().int().min(0).max(7),rents:z.array(amount).length(6),houseCost:amount,mortgage:amount});
const deck=z.object({name:z.string().max(32),color,cards:z.array(z.object({title:z.string().max(80),text:z.string().max(600)})).min(1).max(64)});
export const boardSchema=z.object({version:z.literal(1),boardStyle:z.enum(['classic','campus','photoshop','studio']).default('studio'),title:z.string().max(48),subtitle:z.string().max(120),currency:z.enum(['$','£','€','¥','M','C']),currencyIcon:z.string().regex(/^Fa[A-Za-z0-9]+$/).max(80).optional(),background:color,ink:color,accent:color,titleColor:color.optional(),titleMode:z.enum(['text','logo-suffix']).optional(),bandEdges:z.enum(['auto','clean','source']).optional(),titleSuffix:z.string().max(24).optional(),titleSuffixSize:z.number().min(.2).max(1.2).optional(),titleSuffixUppercase:z.boolean().optional(),titleScale:z.number().min(.5).max(1.5).optional(),logoColor:color.optional(),logo:z.string().max(280000),logoSize:z.number().min(60).max(280),groups:z.array(color).length(8),tiles:z.array(tile).length(40),decks:z.object({chance:deck,chest:deck}),money:z.object({headingMode:z.enum(['original','board','custom','bank']).optional(),headingText:z.string().max(48).optional(),headingColor:color.optional(),style:z.enum(['reference','studio']).optional(),tint:z.boolean().optional(),monochrome:z.boolean().optional(),personalize:z.boolean().optional(),bankName:z.string().max(48),players:z.number().int().min(1).max(8),denominations:z.array(amount).length(7),quantities:z.array(z.number().int().min(0).max(20)).length(7),colors:z.array(color).length(7)}),rules:z.string().max(16000)}).superRefine((b,ctx)=>{const base=createBoard();b.tiles.forEach((t,i)=>{if(t.id!==i||t.kind!==base.tiles[i].kind)ctx.addIssue({code:'custom',message:'The board must keep its 40-space layout.',path:['tiles',i]});});});
export function validateBoard(data){return boardSchema.parse(data);}
export function expandText(text, board) {
 return text.replace(/\{\{(currency|go|jail|tile:\d+)\}\}/g,(_,key)=>key==='currency'?board.currency:key==='go'?board.tiles[0].name:key==='jail'?board.tiles[10].name:board.tiles[Number(key.slice(5))]?.name||'property');
}
export function deedTiles(board){return board.tiles.filter(t=>['property','rail','utility'].includes(t.kind));}
export function boardSizeMm(board){return board.boardStyle==='campus'||board.boardStyle==='classic'||board.boardStyle==='photoshop'?508:500;}
export function moneyTotal(board){return board.money.denominations.reduce((sum,value,i)=>sum+value*board.money.quantities[i],0);}
export function tilePosition(id){
 if(id===0)return {x:865,y:865,w:135,h:135,rotation:0};
 if(id<10)return {x:865-id*81.111111,y:865,w:81.111111,h:135,rotation:0};
 if(id===10)return {x:0,y:865,w:135,h:135,rotation:0};
 if(id<20)return {x:0,y:865-(id-10)*81.111111,w:135,h:81.111111,rotation:90};
 if(id===20)return {x:0,y:0,w:135,h:135,rotation:180};
 if(id<30)return {x:135+(id-21)*81.111111,y:0,w:81.111111,h:135,rotation:180};
 if(id===30)return {x:865,y:0,w:135,h:135,rotation:180};
 return {x:865,y:135+(id-31)*81.111111,w:135,h:81.111111,rotation:270};
}

export function readableInk(color){
 const values=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);
 const luminance=values[0]*.2126+values[1]*.7152+values[2]*.0722;return luminance>.179?'#203e34':'#ffffff';
}
