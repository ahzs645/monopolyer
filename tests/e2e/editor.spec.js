import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {unzipSync,strFromU8} from 'fflate';
const logo='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><style>.logo-fill{fill:#e08022}</style><path class="logo-fill" d="M10 10h80v80H10Z"/><text x="50" y="60" text-anchor="middle" fill="white" font-size="25">ACME</text></svg>';
async function ready(page){await page.goto('./');await expect(page.getByText('Saved on this device',{exact:true})).toBeVisible();}
test('edits, autosaves, undoes, and shares a complete design including its logo',async({page,context})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await ready(page);
 await page.getByLabel('Board name',{exact:true}).fill('ACMEOPOLY');
 await page.getByLabel('Upload SVG logo',{exact:true}).setInputFiles({name:'logo.svg',mimeType:'image/svg+xml',buffer:Buffer.from(logo)});
 await expect(page.getByAltText('Company logo')).toBeVisible();
 await page.getByLabel('Background',{exact:true}).fill('#f5e5cb');
 await page.getByRole('button',{name:'Edit Oak Avenue',exact:true}).click();
 await page.getByLabel('Space name',{exact:true}).fill('ACME Headquarters');await page.getByLabel('Purchase price',{exact:true}).fill('777');
 await page.getByRole('button',{name:'Property deeds',exact:true}).click();
 const deed=page.getByRole('button',{name:'Edit deed for ACME Headquarters',exact:true});await expect(deed).toContainText('$777');
 await page.getByRole('button',{name:'Undo',exact:true}).click();await expect(page.getByLabel('Purchase price',{exact:true})).not.toHaveValue('777');await page.getByRole('button',{name:'Redo',exact:true}).click();await expect(page.getByLabel('Purchase price',{exact:true})).toHaveValue('777');
 await expect(page.getByText('Saved on this device',{exact:true})).toBeVisible();await page.reload();await expect(page.getByLabel('Board name',{exact:true})).toHaveValue('ACMEOPOLY');
 await page.getByRole('button',{name:'Share design',exact:true}).click();const url=await page.getByRole('textbox',{name:'Your share link',exact:true}).inputValue();expect(url).toContain('#board=');
 const copy=await context.newPage();await copy.goto(url);await expect(copy.getByLabel('Board name',{exact:true})).toHaveValue('ACMEOPOLY');await expect(copy.getByAltText('Company logo')).toBeVisible();await copy.getByRole('button',{name:'Edit ACME Headquarters',exact:true}).click();await expect(copy.getByLabel('Purchase price',{exact:true})).toHaveValue('777');expect(errors).toEqual([]);
});
test('edits event decks, keeps placeholders in sync, and reimports project backups',async({page})=>{
 await ready(page);await page.getByRole('button',{name:'Cards',exact:true}).click();await page.getByLabel('Deck name',{exact:true}).fill('Company News');await page.getByLabel('Card title',{exact:true}).fill('Bonus day');await page.getByLabel('What happens next?',{exact:true}).fill('Collect {{currency}}500 at {{tile:39}}.');await expect(page.getByRole('button',{name:/Company News Bonus day/i})).toContainText('Collect $500 at Summit Place.');
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
 test.setTimeout(120000);await ready(page);await page.getByLabel('Upload SVG logo',{exact:true}).setInputFiles({name:'logo.svg',mimeType:'image/svg+xml',buffer:Buffer.from(logo)});await page.getByRole('button',{name:'Get print files',exact:true}).click();
 const promise=page.waitForEvent('download',{timeout:100000});await page.getByRole('button',{name:/Download the complete kit/}).click();const result=await promise;const files=unzipSync(new Uint8Array(await readFile(await result.path())));expect(Object.keys(files)).toHaveLength(13);for(const key of Object.keys(files).filter(k=>k.endsWith('.pdf')))expect(strFromU8(files[key].slice(0,5))).toBe('%PDF-');expect(files['board-6000px.png'].length).toBeGreaterThan(100000);expect(strFromU8(files['board.svg'])).toContain('ACME');expect(strFromU8(files['board.svg'])).not.toContain('pointer-events="none"');expect(JSON.parse(strFromU8(files['project.monopolyer.json'])).logo).toContain('svg');
 await result.saveAs('test-results/example-kit.zip');
});
test('mobile editor fits the viewport and its controls work',async({page})=>{
 await page.setViewportSize({width:390,height:844});await ready(page);expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);await page.getByLabel('Board name',{exact:true}).fill('MOBILE EDITION');await expect(page.getByRole('img',{name:'MOBILE EDITION custom 40-space board'})).toBeVisible();await page.screenshot({path:'test-results/mobile.png',fullPage:true});
});

test('keeps focus while editing the printable guide',async({page})=>{
 await ready(page);await page.getByRole('button',{name:'Get print files',exact:true}).click();await page.getByRole('button',{name:/Edit the game guide/}).click();const guide=page.getByLabel('Game guide & house rules',{exact:true});await guide.fill('CUSTOM RULES: ');await guide.pressSequentially('Everybody gets a bonus.');await expect(guide).toHaveValue('CUSTOM RULES: Everybody gets a bonus.');await expect(guide).toBeFocused();
});
