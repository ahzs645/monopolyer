import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {unzipSync,strFromU8} from 'fflate';
const logo='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><style>.logo-fill{fill:#e08022}</style><path class="logo-fill" d="M10 10h80v80H10Z"/><text x="50" y="60" text-anchor="middle" fill="white" font-size="25">ACME</text></svg>';
async function ready(page){await page.goto('./');const build=page.getByRole('button',{name:'BUILD',exact:true});if(await build.isVisible())await build.click();const tools=page.getByRole('button',{name:'Logo, cards & full board',exact:true});if(await tools.isVisible())await tools.click();await page.getByRole('button',{name:'The board',exact:true}).click();await expect(page.getByText('Saved on this device',{exact:true})).toBeVisible();}
test('edits, autosaves, undoes, and shares a complete design including its logo',async({page,context})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await ready(page);
 await page.getByLabel('Board name',{exact:true}).fill('ACMEOPOLY');
 await page.getByLabel('Upload SVG logo',{exact:true}).setInputFiles({name:'logo.svg',mimeType:'image/svg+xml',buffer:Buffer.from(logo)});
 await expect(page.getByAltText('Company logo')).toBeVisible();
 await page.getByLabel('Background',{exact:true}).fill('#f5e5cb');
 await page.getByRole('button',{name:'Edit Neyoh Residence',exact:true}).click();
 await page.getByLabel('Space name',{exact:true}).fill('ACME Headquarters');await page.getByLabel('Purchase price',{exact:true}).fill('777');
 await page.getByRole('button',{name:'Property deeds',exact:true}).click();
 const deed=page.getByRole('button',{name:'Edit deed for ACME Headquarters',exact:true});await expect(deed).toBeInViewport();await expect(deed).toContainText('$777');
 await page.getByRole('button',{name:'Undo',exact:true}).click();await expect(page.getByLabel('Purchase price',{exact:true})).not.toHaveValue('777');await page.getByRole('button',{name:'Redo',exact:true}).click();await expect(page.getByLabel('Purchase price',{exact:true})).toHaveValue('777');
 await expect(page.getByText('Saved on this device',{exact:true})).toBeVisible();await page.reload();await expect(page.getByLabel('Board name',{exact:true})).toHaveValue('ACMEOPOLY');
 await page.getByRole('button',{name:'Share design',exact:true}).click();const url=await page.getByRole('textbox',{name:'Your share link',exact:true}).inputValue();expect(url).toContain('#board=');
 const copy=await context.newPage();await copy.goto(url);const tools=copy.getByRole('button',{name:'Logo, cards & full board',exact:true});if(await tools.isVisible())await tools.click();await expect(copy.getByLabel('Board name',{exact:true})).toHaveValue('ACMEOPOLY');await expect(copy.getByAltText('Company logo')).toBeVisible();await copy.getByRole('button',{name:'Edit ACME Headquarters',exact:true}).click();await expect(copy.getByLabel('Purchase price',{exact:true})).toHaveValue('777');expect(errors).toEqual([]);
});
test('edits event decks, keeps placeholders in sync, and reimports project backups',async({page})=>{
 await ready(page);await page.getByRole('button',{name:'Cards',exact:true}).click();await page.getByLabel('Deck name',{exact:true}).fill('Company News');await page.getByLabel('Card title',{exact:true}).fill('Bonus day');await page.getByLabel('What happens next?',{exact:true}).fill('Collect {{currency}}500 at {{tile:39}}.');await expect(page.getByRole('button',{name:/Company News Bonus day/i})).toContainText('Collect $500 at Thirsty Moose Pub.');
 await page.getByRole('button',{name:'Add card',exact:true}).click();await expect(page.getByText('17 cards in this deck · up to 64')).toBeVisible();await page.getByRole('button',{name:'Remove',exact:true}).click();
 await page.getByRole('button',{name:'Get print files',exact:true}).click();const d=page.waitForEvent('download');await page.getByRole('button',{name:/Editable project/}).click();const result=await d;const data=JSON.parse(await readFile(await result.path(),'utf8'));expect(data.decks.chance.name).toBe('Company News');
 data.title='REIMPORTED';await page.getByLabel('Import project file',{exact:true}).setInputFiles({name:'test.monopolyer.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});await page.getByRole('button',{name:'Board design',exact:true}).click();await expect(page.getByLabel('Board name',{exact:true})).toHaveValue('REIMPORTED');
});
test('sanitizes uploaded SVG and rejects bad project links',async({page})=>{
 await ready(page);await page.getByLabel('Upload SVG logo',{exact:true}).setInputFiles({name:'bad.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script><image href="https://example.com/track.png"/><path onload="alert(1)" fill="url(https://example.com/a)" d="M0 0h10v10Z"/></svg>')});
 await expect(page.getByText('Saved on this device',{exact:true})).toBeVisible();
 const raw=await page.evaluate(()=>JSON.parse(localStorage.getItem('monopolyer.design.v1')).logo);expect(raw).not.toMatch(/<script|onload|https:\/\/example/);
 await page.goto('./#board=invalid!');await expect(page.getByRole('alert')).toContainText('share link is invalid');
});
test('generates a complete downloadable kit with valid PDFs and full-size artwork',async({page})=>{
 test.setTimeout(120000);await ready(page);await page.getByRole('button',{name:/Start with a template/}).click();await page.getByRole('button',{name:/Back to campus/}).click();await page.getByLabel('Upload SVG logo',{exact:true}).setInputFiles({name:'logo.svg',mimeType:'image/svg+xml',buffer:Buffer.from(logo)});await page.getByRole('button',{name:'Get print files',exact:true}).click();
 const promise=page.waitForEvent('download',{timeout:100000});await page.getByRole('button',{name:/Source-matched game kit/}).click();const result=await promise;const files=unzipSync(new Uint8Array(await readFile(await result.path())));expect(Object.keys(files)).toHaveLength(13);for(const key of Object.keys(files).filter(k=>k.endsWith('.pdf')))expect(strFromU8(files[key].slice(0,5))).toBe('%PDF-');expect(files['board-6000px.png'].length).toBeGreaterThan(100000);expect(strFromU8(files['board.svg'])).toContain('ACME');expect(strFromU8(files['board.svg'])).not.toContain('pointer-events="none"');expect(JSON.parse(strFromU8(files['project.monopolyer.json'])).logo).toContain('svg');
 await result.saveAs('test-results/example-kit.zip');
});
test('mobile editor fits the viewport and its controls work',async({page})=>{
 await page.setViewportSize({width:390,height:844});await ready(page);expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);await page.getByLabel('Board name',{exact:true}).fill('MOBILE EDITION');await expect(page.getByRole('img',{name:'MOBILE EDITION custom 40-space board'})).toBeVisible();await page.screenshot({path:'test-results/mobile.png',fullPage:true});
});

