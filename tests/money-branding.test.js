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
