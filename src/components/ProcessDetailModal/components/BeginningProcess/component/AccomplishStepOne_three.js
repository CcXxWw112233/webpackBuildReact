import React, { Component } from 'react'
import indexStyles from '../index.less'
import { timestampToTime } from '../../../../../utils/util'

export default class AccomplishStepOne_three extends Component {
  // 渲染不同时候的日期状态
  renderDiffDateStatus = () => {
    const { itemValue } = this.props
    const { date_range, date_precision, value } = itemValue
    let containerText = ''
    switch (date_range) {
      case '1': // 表示单个日期
        if (date_precision == '1') {
          // 表示仅日期
          containerText = timestampToTime(value, true)
        } else if (date_precision == '2') {
          // 表示日期 + 时间
          containerText = timestampToTime(value)
        }
        break
      case '2': // 表示日期 + 时间
        const timeArray = (value && value.split(',')) || []
        const startTime = timeArray[0]
        const endTime = timeArray[1]
        if (date_precision == '1') {
          // 表示仅日期
          containerText = `${timestampToTime(startTime)} ~ ${timestampToTime(
            endTime
          )}`
        } else if (date_precision == '2') {
          // 表示日期 + 时间
          containerText = `${timestampToTime(startTime)} ~ ${timestampToTime(
            endTime
          )}`
        }
        break
      default:
        break
    }
    return containerText
  }

  render() {
    const { itemValue } = this.props
    const { title, prompt_content, is_required, value } = itemValue
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
            {this.renderDiffDateStatus() || '暂无内容'}
          </span>
        </div>
      </div>
    )
  }
}