test('keeps focus while editing the printable guide',async({page})=>{
 await ready(page);await page.getByRole('button',{name:'Get print files',exact:true}).click();await page.getByRole('button',{name:/Edit the game guide/}).click();const guide=page.getByLabel('Game guide & house rules',{exact:true});await guide.fill('CUSTOM RULES: ');await guide.pressSequentially('Everybody gets a bonus.');await expect(guide).toHaveValue('CUSTOM RULES: Everybody gets a bonus.');await expect(guide).toBeFocused();
});

test('opens the complete reference-styled builder with the current Photoshop board',async({page})=>{
 await page.setViewportSize({width:1440,height:1100});await page.addInitScript(()=>sessionStorage.setItem('monopolyer.advanced','0'));await page.goto('./');await expect(page.getByRole('button',{name:'BUILD',exact:true})).toBeVisible();await expect(page.getByAltText('One on a die')).toBeVisible();await page.getByRole('button',{name:'BUILD',exact:true}).click();
 const left=await page.locator('.workspace>.editor').boundingBox(),right=await page.locator('.workspace>.preview').boundingBox();expect(left.width).toBe(864);expect(right.width).toBe(576);expect(right.x).toBe(864);
 await expect(page.getByLabel('Board name',{exact:true})).toHaveValue('nugssOPOLY');await expect(page.locator('.board-wrap>svg')).toHaveAttribute('data-board-template','supplied-campus-psd');await expect(page.locator('.board-wrap')).toBeVisible();await expect(page.getByRole('button',{name:'Logo, cards & full board',exact:true})).toHaveCount(0);for(const name of ['Spaces','Cards','Money','Print & export'])await expect(page.getByRole('navigation',{name:'Editor sections'}).getByRole('button',{name,exact:true})).toBeVisible();
 await expect(page.getByLabel('Board name',{exact:true})).toHaveCSS('font-family',/^Kabel,/);await page.evaluate(()=>document.fonts.ready);expect(await page.evaluate(()=>document.fonts.check('16px Kabel'))).toBe(true);await page.getByText('Edit all property names as a list',{exact:true}).click();await page.getByLabel('Property 1/1',{exact:true}).fill('Our original office');await expect(page.locator('.board-wrap>svg [aria-label="OUR ORIGINAL OFFICE"]')).toHaveCount(1);await expect(page.locator('.board-wrap')).toBeVisible();await page.getByLabel('Property group 1 color',{exact:true}).fill('#112233');await expect(page.locator('.board-wrap>svg rect[fill="#112233"]')).toHaveCount(1);
});

