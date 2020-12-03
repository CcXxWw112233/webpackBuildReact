import React, { Component } from 'react'
import indexStyles from '../index.less'
import globalStyles from '@/globalset/css/globalClassName.less'

export default class ConfirmInfoOne_three extends Component {
  render() {
    const { itemValue } = this.props
    const { title, prompt_content, is_required } = itemValue
    return (
      <div className={indexStyles.text_form}>
        <p>
          {title}:&nbsp;&nbsp;
          {is_required == '1' && <span style={{ color: '#F5222D' }}>*</span>}
        </p>
        <div className={indexStyles.text_fillOut}>
          <span className={globalStyles.authTheme}>&#xe7d3;&nbsp;&nbsp;</span>
          <span style={{ color: 'rgba(0,0,0,0.25)' }}>{prompt_content}</span>
        </div>
      </div>
    )
  }
}
