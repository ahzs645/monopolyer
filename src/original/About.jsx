// Original supplied Printopoly About component, with local assets and updated feature status.
import React from 'react'
const Dice1=import.meta.env.BASE_URL+'reference-assets/dice-1.svg';
const Dice2=import.meta.env.BASE_URL+'reference-assets/dice-2.svg';
const Dice3=import.meta.env.BASE_URL+'reference-assets/dice-3.svg';

const OriginalAbout = (props) => {

    const maker = () => {
        props.setPage('Maker')
    }


    return (
        <div className='aboutpage'>

            <div className='titleContainer1'>
                <div className='title1'>PRINTOPOLY</div>
                <div className='subtitle1'>Create your own monopoly game!</div>
            </div>
            <div className='desccontainer1'>
                <div className='dicecontainer'>
                <img alt='dice1' src={Dice1} className='dice'/>
                <div className='para'>Printopoly is an online tool that lets you create custom monopoly boards. <br></br> Choose the property names, color schemes, and even icons to make the experience truly unique. </div>
                <img alt='dice2' src={Dice2} className='dice'/>
                <div className='para'>The website lets you customize every aspect of your board, from the property names and look, to the Chance and Community Chest cards. You can even choose your own currency.</div>
                <img alt='dice3' src={Dice3} className='dice'/>
                <div className='para'>Create the monopoly board fitting your exact idea and see your changes live as you make them in the instant preview mode.</div>
                </div>
                <div className='build'> Click the BUILD button to start creating your own board</div>

                <div className='buttoncontainer'>
                <button onClick={maker} className='buildButton'>BUILD</button>
                </div>
                <div className='blurb'>The site will generate a high resolution image of the monopoly board as well as the corresponding property cards, which can be downladed individaully or already grouped to fit and A4 page.</div>


                <div className='adcontainer'>
                {/* ad 1 */}
                <div className='ad'>"With our easy-to-use online tools, you can create a personalized board that is sure to make your next game night a hit!"</div>

                {/* ad 2 */}
                <div className='ad'>"Whether you're looking to create a fun game for your family or friends, or you're looking for a unique gift, Printopoly is the perfect place for you!"</div>
                </div>



                <div className='upcoming'>
                <div className='upcomingtitle'>Included features:</div>
                <div className='upcomingfeatures'> Custom Money <br/> Custom Community Chest and Chance Cards,<br/> 6000-pixel Board,<br/> Starting Templates </div>
                </div>


            </div>

            <div className='bottomscript'> Created by Marcell Sarosi. Please do not sue me Hasbro.</div>

        </div>
    )
}

export default OriginalAbout
