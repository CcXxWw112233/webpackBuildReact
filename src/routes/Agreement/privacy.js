import React from 'react'
import src from '../../assets/agreement/privacy.html'

export default () => {
  return (
    <div style={{display: 'flex', justifyContent: 'center'}}>
      <iframe title='myiframe' width='800px' height='890px' src={src}></iframe>
    </div>
  )
}