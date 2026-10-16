import {fitText} from '../src/textLayout';
import {describe,it,expect} from 'vitest';
import {createBoard,validateBoard} from '../src/model';
import {billHeading,moneyArtwork} from '../src/moneyArtwork';
describe('bill heading choices',()=>{
 it('preserves original and legacy bank headings for existing projects',()=>{const b=createBoard();expect(billHeading(b)).toMatchObject({mode:'original',value:'MONOPOLY',color:'#000000'});b.money.personalize=true;expect(billHeading(b).value).toBe(b.money.bankName);});
 it('follows a board rename while keeping custom wording independent',()=>{const b=createBoard();b.money.headingMode='board';b.title='northernhealthoploy';expect(billHeading(b).value).toBe(b.title);b.title='New edition';expect(billHeading(b).value).toBe('New edition');b.money.headingMode='custom';b.money.headingText='Northern Health';expect(billHeading(b).value).toBe('Northern Health');b.title='Another edition';expect(billHeading(b).value).toBe('Northern Health');});
 it('retains heading and title colors through project validation and escapes custom markup',()=>{const b=createBoard();b.titleColor='#ffffff';b.money.headingMode='custom';b.money.headingText='Health & <Care>';b.money.headingColor='#005699';const data=validateBoard(b);expect(data.titleColor).toBe('#ffffff');expect(data.money.headingColor).toBe('#005699');const svg=moneyArtwork('<svg></svg>',data,0);expect(svg).toContain('Health &amp; &lt;Care&gt;');expect(svg).toContain('fill="#005699"');expect(svg).not.toContain('<Care>');});
});

it('fits a long board name on one line without splitting or dropping letters',()=>{const title='northernhealthoploy';const layout=fitText(title,{width:400,height:60,fontSize:70,measure:(s,size)=>s.length*size*.6,singleLine:true});expect(layout.lines).toEqual([title.toUpperCase()]);expect(layout.width).toBeLessThanOrEqual(400);expect(layout.height).toBeLessThanOrEqual(60);});

import {curvedBillHeading,missingBillGlyphs} from '../src/billHeadingFont';
it('lays out complete uppercase headings on the source curve and reports missing source glyphs',()=>{
 const source=curvedBillHeading('MONOPOLY');expect(source.missing).toEqual([]);expect(source.paths).toHaveLength(8);expect(source.paths.every(p=>p.d&&p.transform.includes('rotate('))).toBe(true);
 const custom=curvedBillHeading('Northern Healthopoly');expect(custom.paths.map(p=>p.char).join('')).toBe('NORTHERN HEALTHOPOLY');expect(missingBillGlyphs('Northern Healthopoly')).toEqual([]);expect(custom.paths.every(p=>!p.transform.includes('NaN'))).toBe(true);
});
it('prints untinted black-and-white bills even when custom tint and heading colors are saved',()=>{
 const b=createBoard();Object.assign(b.money,{monochrome:true,tint:true,headingMode:'custom',headingText:'MONOPOLY',headingColor:'#005699'});b.money.colors[1]='#cc2244';
 const svg=moneyArtwork('<svg><path fill="#fbd5e3" stroke="#fbd5e3"/><path fill="#231f20"/></svg>',b,1);expect(svg).not.toContain('#cc2244');expect(svg).not.toContain('#fbd5e3');expect(svg).not.toContain('#005699');expect(svg).toContain('fill="#ffffff"');expect(svg).toContain('data-heading-layout="source-curve"');expect(svg).toContain('data-heading-font="Myriad-Roman"');
});

it('loads outline glyphs from a matching OTF and rejects an unrelated font',async()=>{
 const {default:opentype}=await import('opentype.js');const {uploadBillFont}=await import('../src/billHeadingFont');
 const makeFont=name=>{const path=new opentype.Path();path.moveTo(0,0);path.lineTo(400,0);path.lineTo(200,700);path.close();const font=new opentype.Font({familyName:name,styleName:'Roman',unitsPerEm:1000,ascender:800,descender:-200,glyphs:[new opentype.Glyph({name:'.notdef',advanceWidth:500}),...['個'].map(c=>new opentype.Glyph({name:c,unicode:c.charCodeAt(0),advanceWidth:500,path}))]});font.names.postScriptName={en:name};return font.toArrayBuffer();};
 const other=makeFont('Other-Font');await expect(uploadBillFont({size:other.byteLength,arrayBuffer:async()=>other})).rejects.toThrow('Choose Myriad');
 expect(missingBillGlyphs('個')).toEqual(['個']);const data=makeFont('Myriad-Roman'),previous=globalThis.localStorage;globalThis.localStorage={setItem(){}};try{await uploadBillFont({size:data.byteLength,arrayBuffer:async()=>data});expect(missingBillGlyphs('NORTHERN HEALTHOPOLY')).toEqual([]);expect(missingBillGlyphs('個')).toEqual([]);expect(curvedBillHeading('個').paths.every(p=>p.d)).toBe(true);}finally{globalThis.localStorage=previous;}
});
