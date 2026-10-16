import {sanitizeLogo} from './storage';
export const artworkHref=art=>art?.kind==='svg'?`data:image/svg+xml;charset=utf-8,${encodeURIComponent(art.data)}`:art?.data;
export async function readArtwork(file){
 if(file.size>5000000)throw new Error('Please use artwork smaller than 5 MB.');
 const name=(file.name||'Pasted artwork').slice(0,120);
 if(file.type==='image/svg+xml'||/\.svg$/i.test(name)){return {kind:'svg',name,data:sanitizeLogo(await file.text())};}
 if(!/^image\/(png|jpeg|webp|gif)$/.test(file.type))throw new Error('Choose an SVG, PNG, JPEG, WebP or GIF image.');
 const bitmap=await createImageBitmap(file);
 try{
  if(bitmap.width*bitmap.height>50000000)throw new Error('Use an image smaller than 50 megapixels.');
  const canvas=document.createElement('canvas');const scale=Math.min(1,768/Math.max(bitmap.width,bitmap.height));canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('This browser could not read the image.');ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
  const type=file.type==='image/jpeg'?'image/jpeg':'image/png';let data=canvas.toDataURL(type,.9);
  while(data.length>500000&&canvas.width>128&&canvas.height>128){const small=document.createElement('canvas');small.width=Math.round(canvas.width*.75);small.height=Math.round(canvas.height*.75);small.getContext('2d').drawImage(canvas,0,0,small.width,small.height);canvas.width=small.width;canvas.height=small.height;ctx.drawImage(small,0,0);data=canvas.toDataURL(type,.9);}
  if(data.length>500000)throw new Error('This image is too detailed. Please use a smaller image.');
  return {kind:'raster',name,data};
 }finally{bitmap.close();}
}
