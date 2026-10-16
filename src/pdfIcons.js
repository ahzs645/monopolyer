import svgpath from 'svgpath';
// Use the same filled SVG paths as the preview. No icon bitmap is made for PDF.
export function paintIcon(doc,op,x,y,sx,sy){
 const [vx,vy,vw,vh]=op.viewBox,scale=Math.min(op.w/vw,op.h/vh),tx=x+(op.x+(op.w-vw*scale)/2-vx*scale)*sx,ty=y+(op.y+(op.h-vh*scale)/2-vy*scale)*sy;
 doc.setFillColor(op.color);
 for(const d of op.paths){
  const ops=[];svgpath(d).unshort().unarc().abs().matrix([scale*sx,0,0,scale*sy,tx,ty]).iterate((s,_index,cx,cy)=>{
   const [cmd,...c]=s;if(cmd==='M')ops.push({op:'m',c});else if(cmd==='L')ops.push({op:'l',c});else if(cmd==='H')ops.push({op:'l',c:[c[0],cy]});else if(cmd==='V')ops.push({op:'l',c:[cx,c[0]]});else if(cmd==='C')ops.push({op:'c',c});else if(cmd==='Q')ops.push({op:'c',c:[cx+2/3*(c[0]-cx),cy+2/3*(c[1]-cy),c[2]+2/3*(c[0]-c[2]),c[3]+2/3*(c[1]-c[3]),c[2],c[3]]});else if(cmd==='Z')ops.push({op:'h',c:[]});
  });doc.path(ops).fill();
 }
}
