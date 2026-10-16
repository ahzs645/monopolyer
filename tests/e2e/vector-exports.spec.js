import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {PNG} from 'pngjs';
import {unzipSync,strFromU8} from 'fflate';
import {createBoard} from '../../src/model.js';
async function ready(page,preset='campus',edit=false){
 const board=createBoard(preset);if(preset==='printopoly'){board.tiles[1].name='Mediterranean Ave';board.groups[0]='#430144';board.decks.chance.cards[0]={title:'Community Chest and\nChance Card Templates',text:'Sorry no graphics'};}
 if(edit){board.title='ACMEOPOLY';board.background='#ddeeff';board.groups[0]='#112233';board.ink='#223344';board.accent='#aa2255';board.tiles[1].name='ACME Office';board.tiles[1].price=777;board.logo='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="#ff0000" d="M0 0h100v100H0Z"/></svg>';}
 await page.addInitScript(b=>{localStorage.setItem('monopolyer.design.v1',JSON.stringify(b));sessionStorage.setItem('monopolyer.advanced','1');sessionStorage.setItem('monopolyer.editor','1');},board);await page.goto('./');await page.getByRole('button',{name:'The board',exact:true}).click();await expect(page.getByText('Saved on this device',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Get print files',exact:true}).click();return board;
}
async function download(page,label){const pending=page.waitForEvent('download',{timeout:180000});await page.getByRole('button',{name:label}).click();const file=await pending;return {bytes:await readFile(await file.path()),file};}
async function render(page,svg,size=6000,height=size){return Buffer.from(await page.evaluate(async({svg,size,height})=>{
 const img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);await img.decode();const canvas=document.createElement('canvas');canvas.width=size;canvas.height=height;canvas.getContext('2d').drawImage(img,0,0,size,height);return [...new Uint8Array(await (await new Promise(r=>canvas.toBlob(r,'image/png'))).arrayBuffer())];
 },{svg,size,height}));}
function isVector(svg){expect(svg).not.toMatch(/<(?:\w+:)?(?:image|feImage|foreignObject)\b/);expect(svg).not.toMatch(/data:image\/(?:png|jpeg|webp|gif)/);expect(svg).toContain('data-export-content="vector-paths-and-text"');}
for(const preset of ['campus','photoshop'])test(`vector ${preset} board retains source appearance and all palette fills`,async({page})=>{
 test.setTimeout(120000);await ready(page,preset);const {bytes,file}=await download(page,/^Vector SVG board/);const svg=bytes.toString();isVector(svg);expect(svg).toContain('width="508mm"');expect(svg).toContain('native-svg');expect(svg).not.toContain('<mask');await file.saveAs(`test-results/${preset}-vector.svg`);
 const png=await render(page,svg),actual=PNG.sync.read(png),ref=PNG.sync.read(await readFile(`tests/fixtures/original-${preset==='campus'?'campus':'photoshop'}-board.png`));let total=0,changed=0;for(let i=0;i<actual.data.length;i+=4){let max=0;for(let c=0;c<3;c++){const d=Math.abs(actual.data[i+c]-ref.data[i+c]);total+=d;max=Math.max(max,d);}if(max>32)changed++;}expect(total/(actual.width*actual.height*3)).toBeLessThan(1.6);expect(changed/(actual.width*actual.height)).toBeLessThan(.018);
 for(const [x,y] of [[1000,700],[2000,700],[3450,700],[4900,5280],[3900,5280],[2500,5280],[5250,1000],[5250,3950],[700,4940],[700,2500]]){const i=(y*6000+x)*4;expect([...actual.data.slice(i,i+4)]).toEqual([...ref.data.slice(i,i+4)]);}
});
test('edited vector board retains color changes, lettering and an inline path-based logo',async({page})=>{
 test.setTimeout(120000);await ready(page,'campus',true);const {bytes}=await download(page,/^Vector SVG board/);const svg=bytes.toString();isVector(svg);for(const value of ['ACMEOPOLY','ACME OFFICE','777','#ddeeff','#112233','#223344','#aa2255','#ff0000'])expect(svg.includes(value),value).toBe(true);expect(svg).toContain('data-company-logo="true"');expect(svg).not.toContain('<filter');
 // Compare to the same edited source export: this detects lost edit-mask holes,
 // recoloring and nested SVG transforms rather than only checking XML strings.
 const source=await download(page,/Source-matched SVG board/);const actual=PNG.sync.read(await render(page,svg,2000)),ref=PNG.sync.read(await render(page,source.bytes.toString(),2000));let total=0;for(let i=0;i<actual.data.length;i+=4)for(let c=0;c<3;c++)total+=Math.abs(actual.data[i+c]-ref.data[i+c]);expect(total/(2000*2000*3)).toBeLessThan(2);
});
test('complete vector kit contains every card SVG and no PDF raster images',async({page})=>{
 test.setTimeout(240000);await ready(page,'photoshop');const {bytes,file}=await download(page,/^Download the vector kit/);await file.saveAs('test-results/vector-game-kit.zip');const files=unzipSync(bytes);const svgs=Object.keys(files).filter(k=>k.endsWith('.svg'));expect(svgs).toHaveLength(61);expect(svgs.filter(k=>k.startsWith('deeds/'))).toHaveLength(28);expect(svgs.filter(k=>k.startsWith('events/'))).toHaveLength(32);for(const key of svgs)isVector(strFromU8(files[key]));const pdfs=Object.keys(files).filter(k=>k.endsWith('.pdf'));expect(pdfs).toHaveLength(9);
 for(const key of pdfs){const pdf=Buffer.from(files[key]).toString('latin1');expect(pdf.startsWith('%PDF-')).toBeTruthy();expect(pdf,key).not.toMatch(/\/Subtype\s*\/Image\b/);}
 expect((Buffer.from(files['tiled-vector.pdf']).toString('latin1').match(/\/Type \/Page\b/g)||[])).toHaveLength(9);expect((Buffer.from(files['deeds-vector.pdf']).toString('latin1').match(/\/Type \/Page\b/g)||[])).toHaveLength(4);expect(strFromU8(files['READ-ME.txt'])).toContain('traced to outlines');
});

test('individual vector cards retain the supplied PSD typography and layout',async({page})=>{
 test.setTimeout(120000);await ready(page,'printopoly');const {bytes}=await download(page,/^Individual vector cards/);const files=unzipSync(bytes);
 for(const [key,baseline,w,h] of [['deed-01.svg','property',788,900],['chance-01.svg','event',900,525]]){
  const entry=Object.keys(files).find(k=>k.endsWith(key));const svg=strFromU8(files[entry]);isVector(svg);const png=PNG.sync.read(await render(page,svg,w,h));const ref=PNG.sync.read(await readFile(`tests/e2e/psd-cards.spec.js-snapshots/${baseline}-psd-linux.png`));let total=0,changed=0;for(let i=0;i<png.data.length;i+=4){let max=0;for(let c=0;c<3;c++){const d=Math.abs(png.data[i+c]-ref.data[i+c]);total+=d;max=Math.max(max,d);}if(max>64)changed++;}expect(total/(w*h*3)).toBeLessThan(7);expect(changed/(w*h)).toBeLessThan(.04);
 }
});
