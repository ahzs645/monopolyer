import {chromium} from 'playwright-core';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const filter=process.argv[4];
const base=process.argv[2]||'http://127.0.0.1:4176/',out=path.resolve(process.argv[3]||'/workspace/font-overlay-review');await mkdir(out,{recursive:true});
const browser=await chromium.launch();const page=await browser.newPage();page.on('pageerror',e=>console.error(e.message));await page.goto(base);
const {output,fields,pdfs}=await page.evaluate(async()=>{const module=await import('/scripts/font-review-browser.js');return module.captureReview();});await writeFile(path.join(out,'fields.json'),JSON.stringify(fields));
for(const [name,{svg,width,height}] of Object.entries(output)){
 if(filter&&!name.includes(filter))continue;
 await writeFile(path.join(out,name+'.svg'),svg);
 const png=await page.evaluate(async({svg,width,height})=>{const img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);await img.decode();const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;canvas.getContext('2d').drawImage(img,0,0,width,height);return canvas.toDataURL('image/png').split(',')[1];},{svg,width,height});await writeFile(path.join(out,name+'.png'),Buffer.from(png,'base64'));console.log(name);
}
for(const [name,bytes] of Object.entries(filter?{}:pdfs))await writeFile(path.join(out,name+'.pdf'),Buffer.from(bytes));
await browser.close();
