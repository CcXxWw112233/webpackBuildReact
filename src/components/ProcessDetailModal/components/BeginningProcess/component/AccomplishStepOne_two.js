import React, { Component } from 'react'
import indexStyles from '../index.less'

export default class AccomplishStepOne_two extends Component {
  // 判断是多选还是单选所渲染的不同value内容
  renderWhetherMultipleValue = () => {
    const { itemValue } = this.props
    const { value, options = [], is_multiple_choice } = itemValue
    let containerText = ''
    switch (is_multiple_choice) {
      case '1': // 表示是多选
        let temp_value = value ? value.split(',') : []
        let newOptionsData = [...options]
        let arr = []
        newOptionsData.map(item => {
          if (temp_value.indexOf(item.id) != -1) {
            arr.push(item.label_name)
          }
        })
        containerText = arr.join(',')
        break
      case '0': // 表示不是多选
        let temp_value2 =
          (
            (options &&
              options.filter(item => item.id == value) &&
              options.filter(item => item.id == value).length &&
              options.filter(item => item.id == value)[0]) ||
            []
          ).label_name || ''
        containerText = temp_value2
        break

      default:
        break
    }
    return containerText
  }

  render() {
    const { itemValue } = this.props
    const { title, prompt_content, is_required } = itemValue
    return (
      <div className={indexStyles.text_form}>
        <p>
          <span>
            {title}:&nbsp;&nbsp;
            {is_required == '1' && <span style={{ color: '#F5222D' }}>*</span>}
          </span>
        </p>
        <div className={indexStyles.text_fillOut}>
          <span style={{ marginLeft: '12px' }}>
            {this.renderWhetherMultipleValue() || '暂无内容'}
          </span>
        </div>
      </div>
    )
  }
}
