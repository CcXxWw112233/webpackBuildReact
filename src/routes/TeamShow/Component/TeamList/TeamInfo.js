import React from 'react'

export default class TeamInfo extends React.Component {
  render() {
    let templateHtml = ''
    const minHeight = document.body.clientHeight
    return (
      <div
        style={{
          minHeight: minHeight,
          backgroundColor: '#ffffff',
          margin: 0,
          height: 'auto'
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: templateHtml }}></div>
      </div>
    )
  }
}
