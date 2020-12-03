import React, { Component, useState, useEffect } from 'react'
import indexStyles from './index.less'
import NameChangeInput from '../../../NameChangeInput'

function OpinionContent(props) {
  const {
    placeholder,
    value,
    handleCancelRejectProcess,
    opinionTextAreaChange,
    opinionTextAreaBlur
  } = props
  const [opinion_click, setOpinionClick] = useState(false)
  let handleOnBlur = e => {
    opinionTextAreaBlur && opinionTextAreaBlur(e), setOpinionClick(false)
  }
  let handleOnClick = e => {
    handleCancelRejectProcess && handleCancelRejectProcess(e),
      setOpinionClick(true)
  }
  return (
    <div className={indexStyles.opinion_wrapper}>
      {opinion_click ? (
        <div>
          <NameChangeInput
            autosize
            onBlur={handleOnBlur}
            // onPressEnter={this.titleTextAreaChangeBlur}
            // onClick={this.titleTextAreaChangeClick}
            setIsEdit={handleOnBlur}
            onChange={opinionTextAreaChange}
            autoFocus={true}
            goldName={value}
            nodeName={'textarea'}
            maxLength={500}
            style={{
              display: 'block',
              fontSize: 14,
              color: '#262626',
              resize: 'none',
              minHeight: '96px',
              background: 'rgba(255,255,255,1)',
              boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.15)',
              borderRadius: '4px',
              border: 'none',
              marginTop: '4px'
            }}
          />
        </div>
      ) : (
        <div onClick={handleOnClick} className={indexStyles.opinion_content}>
          <span
            style={{
              color: value ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0.45)',
              whiteSpace: 'pre-wrap'
            }}
          >
            {value ? value : placeholder}
          </span>
        </div>
      )}
    </div>
  )
}

export default OpinionContent
