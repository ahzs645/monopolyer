import {describe,it,expect} from 'vitest';
import JsonUrl from '@firstform/json-url';
import {createBoard,validateBoard,deedTiles,expandText,moneyTotal,tilePosition} from '../src/model';
import {propertyPdf,eventsPdf,moneyPdf,buildingsPdf,rulesPdf} from '../src/exports';

describe('game projects',()=>{
 it('builds a complete 40-space board with 28 purchasable deeds and 32 event cards',()=>{
  for(const preset of ['studio','campus','photoshop']){
   const b=validateBoard(createBoard(preset));expect(b.tiles).toHaveLength(40);expect(deedTiles(b)).toHaveLength(28);expect(b.tiles.filter(t=>t.kind==='property')).toHaveLength(22);expect(b.decks.chance.cards.length+b.decks.chest.cards.length).toBe(32);expect(moneyTotal(b)).toBe(1500);
  }
 });
 it('rejects corrupted layouts, unsupported versions, and invalid colors',()=>{
  const b=createBoard();b.tiles[1].id=4;expect(()=>validateBoard(b)).toThrow();b.tiles[1].id=1;b.version=2;expect(()=>validateBoard(b)).toThrow();b.version=1;b.groups[0]='red; background:url(x)';expect(()=>validateBoard(b)).toThrow();
 });
 it('uses board names in event cards and guides',()=>{
  const b=createBoard();b.tiles[39].name='ACME HQ';b.currency='£';expect(expandText('Go to {{tile:39}}, collect {{currency}}200 at {{go}}.',b)).toBe('Go to ACME HQ, collect £200 at GO.');
 });
 it('compresses the entire design losslessly using the requested json-url package',async()=>{
  const b=createBoard('campus');b.title='A company & friends';b.logo='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M0 0h10v10H0Z" fill="#123456"/></svg>';b.tiles[1].rents[0]=42;b.decks.chance.cards[0].text='A custom surprise';
  const codec=JsonUrl('lzstring');const token=await codec.compress(b);expect(await codec.decompress(token)).toEqual(b);expect(token.length).toBeLessThan(JSON.stringify(b).length);expect(token).not.toMatch(/[?#&/]/);
 });
 it('positions each tile exactly once inside the square',()=>{
  const cells=[];for(let i=0;i<40;i++){
   const p=tilePosition(i);expect(p.x).toBeGreaterThanOrEqual(-.001);expect(p.y).toBeGreaterThanOrEqual(-.001);expect(p.x+p.w).toBeLessThanOrEqual(1000.001);expect(p.y+p.h).toBeLessThanOrEqual(1000.001);
   for(const c of cells){const overlapX=Math.min(c.x+c.w,p.x+p.w)-Math.max(c.x,p.x);const overlapY=Math.min(c.y+c.h,p.y+p.h)-Math.max(c.y,p.y);expect(overlapX>0.001&&overlapY>0.001).toBe(false);}cells.push(p);
  }
 });
});
describe('printable game kit',()=>{
 it('paginates all fronts, mirrored backs, money, and buildings on A4',async()=>{
  const b=createBoard('campus');b.money.style='studio';expect((await propertyPdf(b)).getNumberOfPages()).toBe(4);expect((await propertyPdf(b,true)).getNumberOfPages()).toBe(4);expect((await eventsPdf(b)).getNumberOfPages()).toBe(4);expect((await eventsPdf(b,true)).getNumberOfPages()).toBe(4);expect(moneyPdf(b).getNumberOfPages()).toBe(7);expect(buildingsPdf(b).getNumberOfPages()).toBe(2);expect(rulesPdf(b).getNumberOfPages()).toBeGreaterThanOrEqual(1);
 });
 it('handles edited decks with partial pages independently',async()=>{const b=createBoard();b.decks.chance.cards=b.decks.chance.cards.slice(0,1);expect((await eventsPdf(b)).getNumberOfPages()).toBe(3);});
 it('rejects empty money print jobs with a helpful message',()=>{const b=createBoard();b.money.style='studio';b.money.quantities.fill(0);expect(()=>moneyPdf(b)).toThrow('at least one');});
});
