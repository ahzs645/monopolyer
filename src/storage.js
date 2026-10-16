import JsonUrl from '@firstform/json-url';
import { Buffer } from 'buffer';
// json-url 4.2's urlsafe-base64 decoder expects Buffer in the browser.
globalThis.Buffer ??= Buffer;
import DOMPurify from 'dompurify';
import { validateBoard } from './model';

const codec = JsonUrl('lzstring');
export const STORAGE_KEY='monopolyer.design.v1';
export function sanitizeLogo(svg){
 if(typeof svg!=='string'||svg.length>200000)throw new Error('Please use an SVG smaller than 200 KB.');
 const parsed=new DOMParser().parseFromString(svg,'image/svg+xml');
 if(parsed.querySelector('parsererror')||parsed.documentElement.localName!=='svg')throw new Error('This file is not a valid SVG.');
 // Flatten presentation CSS into SVG attributes so Illustrator-style class-based logos keep their colors.
 const allowed=new Set(['fill','fill-opacity','fill-rule','stroke','stroke-width','stroke-linecap','stroke-linejoin','stroke-miterlimit','stroke-dasharray','stroke-dashoffset','stroke-opacity','opacity','clip-path','clip-rule','color','font-size','font-weight','font-family','text-anchor','dominant-baseline','display','visibility','stop-color','stop-opacity','filter','mask']);
 const applyStyle=(el,style)=>{for(const prop of style){const val=style.getPropertyValue(prop).trim();if(allowed.has(prop)&&val&&!/expression|javascript:|@import/i.test(val)&&(!/url\s*\(/i.test(val)||/^url\(['"]?#[\w.-]+['"]?\)$/i.test(val)))el.setAttribute(prop,val);}};
 for(const tag of parsed.querySelectorAll('style')){
  try{const sheet=new CSSStyleSheet();sheet.replaceSync(tag.textContent);for(const rule of sheet.cssRules){if(rule.selectorText&&rule.style){for(const el of parsed.querySelectorAll(rule.selectorText))applyStyle(el,rule.style);}}}catch{/* Unsupported CSS is omitted; vector shapes remain. */}
 }
 for(const el of parsed.querySelectorAll('[style]')){const style=document.createElement('span').style;style.cssText=el.getAttribute('style');applyStyle(el,style);}
 const flattened=new XMLSerializer().serializeToString(parsed.documentElement);
 const clean=DOMPurify.sanitize(flattened,{USE_PROFILES:{svg:true,svgFilters:true},FORBID_TAGS:['style','image','foreignObject','a','animate','animateMotion','animateTransform','set','script'],FORBID_ATTR:['style']});
 const doc=new DOMParser().parseFromString(clean,'image/svg+xml');
 for(const el of [doc.documentElement,...doc.querySelectorAll('*')]){
  for(const attr of [...el.attributes]){
   const val=attr.value.trim();
   if(/href$/i.test(attr.name)&&!val.startsWith('#'))el.removeAttribute(attr.name);
   else if(/url\s*\(/i.test(val)&&!/^url\(['"]?#[\w.-]+['"]?\)$/i.test(val))el.removeAttribute(attr.name);
  }
 }
 doc.documentElement.setAttribute('xmlns','http://www.w3.org/2000/svg');
 return new XMLSerializer().serializeToString(doc.documentElement);
}
export function prepareBoard(data){
 const board=validateBoard(data);
 if(board.logo)board.logo=sanitizeLogo(board.logo);
 for(const tile of board.tiles){const art=tile.customArtwork;if(!art)continue;if(art.kind==='svg')art.data=sanitizeLogo(art.data);else if(!/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(art.data))throw new Error('Invalid uploaded space artwork. Use PNG, JPEG or SVG.');}
 return board;
}
export async function encodeBoard(board){return codec.compress(validateBoard(board));}
export async function decodeBoard(token){
 if(!token||token.length>120000)throw new Error('This share link is missing or too large. Please import a project file instead.');
 try{return prepareBoard(await codec.decompress(token));}catch{throw new Error('This share link is invalid or uses an unsupported project version.');}
}
export function makeShareUrl(token){return `${location.origin}${location.pathname}#board=${token}`;}
export function saveLocal(board){localStorage.setItem(STORAGE_KEY,JSON.stringify(board));}
export function loadLocal(){const raw=localStorage.getItem(STORAGE_KEY);return raw?prepareBoard(JSON.parse(raw)):null;}
export function download(data,filename,type='application/octet-stream'){
 const url=URL.createObjectURL(new Blob([data],{type}));const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
}
export function fileName(board){return (board.title.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'my-board');}
