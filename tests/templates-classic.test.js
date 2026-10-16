import {describe,it,expect} from 'vitest';
import JsonUrl from '@firstform/json-url';
import {createBoard,validateBoard} from '../src/model';
import saved from '../src/reference-assets/nugssopoly-preset.json';
import {defaultIllustration,classicIllustrationOptions} from '../src/classicEvents';
import {eventArtwork} from '../src/psdCards';
describe('saved Over the Edge template',()=>{
 it('retains the entire supplied project apart from its explicit branding setup',()=>{
  const b=validateBoard(createBoard('over-the-edge'));
  for(const key of ['tiles','groups','decks','money','rules','background','ink','currency'])expect(b[key],key).toEqual(saved[key]);
  expect(b.logo.match(/<path\b/g)).toHaveLength(33);expect(b.logo).not.toMatch(/<script|<image|var\(/);expect(b.logo).toContain('#155329');expect(b.logo).toContain('#262626');expect(b.titleSuffix).toBe('OPOLY');expect(b.titleScale).toBe(1.36);
  b.tiles[29].name='Changed';b.decks.chance.cards[0].text='Changed';const fresh=createBoard('over-the-edge');expect(fresh.tiles[29].name).toBe('Over The Edge');expect(fresh.decks.chance.cards).toEqual(saved.decks.chance.cards);
 });
});
describe('classic illustrated event cards',()=>{
 it('uses the requested 31 source illustrations with vector text and paths',()=>{
  expect(classicIllustrationOptions('chance')).toHaveLength(15);expect(classicIllustrationOptions('chest')).toHaveLength(16);
  const b=createBoard('over-the-edge');b.tiles[0].name='HOME';
  for(const key of ['chance','chest']){
   b.decks[key].appearance='classic';
   b.decks[key].cards.forEach((c,i)=>{const art=eventArtwork(b,key,c);expect(art.ops.some(o=>o.type==='image')).toBe(false);const icon=art.ops.find(o=>o.type==='icon');expect(icon.name).toBe(defaultIllustration(key,i));expect(icon.paths.length).toBeGreaterThan(0);expect(art.width/art.height).toBe(900/525);});
  }
  expect(eventArtwork(b,'chest',b.decks.chest.cards[0]).ops.filter(o=>o.type==='text').map(o=>o.value).join(' ')).toContain('HOME');
 });
 it('roundtrips independent deck styles, artwork and paper/title settings through json-url',async()=>{
  const b=createBoard('over-the-edge');Object.assign(b.decks.chest,{appearance:'classic',paperColor:'#123456',showCardTitle:false});b.decks.chest.cards[0].illustration='chest-bank-error-in-your-favor';
  const codec=JsonUrl('lzstring'),restored=validateBoard(await codec.decompress(await codec.compress(b)));expect(restored).toEqual(b);expect(restored.decks.chance.appearance).toBeUndefined();
  const ops=eventArtwork(restored,'chest',restored.decks.chest.cards[0]).ops;expect(ops[0].fill).toBe('#123456');expect(ops.find(o=>o.type==='icon').color).toBe('#ffffff');expect(ops.filter(o=>o.type==='text').map(o=>o.value)).not.toContain('NEW BEGINNINGS');restored.decks.chest.cards[0].illustration='none';expect(eventArtwork(restored,'chest',restored.decks.chest.cards[0]).ops.some(o=>o.type==='icon')).toBe(false);
 });
});
