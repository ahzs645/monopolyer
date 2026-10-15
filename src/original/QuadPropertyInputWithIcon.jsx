// Original supplied Printopoly component; import paths adapted for Vite/React 19.
import React, { useState, useEffect } from 'react'
import IconChooser from './IconChooser';


const QuadPropertyInputWithIcon = (props) => {

    const incolor = props.incolor;
    const property1 = incolor + 1;
    const property2 = incolor + 2;
    const property3 = incolor + 3;
    const property4 = incolor + 4;
    const propertyicon = incolor + "icon";
    const propertycolor = incolor + "color";


    return (
        <div className='neu'>
            <h2 className='neutext'>{props.title}:</h2>
            <div>
                <IconChooser master={props.master} setMaster={props.setMaster} iconName={propertyicon} iconColor={propertycolor} scroll={props.scroll}></IconChooser>
                <div>
                <label className='desc'> {props.title} 1: </label>
                <input
                    className='input'
                    value={props.master[property1]}
                    type="text"
                    onChange={e => props.setMaster({ ...props.master, [property1]: e.target.value })}
                    name={property1}
                    onFocus={e => props.scroll()}
                />
                </div>
                <div>
                <label  className='desc' > {props.title} 2: </label>
                    <input
                    className='input'
                    value={props.master[property2]}
                    type="text"
                    onChange={e => props.setMaster({ ...props.master, [property2]: e.target.value })}
                    name={property2}
                    onFocus={e => props.scroll()}
                />
                </div>

                <div>
                <label  className='desc'>  {props.title} 3: </label>

                <input
                    className='input'
                    value={props.master[property3]}
                    type="text"
                    onChange={e => props.setMaster({ ...props.master, [property3]: e.target.value })}
                    name={property3}
                    onFocus={e => props.scroll()}
                />
                </div>
                <div>
                <label  className='desc'> {props.title} 4: </label>

                <input
                    className='input'
                    value={props.master[property4]}
                    type="text"
                    onChange={e => props.setMaster({ ...props.master, [property4]: e.target.value })}
                    name={property4}
                    onFocus={e => props.scroll()}
                />
                </div>
            </div>
        </div>
    )
}

export default QuadPropertyInputWithIcon
