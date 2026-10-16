// Fit complete wording inside a fixed source slot. Never move its anchor or
// discard characters: wrap words (including long unbroken names), then shrink.
export function fitText(value,{width,height,fontSize=66,lineHeight=1.04,measure,singleLine=false}){
 if(singleLine){const text=String(value).replace(/\s+/g,' ').trim().toUpperCase();const size=Math.min(fontSize,width/Math.max(.001,measure(text,1)),height/lineHeight);return {lines:[text],size,lineHeight:size*lineHeight,width:measure(text,size),height:size*lineHeight};}
 const paragraphs=String(value).replace(/\r\n?/g,'\n').toUpperCase().split('\n');
 const wrap=size=>paragraphs.flatMap(para=>{
  const lines=[];let line='';
  for(const word of para.trim().split(/\s+/).filter(Boolean)){
   if(line&&measure(line+' '+word,size)<=width){line+=' '+word;continue;}
   if(line){lines.push(line);line='';}
   let piece='';for(const char of word){if(piece&&measure(piece+char,size)>width){lines.push(piece);piece=char;}else piece+=char;}line=piece;
  }
  if(line||!lines.length)lines.push(line);return lines;
 });
 let size=fontSize,lines=wrap(size);
 for(let i=0;i<100&&(lines.length*size*lineHeight>height||lines.some(l=>measure(l,size)>width));i++){
  const ratio=Math.min(height/(lines.length*size*lineHeight),...lines.map(l=>width/Math.max(.001,measure(l,size))));size*=Math.min(.96,ratio);lines=wrap(size);
 }
 return {lines,size,lineHeight:size*lineHeight,width:Math.max(0,...lines.map(l=>measure(l,size))),height:lines.length*size*lineHeight};
}
let canvas;
export function nativeTextMetrics(value,size,font,bold=false,italic=false,kerning='auto'){
 if(typeof document==='undefined')return {width:value.length*size*.55,ascent:size*.72,descent:size*.12};
 canvas??=document.createElement('canvas');const ctx=canvas.getContext('2d');ctx.font=`${italic?'italic ':''}${bold?'bold ':''}${size}px "${font}", Arial, sans-serif`;ctx.fontKerning=kerning;const m=ctx.measureText(value);
 return {width:m.width,ascent:m.actualBoundingBoxAscent||size*.72,descent:m.actualBoundingBoxDescent||0};
}
export function subtractRectangles(region,cuts){
 let regions=[region];
 for(const [cx,cy,cw,ch] of cuts)regions=regions.flatMap(([x,y,w,h])=>{const l=Math.max(x,cx),t=Math.max(y,cy),r=Math.min(x+w,cx+cw),b=Math.min(y+h,cy+ch);if(l>=r||t>=b)return [[x,y,w,h]];return [[x,y,w,t-y],[x,b,w,y+h-b],[x,t,l-x,b-t],[r,t,x+w-r,b-t]].filter(a=>a[2]>0&&a[3]>0);});
 return regions;
}
