import React, { Component } from 'react'
import {
  timestampToTimeNormal,
  timeToTimestamp
} from './../../../../../../utils/util'
import { DatePicker, message } from 'antd'

class DateRangePicker extends Component {
  state = {
    start_time: '',
    due_time: '',
    endOpen: false
  }
  disabledStartTime = start_time => {
    const { due_time } = this.state
    if (!start_time || !due_time) {
      return false
    }
    const newDueTime =
      due_time.toString().length > 10
        ? Number(due_time).valueOf() / 1000
        : Number(due_time).valueOf()
    return Number(start_time.valueOf()) / 1000 >= newDueTime //Number(due_time).valueOf();
  }
  startDatePickerChange(e, timeString) {
    this.setState(
      {
        start_time: timeToTimestamp(timeString)
      },
      () => {
        const { start_time, due_time } = this.state
        const { handleDateRangeChange } = this.props
        handleDateRangeChange([start_time, due_time])
      }
    )
  }
  disabledDueTime = due_time => {
    const { start_time } = this.state
    if (!start_time || !due_time) {
      return false
    }

    const newStartTime =
      start_time.toString().length > 10
        ? Number(start_time).valueOf() / 1000
        : Number(start_time).valueOf()
    return Number(due_time.valueOf()) / 1000 < newStartTime
  }
  endDatePickerChange(e, timeString) {
    this.setState(
      {
        due_time: timeToTimestamp(timeString)
      },
      () => {
        const { start_time, due_time } = this.state
        const { handleDateRangeChange } = this.props
        handleDateRangeChange([start_time, due_time])
      }
    )
  }
  handleStartOpenChange = open => {
    if (!open) {
      this.setState({
        endOpen: true
      })
    }
  }
  handleEndOpenChange = open => {
    //如果没有设置 start_time, 就不能打开
    const { start_time } = this.state
    if (open && !start_time) {
      message.info('请先设置开始时间')
      return
    }
    this.setState({
      endOpen: open
    })
  }
  formatDate = dateStr => {
    //如果日期字符串包括年，并且是今年，那么就去掉日期字符串中的年份
    const currentYear = new Date().getFullYear()
    return dateStr.includes(currentYear) ? dateStr.substring(5) : dateStr
  }
  render() {
    const { isSameYearNotShowYear } = this.props
    const { start_time, due_time, endOpen } = this.state
    return (
      <div>
        {start_time || due_time ? (
          ''
        ) : (
          <span style={{ color: '#bfbfbf' }}>设置</span>
        )}
        <span style={{ position: 'relative', cursor: 'pointer' }}>
          &nbsp;
          {start_time ? (
            isSameYearNotShowYear ? (
              this.formatDate(timestampToTimeNormal(start_time, '/', true))
            ) : (
              timestampToTimeNormal(start_time, '/', true)
            )
          ) : (
            <span style={{ cursor: 'pointer' }}>开始</span>
          )}
          <DatePicker
            disabledDate={this.disabledStartTime.bind(this)}
            onChange={this.startDatePickerChange.bind(this)}
            onOpenChange={this.handleStartOpenChange}
            placeholder={'开始时间'}
            format="YYYY/MM/DD HH:mm"
            showTime={{ format: 'HH:mm' }}
            style={{
              opacity: 0,
              width: !start_time ? '16px' : '100px',
              height: 20,
              background: '#000000',
              cursor: 'pointer',
              position: 'absolute',
              right: !start_time ? 8 : 0,
              zIndex: 1
            }}
          />
        </span>
        &nbsp;
        {start_time && due_time ? (
          <span style={{ color: '#bfbfbf' }}> -- </span>
        ) : (
          <span style={{ color: '#bfbfbf' }}> -- </span>
        )}
        &nbsp;
        <span style={{ position: 'relative' }}>
          {due_time ? (
            isSameYearNotShowYear ? (
              this.formatDate(timestampToTimeNormal(due_time, '/', true))
            ) : (
              timestampToTimeNormal(due_time, '/', true)
            )
          ) : (
            <span style={{ cursor: 'pointer' }}>截止时间</span>
          )}
          <DatePicker
            disabledDate={this.disabledDueTime.bind(this)}
            placeholder={'截止时间'}
            format="YYYY/MM/DD HH:mm"
            showTime={{ format: 'HH:mm' }}
            onChange={this.endDatePickerChange.bind(this)}
            onOpenChange={this.handleEndOpenChange}
            open={endOpen}
            style={{
              opacity: 0,
              width: !due_time ? 50 : 100,
              cursor: 'pointer',
              height: 20,
              background: '#000000',
              position: 'absolute',
              right: 0,
              zIndex: 1
            }}
          />
        </span>
      </div>
    )
  }
}

DateRangePicker.defaultProps = {
  handleDateRangeChange: function() {
    message.error('时间范围选择器，接收一个 handleDateRangeChange 回调函数')
  },
  isSameYearNotShowYear: false //如果选择的时间和此刻的时间是同一年是否要隐藏年份
}

export default DateRangePicker
