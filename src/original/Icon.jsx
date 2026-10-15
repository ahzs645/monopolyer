// Original supplied Printopoly component; import paths adapted for Vite/React 19.
import React from "react";

import  *  as FontAwesome from 'react-icons/fa';

const Icon = props => {
  const { iconName, size, color } = props;
  const icon = React.createElement(FontAwesome[iconName]||FontAwesome.FaQuestion);
  return (
    <div style={{ fontSize: size, color: color, marginTop: '5px', display: 'inline-block' }}>{icon}</div>
  );
};

export default Icon
