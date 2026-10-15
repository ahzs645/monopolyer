// Original supplied Printopoly component; import paths adapted for Vite/React 19.
import React, { useState, useEffect } from 'react'
import IconChooser from './IconChooser';


const SinglePropertyInputWithIcon = (props) => {

    const incolor = props.incolor;
    const propertyicon = incolor + "icon";
    const propertycolor = incolor + "color";


    return (
        <div className='neu'>
                <div className='neutext'>  <h2>  {props.title }:  </h2></div>
            <div>
                <IconChooser master={props.master} setMaster={props.setMaster} iconName={propertyicon} iconColor={propertycolor} scroll={props.scroll} ></IconChooser>
                <label className='desc'> {props.title} : </label>
                <input
                    className='input'
                    value={props.master[incolor]}
                    type="text"
                    onChange={e => props.setMaster({ ...props.master, [incolor]: e.target.value })}
                    name={incolor}
                    onFocus={e => props.scroll ? props.scroll(): console.log("no scroll")}
                />
            </div>
        </div>
    )
}

export default SinglePropertyInputWithIcon
