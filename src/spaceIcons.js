import {artworkHref} from './customArtwork';
import * as Icons from 'react-icons/fa';
import {createBoard} from './model';
import {ORIGINAL_ARTWORK} from './reference-assets/artwork';
export const ICON_COMPONENTS={train:'FaTrain',bolt:'FaBolt',drop:'FaTint',gift:'FaGift',question:'FaQuestion',car:'FaCar',lock:'FaLock',gavel:'FaGavel',coin:'FaCoins',book:'FaBook',star:'FaStar',home:'FaHome',heart:'FaHeart',building:'FaBuilding',tree:'FaTree',coffee:'FaCoffee'};
const sources={classic:createBoard('printopoly'),campus:createBoard('campus'),photoshop:createBoard('photoshop'),studio:createBoard('studio')};
export const originalArtwork=(board,id)=>sources[board.boardStyle||'studio']?.tiles[id]?.artwork;
export function usesCustomDeedIcon(board,tile){
 if(tile.customArtwork)return true;
 const original=sources[board.boardStyle||'studio'].tiles[tile.id];if(tile.artwork&&tile.artwork!=='none')return tile.artwork!==original.artwork;return tile.artwork==='none'||tile.icon!==original.icon||tile.faIcon!==original.faIcon;
}
export function iconGeometry(tile){
 const name=Icons[tile.faIcon]?tile.faIcon:ICON_COMPONENTS[tile.icon]||'FaStar',el=Icons[name]({});const paths=[];
 const collect=children=>{for(const child of Array.isArray(children)?children:[children]){if(!child)continue;if(child.type==='path')paths.push(child.props.d);else if(child.props?.children)collect(child.props.children);}};collect(el.props.children);
 return {name,viewBox:el.props.attr.viewBox.split(/\s+/).map(Number),paths};
}
export function deedIcon(board,tile,original){
 if(!usesCustomDeedIcon(board,tile))return null;
 if(tile.customArtwork)return {type:'image',src:artworkHref(tile.customArtwork),customArtwork:tile.customArtwork.kind,...{x:original.x,y:original.y,w:original.w,h:original.h}};
 const src=ORIGINAL_ARTWORK[tile.artwork];
 if(src){const bytes=Uint8Array.from(atob(src.split(',')[1].slice(0,44)),c=>c.charCodeAt(0));const png=new DataView(bytes.buffer),w=png.getUint32(16),h=png.getUint32(20),scale=Math.min(original.w/w,original.h/h);return {type:'image',src,sourceArtwork:tile.artwork,x:original.x+(original.w-w*scale)/2,y:original.y+(original.h-h*scale)/2,w:w*scale,h:h*scale};}
 return {type:'icon',...iconGeometry(tile),x:original.x,y:original.y,w:original.w,h:original.h,color:tile.color};
}
