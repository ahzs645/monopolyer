import {templateTileRect} from './TemplateBoard';
import {tilePosition} from './model';
// Only editor crops are rotated. The full board/export keeps its source geometry.
export function spacePreviewLayout(board,id){
 const native=board.boardStyle!=='studio',r=native?templateTileRect(id):tilePosition(id);
 const rotation=id<10?0:id<20?90:id<30?180:270,sideways=rotation%180!==0;
 const w=sideways?r.h:r.w,h=sideways?r.w:r.h;
 return {w,h,rotation,transform:`translate(${w/2} ${h/2}) rotate(${-rotation}) translate(${-r.x-r.w/2} ${-r.y-r.h/2})`};
}
