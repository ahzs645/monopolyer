// Original supplied Printopoly component; import paths adapted for Vite/React 19.
import React, { useState, useEffect } from 'react'


const DualPropertyInput = (props) => {

    const incolor = props.incolor;
    const property1 = incolor + 1;
    const property2 = incolor + 2;
    const propertyColor = incolor + "color";
    const defaultcolor = props.master[propertyColor];

    useEffect(() => {
        props.setMaster({ ...props.master, [propertyColor]: defaultcolor });
    }, []);

    return (
        <div className='neu'
        // style={{borderColor: props.master[propertyColor]}}
        >
            <h2 className='neutext'>Property group {props.number}:</h2>
            <div>
                <label className='desc'>Property color:</label>
                <input type="color"
                    className='colorinput'
                    id={propertyColor}
                    name={propertyColor}
                    value={props.master[propertyColor]}
                    onChange={e => props.setMaster({ ...props.master, [propertyColor]: e.target.value })}
                    onFocus={e => props.scroll()}
                />
            </div>
            <div>
                <label className='desc'> Property {props.number}/1 </label>
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
                <label className='desc'> Property {props.number}/2 </label>
                <input
                    className='input'
                    value={props.master[property2]}
                    type="text"
                    onChange={e => props.setMaster({ ...props.master, [property2]: e.target.value })}
                    name={property2}
                    onFocus={e => props.scroll()}
                />
            </div>
        </div>
    )
}

export default DualPropertyInput
