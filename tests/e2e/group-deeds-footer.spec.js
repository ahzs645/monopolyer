import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {createBoard} from '../../src/model.js';
async function ready(page){const board=createBoard('northern-health');board.money.players=1;board.money.quantities.fill(1);await page.addInitScript(b=>{sessionStorage.setItem('monopolyer.editor','1');localStorage.setItem('monopolyer.design.v1',JSON.stringify(b));},board);await page.goto('./');await expect(page.getByText('Saved on this device',{exact:true})).toBeVisible();}
async function save(page,name,path){const pending=page.waitForEvent('download');await page.getByRole('button',{name}).click();const file=await pending;if(path)await file.saveAs(path);return readFile(await file.path());}

test('group panels show their deeds and shared settings; selected spaces show just their own deed',async({page,context})=>{
 await ready(page);
 await page.getByRole('button',{name:'Open property group 3',exact:true}).click();
 await expect(page.getByRole('button',{name:'Close property group 3',exact:true})).toHaveAttribute('aria-expanded','true');
 await expect(page.locator('[data-deed-preview]')).toHaveCount(3);
 const group=page.getByRole('region',{name:'Property group 3 setup',exact:true});
 await expect(group.locator('.template-card')).toHaveCount(3);
 await group.getByLabel('Property group 3 color',{exact:true}).fill('#123456');
 await page.getByLabel('Group 3 house / hotel cost',{exact:true}).fill('123');
 await expect(page.locator('[data-deed-preview] rect[fill="#123456"]')).toHaveCount(3);
 await group.getByRole('button',{name:'Open property Bioenergy Plant',exact:true}).click();
 await expect(page.getByLabel('Choose a space',{exact:true})).toHaveValue('11');
 await expect(page.getByLabel('House / hotel cost',{exact:true})).toHaveValue('123');
 await expect(page.locator('[data-deed-preview]')).toHaveCount(1);await expect(page.locator('[data-deed-preview]')).toHaveAttribute('data-deed-preview','11');
 await page.getByLabel('Choose a space',{exact:true}).selectOption('13');await expect(page.locator('[data-deed-preview]')).toHaveAttribute('data-deed-preview','13');await expect(page.getByLabel('House / hotel cost',{exact:true})).toHaveValue('123');
 await page.getByRole('button',{name:'Next space',exact:true}).click();await expect(page.locator('[data-deed-preview]')).toHaveAttribute('data-deed-preview','14');
 await page.getByLabel('Show deeds',{exact:true}).selectOption('group');await expect(page.locator('[data-deed-preview]')).toHaveCount(3);
 await page.getByRole('button',{name:'Show all deeds',exact:true}).click();await expect(page.locator('[data-deed-preview]')).toHaveCount(28);
 await page.getByRole('button',{name:'Edit deed for Neyoh Residence',exact:true}).click();await expect(page.locator('[data-deed-preview]')).toHaveCount(1);await expect(page.locator('[data-deed-preview]')).toHaveAttribute('data-deed-preview','1');
 await page.getByLabel('Choose a space',{exact:true}).selectOption('20');await expect(page.locator('[data-deed-preview]')).toHaveCount(0);await expect(page.getByText('This space does not have a property deed.',{exact:false})).toBeVisible();
 for(const id of ['12','5']){await page.getByLabel('Choose a space',{exact:true}).selectOption(id);await expect(page.locator('[data-deed-preview]')).toHaveCount(1);await expect(page.locator('[data-deed-preview]')).toHaveAttribute('data-deed-preview',id);}
 await page.getByRole('button',{name:'Space previews',exact:true}).click();await page.getByRole('button',{name:'Collapse all groups',exact:true}).click();await expect(page.locator('[data-current-space]')).toHaveCount(0);await page.getByRole('button',{name:'Open property group 3',exact:true}).click();await expect(page.locator('[data-current-space]')).toHaveCount(3);await page.getByRole('button',{name:'Expand all groups',exact:true}).click();await expect(page.locator('[data-current-space]')).toHaveCount(40);
 await page.getByRole('button',{name:'Share design',exact:true}).click();const copy=await context.newPage();await copy.goto(await page.getByLabel('Your share link',{exact:true}).inputValue());await copy.getByRole('button',{name:'Open property group 3',exact:true}).click();await expect(copy.getByLabel('Group 3 house / hotel cost',{exact:true})).toHaveValue('123');await expect(copy.getByLabel('Property group 3 color',{exact:true})).toHaveValue('#123456');
 await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Close dialog',exact:true}).click();await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);
});

