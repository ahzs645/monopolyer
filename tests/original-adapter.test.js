import {it,expect} from 'vitest';
import {createBoard,validateBoard} from '../src/model';
import {toOriginalMaster,fromOriginalMaster,originalPrices} from '../src/original/adapter';
import {fontNamesFromTtf} from '../src/cardFonts';
import regularFont from '../src/fonts/regular';
it('keeps the original editor connected to all project data',()=>{
 const board=createBoard('printopoly');expect(fromOriginalMaster(board,toOriginalMaster(board))).toEqual(board);
 const master={...toOriginalMaster(board),brown1:'Our office',browncolor:'#123456',railicon:'FaPlane',railcolor:'#884422',chest:'Company mail',chesticon:'FaEnvelope',currency:'FaEuroSign'};
 const updated=validateBoard(fromOriginalMaster(board,master));expect(updated.tiles[1].name).toBe('Our office');expect(updated.groups[0]).toBe('#123456');expect([5,15,25,35].map(id=>updated.tiles[id].faIcon)).toEqual(Array(4).fill('FaPlane'));expect([2,17,33].map(id=>updated.tiles[id].name)).toEqual(Array(3).fill('Company mail'));expect(updated.decks.chest.name).toBe('Company mail');expect(updated.currency).toBe('€');expect(originalPrices(updated).brown1.price).toBe('60');
});
it('reads actual font names instead of treating a substitute as an exact font',()=>{
 const bytes=Buffer.from(regularFont,'base64');const names=fontNamesFromTtf(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));expect(names.some(n=>n.includes('Noto Sans'))).toBe(true);expect(names.some(n=>n.includes('Cornerstone'))).toBe(false);expect(()=>fontNamesFromTtf(new ArrayBuffer(2))).toThrow('TrueType');
});
