import * as React from 'react'
import * as FontIcon from 'react-icons/fa'
import * as CSS from 'csstype'
type IconList = string;

interface IconPickerItemProps {
  icon: IconList
  size?: number
  color?: string
  onClick?: (icon: string) => void
  containerStyles?: CSS.Properties
}

const IconPickerItem: React.SFC<IconPickerItemProps> = ({
  icon,
  size = 24,
  color = '#000',
  onClick,
  containerStyles,
}) => {
  const iconDiv = !!icon ? React.createElement(FontIcon[icon]||FontIcon.FaQuestion) : <div />
  return (
    <div
      role={onClick?'button':undefined} tabIndex={onClick?0:undefined} aria-label={onClick?`Use ${icon} icon`:undefined} onKeyDown={e=>{if(onClick&&(e.key==='Enter'||e.key===' ')){e.preventDefault();e.stopPropagation();onClick(icon);}}}
      onClick={() => !!onClick && onClick(icon)}
      style={{ fontSize: size, color: color, padding: 2, ...containerStyles }}
    >
      {iconDiv}
    </div>
  )
}

IconPickerItem.defaultProps = {
  color: '#000',
  size: 24,
}

export { IconPickerItem }