test('bill colors are discoverable and footer edits retain vectors, borders, and saved settings',async({page,context})=>{
 await ready(page);await page.getByRole('button',{name:'Money',exact:true}).first().click();
 await expect(page.getByRole('button',{name:'Overlay reference bill',exact:true})).toHaveCount(0);await expect(page.getByLabel('Note 2 color',{exact:true})).toBeDisabled();await expect(page.getByText('Black & white bills are on. Paper colors are disabled.',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Use colored bills',exact:true}).click();await page.getByLabel('Note 2 color',{exact:true}).fill('#123456');await expect(page.getByLabel('Black & white bills',{exact:true})).not.toBeChecked();await expect(page.getByLabel('Apply my note colors',{exact:true})).toBeChecked();await expect(page.getByLabel('Note 3 color',{exact:true})).toHaveValue('#fcf373');
 await page.getByLabel('Bill footer',{exact:true}).selectOption('custom');await page.getByLabel('Bill footer text',{exact:true}).fill('© 2026 Northern Health');
 await expect(page.locator('[data-money-note]')).toHaveCount(7);
 const audit=await page.locator('[data-money-note]').evaluateAll(async images=>{const results=[];for(const img of images){await img.decode();const svg=decodeURIComponent(img.getAttribute('src').split(',').slice(1).join(',')),doc=new DOMParser().parseFromString(svg,'image/svg+xml'),footer=doc.querySelector('[data-money-footer]');results.push({text:footer?.getAttribute('aria-label'),sourceCopyright:doc.querySelectorAll('use[data-text="©"]').length,paths:footer?.querySelectorAll('path').length,images:doc.querySelectorAll('image').length});}return results;});
 for(const bill of audit){expect(bill.text).toBe('© 2026 Northern Health');expect(bill.sourceCopyright).toBe(0);expect(bill.paths).toBeGreaterThan(10);expect(bill.images).toBe(0);}
 const colored=decodeURIComponent(await page.locator('[data-money-note="1"]').getAttribute('src'));expect(colored).toContain('#123456');
 const footerState=()=>page.locator('[data-money-note="0"]').evaluate(img=>{const s=decodeURIComponent(img.getAttribute('src').slice(img.getAttribute('src').indexOf(',')+1)),doc=new DOMParser().parseFromString(s,'image/svg+xml');return {source:doc.querySelectorAll('use[data-text="©"]').length,custom:doc.querySelectorAll('[data-money-footer]').length};});
 await page.getByLabel('Bill footer',{exact:true}).selectOption('none');await expect.poll(footerState).toEqual({source:0,custom:0});
 await page.getByLabel('Bill footer',{exact:true}).selectOption('original');await expect.poll(footerState).toEqual({source:1,custom:0});
 await page.getByLabel('Bill footer',{exact:true}).selectOption('custom');await expect(page.getByLabel('Bill footer text',{exact:true})).toHaveValue('© 2026 Northern Health');
 await page.getByRole('button',{name:'Share design',exact:true}).click();const copy=await context.newPage();await copy.goto(await page.getByLabel('Your share link',{exact:true}).inputValue());await copy.getByRole('button',{name:'Money',exact:true}).first().click();await expect(copy.getByLabel('Bill footer text',{exact:true})).toHaveValue('© 2026 Northern Health');await expect(copy.getByLabel('Note 2 color',{exact:true})).toHaveValue('#123456');
 await copy.getByRole('button',{name:'Get print files',exact:true}).click();const project=JSON.parse(await save(copy,/^Editable project/));expect(project.money.footerMode).toBe('custom');expect(project.money.footerText).toBe('© 2026 Northern Health');const pdf=await save(copy,/^Play money/,'test-results/custom-footer-bills.pdf');expect(pdf.toString('latin1')).not.toMatch(/\/Subtype\s*\/Image\b/);
 await copy.getByLabel('Import project file',{exact:true}).setInputFiles({name:'footer.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(project))});await copy.getByRole('button',{name:'Money',exact:true}).first().click();await expect(copy.getByLabel('Bill footer text',{exact:true})).toHaveValue('© 2026 Northern Health');
 await copy.setViewportSize({width:390,height:844});await expect.poll(()=>copy.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);await copy.screenshot({path:'test-results/mobile-bill-colors-footer.png',fullPage:true});
});
