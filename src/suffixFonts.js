import {useEffect,useState} from 'react';
import opentype from 'opentype.js';
import {SUFFIX_FONT_IDS} from './model';
export {SUFFIX_FONT_IDS};

// Fonts for the "OPOLY" suffix beside an uploaded logo. Suffixes are drawn as
// glyph outlines, so previews, SVG and PDF exports look identical everywhere.
export const SUFFIX_FONTS=[
 ['Kabel','Printopoly Kabel · matches the page title','reference-assets/kabel.woff'],
 ['KabobExtrabold','Kabob Extrabold · board lettering','template-fonts/KabobExtrabold.ttf'],
 ['KabobLight','Kabob Light · space names','template-fonts/KabobLight.ttf'],
 ['HelveticaNeue-BoldItalic','Helvetica Neue Bold Italic · board title','template-fonts/HelveticaNeue-BoldItalic.ttf'],
 ['Cornerstone','Cornerstone · card titles','template-fonts/Cornerstone.ttf'],
 ['ArialNarrow-Bold','Arial Narrow Bold','template-fonts/ArialNarrow-Bold.ttf'],
 ['CataneoBT-Regular','Cataneo script','template-fonts/CataneoBT-Regular.ttf'],
 ['Arial','Arial semibold · system font',null],
];
export const DEFAULT_SUFFIX_FONT='Kabel';
// Suffix size and baseline were tuned with Arial capitals. Other fonts are
// scaled to the same capital height so switching fonts keeps the alignment.
export const ARIAL_CAP_HEIGHT=.716;

const fonts={},pending={},listeners=new Set();
export const suffixFontId=board=>SUFFIX_FONT_IDS.includes(board.titleSuffixFont)?board.titleSuffixFont:DEFAULT_SUFFIX_FONT;
export function getSuffixFont(id){return fonts[id];}
export function loadSuffixFont(id){
 const url=SUFFIX_FONTS.find(([key])=>key===id)?.[2];
 if(!url||typeof window==='undefined')return Promise.resolve(null);
 if(fonts[id])return Promise.resolve(fonts[id]);
 return pending[id]??=fetch(`${import.meta.env.BASE_URL}${url}`).then(r=>{if(!r.ok)throw new Error(`${id} could not load.`);return r.arrayBuffer();}).then(buffer=>{
  const font=opentype.parse(buffer),cap=font.charToGlyph('H').getBoundingBox().y2/font.unitsPerEm;
  fonts[id]={font,capHeight:cap>0?cap:ARIAL_CAP_HEIGHT};listeners.forEach(fn=>fn());return fonts[id];
 }).catch(err=>{delete pending[id];throw err;});
}
export function useSuffixFont(id){
 const [,refresh]=useState(0);
 useEffect(()=>{const fn=()=>refresh(n=>n+1);listeners.add(fn);loadSuffixFont(id).catch(()=>{});return()=>listeners.delete(fn);},[id]);
 return fonts[id];
}
export function suffixOutline(loaded,text,x,y,size){
 const {font,capHeight}=loaded,fontSize=size*ARIAL_CAP_HEIGHT/capHeight;
 return {d:font.getPath(text,x,y,fontSize).toPathData(3),width:font.getAdvanceWidth(text,fontSize)};
}
