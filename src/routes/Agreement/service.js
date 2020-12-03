import React from 'react'
import src from '../../assets/agreement/service.html'

export default () => {
  const height = document.querySelector('body').clientHeight - 20
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <iframe
        title="myiframe"
        width="800px"
        height={height}
        src={src}
        frameBorder="none"
      ></iframe>
    </div>
  )
}
