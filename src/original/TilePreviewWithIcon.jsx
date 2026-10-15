// Original supplied Printopoly component; import paths adapted for Vite/React 19.
import React from 'react'
import Icon from './Icon';



const TilePreviewWithIcon = (props) => {
    return (
        <div className='holder'>
            <div className="space railroad">
                <div className="container">
                    <div className="name">{props.name}</div>
                    <Icon iconName={props.icon} size={110} color={props.color} />
                        { (props.price && props.price.trim !== '') ? <div className="price">
                            <Icon iconName={props.currency} size={20} color={'black'} />
                            {props.price}
                        </div> : <div></div> }
                </div>
            </div>
        </div>

    )
}

export default TilePreviewWithIcon
