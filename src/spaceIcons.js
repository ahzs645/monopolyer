import * as Icons from 'react-icons/fa';
import {createBoard} from './model';
export const ICON_COMPONENTS={train:'FaTrain',bolt:'FaBolt',drop:'FaTint',gift:'FaGift',question:'FaQuestion',car:'FaCar',lock:'FaLock',gavel:'FaGavel',coin:'FaCoins',book:'FaBook',star:'FaStar',home:'FaHome',heart:'FaHeart',building:'FaBuilding',tree:'FaTree',coffee:'FaCoffee'};
const sources={classic:createBoard('printopoly'),campus:createBoard('campus'),photoshop:createBoard('photoshop'),studio:createBoard('studio')};
export function usesCustomDeedIcon(board,tile){
 if(tile.artwork&&tile.artwork!=='none')return false;
 const original=sources[board.boardStyle||'studio'].tiles[tile.id];return tile.artwork==='none'||tile.icon!==original.icon||tile.faIcon!==original.faIcon;
}
export function iconGeometry(tile){
 const name=Icons[tile.faIcon]?tile.faIcon:ICON_COMPONENTS[tile.icon]||'FaStar',el=Icons[name]({});const paths=[];
 const collect=children=>{for(const child of Array.isArray(children)?children:[children]){if(!child)continue;if(child.type==='path')paths.push(child.props.d);else if(child.props?.children)collect(child.props.children);}};collect(el.props.children);
 return {name,viewBox:el.props.attr.viewBox.split(/\s+/).map(Number),paths};
}
export function deedIcon(board,tile,original){return usesCustomDeedIcon(board,tile)?{type:'icon',...iconGeometry(tile),x:original.x,y:original.y,w:original.w,h:original.h,color:tile.color}:null;}
