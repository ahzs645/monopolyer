import {useEffect,useState} from 'react';
export const CARD_FONT_NAMES=['Cornerstone','KabobLight','KabobExtrabold','CataneoBT-Regular','ArialNarrow-Bold','HelveticaNeue-BoldItalic'];
let fonts={};const listeners=new Set();let initialized=false;
export const BUNDLED_CARD_FONTS=['KabobLight','Cornerstone','CataneoBT-Regular','ArialNarrow-Bold'];
let bundledPromise;
const publish=()=>listeners.forEach(fn=>fn({...fonts}));
export function getCardFonts(){return fonts;}
export function missingCardFonts(){return CARD_FONT_NAMES.filter(name=>!fonts[name]);}
async function install(name,base64){
 const bytes=Uint8Array.from(atob(base64),c=>c.charCodeAt(0));const face=new FontFace(name,bytes.buffer);await face.load();document.fonts.add(face);fonts={...fonts,[name]:base64};publish();
}
export function ensureCardFonts(){
 if(typeof window==='undefined')return Promise.resolve();
 return bundledPromise??=Promise.allSettled(BUNDLED_CARD_FONTS.map(async name=>{
  if(fonts[name])return;
  try{const local=localStorage.getItem(`monopolyer.card-font.${name}`);if(local){await install(name,local);return;}}catch{}
  const response=await fetch(`${import.meta.env.BASE_URL}template-fonts/${name}.ttf`);if(!response.ok)throw new Error(`${name} could not load.`);const bytes=new Uint8Array(await response.arrayBuffer());let raw='';for(let i=0;i<bytes.length;i+=8192)raw+=String.fromCharCode(...bytes.subarray(i,i+8192));await install(name,btoa(raw));
 }));
}

export function fontNamesFromTtf(buffer){
 const view=new DataView(buffer);const names=[];
 if(buffer.byteLength<12||view.getUint32(0)!==0x00010000)throw new Error('Please use a TrueType (.ttf) font.');
 const count=view.getUint16(4);let offset;
 for(let i=0;i<count;i++){const base=12+i*16;if(base+16>buffer.byteLength)throw new Error('Invalid TrueType table.');if(view.getUint32(base)===0x6e616d65){offset=view.getUint32(base+8);break;}}
 if(offset===undefined||offset+6>buffer.byteLength)throw new Error('This font has no readable name table.');
 const records=view.getUint16(offset+2),strings=offset+view.getUint16(offset+4);
 for(let i=0;i<records;i++){const base=offset+6+i*12;if(base+12>buffer.byteLength)break;const platform=view.getUint16(base),id=view.getUint16(base+6),length=view.getUint16(base+8),start=strings+view.getUint16(base+10);if(![1,2,4,6].includes(id)||start+length>buffer.byteLength)continue;const encoding=platform===0||platform===3?'utf-16be':'latin1';names.push(new TextDecoder(encoding).decode(buffer.slice(start,start+length)));}
 return [...new Set(names)];
}

export async function uploadCardFont(name,file){
 if(!CARD_FONT_NAMES.includes(name))throw new Error('Unknown template font.');if(file.size>2000000)throw new Error('Use a TTF font under 2 MB.');
 const buffer=await file.arrayBuffer();const names=fontNamesFromTtf(buffer);const normalize=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');const target=normalize(name);if(!names.some(n=>normalize(n).includes(target))&&!names.some(a=>names.some(b=>normalize(a+b).includes(target))))throw new Error(`This font identifies as ${names[0]||'unknown'}, not ${name}. Choose the matching original font file.`);const bytes=new Uint8Array(buffer);if(new DataView(buffer).getUint32(0)!==0x00010000)throw new Error('Please use a TrueType (.ttf) font, which can also be embedded in the PDF.');
 let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));const data=btoa(binary);await install(name,data);
 try{localStorage.setItem(`monopolyer.card-font.${name}`,data);}catch{throw new Error('Font loaded for this session. Browser storage is full; keep your font file to reload later.');}
}
export function useCardFonts(){
 const [state,setState]=useState(fonts);
 useEffect(()=>{listeners.add(setState);if(!initialized){initialized=true;ensureCardFonts();for(const name of CARD_FONT_NAMES.filter(name=>!BUNDLED_CARD_FONTS.includes(name))){try{const raw=localStorage.getItem(`monopolyer.card-font.${name}`);if(raw)install(name,raw).catch(()=>{});}catch{}}}return()=>listeners.delete(setState);},[]);return state;
}
export function CardFontControls({onNotice}){
 const fonts=useCardFonts();return <details className="card-font-controls"><summary>Exact Photoshop fonts · {Object.keys(fonts).length}/{CARD_FONT_NAMES.length} loaded</summary><p>Four matching fonts from your uploaded archives load automatically: KabobLight, Cornerstone, CataneoBT-Regular and ArialNarrow-Bold. Load KabobExtrabold and HelveticaNeue-BoldItalic for the remaining styles. Additional uploaded fonts stay on this device and are not added to share URLs.</p>{CARD_FONT_NAMES.map(name=><label key={name}><strong>{name}</strong><span>{fonts[name]?'Loaded':'Font file needed'}</span><input aria-label={`Load ${name} TTF`} type="file" accept=".ttf,font/ttf" onChange={async e=>{const file=e.target.files?.[0];e.target.value='';if(file)try{await uploadCardFont(name,file);onNotice?.(`${name} loaded for previews and PDF exports.`);}catch(err){onNotice?.(err.message);}}}/></label>)}<p>Source lettering works without uploading fonts. Text that contains unavailable characters uses a fallback; load the matching font for those characters. Unmodified PSDs are also included in the print downloads.</p></details>;
}
