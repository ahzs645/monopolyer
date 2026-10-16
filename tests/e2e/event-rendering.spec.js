import {test,expect} from '@playwright/test';
import {PNG} from 'pngjs';
import {createBoard} from '../../src/model.js';
async function ready(page,preset){await page.addInitScript(board=>{sessionStorage.setItem('monopolyer.editor','1');localStorage.setItem('monopolyer.design.v1',JSON.stringify(board));},createBoard(preset));await page.goto('./');await expect(page.getByText('Saved on this device',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Cards',exact:true}).click();}

for(const preset of ['printopoly','northern-health'])test(`${preset}: every Chance and second-deck card paints in the website on desktop and mobile`,async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await ready(page,preset);
 const cards=page.locator('.events-preview .template-event-card');await expect(cards).toHaveCount(32);
 // Check the actual cards in their website buttons; isolated SVG print tests
 // cannot catch a parent CSS selector hiding every event-card SVG.
 const audit=await cards.evaluateAll(async svgs=>{await document.fonts.ready;return Promise.all(svgs.map(async svg=>{const box=svg.getBoundingClientRect();const images=await Promise.all([...svg.querySelectorAll('image')].map(async el=>{const image=new Image();image.src=el.getAttribute('href');try{await image.decode();return true;}catch{return false;}}));return {display:getComputedStyle(svg).display,width:box.width,height:box.height,allImagesLoaded:images.every(Boolean),textElements:svg.querySelectorAll('text,image').length};}));});
 for(const [i,card] of audit.entries()){expect(card.display,`card ${i} CSS`).toBe('block');expect(card.width).toBeGreaterThan(100);expect(card.height).toBeGreaterThan(50);expect(card.width/card.height).toBeCloseTo(900/525,2);expect(card.allImagesLoaded).toBe(true);expect(card.textElements).toBeGreaterThan(1);}
 // Pixel checks below the calligraphic heading confirm bodies actually paint.
 for(const key of ['chance','chest']){
  await page.locator(`[data-deck-selector="${key}"]`).click();
  const current=page.locator(`[data-event-deck="${key}"][data-event-index="0"] .template-event-card`);await expect(current).toBeInViewport();
  const png=PNG.sync.read(await current.screenshot());let dark=0;for(let y=Math.floor(png.height*.22);y<png.height*.96;y++)for(let x=0;x<png.width;x++){const n=(y*png.width+x)*4;if(png.data[n+3]>0&&png.data[n]<100&&png.data[n+1]<100&&png.data[n+2]<100)dark++;}expect(dark,`${key} body ink`).toBeGreaterThan(50);
 }
 await page.setViewportSize({width:390,height:844});await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);
 for(const key of ['chance','chest']){await page.locator(`[data-deck-selector="${key}"]`).click();const svg=page.locator(`[data-event-deck="${key}"][data-event-index="0"] .template-event-card`);await expect(svg).toBeVisible();await svg.scrollIntoViewIfNeeded();await expect(svg).toBeInViewport();const box=await svg.boundingBox();expect(box.width).toBeGreaterThan(200);expect(box.width/box.height).toBeCloseTo(900/525,2);await svg.screenshot({path:`test-results/${preset}-${key}-website.png`});}
 expect(errors).toEqual([]);
});

test('editing and navigating either event deck keeps the visible preview on its selected card',async({page})=>{
 await ready(page,'printopoly');await expect(page.getByRole('button',{name:'Edit Chance deck',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Edit Community Chest deck',exact:true})).toBeVisible();
 for(const key of ['chance','chest']){
  await page.locator(`[data-deck-selector="${key}"]`).click();await page.getByLabel('Choose event card',{exact:true}).selectOption('15');
  const selected=page.locator('.event-card.selected');await expect(selected).toHaveAttribute('data-event-deck',key);await expect(selected).toHaveAttribute('data-event-index','15');await expect(selected).toBeInViewport();
  await page.getByLabel('Card title',{exact:true}).fill(`${key} company bonus`);await page.getByLabel('What happens next?',{exact:true}).fill('Collect {{currency}}75 at {{tile:39}}.');await expect(selected.locator('svg')).toContainText(`${key.toUpperCase()} COMPANY BONUS`);await expect(selected).toHaveAttribute('aria-label',`${createBoard('printopoly').decks[key].name} ${key} company bonus Collect $75 at ${createBoard('printopoly').tiles[39].name}.`);
  await page.getByRole('button',{name:'Next card',exact:true}).click();await expect(page.locator('.event-card.selected')).toHaveAttribute('data-event-index','0');await expect(page.locator('.event-card.selected')).toBeInViewport();await page.getByRole('button',{name:'Previous card',exact:true}).click();await expect(page.locator('.event-card.selected')).toHaveAttribute('data-event-index','15');await expect(page.getByLabel('Card title',{exact:true})).toHaveValue(`${key} company bonus`);
 }
 await page.getByLabel('Deck name',{exact:true}).fill('Team news');await expect(page.getByRole('button',{name:'Edit Team news deck',exact:true})).toBeVisible();await expect(page.locator('.event-card.selected .template-event-card')).toBeVisible();
});
