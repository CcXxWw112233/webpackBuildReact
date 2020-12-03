import React, { Component } from 'react'
import indexStyles from '../index.less'
import { Input } from 'antd'

export default class EditStepTypeOne_one extends Component {
  render() {
    const { itemValue } = this.props
    const { title, prompt_content, is_required } = itemValue
    return (
      <div className={indexStyles.text_form}>
        <p>
          {title}:&nbsp;&nbsp;
          {is_required == '1' && <span style={{ color: '#F5222D' }}>*</span>}
        </p>
        <Input placeholder={prompt_content} disabled={true} />
      </div>
    )
  }
}
