import template from './reference-assets/board.json';
import photoshopTemplate from './reference-assets/board-psd.json';
import {createBoard} from './model';
import {getCardFonts} from './cardFonts';
export {template};
export const source=createBoard('campus');
const photoshopSource=createBoard('photoshop');
export function getBoardSource(board){return board.boardStyle==='photoshop'?{template:photoshopTemplate,source:photoshopSource}:{template,source};}
export const norm=s=>String(s).trim().replace(/\s+/g,' ').toUpperCase();
export function boardFontStatus(board){
 if(!['campus','classic','photoshop'].includes(board.boardStyle))return [];const {template,source}=getBoardSource(board);const fonts=getCardFonts(),missing=new Set();
 if(norm(board.title)!==norm(source.title)&&board.title&&!fonts['HelveticaNeue-BoldItalic'])missing.add('HelveticaNeue-BoldItalic');
 for(const t of board.tiles){const original=source.tiles[t.id];if(!fonts.KabobLight&&norm(t.name)!==norm(original.name)&&[...norm(t.name)].some(c=>c!==' '&&!template.glyphs[c]))missing.add('KabobLight');if(!fonts.KabobLight&&(t.price!==original.price||board.currency!==source.currency)&&[...`${board.currency}${t.price}`].some(c=>!template.priceGlyphs[c]))missing.add('KabobLight');}
 for(const key of ['chance','chest'])if(!fonts.KabobLight&&norm(board.decks[key].name)!==norm(source.decks[key].name)&&[...norm(board.decks[key].name)].some(c=>c!==' '&&!template.glyphs[c]))missing.add('KabobLight');
 return [...missing];
}
