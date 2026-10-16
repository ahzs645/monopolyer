import {describe,it,expect} from 'vitest';
import {fitText,subtractRectangles} from '../src/textLayout';
import {iconGeometry,usesCustomDeedIcon} from '../src/spaceIcons';
import {createBoard} from '../src/model';
import {deedArtwork} from '../src/psdCards';
import {paintIcon} from '../src/pdfIcons';
const measure=(s,size)=>[...s].reduce((n,c)=>n+(c==='W'?.95:c==='I'?.2:.5)*size,0);
describe('anchored dynamic lettering',()=>{
 it('uses measured widths, respects manual lines and retains long unbroken wording',()=>{
  const narrow=fitText('IIIIII',{width:120,height:80,fontSize:40,measure}),wide=fitText('WWWWWW',{width:120,height:80,fontSize:40,measure});expect(narrow.lines).toHaveLength(1);expect(wide.lines.length).toBeGreaterThan(1);
  const text='INTERNATIONALHEADQUARTERS\nRESEARCH AND DEVELOPMENT';const fit=fitText(text,{width:160,height:75,fontSize:66,measure});expect(fit.lines.join('').replace(/\s/g,'')).toBe(text.replace(/\s/g,''));expect(fit.width).toBeLessThanOrEqual(160);expect(fit.height).toBeLessThanOrEqual(75.001);expect(fit.lines.some(l=>l.includes('…'))).toBe(false);
 });
 it('subtracts overlapping edit boxes without revealing their overlap',()=>{
  const rects=subtractRectangles([0,0,100,100],[[20,20,40,40],[40,40,40,40]]);expect(rects.reduce((n,[,,w,h])=>n+w*h,0)).toBe(7200);expect(rects.some(([x,y,w,h])=>50>x&&50<x+w&&50>y&&50<y+h)).toBe(false);
 });
});
describe('shared board and deed icons',()=>{
 it('changes a deed symbol without moving its text operations',()=>{
  const board=createBoard('campus'),tile=board.tiles[5],before=deedArtwork(board,tile);expect(usesCustomDeedIcon(board,tile)).toBe(false);tile.icon='heart';tile.artwork='none';tile.color='#bb2244';const after=deedArtwork(board,tile);expect(after.ops.find(o=>o.type==='icon').name).toBe('FaHeart');expect(after.ops.filter(o=>o.type!=='icon')).toEqual(before.ops.filter(o=>!(o.type==='image'&&o.w===222&&o.h===176)));
 });
 it('fits a supplied illustration in the deed symbol slot and restores the source artwork',()=>{const board=createBoard('campus'),tile=board.tiles[5],original=deedArtwork(board,tile);tile.artwork='book';const op=deedArtwork(board,tile).ops.find(o=>o.sourceArtwork==='book');expect(op).toBeDefined();expect(op.w).toBeLessThanOrEqual(222);expect(op.h).toBeLessThanOrEqual(176);tile.artwork='parkingSign';expect(deedArtwork(board,tile)).toEqual(original);});
 it('keeps manual board line breaks within the single-line deed heading slot',()=>{const board=createBoard('campus');board.tiles[12].name='QUANTUM\nOPERATIONS';const title=deedArtwork(board,board.tiles[12]).ops.find(o=>o.type==='text'&&o.value==='QUANTUM OPERATIONS');expect(title).toBeDefined();expect(title.y).toBe(302);});
 it('preserves Font Awesome picker paths and draws them as native PDF operations',()=>{
  const geometry=iconGeometry({faIcon:'FaFlag',icon:'heart'});expect(geometry.name).toBe('FaFlag');const ops=[];paintIcon({setFillColor:()=>{},path:p=>{ops.push(...p);return {fill:()=>{}};}},{...geometry,x:100,y:50,w:80,h:80,color:'#123456'},0,0,1,1);expect(ops[0].op).toBe('m');expect(ops.some(o=>o.op==='c')).toBe(true);for(const o of ops)expect(o.c.every(Number.isFinite)).toBe(true);const heart=[];paintIcon({setFillColor:()=>{},path:p=>{heart.push(...p);return {fill:()=>{}};}},{...iconGeometry({icon:'heart'}),x:100,y:50,w:80,h:80,color:'#123456'},0,0,1,1);expect(heart[0].c[0]).toBeCloseTo(172.234375);expect(heart[0].c[1]).toBeCloseTo(59.78125);const rocket=[];paintIcon({setFillColor:()=>{},path:p=>{rocket.push(...p);return {fill:()=>{}};}},{...iconGeometry({faIcon:'FaRocket'}),x:100,y:200,w:80,h:80,color:'#123456'},0,0,1,1);for(const o of rocket)for(let i=0;i<o.c.length;i++){expect(o.c[i]).toBeGreaterThanOrEqual((i%2?200:100)-.2);expect(o.c[i]).toBeLessThanOrEqual((i%2?280:180)+.2);}
 });
});
