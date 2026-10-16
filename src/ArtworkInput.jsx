import React,{useRef,useState} from 'react';
import {readArtwork,artworkHref} from './customArtwork';
import {sanitizeLogo} from './storage';
export function ArtworkInput({value,onChange,onNotice}){
 const input=useRef();const [markup,setMarkup]=useState('');
 const useFile=async file=>{try{if(file)onChange(await readArtwork(file));}catch(e){onNotice(e.message);}};
 const useSvg=text=>{try{onChange({kind:'svg',name:'Pasted SVG',data:sanitizeLogo(text)});setMarkup('');}catch(e){onNotice(e.message);}};
 const pasteEvent=e=>{const file=[...e.clipboardData.items].find(i=>i.kind==='file'&&i.type.startsWith('image/'))?.getAsFile();const text=e.clipboardData.getData('text/plain');if(file){e.preventDefault();useFile(file);}else if(/<svg[\s>]/i.test(text)){e.preventDefault();useSvg(text);}};
 const paste=async()=>{try{
  if(!navigator.clipboard?.read)throw new Error('Click the artwork box and press Ctrl+V / ⌘V, or paste SVG markup below.');
  const items=await navigator.clipboard.read();for(const item of items){const type=['image/svg+xml','image/png','image/jpeg','text/plain'].find(t=>item.types.includes(t));if(!type)continue;const blob=await item.getType(type);if(type==='text/plain'){useSvg(await blob.text());return;}await useFile(new File([blob],'Pasted artwork'+(type==='image/svg+xml'?'.svg':'.png'),{type}));return;}
  onNotice('Copy an image or SVG markup first.');
 }catch{onNotice('Click the artwork box and press Ctrl+V / ⌘V, or paste SVG markup below.');}};
 const copy=async()=>{try{if(value.kind==='svg')await navigator.clipboard.writeText(value.data);else{let blob=await (await fetch(value.data)).blob();if(blob.type!=='image/png'){const img=await createImageBitmap(blob),canvas=document.createElement('canvas');canvas.width=img.width;canvas.height=img.height;canvas.getContext('2d').drawImage(img,0,0);img.close();blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));}await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);}onNotice('Artwork copied. Select another space and paste it.');}catch{onNotice('Clipboard access is unavailable. Upload the same file to the other space.');}};
 return <section className="custom-artwork-input" aria-label="Custom space artwork"><h3>Upload or paste artwork</h3><p>The image fits the current icon slot. Space names and prices stay in place.</p><input ref={input} className="hidden" type="file" accept=".svg,image/svg+xml,image/png,image/jpeg,image/webp,image/gif" aria-label="Upload space artwork" onChange={e=>{useFile(e.target.files?.[0]);e.target.value='';}}/>
 <div className="artwork-paste-target" tabIndex="0" role="group" aria-label="Paste space artwork here" onPaste={pasteEvent}>{value?<><img src={artworkHref(value)} alt="Custom space artwork"/><strong>{value.name}</strong><small>{value.kind==='svg'?'SVG · vector artwork':'Image · raster artwork'}</small></>:<><strong>Upload an SVG or image</strong><small>Or click here and press Ctrl+V / ⌘V</small></>}</div>
 <div className="button-row"><button className="button outline" onClick={()=>input.current.click()}>Upload artwork</button><button className="button outline" onClick={paste}>Paste from clipboard</button>{value&&<><button className="text-button" onClick={copy}>Copy artwork</button><button className="text-button" onClick={()=>onChange(undefined)}>Remove uploaded artwork</button></>}</div>
 <details><summary>Paste SVG markup</summary><textarea aria-label="Paste SVG markup" value={markup} onChange={e=>setMarkup(e.target.value)} placeholder={'<svg viewBox="0 0 100 100">…</svg>'} rows="4"/><button className="button outline" disabled={!markup.trim()} onClick={()=>useSvg(markup)}>Apply SVG</button></details>
 {value?.kind==='raster'&&<p className="muted">Images are included in PNG, source-matched SVG/PDF and project files. For vector downloads, replace this image with an SVG made from paths.</p>}</section>;
}
