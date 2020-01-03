import React from 'react'
import indexStyles from './index.less'
import { Input, Checkbox, Select, Button, DatePicker } from 'antd'
import {validateFixedTel, validateTel} from "../../../../../../utils/verify";
import {timeToTimestamp} from "../../../../../../utils/util";
import moment from 'moment/moment';

const Option = Select.Option;
const { MonthPicker, RangePicker } = DatePicker

export default class DetailConfirmInfoThreeThree extends React.Component {
  updateEdit(data, key) {
    const { itemKey, parentItemKey } = this.props
    const { datas: { processEditDatas = [], } } = this.props.model
    const { form_data=[] } = processEditDatas[parentItemKey]
    form_data[itemKey][key] = data.value
    this.props.updateDatasProcess({
      processEditDatas
    })
  }
  datePickerChange(date, dateString) {
    this.updateEdit({value: timeToTimestamp(dateString).toString()}, 'default_value')
  }
  rangePickerChange(date, dateString) {
    this.updateEdit({value: `${timeToTimestamp(dateString[0])},${timeToTimestamp(dateString[1])}`}, 'default_value')
  }

  render() {
    const { datas: { processEditDatas = [] } } = this.props.model
    const { itemKey, parentItemKey, FormCanEdit } = this.props
    const { form_data=[] } = processEditDatas[parentItemKey]
    const { property_name, default_value, verification_rule, val_length, is_required, } = form_data[itemKey]

    //模式
    const ruleArray = verification_rule.replace('_', ',').split(',')
    const mode_0 = ruleArray[0]
    const mode_1 = ruleArray[1]
    //时间
    const timeArray = default_value && default_value.split(',') || []
    const startTime = timeArray[0]
    const endTime = timeArray[1]

    return (
      <div className={indexStyles.EditFormThreeOneOut}>
        <div className={indexStyles.EditFormThreeOneOut_form}>
          <div className={indexStyles.EditFormThreeOneOut_form_left}></div>
          <div className={indexStyles.EditFormThreeOneOut_form_right}>
            <div className={indexStyles.EditFormThreeOneOutItem} style={{ width: '100%'}}>
              <p>{property_name}({is_required === '1' ? '必填': '选填'})</p>
              {mode_0==='SINGLE'? (
                <DatePicker
                  style={{width: '100%', height: 24}}
                  size={'small'}
                  disabled={FormCanEdit}
                  showTime={mode_1 === 'DATE_TIME'}
                  allowClear={false}
                  format={mode_1 === 'DATE_TIME' ? "YYYY-MM-DD HH:mm" : "YYYY-MM-DD"}
                  placeholder=""
                  value={startTime ? moment(new Date(Number(startTime))) : undefined} // [moment(new Date(signUpStartTime)), moment(new Date(signUpEndTime))]
                  onChange={this.datePickerChange.bind(this)}
                />
              ) : (
<RangePicker
                size={'small'}
                disabled={FormCanEdit}
                style={{width: '100%', height: 24}}
                showTime={mode_1 === 'DATE_TIME'?{ format: 'HH:mm' } :false}
                format={mode_1 === 'DATE_TIME' ? "YYYY-MM-DD HH:mm" : "YYYY-MM-DD"}
                placeholder={[]}
                value={ (startTime && endTime) ? [moment(new Date(Number(startTime))), moment(new Date(Number(endTime)))] : undefined}
                onChange={this.rangePickerChange.bind(this)}
              />
)}
            </div>
          </div>
        </div>
      </div>
    )
  }

}
