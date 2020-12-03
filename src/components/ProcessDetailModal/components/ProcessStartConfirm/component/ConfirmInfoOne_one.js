import React, { Component } from 'react'
import indexStyles from '../index.less'

export default class ConfirmInfoOne_one extends Component {
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
          <span>{prompt_content}</span>
        </div>
      </div>
    )
  }
}
