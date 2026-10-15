// Original supplied Printopoly component; import paths adapted for Vite/React 19.
import React, { useState, useEffect } from 'react'
import { IconPicker } from './IconPicker'
import Icon from './Icon';


const IconChooser = (props) => {

    // <IconChooser
    // master={props.master}
    // setMaster={props.setMaster}
    // iconName={propertyicon1}
    // iconColor={propertycolor1} >
    // </IconChooser>

    // const camelize = (s) => {
    //     const word = s.split(' ')[1].replace(/-./g, x => x[1].toUpperCase())
    //     console.log(word)
    //     return word.charAt(0).toUpperCase() + word.slice(1);
    // }

    // const toKebabCase = (s) => {
    //     const word = s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    //     console.log(word);
    //     return "fa-solid " + word + " fa-5x";
    // }

    //kebab case to camel case


    return (
        <div className='iconcontainer2'>
            <label className='desc'> Icon: </label>
            <input type="color"
                className='iconcolorinput'
                id={props.iconColor}
                name={props.iconColor}
                value={props.master[props.iconColor]}
                onChange={e => props.setMaster({ ...props.master, [props.iconColor]: e.target.value })}
                onFocus={e => props.scroll ? props.scroll() : console.log("no scroll")}
            />
            <IconPicker
                value={props.master[props.iconName]}
                onChange={(v) => props.setMaster({ ...props.master, [props.iconName]: v })}
                onClick={e => props.scroll ? props.scroll() : console.log("no scroll")}
            />
            <span style={{paddingLeft: '5px' }}>
                <Icon iconName={props.master[props.iconName]} size={50} color={props.master[props.iconColor]} />
            </span>
        </div>
    )
}

export default IconChooser
