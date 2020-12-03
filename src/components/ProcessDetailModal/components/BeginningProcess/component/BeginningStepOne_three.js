import React, { Component } from 'react'
import { Input, DatePicker } from 'antd'
import indexStyles from '../index.less'
import moment from 'moment'
import {
  timeToTimestamp,
  compareACoupleOfObjects,
  isObjectValueEqual
} from '../../../../../utils/util'
import { connect } from 'dva'
import { updateUserStorage } from '../../handleOperateModal'

const { MonthPicker, RangePicker } = DatePicker

@connect(mapStateToProps)
export default class BeginningStepOne_three extends Component {
  constructor(props) {
    super(props)
    this.state = {
      startOpen: false,
      localItem: props.itemValue ? props.itemValue : {}
    }
  }

  componentWillReceiveProps(nextProps) {
    if (isObjectValueEqual(this.props.itemValue, nextProps.itemValue)) return
    this.setState({
      localItem: nextProps.itemValue ? nextProps.itemValue : {}
    })
  }

  updateState = (data, key) => {
    const { localItem = {} } = this.state
    localItem[key] = data.value
    this.setState({
      localItem: { ...localItem }
    })
  }

  updateEdit = (data, key) => {
    const { itemKey, parentKey, processEditDatas = [] } = this.props
    const { forms = [] } = processEditDatas[parentKey]
    forms[itemKey][key] = data.value
    this.props.updateCorrespondingPrcodessStepWithNodeContent &&
      this.props.updateCorrespondingPrcodessStepWithNodeContent('forms', forms)
    if (data.update_storage) {
      updateUserStorage({ forms: forms })
    }
  }

  // 预约开始时间
  startDatePickerChange = timeString => {
    // 这里是如果清空了时间 会变为0
    if (!timeToTimestamp(timeString)) {
      this.updateEdit({ value: '', update_storage: true }, 'value')
      this.updateState({ value: '' }, 'value')
      return
    }
    this.updateState({ value: timeToTimestamp(timeString) }, 'value')
    this.updateEdit(
      { value: timeToTimestamp(timeString), update_storage: true },
      'value'
    )
  }

  handleStartOpenChange = open => {
    // this.setState({ endOpen: true });
    this.setState({
      startOpen: open
    })
  }

  handleStartDatePickerChange = timeString => {
    // 这里是如果清空了时间 会变为0
    if (!timeToTimestamp(timeString)) {
      this.updateEdit({ value: '', update_storage: true }, 'value')
      this.updateState({ value: '' }, 'value')
      return
    }
    this.updateState({ value: timeToTimestamp(timeString) }, 'value')
    this.updateEdit(
      { value: timeToTimestamp(timeString), update_storage: true },
      'value'
    )
    this.setState(
      {
        start_time: timeToTimestamp(timeString)
      },
      () => {
        this.handleStartOpenChange(true)
      }
    )
  }

  rangePickerChange = (date, dateString) => {
    if (dateString[0] == '' && dateString[1] == '') {
      this.updateEdit({ value: '', update_storage: true }, 'value')
      this.updateState({ value: '' }, 'value')
      return
    }
    this.updateEdit(
      {
        value: `${timeToTimestamp(dateString[0])},${timeToTimestamp(
          dateString[1]
        )}`,
        update_storage: true
      },
      'value'
    )
    this.updateState(
      {
        value: `${timeToTimestamp(dateString[0])},${timeToTimestamp(
          dateString[1]
        )}`
      },
      'value'
    )
  }

  rangePickerChange2 = (date, dateString) => {
    if (dateString[0] == '' && dateString[1] == '') {
      this.updateEdit({ value: '', update_storage: true }, 'value')
      this.updateState({ value: '' }, 'value')
      return
    }
    this.updateEdit(
      {
        value: `${timeToTimestamp(dateString[0])},${timeToTimestamp(
          dateString[1]
        )}`,
        update_storage: true
      },
      'value'
    )
    this.updateState(
      {
        value: `${timeToTimestamp(dateString[0])},${timeToTimestamp(
          dateString[1]
        )}`
      },
      'value'
    )
  }

  renderDiffDateRangeAndDatePrecision = () => {
    const { itemValue } = this.props
    const { localItem = {} } = this.state
    const { date_range, date_precision, prompt_content, value } = localItem
    let container = <div></div>
    switch (date_range) {
      case '1': // 表示单个日期
        if (date_precision == '1') {
          // 表示仅日期
          container = (
            <DatePicker
              onChange={this.startDatePickerChange.bind(this)}
              format={'YYYY/MM/DD'}
              style={{ width: '100%' }}
              placeholder={prompt_content}
              value={value ? moment(new Date(Number(value))) : undefined}
            />
          )
        } else if (date_precision == '2') {
          // 表示日期 + 时间
          container = (
            <DatePicker
              onOk={this.startDatePickerChange.bind(this)}
              onChange={this.handleStartDatePickerChange.bind(this)}
              onOpenChange={this.handleStartOpenChange}
              open={this.state.startOpen}
              format="YYYY-MM-DD HH:mm"
              showTime={{ format: 'HH:mm' }}
              style={{ width: '100%' }}
              placeholder={prompt_content}
              value={value ? moment(new Date(Number(value))) : undefined}
            />
          )
        }
        break
      case '2': // 表示日期 + 时间
        const timeArray = (value && value.split(',')) || []
        const startTime = timeArray[0]
        const endTime = timeArray[1]
        if (date_precision == '1') {
          // 表示仅日期
          container = (
            <RangePicker
              format="YYYY-MM-DD"
              style={{ width: '100%' }}
              onChange={this.rangePickerChange}
              value={
                startTime && endTime
                  ? [
                      moment(new Date(Number(startTime))),
                      moment(new Date(Number(endTime)))
                    ]
                  : undefined
              }
            />
          )
        } else if (date_precision == '2') {
          // 表示日期 + 时间
          container = (
            <RangePicker
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
              onChange={this.rangePickerChange2}
              style={{ width: '100%' }}
              value={
                startTime && endTime
                  ? [
                      moment(new Date(Number(startTime))),
                      moment(new Date(Number(endTime)))
                    ]
                  : undefined
              }
            />
          )
        }
        break
      default:
        // container = <DatePicker style={{ width: '100%' }} placeholder={prompt_content} />
        break
    }
    return container
  }

  render() {
    const { itemValue } = this.props
    const {
      title,
      prompt_content,
      is_required,
      date_range,
      date_precision
    } = itemValue
    return (
      <div className={indexStyles.text_form}>
        <p>
          <span>
            {title}:&nbsp;&nbsp;
            {is_required == '1' && <span style={{ color: '#F5222D' }}>*</span>}
          </span>
        </p>
        <div className={indexStyles.text_fillOut}>
          {/* <DatePicker style={{ width: '100%' }} placeholder={prompt_content} /> */}
          {this.renderDiffDateRangeAndDatePrecision()}
        </div>
      </div>
    )
  }
}

function mapStateToProps({
  publicProcessDetailModal: { processEditDatas = [] }
}) {
  return { processEditDatas }
}

/**
 * 1. 单个日期 + 仅日期
 * 2. 单个日期 + 日期/时间
 * 3. 开始日期~截止日期 + 仅日期
 * 4. 开始日期 ~ 截止日期 + 日期/时间
 * date_range 日期范围 1 == 单个日期 2 == 开始日期~截止日期
 * date_precision 日期精度 1 == 仅日期 2 == 日期+时间
 */
