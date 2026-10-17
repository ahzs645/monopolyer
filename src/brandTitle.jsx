import React from 'react';
import {nativeTextMetrics} from './textLayout';
import {suffixFontId,suffixOutline,useSuffixFont} from './suffixFonts';

// Keep the uploaded original intact; a monochrome presentation is reversible.
export function presentedLogo(svg,color){
 if(!color)return svg;
 return svg.replace(/\s(fill|stroke)="([^"]*)"/g,(all,key,value)=>value==='none'?all:` ${key}="${color}"`).replace(/<svg\b([^>]*)>/,(all,attrs)=>'<svg'+attrs.replace(/\sfill="[^"]*"/g,'')+' fill="'+color+'">');
}
export function logoAspect(svg){const m=svg.match(/viewBox\s*=\s*["']([^"']+)["']/i);const box=m?.[1].trim().split(/[\s,]+/).map(Number);return box?.length===4&&box[2]>0&&box[3]>0?box[2]/box[3]:3;}
export function BrandTitle({board,width=3400,height=650}){
 const color=board.titleColor||board.accent,typedSuffix=board.titleSuffix??'opoly',suffix=board.titleSuffixUppercase?typedSuffix.toUpperCase():typedSuffix,logoWidth=100*logoAspect(board.logo),fontSize=100*(board.titleSuffixSize??.56);
 const fontId=suffixFontId(board),loaded=useSuffixFont(fontId),gap=suffix?2:0,baseline=100*(board.titleSuffixBaseline??.763);
 const outline=loaded&&suffix?suffixOutline(loaded,suffix,logoWidth+gap,baseline,fontSize):null;
 const textWidth=outline?outline.width:nativeTextMetrics(suffix,fontSize,'Arial',true,false).width,total=logoWidth+gap+textWidth,titleScale=board.titleScale??1,scale=Math.min(width/total,height/100)*titleScale;
 return <g data-brand-title="logo-suffix" data-title-scale={titleScale} aria-label={board.title} fill={color} transform={`scale(${scale}) translate(${-total/2} -50)`}>
  <image data-company-logo="true" href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(presentedLogo(board.logo,board.titleLogoOriginalColors?undefined:color))}`} x="0" y="0" width={logoWidth} height="100" preserveAspectRatio="xMidYMid meet"/>
  {outline?<path data-title-suffix="true" data-suffix-font={fontId} d={outline.d}><title>{suffix}</title></path>:<text data-title-suffix="true" data-suffix-font={loaded||fontId==='Arial'?'Arial':'loading'} x={logoWidth+gap} y={baseline} fontFamily="Arial, Helvetica, sans-serif" fontSize={fontSize} fontWeight="600">{suffix}</text>}
 </g>;
}