test('overlays original artwork, reuses PSD illustrations, and keeps guides out of exports',async({page})=>{
 test.setTimeout(90000);await ready(page);await page.getByRole('button',{name:/Start with a template/}).click();await page.getByRole('button',{name:/Back to campus/}).click();
 await expect(page.locator('.board-wrap > svg [data-source-artwork]')).toHaveCount(17);
 await page.getByRole('button',{name:'Overlay original artwork',exact:true}).click();const overlay=page.getByAltText('Original artwork overlay');await expect(overlay).toBeVisible();await page.getByLabel('Original artwork opacity',{exact:true}).fill('75');await expect(overlay).toHaveCSS('opacity','0.75');
 await page.getByLabel('Overlay reference',{exact:true}).selectOption('campus-psd.jpg');await expect(overlay).toHaveAttribute('src',/campus-psd.jpg$/);
 const uri=await overlay.getAttribute('src');expect(await page.evaluate(async src=>(await fetch(src)).status,uri)).toBe(200);
 await page.getByRole('button',{name:'Get print files',exact:true}).click();const promise=page.waitForEvent('download');await page.getByRole('button',{name:/Source-matched SVG board/}).click();const result=await promise;const svg=await readFile(await result.path(),'utf8');expect(svg).toContain('data:image/png;base64,');expect(svg).not.toContain('campus-psd.jpg');expect(svg).not.toContain('original-board-overlay');
 await page.getByRole('button',{name:'Share design',exact:true}).click();const url=await page.getByRole('textbox',{name:'Your share link',exact:true}).inputValue();await page.getByRole('button',{name:'Close dialog',exact:true}).click();const restored=await page.context().newPage();await restored.goto(url);const restoredTools=restored.getByRole('button',{name:'Logo, cards & full board',exact:true});if(await restoredTools.isVisible())await restoredTools.click();await expect(restored.getByLabel('Board name',{exact:true})).toHaveValue('UNBCOPOLY');await expect(restored.locator('.board-wrap > svg [data-source-artwork]')).toHaveCount(17);
 await page.getByRole('button',{name:'The board',exact:true}).click();await page.screenshot({path:'test-results/restored-campus.png',fullPage:true});
});
