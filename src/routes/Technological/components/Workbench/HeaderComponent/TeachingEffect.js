import React from 'react'
import mapSrc from './img/effect.png'

export default class SchoolWork extends React.Component {

  render() {
    return (
      <div style={{cursor: 'pointer'}}>
        <img src={mapSrc} />
      </div>
    )
  }
}
