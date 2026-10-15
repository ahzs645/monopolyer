// Original supplied Printopoly Maker JSX. State/export callbacks use the static app backend.
import React,{useRef,useState} from 'react';
import {FaArrowLeft} from 'react-icons/fa';
import {IconPicker} from './IconPicker';
import DualPropertyInput from './DualPropertyInput';
import TriplePropertyInput from './TriplePropertyInput';
import IconChooser from './IconChooser';
import DualPropertyInputWithIcon from './DualPropertyInputWithIcon';
import SinglePropertyInputWithIcon from './SinglePropertyInputWithIcon';
import QuadPropertyInputWithIcon from './QuadPropertyInputWithIcon';
import TilePreview from './TilePreview';
import TilePreviewWithIcon from './TilePreviewWithIcon';
export default function OriginalMaker({master,setMaster,cardMaster,doit,loading,onBack,onAdvanced,onShare,onOpen}){
 const brownRef=useRef();
 const scrollToBrown=()=>brownRef.current?.scrollIntoView({block:'center'});
 const cyanRef=useRef();
 const scrollToCyan=()=>cyanRef.current?.scrollIntoView({block:'center'});
 const purpleRef=useRef();
 const scrollToPurple=()=>purpleRef.current?.scrollIntoView({block:'center'});
 const orangeRef=useRef();
 const scrollToOrange=()=>orangeRef.current?.scrollIntoView({block:'center'});
 const redRef=useRef();
 const scrollToRed=()=>redRef.current?.scrollIntoView({block:'center'});
 const yellowRef=useRef();
 const scrollToYellow=()=>yellowRef.current?.scrollIntoView({block:'center'});
 const greenRef=useRef();
 const scrollToGreen=()=>greenRef.current?.scrollIntoView({block:'center'});
 const blueRef=useRef();
 const scrollToBlue=()=>blueRef.current?.scrollIntoView({block:'center'});
 const railRef=useRef();
 const scrollToRail=()=>railRef.current?.scrollIntoView({block:'center'});
 const utilityRef=useRef();
 const scrollToUtility=()=>utilityRef.current?.scrollIntoView({block:'center'});
 const taxRef=useRef();
 const scrollToTax=()=>taxRef.current?.scrollIntoView({block:'center'});
 const chanceRef=useRef();
 const scrollToChance=()=>chanceRef.current?.scrollIntoView({block:'center'});
 const chestRef=useRef();
 const scrollToChest=()=>chestRef.current?.scrollIntoView({block:'center'});
 const parkingRef=useRef();
 const scrollToParking=()=>parkingRef.current?.scrollIntoView({block:'center'});
 const jailRef=useRef();
 const scrollToJail=()=>jailRef.current?.scrollIntoView({block:'center'});
 const titleRef=useRef();
 const scrollToTitle=()=>titleRef.current?.scrollIntoView({block:'center'});
 const [grouping,setGrouping]=useState(true);
 const back=onBack;
    return (
      <div className="App">
            {/* <div className='hello'><FaDice size={50}/></div> */}
            <button className='hello' onClick={back}><FaArrowLeft size={50}/></button>
        <div className='left'>
          <div className='heading2'> <h1>Title</h1></div>
          <div className='neu'>
            <label className='desc'> Title: </label>
            <input
              className='input'
              value={master.title}
              type="text"
              onChange={e => setMaster({ ...master, title: e.target.value })}
              name="title"
              onFocus={e => scrollToTitle()}
            />
          </div>
          <div className='heading2'> <h1>Currency</h1></div>
          <div className='iconcontainer'>
            <label className='desc' > Currency: </label>
            <div className='iconstyle'>
              <IconPicker
                value={master.currency}
                onChange={(v) => setMaster({ ...master, currency: v })}
              />
            </div>
          </div>

          <div className='heading2' ><h1>Properties</h1> </div>

          <DualPropertyInput number={1} incolor={"brown"} master={master} setMaster={setMaster} scroll={scrollToBrown}></DualPropertyInput>
          <TriplePropertyInput number={2} incolor={"cyan"} master={master} setMaster={setMaster} scroll={scrollToCyan}></TriplePropertyInput>
          <TriplePropertyInput number={3} incolor={"purple"} master={master} setMaster={setMaster} scroll={scrollToPurple}></TriplePropertyInput>
          <TriplePropertyInput number={4} incolor={"orange"} master={master} setMaster={setMaster} scroll={scrollToOrange}></TriplePropertyInput>
          <TriplePropertyInput number={5} incolor={"red"} master={master} setMaster={setMaster} scroll={scrollToRed}></TriplePropertyInput>
          <TriplePropertyInput number={6} incolor={"yellow"} master={master} setMaster={setMaster} scroll={scrollToYellow}></TriplePropertyInput>
          <TriplePropertyInput number={7} incolor={"green"} master={master} setMaster={setMaster} scroll={scrollToGreen}></TriplePropertyInput>
          <DualPropertyInput number={8} incolor={"blue"} master={master} setMaster={setMaster} scroll={scrollToBlue}></DualPropertyInput>

          <div className='heading2'> <h1>Specials</h1></div>
          <DualPropertyInputWithIcon title={"Taxes"} incolor={"tax"} master={master} setMaster={setMaster} scroll={scrollToTax} ></DualPropertyInputWithIcon>
          <DualPropertyInputWithIcon title={"Utility"} incolor={"util"} master={master} setMaster={setMaster} scroll={scrollToUtility}></DualPropertyInputWithIcon>
          <QuadPropertyInputWithIcon title={"Transportation"} incolor={"rail"} master={master} setMaster={setMaster} scroll={scrollToRail}></QuadPropertyInputWithIcon>
          <SinglePropertyInputWithIcon title={"Chance"} incolor={"chance"} master={master} setMaster={setMaster} scroll={scrollToChance}></SinglePropertyInputWithIcon>
          <SinglePropertyInputWithIcon title={"Community Chest"} incolor={"chest"} master={master} setMaster={setMaster} scroll={scrollToChest}></SinglePropertyInputWithIcon>




          <SinglePropertyInputWithIcon title={"Jail"} incolor={"jail"} master={master} setMaster={setMaster} scroll={scrollToJail}></SinglePropertyInputWithIcon>
          <div className='neu'>
            <div className='neutext'>  <h2> Go to Jail Icon: </h2></div>
            <IconChooser master={master} setMaster={setMaster} iconName={"gojailicon"} iconColor={"gojailcolor"} scroll={scrollToJail} ></IconChooser>
          </div>

          <SinglePropertyInputWithIcon title={"Parking"} incolor={"parking"} master={master} setMaster={setMaster} scroll={scrollToParking}></SinglePropertyInputWithIcon>

          <div className='neu'>
              <div className='iconcontainer1'>
              <input
                  className='checkboxstyle'
                  type="checkbox"
                  name="site_name"
                  checked={grouping}
                  onChange={(e) =>{
                    console.log(grouping)
                    setGrouping(!grouping)
                    }}

                />
                <label className='desc'> Group Images (check for performance)</label>
              </div>
          </div>
          {(loading==="loading") ? <div className='heading2loading'> <h1>Loading... This will take a minute...  Do Not Panic!</h1></div>: <></>}
          {(loading==="none") ? <div className='heading2'> <h1>Press Print to Download Files</h1></div>: <></>}
          {(loading==="done") ? <div className='heading2'> <h1>Download Successful</h1></div>: <></>}
          {(loading==="error") ? <div className='heading2'> <h1>Error occured. Try again by refreshing the page. If this continues to happen try  Group Images.</h1></div>: <></>}
          <button disabled={loading==="loading" || loading==="error"}  className='submitButton' onClick={doit}>Print</button>
        </div>
        <div className='right'>

          <h1 ref={titleRef} className="title">{master.title}</h1><div className="source-tools"><button onClick={onAdvanced}>Logo, cards &amp; full board</button><button onClick={onShare}>Save / share</button><button onClick={onOpen}>Open project</button></div>

          <div className='exprow' ref={brownRef}>
            <TilePreview name={master.brown1} color={master.browncolor} currency={master.currency} price={cardMaster.brown1.price}></TilePreview>
            <TilePreview name={master.brown2} color={master.browncolor} currency={master.currency} price={cardMaster.brown2.price}></TilePreview>
          </div>
          <div className='exprow' ref={cyanRef}>
            <TilePreview name={master.cyan1} color={master.cyancolor} currency={master.currency} price={cardMaster.cyan1.price}></TilePreview>
            <TilePreview name={master.cyan2} color={master.cyancolor} currency={master.currency} price={cardMaster.cyan2.price}></TilePreview>
            <TilePreview name={master.cyan3} color={master.cyancolor} currency={master.currency} price={cardMaster.cyan3.price}></TilePreview>
          </div>
          <div className='exprow' ref={purpleRef}>
            <TilePreview name={master.purple1} color={master.purplecolor} currency={master.currency} price={cardMaster.purple1.price}></TilePreview>
            <TilePreview name={master.purple2} color={master.purplecolor} currency={master.currency} price={cardMaster.purple2.price}></TilePreview>
            <TilePreview name={master.purple3} color={master.purplecolor} currency={master.currency} price={cardMaster.purple3.price}></TilePreview>
          </div>
          <div className='exprow' ref={orangeRef}>
            <TilePreview name={master.orange1} color={master.orangecolor} currency={master.currency} price={cardMaster.orange1.price}></TilePreview>
            <TilePreview name={master.orange2} color={master.orangecolor} currency={master.currency} price={cardMaster.orange2.price}></TilePreview>
            <TilePreview name={master.orange3} color={master.orangecolor} currency={master.currency} price={cardMaster.orange3.price}></TilePreview>
          </div>
          <div className='exprow' ref={redRef}>
            <TilePreview name={master.red1} color={master.redcolor} currency={master.currency} price={cardMaster.red1.price}></TilePreview>
            <TilePreview name={master.red2} color={master.redcolor} currency={master.currency} price={cardMaster.red2.price}></TilePreview>
            <TilePreview name={master.red3} color={master.redcolor} currency={master.currency} price={cardMaster.red3.price}></TilePreview>
          </div>
          <div className='exprow' ref={yellowRef}>
            <TilePreview name={master.yellow1} color={master.yellowcolor} currency={master.currency} price={cardMaster.yellow1.price}></TilePreview>
            <TilePreview name={master.yellow2} color={master.yellowcolor} currency={master.currency} price={cardMaster.yellow2.price}></TilePreview>
            <TilePreview name={master.yellow3} color={master.yellowcolor} currency={master.currency} price={cardMaster.yellow3.price}></TilePreview>
          </div>
          <div className='exprow' ref={greenRef}>
            <TilePreview name={master.green1} color={master.greencolor} currency={master.currency} price={cardMaster.green1.price}></TilePreview>
            <TilePreview name={master.green2} color={master.greencolor} currency={master.currency} price={cardMaster.green2.price}></TilePreview>
            <TilePreview name={master.green3} color={master.greencolor} currency={master.currency} price={cardMaster.green3.price}></TilePreview>
          </div>
          <div className='exprow' ref={blueRef}>
            <TilePreview name={master.blue1} color={master.bluecolor} currency={master.currency} price={cardMaster.blue1.price}></TilePreview>
            <TilePreview name={master.blue2} color={master.bluecolor} currency={master.currency} price={cardMaster.blue2.price}></TilePreview>
          </div>

          <div className='exprow' ref={taxRef}>
            <TilePreviewWithIcon name={master.tax1} icon={master.tax1icon} color={master.tax1color} currency={master.currency} price={master.tax1price}></TilePreviewWithIcon>
            <TilePreviewWithIcon name={master.tax2} icon={master.tax2icon} color={master.tax2color} currency={master.currency} price={master.tax2price}></TilePreviewWithIcon>
          </div>

          <div className='exprow' ref={utilityRef}>
            <TilePreviewWithIcon name={master.util1} icon={master.util1icon} color={master.util1color} currency={master.currency} price={master.util1price}></TilePreviewWithIcon>
            <TilePreviewWithIcon name={master.util2} icon={master.util2icon} color={master.util2color} currency={master.currency} price={master.util2price}></TilePreviewWithIcon>
          </div>

          <div className='exprow' ref={railRef}>
            <div style={{ flex: '0 0 50%', justifyContent: 'center' }}>
              <TilePreviewWithIcon name={master.rail1} icon={master.railicon} color={master.railcolor} currency={master.currency} price={master.rail1price}></TilePreviewWithIcon>
            </div>
            <div style={{ flex: '0 0 50%', justifyContent: 'center' }}>
              <TilePreviewWithIcon name={master.rail2} icon={master.railicon} color={master.railcolor} currency={master.currency} price={master.rail2price}></TilePreviewWithIcon>
            </div>
            <div style={{ flex: '0 0 50%', justifyContent: 'center' }}>
              <TilePreviewWithIcon name={master.rail3} icon={master.railicon} color={master.railcolor} currency={master.currency} price={master.rail3price}></TilePreviewWithIcon>
            </div>
            <div style={{ flex: '0 0 50%', justifyContent: 'center' }}>
              <TilePreviewWithIcon name={master.rail4} icon={master.railicon} color={master.railcolor} currency={master.currency} price={master.rail4price}></TilePreviewWithIcon>
            </div>
          </div>

          <div className='exprow' ref={chanceRef}>
            <div ref={chestRef}>
              <TilePreviewWithIcon name={master.chance} icon={master.chanceicon} color={master.chancecolor} currency={master.currency} price={''}></TilePreviewWithIcon>
              <TilePreviewWithIcon name={master.chest} icon={master.chesticon} color={master.chestcolor} currency={master.currency} price={''}></TilePreviewWithIcon>
            </div>
          </div>

          <div className='exprow' ref={jailRef}>
            <TilePreviewWithIcon name={master.jail} icon={master.jailicon} color={master.jailcolor} currency={master.currency} price={''}></TilePreviewWithIcon>
            <TilePreviewWithIcon name={"Go to " + master.jail} icon={master.gojailicon} color={master.gojailcolor} currency={master.currency} price={''}></TilePreviewWithIcon>

          </div>

          <div className='exprow' ref={parkingRef}>
            <TilePreviewWithIcon name={"Free " + master.parking} icon={master.parkingicon} color={master.parkingcolor} currency={master.currency} price={''}></TilePreviewWithIcon>
          </div>

          <br>
          </br>
          <h1>-</h1>
        </div>

      </div>
    );
}
