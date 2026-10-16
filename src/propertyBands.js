// Bands use shared grid boundaries. Fill extends under the border stroke, so
// palette edits never expose the original raster antialiasing around a color.
export function propertyBandRect(id,tileRect){
 const {x,y,w,h}=tileRect;
 if(id<10)return {x,y:5194,width:w,height:183};
 if(id<20)return {x:635,y,width:179,height:h};
 if(id<30)return {x,y:620,width:w,height:186};
 return {x:5186,y,width:179,height:h};
}
export function cleanPropertyBands(board,source){
 if(board.bandEdges==='source')return false;
 return board.bandEdges==='clean'||board.ink!==source.ink||board.groups.some((color,i)=>color!==source.groups[i])||board.tiles.some(t=>t.kind==='property'&&t.group!==source.tiles[t.id].group);
}
